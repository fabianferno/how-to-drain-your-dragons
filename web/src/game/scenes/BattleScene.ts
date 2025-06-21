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
import { Dragon, DuelPhase } from "../../types/game";
import {
  canPlayerCommit,
  canPlayerReveal,
  progressBattle,
  createCommitment,
  generateRandomNonce,
  getAliveDragons,
} from "../../lib/gameLogic";

export class BattleScene extends Scene {
  private game: any; // DragonBattleGame type
  private dragonButtons: DragonButton[] = [];
  private commitButton: ScreenElement;
  private revealButton: ScreenElement;
  private selectedDragonId?: string;
  private currentNonce?: string;
  private statusText: ScreenElement;
  private statusTextElement?: ScreenElement;

  constructor(game: any) {
    super();
    this.game = game;

    this.commitButton = new ScreenElement({
      x: 400,
      y: 600,
      width: 150,
      height: 50,
    });

    this.revealButton = new ScreenElement({
      x: 600,
      y: 600,
      width: 150,
      height: 50,
    });

    this.statusText = new ScreenElement({
      x: 600,
      y: 100,
    });
  }

  onInitialize() {
    // Battle title
    const title = new Text({
      text: "Dragon Battle!",
      font: new Font({
        family: "Arial",
        size: 32,
        unit: FontUnit.Px,
        color: Color.Red,
      }),
    });
    const titleActor = new ScreenElement({
      x: 600,
      y: 50,
    });
    titleActor.graphics.add(title);
    this.add(titleActor);

    // Commit button
    const commitText = new Text({
      text: "Commit Dragon",
      font: new Font({
        family: "Arial",
        size: 16,
        unit: FontUnit.Px,
        color: Color.White,
      }),
    });
    this.commitButton.graphics.add(
      new Rectangle({
        width: 150,
        height: 50,
        color: Color.Green,
      })
    );
    this.commitButton.graphics.add(commitText);
    this.commitButton.on("pointerup", () => this.commitDragon());
    this.add(this.commitButton);

    // Reveal button
    const revealText = new Text({
      text: "Reveal Dragon",
      font: new Font({
        family: "Arial",
        size: 16,
        unit: FontUnit.Px,
        color: Color.White,
      }),
    });
    this.revealButton.graphics.add(
      new Rectangle({
        width: 150,
        height: 50,
        color: Color.Orange,
      })
    );
    this.revealButton.graphics.add(revealText);
    this.revealButton.on("pointerup", () => this.revealDragon());
    this.add(this.revealButton);

    this.add(this.statusText);
  }

  onActivate() {
    this.refreshBattleState();
  }

  public updateBattle(battle: any) {
    this.game.gameContext.currentBattle = battle;
    this.refreshBattleState();
  }

  private refreshBattleState() {
    const battle = this.game.gameContext.currentBattle;
    const currentPlayer = this.game.gameContext.currentPlayer;

    if (!battle || !currentPlayer) return;

    // Clear existing dragon buttons
    this.dragonButtons.forEach((button) => this.remove(button));
    this.dragonButtons = [];

    // Show current battle info
    this.updateBattleInfo();

    // Show alive dragons for selection
    const aliveDragons = getAliveDragons(currentPlayer);
    aliveDragons.forEach((dragon, index) => {
      const button = new DragonButton(200 + index * 150, 300, dragon, () =>
        this.selectDragon(dragon.id)
      );
      this.dragonButtons.push(button);
      this.add(button);
    });

    // Update button states
    this.updateButtonStates();
  }

  private updateBattleInfo() {
    const battle = this.game.gameContext.currentBattle;
    if (!battle) return;

    const currentDuel = battle.duels[battle.currentDuelIndex];
    if (!currentDuel) return;

    let statusMsg = "";

    if (battle.completed) {
      const winner =
        battle.winner === this.game.gameContext.currentPlayer?.id
          ? "You won!"
          : "You lost!";
      statusMsg = `Battle Complete! ${winner}`;
    } else {
      const duelNum = battle.currentDuelIndex + 1;
      statusMsg = `Duel ${duelNum}/2 - Phase: ${currentDuel.phase}`;

      if (currentDuel.phase === DuelPhase.COMMIT) {
        statusMsg += " - Select and commit your dragon";
      } else if (currentDuel.phase === DuelPhase.REVEAL) {
        statusMsg += " - Reveal your dragon choice";
      }
    }

    // Remove previous status text if it exists
    if (this.statusTextElement) {
      this.remove(this.statusTextElement);
    }

    // Create new status text element
    const statusTextGraphic = new Text({
      text: statusMsg,
      font: new Font({
        family: "Arial",
        size: 18,
        unit: FontUnit.Px,
        color: Color.White,
      }),
    });
    this.statusTextElement = new ScreenElement({
      x: 600,
      y: 100,
    });
    this.statusTextElement.graphics.add(statusTextGraphic);
    this.add(this.statusTextElement);

    // Show opponent info
    const opponent =
      battle.player1.id === this.game.gameContext.currentPlayer?.id
        ? battle.player2
        : battle.player1;

    const opponentInfo = new Text({
      text: `VS ${opponent.name} (${
        getAliveDragons(opponent).length
      } dragons left)`,
      font: new Font({
        family: "Arial",
        size: 16,
        unit: FontUnit.Px,
        color: Color.Yellow,
      }),
    });
    const opponentActor = new ScreenElement({
      x: 600,
      y: 150,
    });
    opponentActor.graphics.add(opponentInfo);
    this.add(opponentActor);
  }

