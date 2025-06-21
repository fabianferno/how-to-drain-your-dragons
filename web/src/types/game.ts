export enum DragonType {
  FIRE = "fire",
  WATER = "water",
  AIR = "air",
  EARTH = "earth",
  AETHER = "aether",
}

export interface Dragon {
  id: string;
  type: DragonType;
  isAlive: boolean;
  name: string;
}

export interface Player {
  id: string;
  name: string;
  dragons: Dragon[];
  points: number;
  isReady: boolean;
}

export interface Duel {
  id: string;
  player1DragonCommit?: string; // hashed dragon choice + nonce
  player2DragonCommit?: string;
  player1DragonReveal?: { dragonId: string; nonce: string };
  player2DragonReveal?: { dragonId: string; nonce: string };
  winner?: string; // player id
  completed: boolean;
  phase: DuelPhase;
}

export enum DuelPhase {
  COMMIT = "commit",
  REVEAL = "reveal",
  RESOLVED = "resolved",
}

export interface Battle {
  id: string;
  player1: Player;
  player2: Player;
  duels: Duel[];
  currentDuelIndex: number;
  winner?: string;
  completed: boolean;
  createdAt: Date;
}

export enum GameState {
  REGISTRATION = "registration",
  LOBBY = "lobby",
  IN_BATTLE = "in_battle",
  BATTLE_COMPLETE = "battle_complete",
}

export interface GameContext {
  currentPlayer?: Player;
  gameState: GameState;
  currentBattle?: Battle;
  lobby: Player[];
  leaderboard: Player[];
}

// Dragon effectiveness matrix - similar to rock paper scissors
export const DRAGON_EFFECTIVENESS: Record<DragonType, DragonType[]> = {
  [DragonType.FIRE]: [DragonType.AIR, DragonType.EARTH],
  [DragonType.WATER]: [DragonType.FIRE, DragonType.AETHER],
  [DragonType.AIR]: [DragonType.WATER, DragonType.EARTH],
  [DragonType.EARTH]: [DragonType.AETHER, DragonType.FIRE],
  [DragonType.AETHER]: [DragonType.AIR, DragonType.WATER],
};
