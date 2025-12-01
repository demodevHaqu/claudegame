import * as Phaser from "phaser";
import type { GameState } from "./GameScene";

export class VictoryScene extends Phaser.Scene {
  private gameState!: GameState;

  constructor() {
    super({ key: "VictoryScene" });
  }

  init(data: { gameState: GameState }) {
    this.gameState = data.gameState;
  }

  create() {
    const { width, height } = this.cameras.main;
    this.cameras.main.setBackgroundColor(0x0a0a0f);

    // 승리 텍스트
    const victory = this.add.text(width / 2, height / 4, "VICTORY!", {
      fontFamily: "monospace",
      fontSize: "72px",
      color: "#FFD700",
      stroke: "#FF8C00",
      strokeThickness: 4,
    });
    victory.setOrigin(0.5);

    // 글리치 효과
    this.tweens.add({
      targets: victory,
      scaleX: { from: 1, to: 1.05 },
      scaleY: { from: 1, to: 0.95 },
      duration: 100,
      yoyo: true,
      repeat: -1,
      repeatDelay: 1500,
    });

    // 총 시간
    const totalTime = Date.now() - this.gameState.startTime;
    const minutes = Math.floor(totalTime / 60000);
    const seconds = Math.floor((totalTime % 60000) / 1000);

    // 보너스 계산
    let finalScore = this.gameState.score;
    const bonuses: string[] = [];

    // 노데스 보너스
    if (this.gameState.deaths === 0) {
      finalScore = Math.floor(finalScore * 1.5);
      bonuses.push("NO DEATH BONUS x1.5");
    }

    // 스피드런 보너스
    if (totalTime < 300000) { // 5분 이내
      finalScore = Math.floor(finalScore * 2);
      bonuses.push("SPEED RUN BONUS x2.0");
    }

    // 결과 표시
    const resultY = height / 2 - 50;
    const results = [
      `TIME: ${minutes}:${seconds.toString().padStart(2, "0")}`,
      `DEATHS: ${this.gameState.deaths}`,
      `BASE SCORE: ${this.gameState.score.toLocaleString()}`,
      ...bonuses,
      ``,
      `FINAL SCORE: ${finalScore.toLocaleString()}`,
    ];

    results.forEach((text, i) => {
      const isLast = i === results.length - 1;
      const t = this.add.text(width / 2, resultY + i * 35, text, {
        fontFamily: "monospace",
        fontSize: isLast ? "28px" : "20px",
        color: isLast ? "#FFD700" : text.includes("BONUS") ? "#00FF00" : "#FFFFFF",
      });
      t.setOrigin(0.5);
    });

    // 이름 입력
    const nameLabel = this.add.text(width / 2, height - 180, "ENTER YOUR NAME:", {
      fontFamily: "monospace",
      fontSize: "16px",
      color: "#888888",
    });
    nameLabel.setOrigin(0.5);

    let playerName = "";
    const nameDisplay = this.add.text(width / 2, height - 140, "_", {
      fontFamily: "monospace",
      fontSize: "24px",
      color: "#00FFFF",
    });
    nameDisplay.setOrigin(0.5);

    // 커서 깜빡임
    this.tweens.add({
      targets: nameDisplay,
      alpha: { from: 1, to: 0.3 },
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    // 키보드 입력
    this.input.keyboard?.on("keydown", (event: KeyboardEvent) => {
      if (event.key === "Enter" && playerName.length > 0) {
        this.submitScore(playerName, finalScore, totalTime);
      } else if (event.key === "Backspace") {
        playerName = playerName.slice(0, -1);
        nameDisplay.setText(playerName + "_");
      } else if (event.key.length === 1 && playerName.length < 12) {
        if (/[a-zA-Z0-9]/.test(event.key)) {
          playerName += event.key.toUpperCase();
          nameDisplay.setText(playerName + "_");
        }
      }
    });

    // 안내 텍스트
    this.add.text(width / 2, height - 80, "Press ENTER to submit score", {
      fontFamily: "monospace",
      fontSize: "14px",
      color: "#666666",
    }).setOrigin(0.5);
  }

  private async submitScore(name: string, score: number, time: number) {
    try {
      // 게임 결과를 localStorage에 저장 (React 컴포넌트에서 Clerk 정보와 함께 제출)
      const gameResult = {
        playerName: name,
        totalScore: score,
        totalTime: time,
        deaths: this.gameState.deaths,
        stage1Time: this.gameState.stageTimes[0] || null,
        stage2Time: this.gameState.stageTimes[1] || null,
        stage3Time: this.gameState.stageTimes[2] || null,
        stage4Time: this.gameState.stageTimes[3] || null,
        stage5Time: this.gameState.stageTimes[4] || null,
        noDeathBonus: this.gameState.deaths === 0,
        speedRunBonus: time < 300000,
        timestamp: Date.now(),
      };

      localStorage.setItem("gameResult", JSON.stringify(gameResult));

      // 리더보드로 이동 (React 컴포넌트에서 자동 제출)
      window.location.href = "/leaderboard";
    } catch (error) {
      console.error("Failed to save game result:", error);
    }
  }
}
