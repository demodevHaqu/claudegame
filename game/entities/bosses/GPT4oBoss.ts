import * as Phaser from "phaser";
import { Boss } from "../Boss";
import type { GameScene } from "../../scenes/GameScene";

export class GPT4oBoss extends Boss {
  constructor(scene: GameScene, x: number, y: number) {
    super(scene, x, y, "boss_gpt4o", "GPT-4o", 200);
    this.sprite.setTint(0x00ffff);
  }

  protected setupPatterns() {
    this.patterns = [
      {
        name: "Rush",
        duration: 1000,
        cooldown: 2500,
        execute: () => this.rushAttack(),
      },
      {
        name: "Triple Punch",
        duration: 1500,
        cooldown: 3000,
        execute: () => this.triplePunch(),
      },
      {
        name: "Quick Shot",
        duration: 500,
        cooldown: 2000,
        execute: () => this.quickShot(),
      },
    ];
  }

  protected updateBehavior(delta: number) {
    // 기본 상하 움직임
    const time = this.scene.time.now;
    const offsetY = Math.sin(time / 1000) * 100;
    this.sprite.y = this.initialY + offsetY;
  }

  private rushAttack() {
    const player = this.scene.player;
    if (!player) return;

    // 돌진 준비
    this.sprite.setTint(0xff0000);

    this.scene.time.delayedCall(500, () => {
      // 플레이어 방향으로 돌진
      const targetX = player.sprite.x + 100;
      const targetY = player.sprite.y;

      this.scene.tweens.add({
        targets: this.sprite,
        x: targetX,
        y: targetY,
        duration: 400,
        ease: "Quad.easeIn",
        onComplete: () => {
          // 돌진 후 원위치
          this.sprite.clearTint();
          this.moveTo(this.initialX, this.initialY, 800);
        },
      });
    });
  }

  private triplePunch() {
    // 3연속 발사
    for (let i = 0; i < 3; i++) {
      this.scene.time.delayedCall(i * 300, () => {
        this.fireAtPlayer(500);

        // 시각 효과
        const flash = this.scene.add.circle(
          this.sprite.x - 30,
          this.sprite.y,
          15,
          0x00ffff
        );
        this.scene.tweens.add({
          targets: flash,
          scale: 2,
          alpha: 0,
          duration: 200,
          onComplete: () => flash.destroy(),
        });
      });
    }
  }

  private quickShot() {
    // 빠른 단발
    this.fireAtPlayer(600);
  }
}
