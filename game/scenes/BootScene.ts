import * as Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload() {
    // 로딩 바 생성
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x1a1a2e, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const loadingText = this.add.text(width / 2, height / 2 - 50, "LOADING...", {
      fontFamily: "monospace",
      fontSize: "20px",
      color: "#FFD700",
    });
    loadingText.setOrigin(0.5, 0.5);

    const percentText = this.add.text(width / 2, height / 2, "0%", {
      fontFamily: "monospace",
      fontSize: "18px",
      color: "#00FFFF",
    });
    percentText.setOrigin(0.5, 0.5);

    // 로딩 이벤트
    this.load.on("progress", (value: number) => {
      percentText.setText(Math.round(value * 100) + "%");
      progressBar.clear();
      progressBar.fillStyle(0xffd700, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    this.load.on("complete", () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });

    // 플레이스홀더 에셋 생성 (실제 에셋이 없을 때 사용)
    this.createPlaceholderAssets();
  }

  create() {
    this.scene.start("MenuScene");
  }

  private createPlaceholderAssets() {
    // 플레이어 플레이스홀더 (64x64 황금색 사각형)
    const playerGraphics = this.make.graphics({ x: 0, y: 0 });
    playerGraphics.fillStyle(0xffd700);
    playerGraphics.fillRect(0, 0, 64, 64);
    playerGraphics.fillStyle(0xff8c00);
    playerGraphics.fillRect(16, 16, 32, 32);
    playerGraphics.generateTexture("player", 64, 64);
    playerGraphics.destroy();

    // 보스 플레이스홀더들
    const bossColors = [0x00ffff, 0x9400d3, 0x00ced1, 0x8a2be2, 0xff0080];
    const bossNames = ["boss_gpt4o", "boss_gemini2", "boss_gpt5", "boss_gemini3", "boss_final"];
    bossNames.forEach((name, i) => {
      const bossGraphics = this.make.graphics({ x: 0, y: 0 });
      bossGraphics.fillStyle(bossColors[i]);
      bossGraphics.fillRect(0, 0, 128, 128);
      bossGraphics.fillStyle(0x0a0a0f);
      bossGraphics.fillRect(32, 32, 64, 64);
      bossGraphics.generateTexture(name, 128, 128);
      bossGraphics.destroy();
    });

    // 투사체 플레이스홀더
    const bulletGraphics = this.make.graphics({ x: 0, y: 0 });
    bulletGraphics.fillStyle(0xffd700);
    bulletGraphics.fillCircle(8, 8, 8);
    bulletGraphics.generateTexture("bullet_player", 16, 16);
    bulletGraphics.destroy();

    const enemyBulletGraphics = this.make.graphics({ x: 0, y: 0 });
    enemyBulletGraphics.fillStyle(0xff0080);
    enemyBulletGraphics.fillCircle(8, 8, 8);
    enemyBulletGraphics.generateTexture("bullet_enemy", 16, 16);
    enemyBulletGraphics.destroy();

    // 이펙트 플레이스홀더
    const effectGraphics = this.make.graphics({ x: 0, y: 0 });
    effectGraphics.fillStyle(0xffffff, 0.8);
    effectGraphics.fillCircle(16, 16, 16);
    effectGraphics.generateTexture("effect_hit", 32, 32);
    effectGraphics.destroy();

    // 배경 플레이스홀더
    const bgGraphics = this.make.graphics({ x: 0, y: 0 });
    bgGraphics.fillGradientStyle(0x0a0a0f, 0x0a0a0f, 0x1a1a2e, 0x1a1a2e);
    bgGraphics.fillRect(0, 0, 1280, 720);
    // 그리드 라인
    bgGraphics.lineStyle(1, 0x00ffff, 0.1);
    for (let i = 0; i < 1280; i += 50) {
      bgGraphics.moveTo(i, 0);
      bgGraphics.lineTo(i, 720);
    }
    for (let i = 0; i < 720; i += 50) {
      bgGraphics.moveTo(0, i);
      bgGraphics.lineTo(1280, i);
    }
    bgGraphics.strokePath();
    bgGraphics.generateTexture("bg_game", 1280, 720);
    bgGraphics.destroy();
  }
}
