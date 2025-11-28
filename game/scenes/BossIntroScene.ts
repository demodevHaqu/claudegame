import * as Phaser from "phaser";
import type { GameState } from "./GameScene";
import { AudioSystem } from "../systems/AudioSystem";

interface BossInfo {
  name: string;
  title: string;
  color: number;
  difficulty: string;
  tagline: string;
}

const BOSS_DATA: Record<number, BossInfo> = {
  1: {
    name: "GPT-4o",
    title: '"The Rookie"',
    color: 0x00ffff,
    difficulty: "★",
    tagline: "Your journey begins here...",
  },
  2: {
    name: "Gemini 2.0",
    title: '"Flash"',
    color: 0x9400d3,
    difficulty: "★★",
    tagline: "Speed is everything.",
  },
  3: {
    name: "GPT-5",
    title: '"Titan"',
    color: 0x00ced1,
    difficulty: "★★★",
    tagline: "Power beyond measure.",
  },
  4: {
    name: "Gemini 3 Pro",
    title: '"Galaxy Master"',
    color: 0x8a2be2,
    difficulty: "★★★★",
    tagline: "The multiverse awaits.",
  },
  5: {
    name: "???",
    title: '"The Benchmark"',
    color: 0xff0080,
    difficulty: "★★★★★",
    tagline: "This is your final test.",
  },
};

export class BossIntroScene extends Phaser.Scene {
  private stage: number = 1;
  private gameState?: GameState;
  private audioSystem!: AudioSystem;

  constructor() {
    super({ key: "BossIntroScene" });
  }

  init(data: { stage: number; gameState?: GameState }) {
    this.stage = data.stage || 1;
    this.gameState = data.gameState;
  }

  create() {
    const { width, height } = this.cameras.main;
    const bossInfo = BOSS_DATA[this.stage];

    this.audioSystem = new AudioSystem(this);

    // 배경
    this.cameras.main.setBackgroundColor(0x0a0a0f);

    // 스캔라인 효과
    const scanlines = this.add.graphics();
    scanlines.setDepth(100);
    for (let i = 0; i < height; i += 4) {
      scanlines.fillStyle(0x000000, 0.1);
      scanlines.fillRect(0, i, width, 2);
    }

    // 글리치 오버레이
    const glitchOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0);
    glitchOverlay.setDepth(99);

    // 글리치 효과
    this.time.addEvent({
      delay: 100,
      repeat: 50,
      callback: () => {
        if (Math.random() < 0.3) {
          glitchOverlay.setAlpha(0.1);
          glitchOverlay.setFillStyle(bossInfo.color, 0.1);
          this.time.delayedCall(50, () => glitchOverlay.setAlpha(0));
        }
      },
    });

