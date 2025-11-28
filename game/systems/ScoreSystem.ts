import * as Phaser from "phaser";

export interface ScoreData {
  baseScore: number;
  comboBonus: number;
  timeBonus: number;
  noDeathBonus: number;
  totalScore: number;
}

export interface StageResult {
  stage: number;
  time: number;
  score: number;
  maxCombo: number;
  damageDealt: number;
  damageTaken: number;
  perfectClear: boolean;
}

export class ScoreSystem {
  private scene: Phaser.Scene;
  private score: number = 0;
  private displayScore: number = 0;
  private maxCombo: number = 0;
  private damageDealt: number = 0;
  private damageTaken: number = 0;
  private stageResults: StageResult[] = [];

  private scoreUI!: Phaser.GameObjects.Container;
  private scoreText!: Phaser.GameObjects.Text;
  private addScoreText!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.createUI();
  }

  private createUI() {
    const { width } = this.scene.cameras.main;

    this.scoreUI = this.scene.add.container(width / 2, 80);
    this.scoreUI.setDepth(200);

    // 메인 스코어
    this.scoreText = this.scene.add.text(0, 0, "0", {
      fontFamily: "monospace",
      fontSize: "36px",
      color: "#FFD700",
      stroke: "#000000",
      strokeThickness: 4,
    });
    this.scoreText.setOrigin(0.5);

    // SCORE 라벨
    const label = this.scene.add.text(0, -25, "SCORE", {
      fontFamily: "monospace",
      fontSize: "14px",
      color: "#888888",
    });
    label.setOrigin(0.5);

    // 추가 점수 표시
    this.addScoreText = this.scene.add.text(0, 30, "", {
      fontFamily: "monospace",
      fontSize: "20px",
      color: "#00FF00",
    });
    this.addScoreText.setOrigin(0.5);
    this.addScoreText.setAlpha(0);

    this.scoreUI.add([label, this.scoreText, this.addScoreText]);
  }

  addScore(amount: number, multiplier: number = 1, showPopup: boolean = true) {
    const finalAmount = Math.floor(amount * multiplier);
    this.score += finalAmount;

    if (showPopup && finalAmount > 0) {
      this.showScorePopup(finalAmount);
    }

    // 스코어 카운트업 애니메이션
    this.scene.tweens.add({
      targets: this,
      displayScore: this.score,
      duration: 300,
      ease: "Cubic.easeOut",
      onUpdate: () => {
        this.scoreText.setText(Math.floor(this.displayScore).toLocaleString());
      },
    });

    return finalAmount;
  }

  private showScorePopup(amount: number) {
    this.addScoreText.setText(`+${amount.toLocaleString()}`);
    this.addScoreText.setAlpha(1);

    this.scene.tweens.add({
      targets: this.addScoreText,
      y: 20,
      alpha: 0,
      duration: 800,
      ease: "Cubic.easeOut",
      onComplete: () => {
        this.addScoreText.setY(30);
      },
    });

    // 스코어 텍스트 펀치 효과
    this.scene.tweens.add({
      targets: this.scoreText,
      scale: { from: 1.2, to: 1 },
      duration: 150,
    });
  }

  // 보스 처치 점수
  addBossKillScore(stage: number, remainingHp: number, maxHp: number) {
    const baseScore = stage * 2000;
    const hpBonus = Math.floor((remainingHp / maxHp) * 1000);
    const total = baseScore + hpBonus;

    this.addScore(total, 1, true);

    // 특별 보너스 표시
    this.showBonusText(`BOSS DEFEATED +${total.toLocaleString()}`);

    return total;
  }

  // 스테이지 클리어 보너스
  addStageClearBonus(stageTime: number, deaths: number) {
    let bonus = 0;
    const bonusTexts: string[] = [];

    // 시간 보너스
    if (stageTime < 30000) {
      bonus += 2000;
      bonusTexts.push("SPEED BONUS +2,000");
    } else if (stageTime < 60000) {
      bonus += 1000;
      bonusTexts.push("TIME BONUS +1,000");
    }

    // 노데스 보너스
    if (deaths === 0) {
      bonus += 1500;
      bonusTexts.push("NO DEATH +1,500");
    }

    // 퍼펙트 (노피격)
    if (this.damageTaken === 0) {
      bonus += 3000;
      bonusTexts.push("PERFECT! +3,000");
    }

    this.addScore(bonus, 1, false);

    // 보너스 표시
    bonusTexts.forEach((text, i) => {
      this.scene.time.delayedCall(i * 400, () => {
        this.showBonusText(text);
      });
    });

    return bonus;
  }

  private showBonusText(text: string) {
    const { width, height } = this.scene.cameras.main;

    const bonusText = this.scene.add.text(width / 2, height / 2, text, {
      fontFamily: "monospace",
      fontSize: "32px",
      color: "#FFD700",
      stroke: "#000000",
      strokeThickness: 4,
    });
    bonusText.setOrigin(0.5);
    bonusText.setDepth(250);

    this.scene.tweens.add({
      targets: bonusText,
      y: height / 2 - 50,
      alpha: 0,
      scale: 1.3,
      duration: 1200,
      ease: "Cubic.easeOut",
      onComplete: () => bonusText.destroy(),
    });
  }

  // 콤보 추적
  updateMaxCombo(combo: number) {
    if (combo > this.maxCombo) {
      this.maxCombo = combo;
    }
  }

  // 대미지 추적
  addDamageDealt(amount: number) {
    this.damageDealt += amount;
  }

  addDamageTaken(amount: number) {
    this.damageTaken += amount;
  }

  // 스테이지 결과 저장
  saveStageResult(stage: number, time: number, perfectClear: boolean) {
    this.stageResults.push({
      stage,
      time,
      score: this.score,
      maxCombo: this.maxCombo,
      damageDealt: this.damageDealt,
      damageTaken: this.damageTaken,
      perfectClear,
    });
  }

  // 최종 결과 계산
  calculateFinalResult(totalTime: number, deaths: number): ScoreData {
    let totalBonus = 0;

    // 전체 시간 보너스
    if (totalTime < 180000) { // 3분 이내
      totalBonus += 5000;
    } else if (totalTime < 300000) { // 5분 이내
      totalBonus += 2000;
    }

    // 노데스 배율
    const noDeathMultiplier = deaths === 0 ? 1.5 : 1;

    return {
      baseScore: this.score,
      comboBonus: this.maxCombo * 10,
      timeBonus: totalBonus,
      noDeathBonus: deaths === 0 ? Math.floor(this.score * 0.5) : 0,
      totalScore: Math.floor((this.score + this.maxCombo * 10 + totalBonus) * noDeathMultiplier),
    };
  }

  getScore(): number {
    return this.score;
  }

  getMaxCombo(): number {
    return this.maxCombo;
  }

  getStageResults(): StageResult[] {
    return this.stageResults;
  }

  reset() {
    this.score = 0;
    this.displayScore = 0;
    this.maxCombo = 0;
    this.damageDealt = 0;
    this.damageTaken = 0;
    this.stageResults = [];
    this.scoreText.setText("0");
  }

  destroy() {
    this.scoreUI.destroy();
  }
}
