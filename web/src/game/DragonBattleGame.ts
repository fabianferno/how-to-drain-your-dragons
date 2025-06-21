import { Engine, Color, DisplayMode } from "excalibur";
import {
  DragonType,
  Player,
  GameState,
  GameContext,
  DuelPhase,
  Battle,
} from "../types/game";
import { LobbyScene } from "../game/scenes/LobbyScene";
import { BattleScene } from "../game/scenes/BattleScene";
import { RegistrationScene } from "../game/scenes/RegistrationScene";
import { socketService } from "../lib/socketService";

export class DragonBattleGame extends Engine {
  public gameContext: GameContext;
  public lobbyScene: LobbyScene;
  public battleScene: BattleScene;
  public registrationScene: RegistrationScene;

  constructor() {
    super({
      width: 1200,
      height: 800,
      canvasElementId: "game-canvas",
      backgroundColor: Color.fromHex("#2C1810"),
      displayMode: DisplayMode.Fixed,
    });

    this.gameContext = {
      gameState: GameState.REGISTRATION,
      lobby: [],
      leaderboard: [],
    };

    // Initialize scenes
    this.registrationScene = new RegistrationScene(this);
    this.lobbyScene = new LobbyScene(this);
    this.battleScene = new BattleScene(this);

    this.addScene("registration", this.registrationScene);
    this.addScene("lobby", this.lobbyScene);
    this.addScene("battle", this.battleScene);
  }

  public async onInitialize() {
    try {
      // Connect to socket.io server
      await socketService.connect();

      // Set up socket event listeners
      this.setupSocketListeners();

      this.goToScene("registration");
    } catch (error) {
      console.error("Failed to connect to server:", error);
      // Handle connection error - maybe show an error message
    }
  }

  private setupSocketListeners() {
    // Listen for lobby updates
    socketService.onLobbyUpdated((data) => {
      this.gameContext.lobby = data.lobby;
      this.gameContext.leaderboard = data.leaderboard;

      // Update lobby scene if currently active
      if (this.gameContext.gameState === GameState.LOBBY) {
        this.lobbyScene.refreshLobby();
      }
    });

    // Listen for battle events
    socketService.onBattleStarted((battle) => {
      this.gameContext.currentBattle = battle;
      this.gameContext.gameState = GameState.IN_BATTLE;
      this.goToScene("battle");
    });

    socketService.onBattleUpdated((battle) => {
      this.gameContext.currentBattle = battle;
      if (this.gameContext.gameState === GameState.IN_BATTLE) {
        this.battleScene.updateBattle(battle);
      }
    });

    socketService.onBattleEnded((data) => {
      console.log("Battle ended:", data);
      // Return to lobby after battle
      setTimeout(() => {
        this.gameContext.gameState = GameState.LOBBY;
        this.gameContext.currentBattle = undefined;
        this.goToScene("lobby");
      }, 3000);
    });

    socketService.onRevealFailed((error) => {
      console.error("Reveal failed:", error);
      // Handle reveal failure
    });
  }

  public async registerPlayer(
    playerName: string,
    selectedDragons: DragonType[]
  ) {
    if (selectedDragons.length !== 3) {
      throw new Error("Player must select exactly 3 dragons");
    }

    try {
      const dragons = selectedDragons.map((type, index) => ({
        id: `dragon_${index}_${Date.now()}`,
        type,
        isAlive: true,
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} Dragon`,
      }));

      const player = await socketService.registerPlayer({
        name: playerName,
        dragons: dragons,
      });

      this.gameContext.currentPlayer = player;
      this.gameContext.gameState = GameState.LOBBY;
      this.goToScene("lobby");
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  }

  public async challengePlayer(opponentId: string) {
    if (!this.gameContext.currentPlayer) return;

    try {
      const battle = await socketService.challengePlayer(opponentId);
      // Battle will be handled by the socket listener
    } catch (error) {
      console.error("Challenge failed:", error);
    }
  }

  public commitDragon(dragonId: string, nonce: string) {
    if (!this.gameContext.currentBattle) return;

    socketService.commitDragon(
      this.gameContext.currentBattle.id,
      dragonId,
      nonce
    );
  }

  public revealDragon(dragonId: string, nonce: string) {
    if (!this.gameContext.currentBattle) return;

    socketService.revealDragon(
      this.gameContext.currentBattle.id,
      dragonId,
      nonce
    );
  }

  public updateLeaderboard() {
    // Leaderboard is now managed by the server
    // This method is kept for compatibility but does nothing
  }

  public dispose() {
    // Clean up socket connections
    socketService.offAllListeners();
    socketService.disconnect();
    super.dispose();
  }
}
