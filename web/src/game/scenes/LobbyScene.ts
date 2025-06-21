import {
  Scene,
  Color,
  ScreenElement,
  Font,
  FontUnit,
  Text,
  Rectangle,
} from "excalibur";
// DragonBattleGame will be passed through constructor to avoid circular imports
import { Player } from "../../types/game";

export class LobbyScene extends Scene {
  private game: any; // DragonBattleGame type
  private playerButtons: PlayerButton[] = [];
  private leaderboardElements: ScreenElement[] = [];

  constructor(game: any) {
    super();
    this.game = game;
  }

  onInitialize() {
    // Title
    const title = new Text({
      text: "Dragon Battle Lobby",
      font: new Font({
        family: "Arial",
        size: 32,
        unit: FontUnit.Px,
        color: Color.White,
      }),
    });
    const titleActor = new ScreenElement({
      x: 600,
      y: 50,
    });
    titleActor.graphics.add(title);
    this.add(titleActor);

    // Current player info
    this.updatePlayerInfo();

    // Leaderboard
    this.updateLeaderboard();
  }

  onActivate() {
    this.refreshLobby();
    this.updateLeaderboard();
  }

  private updatePlayerInfo() {
    if (!this.game.gameContext.currentPlayer) return;

    const player = this.game.gameContext.currentPlayer;
    const playerInfo = new Text({
      text: `${player.name} - Points: ${player.points}`,
      font: new Font({
        family: "Arial",
        size: 20,
        unit: FontUnit.Px,
        color: Color.Yellow,
      }),
    });
    const playerInfoActor = new ScreenElement({
      x: 100,
      y: 100,
    });
    playerInfoActor.graphics.add(playerInfo);
    this.add(playerInfoActor);

    // Player's dragons
    const dragonsText = new Text({
      text: `Dragons: ${player.dragons.map((d: any) => d.name).join(", ")}`,
      font: new Font({
        family: "Arial",
        size: 16,
        unit: FontUnit.Px,
        color: Color.LightGray,
      }),
    });
    const dragonsActor = new ScreenElement({
      x: 100,
      y: 130,
    });
    dragonsActor.graphics.add(dragonsText);
    this.add(dragonsActor);
  }

  public refreshLobby() {
    // Clear existing player buttons
    this.playerButtons.forEach((button) => this.remove(button));
    this.playerButtons = [];

    // Add other players (excluding current player)
    const otherPlayers = this.game.gameContext.lobby.filter(
      (p: any) => p.id !== this.game.gameContext.currentPlayer?.id
    );

    if (otherPlayers.length === 0) {
      const noPlayersText = new Text({
        text: "Waiting for other players...",
        font: new Font({
          family: "Arial",
          size: 18,
          unit: FontUnit.Px,
          color: Color.LightGray,
        }),
      });
      const noPlayersActor = new ScreenElement({
        x: 600,
        y: 300,
      });
      noPlayersActor.graphics.add(noPlayersText);
      this.add(noPlayersActor);
    } else {
      const playersTitle = new Text({
        text: "Challenge a Player:",
        font: new Font({
          family: "Arial",
          size: 24,
          unit: FontUnit.Px,
          color: Color.White,
        }),
      });
      const playersTitleActor = new ScreenElement({
        x: 600,
        y: 200,
      });
      playersTitleActor.graphics.add(playersTitle);
      this.add(playersTitleActor);

      otherPlayers.forEach((player: any, index: number) => {
        const button = new PlayerButton(600, 250 + index * 80, player, () =>
          this.challengePlayer(player.id)
        );
        this.playerButtons.push(button);
        this.add(button);
      });
    }
  }

  private challengePlayer(playerId: string) {
    this.game.challengePlayer(playerId);
  }

  private updateLeaderboard() {
    // Clear existing leaderboard
    this.leaderboardElements.forEach((el) => this.remove(el));
    this.leaderboardElements = [];

    this.game.updateLeaderboard();
    const leaderboard = this.game.gameContext.leaderboard.slice(0, 5);

    const leaderboardTitle = new Text({
      text: "Leaderboard",
      font: new Font({
        family: "Arial",
        size: 20,
        unit: FontUnit.Px,
        color: Color.White,
      }),
    });
    const leaderboardTitleActor = new ScreenElement({
      x: 1000,
      y: 100,
    });
    leaderboardTitleActor.graphics.add(leaderboardTitle);
    this.add(leaderboardTitleActor);
    this.leaderboardElements.push(leaderboardTitleActor);

    leaderboard.forEach((player: any, index: number) => {
      const playerText = new Text({
        text: `${index + 1}. ${player.name} - ${player.points}pts`,
        font: new Font({
          family: "Arial",
          size: 16,
          unit: FontUnit.Px,
          color: Color.LightGray,
        }),
      });
      const playerActor = new ScreenElement({
        x: 1000,
        y: 130 + index * 25,
      });
      playerActor.graphics.add(playerText);
      this.add(playerActor);
      this.leaderboardElements.push(playerActor);
    });
  }
}

class PlayerButton extends ScreenElement {
  private player: Player;
  private callback: () => void;

  constructor(x: number, y: number, player: Player, callback: () => void) {
    super({ x, y, width: 300, height: 60 });
    this.player = player;
    this.callback = callback;

    const rect = new Rectangle({
      width: 300,
      height: 60,
      color: Color.Blue,
    });

    const nameText = new Text({
      text: player.name,
      font: new Font({
        family: "Arial",
        size: 18,
        unit: FontUnit.Px,
        color: Color.White,
      }),
    });

    const pointsText = new Text({
      text: `${player.points} points`,
      font: new Font({
        family: "Arial",
        size: 14,
        unit: FontUnit.Px,
        color: Color.LightGray,
      }),
    });

    this.graphics.add(rect);
    this.graphics.add(nameText);
    // Position points text below name
    const pointsActor = new ScreenElement({
      x: 0,
      y: 20,
    });
    pointsActor.graphics.add(pointsText);
    this.addChild(pointsActor);

    this.on("pointerup", this.callback);
  }
}
