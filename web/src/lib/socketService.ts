import { io, Socket } from "socket.io-client";
import { Player, Battle } from "../types/game";

export class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io("http://localhost:4000", {
          transports: ["websocket", "polling"],
        });

        this.socket.on("connect", () => {
          console.log("Connected to server:", this.socket?.id);
          this.isConnected = true;
          resolve();
        });

        this.socket.on("disconnect", () => {
          console.log("Disconnected from server");
          this.isConnected = false;
        });

        this.socket.on("connect_error", (error) => {
          console.error("Connection error:", error);
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  registerPlayer(playerData: {
    name: string;
    dragons: any[];
  }): Promise<Player> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error("Not connected to server"));
        return;
      }

      this.socket.emit("register-player", playerData);

      this.socket.once("registration-success", (player: Player) => {
        resolve(player);
      });

      setTimeout(() => {
        reject(new Error("Registration timeout"));
      }, 5000);
    });
  }

  challengePlayer(targetPlayerId: string): Promise<Battle> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error("Not connected to server"));
        return;
      }

      this.socket.emit("challenge-player", targetPlayerId);

      this.socket.once("battle-started", (battle: Battle) => {
        resolve(battle);
      });

      this.socket.once("challenge-failed", (error: string) => {
        reject(new Error(error));
      });

      setTimeout(() => {
        reject(new Error("Challenge timeout"));
      }, 10000);
    });
  }

  commitDragon(battleId: string, dragonId: string, nonce: string): void {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit("commit-dragon", { battleId, dragonId, nonce });
  }

  revealDragon(battleId: string, dragonId: string, nonce: string): void {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit("reveal-dragon", { battleId, dragonId, nonce });
  }

  onLobbyUpdated(
    callback: (data: { lobby: Player[]; leaderboard: Player[] }) => void
  ): void {
    if (!this.socket) return;
    this.socket.on("lobby-updated", callback);
  }

  onBattleStarted(callback: (battle: Battle) => void): void {
    if (!this.socket) return;
    this.socket.on("battle-started", callback);
  }

  onBattleUpdated(callback: (battle: Battle) => void): void {
    if (!this.socket) return;
    this.socket.on("battle-updated", callback);
  }

  onBattleEnded(
    callback: (data: { reason: string; winnerId: string }) => void
  ): void {
    if (!this.socket) return;
    this.socket.on("battle-ended", callback);
  }

  onRevealFailed(callback: (error: string) => void): void {
    if (!this.socket) return;
    this.socket.on("reveal-failed", callback);
  }

  offAllListeners(): void {
    if (!this.socket) return;
    this.socket.removeAllListeners();
  }

  getSocketId(): string | null {
    return this.socket?.id || null;
  }

  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }
}

// Singleton instance
export const socketService = new SocketService();
