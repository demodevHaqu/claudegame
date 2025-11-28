import * as Phaser from "phaser";

export interface ComboData {
  count: number;
  multiplier: number;
  timer: number;
  maxTime: number;
}

export class ComboSystem {
  private scene: Phaser.Scene;
  private combo: ComboData;
  private comboUI!: Phaser.GameObjects.Container;
  private comboText!: Phaser.GameObjects.Text;
  private comboBar!: Phaser.GameObjects.Graphics;
  private multiplierText!: Phaser.GameObjects.Text;

  private readonly COMBO_TIMEOUT = 3000; // 3초 내 다음 히트
  private readonly MAX_MULTIPLIER = 5;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.combo = {
      count: 0,
      multiplier: 1,
      timer: 0,
      maxTime: this.COMBO_TIMEOUT,
    };
    this.createUI();
  }

  private createUI() {
    const { width } = this.scene.cameras.main;

    this.comboUI = this.scene.add.container(width - 150, 100);
    this.comboUI.setDepth(200);
    this.comboUI.setAlpha(0);

    // 콤보 숫자
    this.comboText = this.scene.add.text(0, 0, "0", {
      fontFamily: "monospace",
      fontSize: "48px",
      color: "#FFFFFF",
      stroke: "#000000",
      strokeThickness: 4,
    });
    this.comboText.setOrigin(0.5);

    // COMBO 라벨
    const label = this.scene.add.text(0, 35, "COMBO", {
      fontFamily: "monospace",
      fontSize: "16px",
      color: "#888888",
    });
    label.setOrigin(0.5);

    // 배율 표시
    this.multiplierText = this.scene.add.text(0, -35, "x1.0", {
      fontFamily: "monospace",
      fontSize: "20px",
      color: "#FFD700",
    });
    this.multiplierText.setOrigin(0.5);

    // 콤보 게이지 바
    this.comboBar = this.scene.add.graphics();

    this.comboUI.add([this.comboBar, this.comboText, label, this.multiplierText]);
  }

  addHit(): number {
    this.combo.count++;
    this.combo.timer = this.COMBO_TIMEOUT;

    // 배율 계산 (10콤보마다 0.5씩 증가, 최대 5배)
    this.combo.multiplier = Math.min(
      this.MAX_MULTIPLIER,
      1 + Math.floor(this.combo.count / 10) * 0.5
    );

    this.updateUI();
    this.showComboPopup();

    return this.combo.multiplier;
  }

  private showComboPopup() {
    // 콤보 UI 페이드 인
    this.scene.tweens.add({
      targets: this.comboUI,
      alpha: 1,
      duration: 100,
    });

    // 콤보 텍스트 펀치 효과
    this.scene.tweens.add({
      targets: this.comboText,
      scale: { from: 1.3, to: 1 },
      duration: 150,
      ease: "Back.easeOut",
    });

    // 마일스톤 콤보에서 특별 이펙트
    if (this.combo.count === 10 || this.combo.count === 25 || this.combo.count === 50 || this.combo.count === 100) {
      this.milestoneEffect();
    }
  }

  private milestoneEffect() {
    const { width, height } = this.scene.cameras.main;

    let message = "";
    let color = "#FFFFFF";

    if (this.combo.count >= 100) {
      message = "LEGENDARY!";
      color = "#FF00FF";
    } else if (this.combo.count >= 50) {
      message = "INCREDIBLE!";
      color = "#FFD700";
    } else if (this.combo.count >= 25) {
      message = "AMAZING!";
      color = "#00FFFF";
    } else if (this.combo.count >= 10) {
      message = "GREAT!";
      color = "#00FF00";
    }

    const text = this.scene.add.text(width / 2, height / 2 - 100, message, {
      fontFamily: "monospace",
      fontSize: "64px",
      color: color,
      stroke: "#000000",
      strokeThickness: 6,
    });
    text.setOrigin(0.5);
    text.setDepth(300);

    this.scene.tweens.add({
      targets: text,
      scale: { from: 0.5, to: 1.5 },
      alpha: { from: 1, to: 0 },
      y: height / 2 - 150,
      duration: 1000,
      ease: "Cubic.easeOut",
      onComplete: () => text.destroy(),
    });

    // 화면 효과
    this.scene.cameras.main.shake(200, 0.01);
  }

  private updateUI() {
    // 콤보 숫자 업데이트
    this.comboText.setText(this.combo.count.toString());

    // 색상 변경
    let color = "#FFFFFF";
    if (this.combo.count >= 50) color = "#FF00FF";
    else if (this.combo.count >= 25) color = "#FFD700";
    else if (this.combo.count >= 10) color = "#00FFFF";
    else if (this.combo.count >= 5) color = "#00FF00";

    this.comboText.setColor(color);

    // 배율 업데이트
    this.multiplierText.setText(`x${this.combo.multiplier.toFixed(1)}`);

    // 게이지 바 업데이트
    this.updateComboBar();
  }

  private updateComboBar() {
    this.comboBar.clear();

    const barWidth = 80;
    const barHeight = 6;
    const ratio = this.combo.timer / this.combo.maxTime;

    // 배경
    this.comboBar.fillStyle(0x333333, 0.8);
    this.comboBar.fillRect(-barWidth / 2, 55, barWidth, barHeight);

    // 게이지
    let barColor = 0x00ff00;
    if (ratio < 0.3) barColor = 0xff0000;
    else if (ratio < 0.6) barColor = 0xffff00;

    this.comboBar.fillStyle(barColor, 1);
    this.comboBar.fillRect(-barWidth / 2, 55, barWidth * ratio, barHeight);
  }

  update(delta: number) {
    if (this.combo.count > 0) {
      this.combo.timer -= delta;

      if (this.combo.timer <= 0) {
        this.resetCombo();
      } else {
        this.updateComboBar();
      }
    }
  }

  private resetCombo() {
    if (this.combo.count > 0) {
      // 콤보 종료 애니메이션
      this.scene.tweens.add({
        targets: this.comboUI,
        alpha: 0,
        scale: 0.8,
        duration: 300,
        onComplete: () => {
          this.comboUI.setScale(1);
        },
      });
    }

    this.combo.count = 0;
    this.combo.multiplier = 1;
    this.combo.timer = 0;
  }

  getCombo(): number {
    return this.combo.count;
  }

  getMultiplier(): number {
    return this.combo.multiplier;
  }

  // 콤보 보너스 점수 계산
  calculateBonusScore(baseScore: number): number {
    return Math.floor(baseScore * this.combo.multiplier);
  }

  destroy() {
    this.comboUI.destroy();
  }
}
