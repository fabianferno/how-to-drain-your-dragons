import {
  Scene,
  Actor,
  Color,
  Vector,
  ScreenElement,
  Font,
  FontUnit,
  Text,
  Rectangle,
} from "excalibur";
import { DragonType } from "../../types/game";
// DragonBattleGame will be passed through constructor to avoid circular imports

export class RegistrationScene extends Scene {
  private game: any; // DragonBattleGame type
  private selectedDragons: DragonType[] = [];
  private playerName: string = "";
  private dragonButtons: DragonButton[] = [];
  private nameInputElement: HTMLInputElement | null = null;
  private registerButton: ScreenElement;
  private statusText: ScreenElement;

  constructor(game: any) {
    super();
    this.game = game;
    this.registerButton = new ScreenElement({
      x: 600,
      y: 650,
      width: 200,
      height: 50,
    });
    this.statusText = new ScreenElement({
      x: 600,
      y: 550,
    });
  }

  onInitialize() {
    // Title
    const title = new Text({
      text: "How to Drain Your Dragon",
      font: new Font({
        family: "Arial",
        size: 32,
        unit: FontUnit.Px,
        color: Color.White,
      }),
    });
    const titleActor = new ScreenElement({
      x: 600,
      y: 80,
    });
    titleActor.graphics.add(title);
    this.add(titleActor);

    // Subtitle
    const subtitle = new Text({
      text: "(Too)",
      font: new Font({
        family: "Arial",
        size: 20,
        unit: FontUnit.Px,
        color: Color.Yellow,
      }),
    });
    const subtitleActor = new ScreenElement({
      x: 600,
      y: 120,
    });
    subtitleActor.graphics.add(subtitle);
    this.add(subtitleActor);

    // Name input label
    const nameLabel = new Text({
      text: "Enter Your Name:",
      font: new Font({
        family: "Arial",
        size: 18,
        unit: FontUnit.Px,
        color: Color.White,
      }),
    });
    const nameLabelActor = new ScreenElement({
      x: 600,
      y: 180,
    });
    nameLabelActor.graphics.add(nameLabel);
    this.add(nameLabelActor);

    // Create HTML input overlay
    this.createNameInput();

    // Dragon selection title
    const dragonTitle = new Text({
      text: "Choose 3 Dragons:",
      font: new Font({
        family: "Arial",
        size: 24,
        unit: FontUnit.Px,
        color: Color.White,
      }),
    });
    const dragonTitleActor = new ScreenElement({
      x: 600,
      y: 280,
    });
    dragonTitleActor.graphics.add(dragonTitle);
    this.add(dragonTitleActor);

    // Instructions
    const instructions = new Text({
      text: "Select exactly 3 different dragons to battle with",
      font: new Font({
        family: "Arial",
        size: 16,
        unit: FontUnit.Px,
        color: Color.LightGray,
      }),
    });
    const instructionsActor = new ScreenElement({
      x: 600,
      y: 320,
    });
    instructionsActor.graphics.add(instructions);
    this.add(instructionsActor);

    // Dragon selection buttons
    const dragonTypes = Object.values(DragonType);
    const startX = 300;
    const spacing = 150;

    dragonTypes.forEach((dragonType, index) => {
      const button = new DragonButton(
        startX + index * spacing,
        400,
        dragonType,
        () => this.toggleDragon(dragonType)
      );
      this.dragonButtons.push(button);
      this.add(button);
    });

    // Status text
    this.add(this.statusText);
    this.updateStatusText();

    // Register button
    const registerText = new Text({
      text: "Enter Game",
      font: new Font({
        family: "Arial",
        size: 20,
        unit: FontUnit.Px,
        color: Color.White,
      }),
    });
    this.registerButton.graphics.add(
      new Rectangle({
        width: 200,
        height: 50,
        color: Color.Green,
      })
    );
    this.registerButton.graphics.add(registerText);
    this.registerButton.on("pointerup", () => this.attemptRegistration());
    this.add(this.registerButton);
  }

  private createNameInput() {
    // Create HTML input element
    this.nameInputElement = document.createElement("input");
    this.nameInputElement.type = "text";
    this.nameInputElement.placeholder = "Enter your player name...";
    this.nameInputElement.maxLength = 20;
    this.nameInputElement.style.cssText = `
      position: absolute;
      left: 450px;
      top: 200px;
      width: 300px;
      height: 40px;
      padding: 8px 12px;
      font-size: 16px;
      border: 2px solid #444;
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      font-family: Arial, sans-serif;
      z-index: 1000;
    `;

    // Add input event listener
    this.nameInputElement.addEventListener("input", (e) => {
      this.playerName = (e.target as HTMLInputElement).value;
      this.updateStatusText();
    });

    // Add to DOM
    document.body.appendChild(this.nameInputElement);
  }