  private updateButtonStates() {
    const battle = this.game.gameContext.currentBattle;
    const currentPlayer = this.game.gameContext.currentPlayer;

    if (!battle || !currentPlayer) return;

    const canCommit = canPlayerCommit(battle, currentPlayer.id);
    const canReveal = canPlayerReveal(battle, currentPlayer.id);

    // Remove and recreate buttons with updated state
    this.remove(this.commitButton);
    this.remove(this.revealButton);

    // Recreate commit button
    this.commitButton = new ScreenElement({
      x: 400,
      y: 600,
      width: 150,
      height: 50,
    });
    const commitRect = new Rectangle({
      width: 150,
      height: 50,
      color: canCommit ? Color.Green : Color.Gray,
    });
    const commitText = new Text({
      text: "Commit Dragon",
      font: new Font({
        family: "Arial",
        size: 16,
        unit: FontUnit.Px,
        color: Color.White,
      }),
    });
    this.commitButton.graphics.add(commitRect);
    this.commitButton.graphics.add(commitText);
    this.commitButton.on("pointerup", () => this.commitDragon());
    this.add(this.commitButton);

    // Recreate reveal button
    this.revealButton = new ScreenElement({
      x: 600,
      y: 600,
      width: 150,
      height: 50,
    });
    const revealRect = new Rectangle({
      width: 150,
      height: 50,
      color: canReveal ? Color.Orange : Color.Gray,
    });
    const revealText = new Text({
      text: "Reveal Dragon",
      font: new Font({
        family: "Arial",
        size: 16,
        unit: FontUnit.Px,
        color: Color.White,
      }),
    });
    this.revealButton.graphics.add(revealRect);
    this.revealButton.graphics.add(revealText);
    this.revealButton.on("pointerup", () => this.revealDragon());
    this.add(this.revealButton);
  }

  private selectDragon(dragonId: string) {
    this.selectedDragonId = dragonId;

    // Update dragon button states
    this.dragonButtons.forEach((button) => {
      button.updateSelected(button.dragon.id === dragonId);
    });
  }

  private commitDragon() {
    const battle = this.game.gameContext.currentBattle;
    const currentPlayer = this.game.gameContext.currentPlayer;

    if (!battle || !currentPlayer || !this.selectedDragonId) return;
    if (!canPlayerCommit(battle, currentPlayer.id)) return;

    // Generate nonce for commitment
    this.currentNonce = generateRandomNonce();

    // Send commit to server via socket
    this.game.commitDragon(this.selectedDragonId, this.currentNonce);
  }

  private revealDragon() {
    const battle = this.game.gameContext.currentBattle;
    const currentPlayer = this.game.gameContext.currentPlayer;

    if (
      !battle ||
      !currentPlayer ||
      !this.selectedDragonId ||
      !this.currentNonce
    )
      return;
    if (!canPlayerReveal(battle, currentPlayer.id)) return;

    // Send reveal to server via socket
    this.game.revealDragon(this.selectedDragonId, this.currentNonce);
  }
}

class DragonButton extends ScreenElement {
  public dragon: Dragon;
  private callback: () => void;
  private isSelected: boolean = false;
  private rect: Rectangle;

  constructor(x: number, y: number, dragon: Dragon, callback: () => void) {
    super({ x, y, width: 120, height: 80 });
    this.dragon = dragon;
    this.callback = callback;

    this.rect = new Rectangle({
      width: 120,
      height: 80,
      color: this.getDragonColor(),
    });

    const nameText = new Text({
      text: dragon.name,
      font: new Font({
        family: "Arial",
        size: 12,
        unit: FontUnit.Px,
        color: Color.White,
      }),
    });

    this.graphics.add(this.rect);
    this.graphics.add(nameText);

    this.on("pointerup", this.callback);
  }

  private getDragonColor(): Color {
    switch (this.dragon.type) {
      case "fire":
        return Color.Red;
      case "water":
        return Color.Blue;
      case "air":
        return Color.Cyan;
      case "earth":
        return Color.Brown;
      case "aether":
        return Color.Purple;
      default:
        return Color.Gray;
    }
  }

  public updateSelected(selected: boolean) {
    this.isSelected = selected;
    this.rect.color = selected ? Color.White : this.getDragonColor();
  }
}