    // 시퀀스 시작
    this.playIntroSequence(bossInfo);
  }

  private playIntroSequence(bossInfo: BossInfo) {
    const { width, height } = this.cameras.main;

    // === Phase 1: WARNING (0-1.5초) ===
    const warningBg = this.add.rectangle(width / 2, height / 2, width, 100, 0xff0000, 0.2);
    warningBg.setAlpha(0);

    const warning = this.add.text(width / 2, height / 2, "⚠ WARNING ⚠", {
      fontFamily: "monospace",
      fontSize: "56px",
      color: "#FF0000",
    });
    warning.setOrigin(0.5);
    warning.setAlpha(0);

    // 경고 페이드 인 + 깜빡임
    this.tweens.add({
      targets: [warning, warningBg],
      alpha: 1,
      duration: 200,
      onComplete: () => {
        this.tweens.add({
          targets: [warning, warningBg],
          alpha: { from: 1, to: 0.3 },
          duration: 150,
          yoyo: true,
          repeat: 4,
          onComplete: () => {
            this.tweens.add({
              targets: [warning, warningBg],
              alpha: 0,
              duration: 200,
            });
          },
        });
      },
    });

    // 사운드
    this.audioSystem.playBossAppear();

    // === Phase 2: STAGE 표시 (1.5-2.5초) ===
    this.time.delayedCall(1500, () => {
      // 라인 효과
      const topLine = this.add.rectangle(width / 2, height / 3 - 50, 0, 3, 0xffffff);
      const bottomLine = this.add.rectangle(width / 2, height / 3 + 50, 0, 3, 0xffffff);

      this.tweens.add({
        targets: [topLine, bottomLine],
        width: 400,
        duration: 300,
        ease: "Cubic.easeOut",
      });

      const stageText = this.add.text(width / 2, height / 3, `STAGE ${this.stage}`, {
        fontFamily: "monospace",
        fontSize: "36px",
        color: "#FFFFFF",
      });
      stageText.setOrigin(0.5);
      stageText.setAlpha(0);

      this.tweens.add({
        targets: stageText,
        alpha: 1,
        duration: 300,
        delay: 200,
      });
    });

    // === Phase 3: 보스 이름 + 타이틀 (2.5-4초) ===
    this.time.delayedCall(2500, () => {
      // 화면 흔들림
      this.cameras.main.shake(300, 0.02);

      // 보스 이름 (타자기 효과)
      const bossNameContainer = this.add.container(width / 2, height / 2);

      const bossName = this.add.text(0, 0, "", {
        fontFamily: "monospace",
        fontSize: "72px",
        color: Phaser.Display.Color.IntegerToColor(bossInfo.color).rgba,
      });
      bossName.setOrigin(0.5);
      bossNameContainer.add(bossName);

      // 타자기 효과
      let charIndex = 0;
      const typeTimer = this.time.addEvent({
        delay: 80,
        repeat: bossInfo.name.length - 1,
        callback: () => {
          charIndex++;
          bossName.setText(bossInfo.name.substring(0, charIndex));
          this.audioSystem.playClick();
        },
      });

      // 타이틀
      this.time.delayedCall(bossInfo.name.length * 80 + 200, () => {
        const bossTitle = this.add.text(0, 55, bossInfo.title, {
          fontFamily: "monospace",
          fontSize: "28px",
          color: "#AAAAAA",
        });
        bossTitle.setOrigin(0.5);
        bossTitle.setAlpha(0);
        bossNameContainer.add(bossTitle);

        this.tweens.add({
          targets: bossTitle,
          alpha: 1,
          y: 60,
          duration: 400,
          ease: "Back.easeOut",
        });
      });

      // 난이도 별
      this.time.delayedCall(bossInfo.name.length * 80 + 600, () => {
        const difficulty = this.add.text(0, 110, bossInfo.difficulty, {
          fontFamily: "monospace",
          fontSize: "40px",
          color: "#FFD700",
        });
        difficulty.setOrigin(0.5);
        difficulty.setAlpha(0);
        difficulty.setScale(0.5);
        bossNameContainer.add(difficulty);

        this.tweens.add({
          targets: difficulty,
          alpha: 1,
          scale: 1,
          duration: 300,
          ease: "Back.easeOut",
        });
      });
    });

    // === Phase 4: 태그라인 (4-5초) ===
    this.time.delayedCall(4000, () => {
      const tagline = this.add.text(width / 2, height * 0.75, bossInfo.tagline, {
        fontFamily: "monospace",
        fontSize: "20px",
        color: "#666666",
        fontStyle: "italic",
      });
      tagline.setOrigin(0.5);
      tagline.setAlpha(0);

      this.tweens.add({
        targets: tagline,
        alpha: 1,
        duration: 500,
      });
    });

    // === Phase 5: "FIGHT!" + 전환 (5-6초) ===
    this.time.delayedCall(5000, () => {
      // 화면 플래시
      this.cameras.main.flash(200, 255, 255, 255);

      const fight = this.add.text(width / 2, height / 2, "FIGHT!", {
        fontFamily: "monospace",
        fontSize: "96px",
        color: "#FFD700",
        stroke: "#000000",
        strokeThickness: 8,
      });
      fight.setOrigin(0.5);
      fight.setScale(0.5);
      fight.setDepth(200);

      this.tweens.add({
        targets: fight,
        scale: { from: 0.5, to: 1.5 },
        alpha: { from: 1, to: 0 },
        duration: 800,
        ease: "Cubic.easeOut",
      });

      this.audioSystem.playSelect();
    });

    // === 게임 시작 ===
    this.time.delayedCall(5800, () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(300, () => {
        this.audioSystem.destroy();
        this.scene.start("GameScene", {
          stage: this.stage,
          gameState: this.gameState,
        });
      });
    });
  }
}