  private updateStatusText() {
    let statusMsg = "";
    let color = Color.White;

    if (this.playerName.trim() === "") {
      statusMsg = "Please enter your name";
      color = Color.Yellow;
    } else if (this.selectedDragons.length === 0) {
      statusMsg = "Select 3 dragons to continue";
      color = Color.Yellow;
    } else if (this.selectedDragons.length < 3) {
      statusMsg = `Select ${3 - this.selectedDragons.length} more dragon(s)`;
      color = Color.Orange;
    } else if (this.selectedDragons.length === 3) {
      statusMsg = "Ready to enter the game!";
      color = Color.Green;
    }

    const statusText = new Text({
      text: statusMsg,
      font: new Font({
        family: "Arial",
        size: 18,
        unit: FontUnit.Px,
        color: color,
      }),
    });

    this.statusText.graphics.use(statusText);
  }

  private toggleDragon(dragonType: DragonType) {
    const index = this.selectedDragons.indexOf(dragonType);
    if (index >= 0) {
      // Remove dragon
      this.selectedDragons.splice(index, 1);
    } else if (this.selectedDragons.length < 3) {
      // Add dragon
      this.selectedDragons.push(dragonType);
    }

    // Update button states
    this.dragonButtons.forEach((button) => {
      button.updateSelected(this.selectedDragons.includes(button.dragonType));
    });

    this.updateStatusText();
  }

  private async attemptRegistration() {
    const name = this.playerName.trim();
    if (name === "") {
      alert("Please enter your name!");
      return;
    }

    if (this.selectedDragons.length !== 3) {
      alert("Please select exactly 3 dragons!");
      return;
    }

    try {
      // Clean up HTML input
      this.cleanupInput();

      // Show loading state
      const loadingText = new Text({
        text: "Connecting to server...",
        font: new Font({
          family: "Arial",
          size: 18,
          unit: FontUnit.Px,
          color: Color.Cyan,
        }),
      });
      this.statusText.graphics.use(loadingText);

      await this.game.registerPlayer(name, this.selectedDragons);
    } catch (error) {
      console.error("Registration failed:", error);

      // Show error message
      const errorText = new Text({
        text: "Connection failed! Please try again.",
        font: new Font({
          family: "Arial",
          size: 18,
          unit: FontUnit.Px,
          color: Color.Red,
        }),
      });
      this.statusText.graphics.use(errorText);

      // Recreate input after error
      setTimeout(() => {
        this.createNameInput();
        this.updateStatusText();
      }, 2000);
    }
  }

  private cleanupInput() {
    if (this.nameInputElement && this.nameInputElement.parentNode) {
      this.nameInputElement.parentNode.removeChild(this.nameInputElement);
      this.nameInputElement = null;
    }
  }

  onActivate() {
    // Reset state when scene activates
    this.selectedDragons = [];
    this.playerName = "";
    this.dragonButtons.forEach((button) => {
      button.updateSelected(false);
    });

    // Recreate input if needed
    if (!this.nameInputElement) {
      this.createNameInput();
    }

    this.updateStatusText();
  }

  onDeactivate() {
    // Clean up HTML input when leaving scene
    this.cleanupInput();
  }
}

class DragonButton extends ScreenElement {
  public dragonType: DragonType;
  private callback: () => void;
  private isSelected: boolean = false;
  private rect: Rectangle;
  private text: Text;

  constructor(
    x: number,
    y: number,
    dragonType: DragonType,
    callback: () => void
  ) {
    super({ x, y, width: 120, height: 80 });
    this.dragonType = dragonType;
    this.callback = callback;

    this.rect = new Rectangle({
      width: 120,
      height: 80,
      color: this.getDragonColor(dragonType),
    });

    this.text = new Text({
      text: dragonType.toUpperCase(),
      font: new Font({
        family: "Arial",
        size: 14,
        unit: FontUnit.Px,
        color: Color.White,
      }),
    });

    this.graphics.add(this.rect);
    this.graphics.add(this.text);

    this.on("pointerup", this.callback);
  }

  private getDragonColor(dragonType: DragonType): Color {
    switch (dragonType) {
      case DragonType.FIRE:
        return Color.Red;
      case DragonType.WATER:
        return Color.Blue;
      case DragonType.AIR:
        return Color.Cyan;
      case DragonType.EARTH:
        return Color.Brown;
      case DragonType.AETHER:
        return Color.Purple;
      default:
        return Color.Gray;
    }
  }

  public updateSelected(selected: boolean) {
    this.isSelected = selected;
    this.rect.color = selected
      ? Color.White
      : this.getDragonColor(this.dragonType);
    this.text.color = selected ? Color.Black : Color.White;
  }
}
