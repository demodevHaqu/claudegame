import * as Phaser from "phaser";
import { AudioSystem } from "../systems/AudioSystem";
import type { GameState } from "./GameScene";

type Difficulty = "easy" | "normal" | "hard" | "nightmare";

interface DifficultyOption {
  key: Difficulty;
  label: string;
  color: number;
  description: string;
}

const DIFFICULTIES: DifficultyOption[] = [
  { key: "easy", label: "EASY", color: 0x00ff00, description: "For beginners" },
  { key: "normal", label: "NORMAL", color: 0x00ffff, description: "Standard experience" },
  { key: "hard", label: "HARD", color: 0xff8800, description: "For veterans" },
  { key: "nightmare", label: "NIGHTMARE", color: 0xff0000, description: "No mercy" },
];

export class MenuScene extends Phaser.Scene {
  private audioSystem!: AudioSystem;
  private selectedDifficulty: number = 1; // Normal by default
  private difficultyButtons: Phaser.GameObjects.Container[] = [];
  private titleText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "MenuScene" });
  }

  create() {
    const { width, height } = this.cameras.main;

    this.audioSystem = new AudioSystem(this);
    this.audioSystem.playMenuBGM();

    // 배경
    this.createBackground();

    // 타이틀
    this.createTitle();

    // 난이도 선택
    this.createDifficultySelector();

    // 시작 버튼
    this.createStartButton();

    // 조작법
    this.createControls();

    // 크레딧
    this.createCredits();

    // 키보드 이벤트
    this.setupKeyboard();

    // 페이드 인
    this.cameras.main.fadeIn(500);
  }

  private createBackground() {
    const { width, height } = this.cameras.main;

    // 그라데이션 배경
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0a0f, 0x0a0a0f, 0x16213e, 0x16213e);
    bg.fillRect(0, 0, width, height);

    // 그리드
    bg.lineStyle(1, 0x00ffff, 0.03);
    for (let i = 0; i < width; i += 40) {
      bg.moveTo(i, 0);
      bg.lineTo(i, height);
    }
    for (let i = 0; i < height; i += 40) {
      bg.moveTo(0, i);
      bg.lineTo(width, i);
    }
    bg.strokePath();

    // 움직이는 파티클
    for (let i = 0; i < 30; i++) {
      const particle = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(1, 3),
        0x00ffff,
        0.3
      );

      this.tweens.add({
        targets: particle,
        y: { from: particle.y, to: particle.y - 100 },
        alpha: { from: 0.3, to: 0 },
        duration: Phaser.Math.Between(3000, 6000),
        repeat: -1,
        onRepeat: () => {
          particle.x = Phaser.Math.Between(0, width);
          particle.y = height + 50;
          particle.setAlpha(0.3);
        },
      });
    }
  }

  private createTitle() {
    const { width } = this.cameras.main;

    // ASCII 아트 타이틀
    const asciiTitle = this.add.text(width / 2, 100,
`  ██████╗██╗      █████╗ ██╗   ██╗██████╗ ███████╗
 ██╔════╝██║     ██╔══██╗██║   ██║██╔══██╗██╔════╝
 ██║     ██║     ███████║██║   ██║██║  ██║█████╗
 ██║     ██║     ██╔══██║██║   ██║██║  ██║██╔══╝
 ╚██████╗███████╗██║  ██║╚██████╔╝██████╔╝███████╗
  ╚═════╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝`, {
      fontFamily: "monospace",
      fontSize: "14px",
      color: "#FFD700",
      align: "center",
    });
    asciiTitle.setOrigin(0.5, 0);

    // 서브타이틀
    this.titleText = this.add.text(width / 2, 210, "AI ARENA: CODE WARS", {
      fontFamily: "monospace",
      fontSize: "32px",
      color: "#FFFFFF",
    });
    this.titleText.setOrigin(0.5);

    // 글리치 효과
    this.time.addEvent({
      delay: 3000,
      loop: true,
      callback: () => {
        this.tweens.add({
          targets: this.titleText,
          x: { from: width / 2 - 3, to: width / 2 + 3 },
          duration: 50,
          yoyo: true,
          repeat: 3,
        });
      },
    });

    // 태그라인
    this.add.text(width / 2, 250, "Claude vs AI Competitors", {
      fontFamily: "monospace",
      fontSize: "16px",
      color: "#888888",
    }).setOrigin(0.5);
  }

  private createDifficultySelector() {
    const { width, height } = this.cameras.main;
    const startY = height / 2 - 40;

    // 제목
    this.add.text(width / 2, startY - 50, "SELECT DIFFICULTY", {
      fontFamily: "monospace",
      fontSize: "20px",
      color: "#888888",
    }).setOrigin(0.5);

    // 버튼들
    DIFFICULTIES.forEach((diff, i) => {
      const btn = this.createDifficultyButton(
        width / 2,
        startY + i * 50,
        diff,
        i
      );
      this.difficultyButtons.push(btn);
    });

    this.updateDifficultySelection();
  }

  private createDifficultyButton(
    x: number,
    y: number,
    diff: DifficultyOption,
    index: number
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    // 배경
    const bg = this.add.rectangle(0, 0, 300, 40, 0x1a1a2e);
    bg.setStrokeStyle(2, diff.color, 0.5);

    // 라벨
    const label = this.add.text(-100, 0, diff.label, {
      fontFamily: "monospace",
      fontSize: "18px",
      color: Phaser.Display.Color.IntegerToColor(diff.color).rgba,
    }).setOrigin(0, 0.5);

    // 설명
    const desc = this.add.text(100, 0, diff.description, {
      fontFamily: "monospace",
      fontSize: "12px",
      color: "#666666",
    }).setOrigin(1, 0.5);

    container.add([bg, label, desc]);

    // 인터랙션
    bg.setInteractive({ useHandCursor: true });
    bg.on("pointerover", () => {
      this.selectedDifficulty = index;
      this.updateDifficultySelection();
      this.audioSystem.playClick();
    });
    bg.on("pointerdown", () => {
      this.startGame();
    });

    return container;
  }

  private updateDifficultySelection() {
    this.difficultyButtons.forEach((btn, i) => {
      const bg = btn.first as Phaser.GameObjects.Rectangle;
      const diff = DIFFICULTIES[i];

      if (i === this.selectedDifficulty) {
        bg.setFillStyle(diff.color, 0.3);
        bg.setStrokeStyle(3, diff.color, 1);
        this.tweens.add({
          targets: btn,
          scaleX: 1.05,
          scaleY: 1.05,
          duration: 100,
        });
      } else {
        bg.setFillStyle(0x1a1a2e, 1);
        bg.setStrokeStyle(2, diff.color, 0.5);
        btn.setScale(1);
      }
    });
  }

  private createStartButton() {
    const { width, height } = this.cameras.main;

    const startBtn = this.add.text(width / 2, height - 150, "[ PRESS ENTER TO START ]", {
      fontFamily: "monospace",
      fontSize: "24px",
      color: "#FFD700",
    });
    startBtn.setOrigin(0.5);
    startBtn.setInteractive({ useHandCursor: true });

    // 깜빡임
    this.tweens.add({
      targets: startBtn,
      alpha: { from: 1, to: 0.3 },
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    startBtn.on("pointerdown", () => this.startGame());
  }

  private createControls() {
    const { width, height } = this.cameras.main;

    const controls = [
      "Arrow Keys: Move",
      "Z: Attack",
      "X: Beam Skill",
      "C: Shield",
      "SPACE: Ultimate",
    ];

    const controlsText = this.add.text(width / 2, height - 80, controls.join("  |  "), {
      fontFamily: "monospace",
      fontSize: "12px",
      color: "#666666",
    });
    controlsText.setOrigin(0.5);
  }

  private createCredits() {
    const { width, height } = this.cameras.main;

    this.add.text(width / 2, height - 30, "Made with Claude Code Opus 4.5", {
      fontFamily: "monospace",
      fontSize: "11px",
      color: "#444444",
    }).setOrigin(0.5);
  }

  private setupKeyboard() {
    this.input.keyboard?.on("keydown-UP", () => {
      this.selectedDifficulty = Math.max(0, this.selectedDifficulty - 1);
      this.updateDifficultySelection();
      this.audioSystem.playClick();
    });

    this.input.keyboard?.on("keydown-DOWN", () => {
      this.selectedDifficulty = Math.min(DIFFICULTIES.length - 1, this.selectedDifficulty + 1);
      this.updateDifficultySelection();
      this.audioSystem.playClick();
    });

    this.input.keyboard?.on("keydown-ENTER", () => {
      this.startGame();
    });

    this.input.keyboard?.on("keydown-M", () => {
      this.audioSystem.toggleMute();
    });
  }

  private startGame() {
    this.audioSystem.playSelect();
    this.audioSystem.stopBGM();

    const gameState: GameState = {
      stage: 1,
      score: 0,
      deaths: 0,
      startTime: Date.now(),
      stageTimes: [],
      difficulty: DIFFICULTIES[this.selectedDifficulty].key,
    };

    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.time.delayedCall(500, () => {
      this.scene.start("BossIntroScene", { stage: 1, gameState });
    });
  }
}
