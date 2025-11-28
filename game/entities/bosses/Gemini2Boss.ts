import * as Phaser from "phaser";
import { Boss } from "../Boss";
import type { GameScene } from "../../scenes/GameScene";

export class Gemini2Boss extends Boss {
  private teleportCooldown: number = 0;

  constructor(scene: GameScene, x: number, y: number) {
    super(scene, x, y, "boss_gemini2", "Gemini 2.0", 350);
    this.sprite.setTint(0x9400d3);
  }

  protected setupPatterns() {
    this.patterns = [
      {
        name: "Teleport Strike",
        duration: 1000,
        cooldown: 3000,
        execute: () => this.teleportStrike(),
      },
      {
        name: "Star Summon",
        duration: 2000,
        cooldown: 4000,
        execute: () => this.starSummon(),
      },
      {
        name: "Galaxy Spin",
        duration: 3000,
        cooldown: 5000,
        execute: () => this.galaxySpin(),
      },
    ];
  }

  protected updateBehavior(delta: number) {
    this.teleportCooldown -= delta;
  }

  private teleportStrike() {
    const player = this.scene.player;
    if (!player) return;

    // 페이드 아웃
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        // 플레이어 근처로 텔레포트
        const side = Phaser.Math.Between(0, 1) === 0 ? -150 : 150;
        this.sprite.x = player.sprite.x + side;
        this.sprite.y = player.sprite.y + Phaser.Math.Between(-100, 100);

        // 페이드 인
        this.scene.tweens.add({
          targets: this.sprite,
          alpha: 1,
          duration: 200,
          onComplete: () => {
            // 텔레포트 후 공격
            this.fireCircle(8, 350);
          },
        });
      },
    });
  }

  private starSummon() {
    // 5개 별 소환 (5각형 형태로 발사)
    const centerX = this.sprite.x;
    const centerY = this.sprite.y;

    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      const starX = centerX + Math.cos(angle) * 60;
      const starY = centerY + Math.sin(angle) * 60;

      // 별 이펙트
      const star = this.scene.add.star(starX, starY, 5, 10, 20, 0x9400d3);

      this.scene.tweens.add({
        targets: star,
        scale: { from: 0, to: 1 },
        rotation: Math.PI * 2,
        duration: 500,
        onComplete: () => {
          // 별에서 발사
          const playerAngle = Phaser.Math.Angle.Between(
            starX,
            starY,
            this.scene.player.sprite.x,
            this.scene.player.sprite.y
          );

          const bullet = this.scene.bossBullets.get(
            starX,
            starY,
            "bullet_enemy"
          ) as Phaser.Physics.Arcade.Image;

          if (bullet) {
            bullet.setActive(true);
            bullet.setVisible(true);
            bullet.setTint(0x9400d3);
            bullet.setScale(1.5);
            bullet.setVelocity(
              Math.cos(playerAngle) * 400,
              Math.sin(playerAngle) * 400
            );

            this.scene.time.delayedCall(5000, () => {
              if (bullet.active) bullet.destroy();
            });
          }

          star.destroy();
        },
      });
    }
  }

  private galaxySpin() {
    // 회전하면서 방사형 발사
    const duration = 2000;
    const bulletInterval = 200;
    let elapsed = 0;

    const spinTimer = this.scene.time.addEvent({
      delay: bulletInterval,
      repeat: duration / bulletInterval,
      callback: () => {
        elapsed += bulletInterval;
        const baseAngle = (elapsed / duration) * Math.PI * 4; // 2바퀴 회전

        // 3방향 발사
        for (let i = 0; i < 3; i++) {
          const angle = baseAngle + (Math.PI * 2 * i) / 3;

          const bullet = this.scene.bossBullets.get(
            this.sprite.x,
            this.sprite.y,
            "bullet_enemy"
          ) as Phaser.Physics.Arcade.Image;

          if (bullet) {
            bullet.setActive(true);
            bullet.setVisible(true);
            bullet.setTint(0x8a2be2);
            bullet.setVelocity(
              Math.cos(angle) * 300,
              Math.sin(angle) * 300
            );

            this.scene.time.delayedCall(5000, () => {
              if (bullet.active) bullet.destroy();
            });
          }
        }
      },
    });
  }
}
