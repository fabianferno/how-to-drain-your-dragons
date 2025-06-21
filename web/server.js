const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.PORT || 4000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Game state
const gameState = {
  players: new Map(), // socketId -> player data
  lobby: [],
  battles: new Map(), // battleId -> battle data
  leaderboard: [],
};

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Player connected:", socket.id);

    // Handle player registration
    socket.on("register-player", (playerData) => {
      console.log("Player registering:", playerData);

      const player = {
        id: socket.id,
        socketId: socket.id,
        name: playerData.name,
        dragons: playerData.dragons,
        points: 1000,
        isReady: true,
        isInBattle: false,
      };

      gameState.players.set(socket.id, player);
      gameState.lobby.push(player);
      updateLeaderboard();

      // Send lobby data to all players
      io.emit("lobby-updated", {
        lobby: gameState.lobby,
        leaderboard: gameState.leaderboard,
      });

      socket.emit("registration-success", player);
    });

    // Handle challenge requests
    socket.on("challenge-player", (targetPlayerId) => {
      const challenger = gameState.players.get(socket.id);
      const target = gameState.players.get(targetPlayerId);

      if (
        !challenger ||
        !target ||
        target.isInBattle ||
        challenger.isInBattle
      ) {
        socket.emit("challenge-failed", "Player not available");
        return;
      }

      // Create battle
      const battleId = `battle_${Date.now()}_${Math.random()
        .toString(36)
        .substring(7)}`;
      const battle = {
        id: battleId,
        player1: { ...challenger },
        player2: { ...target },
        duels: [
          {
            id: `duel_${Date.now()}`,
            completed: false,
            phase: "commit",
          },
        ],
        currentDuelIndex: 0,
        completed: false,
        createdAt: new Date(),
      };

      gameState.battles.set(battleId, battle);

      // Mark players as in battle
      challenger.isInBattle = true;
      target.isInBattle = true;

      // Remove from lobby
      gameState.lobby = gameState.lobby.filter(
        (p) => p.id !== challenger.id && p.id !== target.id
      );

      // Notify both players
      socket.emit("battle-started", battle);
      socket.to(targetPlayerId).emit("battle-started", battle);

      // Update lobby for others
      io.emit("lobby-updated", {
        lobby: gameState.lobby,
        leaderboard: gameState.leaderboard,
      });
    });

    // Handle dragon commits
    socket.on("commit-dragon", ({ battleId, dragonId, nonce }) => {
      const battle = gameState.battles.get(battleId);
      const player = gameState.players.get(socket.id);

      if (!battle || !player) return;

      const currentDuel = battle.duels[battle.currentDuelIndex];
      if (!currentDuel || currentDuel.phase !== "commit") return;

      // Create commitment (simple hash)
      const commitment = Buffer.from(dragonId + nonce).toString("base64");

      if (battle.player1.id === player.id) {
        currentDuel.player1DragonCommit = commitment;
        currentDuel.player1Nonce = nonce;
        currentDuel.player1DragonId = dragonId;
      } else if (battle.player2.id === player.id) {
        currentDuel.player2DragonCommit = commitment;
        currentDuel.player2Nonce = nonce;
        currentDuel.player2DragonId = dragonId;
      }

      // Check if both players have committed
      if (currentDuel.player1DragonCommit && currentDuel.player2DragonCommit) {
        currentDuel.phase = "reveal";
      }

      // Update battle for both players
      gameState.battles.set(battleId, battle);
      io.to(battle.player1.socketId).emit("battle-updated", battle);
      io.to(battle.player2.socketId).emit("battle-updated", battle);
    });

    // Handle dragon reveals
    socket.on("reveal-dragon", ({ battleId, dragonId, nonce }) => {
      const battle = gameState.battles.get(battleId);
      const player = gameState.players.get(socket.id);

      if (!battle || !player) return;

      const currentDuel = battle.duels[battle.currentDuelIndex];
      if (!currentDuel || currentDuel.phase !== "reveal") return;

      // Verify commitment
      const commitment = Buffer.from(dragonId + nonce).toString("base64");
      let isValid = false;

      if (
        battle.player1.id === player.id &&
        currentDuel.player1DragonCommit === commitment
      ) {
        currentDuel.player1DragonReveal = { dragonId, nonce };
        isValid = true;
      } else if (
        battle.player2.id === player.id &&
        currentDuel.player2DragonCommit === commitment
      ) {
        currentDuel.player2DragonReveal = { dragonId, nonce };
        isValid = true;
      }

      if (!isValid) {
        socket.emit("reveal-failed", "Invalid commitment");
        return;
      }

      // Check if both players have revealed
      if (currentDuel.player1DragonReveal && currentDuel.player2DragonReveal) {
        resolveDuel(battle, currentDuel);
      }

      gameState.battles.set(battleId, battle);
      io.to(battle.player1.socketId).emit("battle-updated", battle);
      io.to(battle.player2.socketId).emit("battle-updated", battle);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("Player disconnected:", socket.id);

      const player = gameState.players.get(socket.id);
      if (player) {
        // Remove from lobby
        gameState.lobby = gameState.lobby.filter((p) => p.id !== player.id);

        // Handle ongoing battles
        for (const [battleId, battle] of gameState.battles) {
          if (
            battle.player1.id === player.id ||
            battle.player2.id === player.id
          ) {
            // End battle, other player wins by forfeit
            const winnerId =
              battle.player1.id === player.id
                ? battle.player2.id
                : battle.player1.id;
            const winnerSocket =
              battle.player1.id === player.id
                ? battle.player2.socketId
                : battle.player1.socketId;

            socket.to(winnerSocket).emit("battle-ended", {
              reason: "opponent-disconnected",
              winnerId,
            });

            gameState.battles.delete(battleId);
          }
        }

        gameState.players.delete(socket.id);
        updateLeaderboard();

        // Update lobby for remaining players
        io.emit("lobby-updated", {
          lobby: gameState.lobby,
          leaderboard: gameState.leaderboard,
        });
      }
    });
  });

  // Helper functions
  function resolveDuel(battle, duel) {
    const p1DragonId = duel.player1DragonReveal.dragonId;
    const p2DragonId = duel.player2DragonReveal.dragonId;

    // Find dragons
    const p1Dragon = battle.player1.dragons.find((d) => d.id === p1DragonId);
    const p2Dragon = battle.player2.dragons.find((d) => d.id === p2DragonId);

    if (!p1Dragon || !p2Dragon) return;

    // Dragon effectiveness matrix
    const effectiveness = {
      fire: ["air", "earth"],
      water: ["fire", "aether"],
      air: ["water", "earth"],
      earth: ["aether", "fire"],
      aether: ["air", "water"],
    };

    const p1Wins = effectiveness[p1Dragon.type]?.includes(p2Dragon.type);
    const p2Wins = effectiveness[p2Dragon.type]?.includes(p1Dragon.type);

    let winner, loserDragon;
    if (p1Wins && !p2Wins) {
      winner = battle.player1.id;
      loserDragon = p2Dragon;
    } else if (p2Wins && !p1Wins) {
      winner = battle.player2.id;
      loserDragon = p1Dragon;
    } else {
      // Tie - random winner
      if (Math.random() > 0.5) {
        winner = battle.player1.id;
        loserDragon = p2Dragon;
      } else {
        winner = battle.player2.id;
        loserDragon = p1Dragon;
      }
    }

    // Mark losing dragon as dead
    if (loserDragon) {
      loserDragon.isAlive = false;
    }

    duel.winner = winner;
    duel.completed = true;
    duel.phase = "resolved";

    // Check if battle should continue
    const p1AliveDragons = battle.player1.dragons.filter((d) => d.isAlive);
    const p2AliveDragons = battle.player2.dragons.filter((d) => d.isAlive);

    if (
      battle.currentDuelIndex >= 1 ||
      p1AliveDragons.length === 0 ||
      p2AliveDragons.length === 0
    ) {
      // Battle complete
      battle.completed = true;
      if (p1AliveDragons.length > p2AliveDragons.length) {
        battle.winner = battle.player1.id;
      } else if (p2AliveDragons.length > p1AliveDragons.length) {
        battle.winner = battle.player2.id;
      } else {
        battle.winner =
          Math.random() > 0.5 ? battle.player1.id : battle.player2.id;
      }

      // Update points
      const winner = gameState.players.get(battle.winner);
      const loser = gameState.players.get(
        battle.winner === battle.player1.id
          ? battle.player2.id
          : battle.player1.id
      );

      if (winner) winner.points += 100;
      if (loser) loser.points = Math.max(0, loser.points - 50);

      // Reset dragons and return to lobby
      setTimeout(() => {
        [battle.player1, battle.player2].forEach((player) => {
          const gamePlayer = gameState.players.get(player.id);
          if (gamePlayer) {
            gamePlayer.isInBattle = false;
            gamePlayer.dragons.forEach((d) => (d.isAlive = true));
            gameState.lobby.push(gamePlayer);
          }
        });

        updateLeaderboard();
        gameState.battles.delete(battle.id);

        io.emit("lobby-updated", {
          lobby: gameState.lobby,
          leaderboard: gameState.leaderboard,
        });
      }, 3000);
    } else {
      // Start next duel
      battle.currentDuelIndex++;
      battle.duels.push({
        id: `duel_${Date.now()}`,
        completed: false,
        phase: "commit",
      });
    }
  }

  function updateLeaderboard() {
    const allPlayers = Array.from(gameState.players.values());
    gameState.leaderboard = allPlayers
      .sort((a, b) => b.points - a.points)
      .slice(0, 10);
  }

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
