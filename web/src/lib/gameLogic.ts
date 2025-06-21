import {
  Dragon,
  DragonType,
  DRAGON_EFFECTIVENESS,
  Battle,
  Duel,
  DuelPhase,
  Player,
} from "../types/game";
import { v4 as uuidv4 } from "uuid";

export function checkDragonEffectiveness(
  attacker: DragonType,
  defender: DragonType
): boolean {
  return DRAGON_EFFECTIVENESS[attacker].includes(defender);
}

export function resolveDuel(
  player1Dragon: Dragon,
  player2Dragon: Dragon
): { winner: "player1" | "player2" | "tie"; loserDragon?: Dragon } {
  const player1Wins = checkDragonEffectiveness(
    player1Dragon.type,
    player2Dragon.type
  );
  const player2Wins = checkDragonEffectiveness(
    player2Dragon.type,
    player1Dragon.type
  );

  if (player1Wins && !player2Wins) {
    return { winner: "player1", loserDragon: player2Dragon };
  } else if (player2Wins && !player1Wins) {
    return { winner: "player2", loserDragon: player1Dragon };
  } else {
    // Tie - both dragons die or random winner
    return Math.random() > 0.5
      ? { winner: "player1", loserDragon: player2Dragon }
      : { winner: "player2", loserDragon: player1Dragon };
  }
}

export function createCommitment(dragonId: string, nonce: string): string {
  // Simple hash function for commitment (in real game, use proper cryptographic hash)
  return btoa(dragonId + nonce);
}

export function verifyCommitment(
  commitment: string,
  dragonId: string,
  nonce: string
): boolean {
  return commitment === createCommitment(dragonId, nonce);
}

export function getAliveDragons(player: Player): Dragon[] {
  return player.dragons.filter((dragon) => dragon.isAlive);
}

export function createBattle(player1: Player, player2: Player): Battle {
  return {
    id: uuidv4(),
    player1: { ...player1 },
    player2: { ...player2 },
    duels: [],
    currentDuelIndex: 0,
    completed: false,
    createdAt: new Date(),
  };
}

export function createDuel(): Duel {
  return {
    id: uuidv4(),
    completed: false,
    phase: DuelPhase.COMMIT,
  };
}

export function canPlayerCommit(battle: Battle, playerId: string): boolean {
  const currentDuel = battle.duels[battle.currentDuelIndex];
  if (!currentDuel || currentDuel.phase !== DuelPhase.COMMIT) return false;

  if (battle.player1.id === playerId) {
    return !currentDuel.player1DragonCommit;
  } else if (battle.player2.id === playerId) {
    return !currentDuel.player2DragonCommit;
  }
  return false;
}

export function canPlayerReveal(battle: Battle, playerId: string): boolean {
  const currentDuel = battle.duels[battle.currentDuelIndex];
  if (!currentDuel || currentDuel.phase !== DuelPhase.REVEAL) return false;

  if (battle.player1.id === playerId) {
    return !currentDuel.player1DragonReveal;
  } else if (battle.player2.id === playerId) {
    return !currentDuel.player2DragonReveal;
  }
  return false;
}

export function progressBattle(battle: Battle): Battle {
  const currentDuel = battle.duels[battle.currentDuelIndex];

  if (!currentDuel) return battle;

  // Check if we can progress from commit to reveal phase
  if (
    currentDuel.phase === DuelPhase.COMMIT &&
    currentDuel.player1DragonCommit &&
    currentDuel.player2DragonCommit
  ) {
    currentDuel.phase = DuelPhase.REVEAL;
  }

  // Check if we can resolve the duel
  if (
    currentDuel.phase === DuelPhase.REVEAL &&
    currentDuel.player1DragonReveal &&
    currentDuel.player2DragonReveal
  ) {
    // Verify commitments
    const p1Valid = verifyCommitment(
      currentDuel.player1DragonCommit!,
      currentDuel.player1DragonReveal.dragonId,
      currentDuel.player1DragonReveal.nonce
    );

    const p2Valid = verifyCommitment(
      currentDuel.player2DragonCommit!,
      currentDuel.player2DragonReveal.dragonId,
      currentDuel.player2DragonReveal.nonce
    );

    if (p1Valid && p2Valid) {
      // Find the dragons
      const p1Dragon = battle.player1.dragons.find(
        (d) => d.id === currentDuel.player1DragonReveal!.dragonId
      );
      const p2Dragon = battle.player2.dragons.find(
        (d) => d.id === currentDuel.player2DragonReveal!.dragonId
      );

      if (p1Dragon && p2Dragon && p1Dragon.isAlive && p2Dragon.isAlive) {
        const result = resolveDuel(p1Dragon, p2Dragon);

        // Mark losing dragon as dead
        if (result.loserDragon) {
          result.loserDragon.isAlive = false;
        }

        currentDuel.winner =
          result.winner === "player1" ? battle.player1.id : battle.player2.id;
        currentDuel.completed = true;
        currentDuel.phase = DuelPhase.RESOLVED;

        // Check if battle is complete (2 duels done or no more dragons)
        const p1AliveDragons = getAliveDragons(battle.player1);
        const p2AliveDragons = getAliveDragons(battle.player2);

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
            // Tie - could use points or random
            battle.winner =
              Math.random() > 0.5 ? battle.player1.id : battle.player2.id;
          }
        } else {
          // Start next duel
          battle.currentDuelIndex++;
          battle.duels.push(createDuel());
        }
      }
    }
  }

  return battle;
}

export function generateRandomNonce(): string {
  return Math.random().toString(36).substring(2, 15);
}
