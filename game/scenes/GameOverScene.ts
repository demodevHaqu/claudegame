import * as Phaser from "phaser";
import type { GameState } from "./GameScene";

export class GameOverScene extends Phaser.Scene {
  private gameState!: GameState;
  private stage: number = 1;

  constructor() {
    super({ key: "GameOverScene" });
  }

  init(data: { gameState: GameState; stage: number }) {
    this.gameState = data.gameState;
    this.stage = data.stage;
  }

  create() {
    const { width, height } = this.cameras.main;
    this.cameras.main.setBackgroundColor(0x0a0a0f);

    // 게임 오버 텍스트
    const gameOver = this.add.text(width / 2, height / 3, "GAME OVER", {
      fontFamily: "monospace",
      fontSize: "64px",
      color: "#FF0000",
      stroke: "#880000",
      strokeThickness: 4,
    });
    gameOver.setOrigin(0.5);

    // 글리치 효과
    this.tweens.add({
      targets: gameOver,
      x: { from: width / 2 - 3, to: width / 2 + 3 },
      duration: 50,
      yoyo: true,
      repeat: -1,
    });

    // 현재 진행 상황
    const stageText = this.add.text(width / 2, height / 2, `Defeated at Stage ${this.stage}`, {
      fontFamily: "monospace",
      fontSize: "24px",
      color: "#888888",
    });
    stageText.setOrigin(0.5);

    const scoreText = this.add.text(width / 2, height / 2 + 40, `Score: ${this.gameState.score.toLocaleString()}`, {
      fontFamily: "monospace",
      fontSize: "20px",
      color: "#FFD700",
    });
    scoreText.setOrigin(0.5);

    // 리트라이 버튼
    const retryBtn = this.add.text(width / 2, height / 2 + 120, "[ RETRY - Press R ]", {
      fontFamily: "monospace",
      fontSize: "24px",
      color: "#00FFFF",
    });
    retryBtn.setOrigin(0.5);
    retryBtn.setInteractive({ useHandCursor: true });

    // 메인 메뉴 버튼
    const menuBtn = this.add.text(width / 2, height / 2 + 170, "[ MAIN MENU - Press M ]", {
      fontFamily: "monospace",
      fontSize: "20px",
      color: "#FFFFFF",
    });
    menuBtn.setOrigin(0.5);
    menuBtn.setInteractive({ useHandCursor: true });

    // 호버 효과
    [retryBtn, menuBtn].forEach((btn) => {
      btn.on("pointerover", () => btn.setColor("#FFD700"));
      btn.on("pointerout", () => btn.setColor(btn === retryBtn ? "#00FFFF" : "#FFFFFF"));
    });

    // 키보드 이벤트
    this.input.keyboard?.once("keydown-R", () => this.retry());
    this.input.keyboard?.once("keydown-M", () => this.goToMenu());

    retryBtn.on("pointerdown", () => this.retry());
    menuBtn.on("pointerdown", () => this.goToMenu());
  }

  private retry() {
    // 현재 스테이지부터 다시 시작 (점수와 사망 횟수 유지)
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.time.delayedCall(500, () => {
      this.scene.start("BossIntroScene", {
        stage: this.stage,
        gameState: {
          ...this.gameState,
          stageTimes: this.gameState.stageTimes.slice(0, this.stage - 1),
        },
      });
    });
  }

  private goToMenu() {
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.time.delayedCall(500, () => {
      // Next.js 홈페이지로 이동
      window.location.href = "/";
    });
  }
}
