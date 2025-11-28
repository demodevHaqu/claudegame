import * as Phaser from "phaser";
import { Boss } from "../Boss";
import type { GameScene } from "../../scenes/GameScene";

export class GPT5Boss extends Boss {
  private clones: Phaser.GameObjects.Sprite[] = [];

  constructor(scene: GameScene, x: number, y: number) {
    super(scene, x, y, "boss_gpt5", "GPT-5", 500);
    this.sprite.setTint(0x00ced1);
  }

  protected setupPatterns() {
    this.patterns = [
      {
        name: "Laser Beam",
        duration: 2000,
        cooldown: 4000,
        execute: () => this.laserBeam(),
      },
      {
        name: "Clone Attack",
        duration: 3000,
        cooldown: 6000,
        execute: () => this.cloneAttack(),
      },
      {
        name: "AI Barrage",
        duration: 2500,
        cooldown: 5000,
        execute: () => this.aiBarrage(),
      },
    ];
  }

  protected updateBehavior(_delta: number) {
    // 느린 추적
    const player = this.scene.player;
    if (!player) return;

    const targetY = player.sprite.y;
    const diff = targetY - this.sprite.y;
    this.sprite.y += diff * 0.01;
  }

  private laserBeam() {
    const player = this.scene.player;
    if (!player) return;

    // 조준 표시
    const aimLine = this.scene.add.line(
      0,
      0,
      this.sprite.x,
      this.sprite.y,
      0,
      this.sprite.y,
      0xff0000,
      0.5
    );
    aimLine.setOrigin(0, 0);

    // 조준선 확장
    this.scene.tweens.add({
      targets: aimLine,
      x2: -1280,
      duration: 1000,
      onComplete: () => {
        aimLine.destroy();

        // 레이저 발사
        const laser = this.scene.add.rectangle(
          this.sprite.x - 640,
          this.sprite.y,
          1280,
          30,
          0x00ced1,
          1
        );
        laser.setOrigin(1, 0.5);

        // 레이저 페이드
        this.scene.tweens.add({
          targets: laser,
          alpha: 0,
          scaleY: 3,
          duration: 300,
          onComplete: () => laser.destroy(),
        });

        // 플레이어 피격 체크
        if (
          Math.abs(player.sprite.y - this.sprite.y) < 30 &&
          player.sprite.x < this.sprite.x
        ) {
          player.takeDamage(20);
        }
      },
    });
  }

  private cloneAttack() {
    // 기존 분신 제거
    this.clones.forEach((clone) => clone.destroy());
    this.clones = [];

    // 3개 분신 생성
    const positions = [
      { x: this.sprite.x - 100, y: this.sprite.y - 150 },
      { x: this.sprite.x - 100, y: this.sprite.y + 150 },
      { x: this.sprite.x + 50, y: this.sprite.y },
    ];

    positions.forEach((pos, i) => {
      const clone = this.scene.add.sprite(
        this.sprite.x,
        this.sprite.y,
        "boss_gpt5"
      );
      clone.setTint(0x00ced1);
      clone.setAlpha(0.6);
      clone.setScale(1.2);

      this.scene.tweens.add({
        targets: clone,
        x: pos.x,
        y: pos.y,
        duration: 500,
        ease: "Back.easeOut",
        onComplete: () => {
          // 분신 공격
          this.scene.time.delayedCall(500, () => {
            if (clone.active) {
              this.fireFromPosition(clone.x, clone.y);
            }
          });

          // 분신 소멸
          this.scene.time.delayedCall(2000, () => {
            if (clone.active) {
              this.scene.tweens.add({
                targets: clone,
                alpha: 0,
                duration: 300,
                onComplete: () => clone.destroy(),
              });
            }
          });
        },
      });

      this.clones.push(clone);
    });
  }

  private fireFromPosition(x: number, y: number) {
    const player = this.scene.player;
    if (!player) return;

    const angle = Phaser.Math.Angle.Between(x, y, player.sprite.x, player.sprite.y);

    for (let i = -1; i <= 1; i++) {
      const spreadAngle = angle + i * 0.2;

      const bullet = this.scene.bossBullets.get(
        x,
        y,
        "bullet_enemy"
      ) as Phaser.Physics.Arcade.Image;

      if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        bullet.setTint(0x00ced1);
        bullet.setVelocity(
          Math.cos(spreadAngle) * 400,
          Math.sin(spreadAngle) * 400
        );

        this.scene.time.delayedCall(5000, () => {
          if (bullet.active) bullet.destroy();
        });
      }
    }
  }

  private aiBarrage() {
    // 폭격 패턴
    const { width, height } = this.scene.cameras.main;
    const bombCount = 8;

    for (let i = 0; i < bombCount; i++) {
      this.scene.time.delayedCall(i * 200, () => {
        // 경고 표시
        const warningX = Phaser.Math.Between(100, width - 200);
        const warning = this.scene.add.circle(warningX, height - 50, 40, 0xff0000, 0.3);

        this.scene.tweens.add({
          targets: warning,
          scale: { from: 0.5, to: 1.5 },
          alpha: { from: 0.5, to: 0 },
          duration: 800,
          onComplete: () => {
            warning.destroy();

            // 폭탄 낙하
            const bomb = this.scene.add.circle(warningX, -20, 15, 0x00ced1);

            this.scene.tweens.add({
              targets: bomb,
              y: height - 50,
              duration: 400,
              ease: "Quad.easeIn",
              onComplete: () => {
                // 폭발
                const explosion = this.scene.add.circle(
                  bomb.x,
                  bomb.y,
                  20,
                  0x00ced1
                );

                this.scene.tweens.add({
                  targets: explosion,
                  scale: 4,
                  alpha: 0,
                  duration: 300,
                  onComplete: () => explosion.destroy(),
                });

                // 플레이어 피격 체크
                const player = this.scene.player;
                if (player && !player.isDead) {
                  const dist = Phaser.Math.Distance.Between(
                    player.sprite.x,
                    player.sprite.y,
                    bomb.x,
                    bomb.y
                  );
                  if (dist < 80) {
                    player.takeDamage(15);
                  }
                }

                bomb.destroy();
              },
            });
          },
        });
      });
    }
  }
}
