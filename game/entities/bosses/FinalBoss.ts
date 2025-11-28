import * as Phaser from "phaser";
import { Boss } from "../Boss";
import type { GameScene } from "../../scenes/GameScene";

export class FinalBoss extends Boss {
  private phase: number = 1;
  private phaseTransitioning: boolean = false;
  private enraged: boolean = false;

  constructor(scene: GameScene, x: number, y: number) {
    super(scene, x, y, "boss_final", "???", 1000);
    this.sprite.setTint(0xff0080);
    this.sprite.setScale(2);
  }

  protected setupPatterns() {
    this.patterns = [
      {
        name: "GPT Rush",
        duration: 1500,
        cooldown: 3000,
        execute: () => this.gptRush(),
      },
      {
        name: "Gemini Stars",
        duration: 2000,
        cooldown: 3500,
        execute: () => this.geminiStars(),
      },
      {
        name: "Titan Laser",
        duration: 2500,
        cooldown: 4000,
        execute: () => this.titanLaser(),
      },
      {
        name: "Galaxy Warp",
        duration: 3000,
        cooldown: 4500,
        execute: () => this.galaxyWarp(),
      },
    ];
  }

  protected updateBehavior(_delta: number) {
    // 페이즈 체크
    if (this.hp <= this.maxHp * 0.6 && this.phase === 1 && !this.phaseTransitioning) {
      this.enterPhase2();
    }
    if (this.hp <= this.maxHp * 0.3 && this.phase === 2 && !this.phaseTransitioning) {
      this.enterPhase3();
    }
  }

  private enterPhase2() {
    this.phaseTransitioning = true;
    this.phase = 2;

    this.scene.cameras.main.flash(800, 255, 0, 128);

    // "THE BENCHMARK AWAKENS" 텍스트
    const text = this.scene.add.text(
      this.scene.cameras.main.width / 2,
      100,
      "THE BENCHMARK AWAKENS",
      {
        fontFamily: "monospace",
        fontSize: "32px",
        color: "#FF0080",
      }
    );
    text.setOrigin(0.5);

    this.scene.tweens.add({
      targets: text,
      alpha: { from: 1, to: 0 },
      y: 50,
      duration: 2000,
      onComplete: () => text.destroy(),
    });

    // 변신
    this.sprite.setTint(0xff00ff);

    this.scene.time.delayedCall(1500, () => {
      this.phaseTransitioning = false;

      // 새 패턴 추가
      this.patterns.push({
        name: "Benchmark Barrage",
        duration: 4000,
        cooldown: 5000,
        execute: () => this.benchmarkBarrage(),
      });
    });
  }

  private enterPhase3() {
    this.phaseTransitioning = true;
    this.phase = 3;
    this.enraged = true;

    this.scene.cameras.main.shake(1000, 0.03);

    // "FINAL FORM" 텍스트
    const text = this.scene.add.text(
      this.scene.cameras.main.width / 2,
      100,
      "FINAL FORM",
      {
        fontFamily: "monospace",
        fontSize: "48px",
        color: "#FFFFFF",
      }
    );
    text.setOrigin(0.5);

    this.scene.tweens.add({
      targets: text,
      scale: { from: 1, to: 2 },
      alpha: { from: 1, to: 0 },
      duration: 2000,
      onComplete: () => text.destroy(),
    });

    // 최종 변신
    this.sprite.setTint(0xffffff);
    this.sprite.setScale(2.5);

    // 모든 패턴 쿨다운 감소
    this.patterns.forEach((p) => {
      p.cooldown *= 0.7;
    });

    this.scene.time.delayedCall(1500, () => {
      this.phaseTransitioning = false;

      // 최종 패턴 추가
      this.patterns.push({
        name: "Apocalypse",
        duration: 5000,
        cooldown: 8000,
        execute: () => this.apocalypse(),
      });
    });
  }

  // GPT-4o 패턴: 돌진
  private gptRush() {
    const player = this.scene.player;
    if (!player) return;

    this.sprite.setTint(0x00ffff);

    this.scene.time.delayedCall(400, () => {
      const rushCount = this.phase >= 2 ? 3 : 2;

      for (let i = 0; i < rushCount; i++) {
        this.scene.time.delayedCall(i * 600, () => {
          const targetX = player.sprite.x + 100;
          const targetY = player.sprite.y;

          this.scene.tweens.add({
            targets: this.sprite,
            x: targetX,
            y: targetY,
            duration: 300,
            ease: "Quad.easeIn",
            onComplete: () => {
              // 충격파
              this.fireCircle(this.phase >= 2 ? 12 : 8, 300);
            },
          });
        });
      }

      this.scene.time.delayedCall(rushCount * 600 + 500, () => {
        this.sprite.setTint(this.getCurrentTint());
        this.moveTo(this.initialX, this.initialY, 800);
      });
    });
  }

  // Gemini 패턴: 별 소환
  private geminiStars() {
    this.sprite.setTint(0x9400d3);

    const starCount = this.phase >= 2 ? 8 : 5;

    for (let i = 0; i < starCount; i++) {
      const angle = (Math.PI * 2 * i) / starCount;
      const radius = 120;
      const starX = this.sprite.x + Math.cos(angle) * radius;
      const starY = this.sprite.y + Math.sin(angle) * radius;

      const star = this.scene.add.star(starX, starY, 5, 10, 25, 0x9400d3);
      star.setAlpha(0);

      this.scene.tweens.add({
        targets: star,
        alpha: 1,
        rotation: Math.PI * 2,
        duration: 500,
        delay: i * 100,
        onComplete: () => {
          // 플레이어 방향으로 발사
          const player = this.scene.player;
          if (player && !player.isDead) {
            const bulletAngle = Phaser.Math.Angle.Between(
              star.x,
              star.y,
              player.sprite.x,
              player.sprite.y
            );

            const bullet = this.scene.bossBullets.get(
              star.x,
              star.y,
              "bullet_enemy"
            ) as Phaser.Physics.Arcade.Image;

            if (bullet) {
              bullet.setActive(true);
              bullet.setVisible(true);
              bullet.setTint(0x9400d3);
              bullet.setScale(1.5);
              bullet.setVelocity(
                Math.cos(bulletAngle) * 450,
                Math.sin(bulletAngle) * 450
              );

              this.scene.time.delayedCall(5000, () => {
                if (bullet.active) bullet.destroy();
              });
            }
          }

          star.destroy();
        },
      });
    }

    this.scene.time.delayedCall(1500, () => {
      this.sprite.setTint(this.getCurrentTint());
    });
  }

  // GPT-5 패턴: 레이저
  private titanLaser() {
    this.sprite.setTint(0x00ced1);

    const player = this.scene.player;
    if (!player) return;

    // 수평 + 수직 레이저
    const laserPositions = [
      { horizontal: true, y: player.sprite.y },
      { horizontal: false, x: player.sprite.x },
    ];

    if (this.phase >= 2) {
      laserPositions.push({ horizontal: true, y: player.sprite.y + 100 });
      laserPositions.push({ horizontal: true, y: player.sprite.y - 100 });
    }

    laserPositions.forEach((pos, i) => {
      this.scene.time.delayedCall(i * 400, () => {
        // 경고선
        const warning = pos.horizontal
          ? this.scene.add.line(0, 0, 0, pos.y!, 1280, pos.y!, 0xff0000, 0.3)
          : this.scene.add.line(0, 0, pos.x!, 0, pos.x!, 720, 0xff0000, 0.3);

        this.scene.tweens.add({
          targets: warning,
          alpha: { from: 0.3, to: 0.8 },
          duration: 300,
          yoyo: true,
          repeat: 2,
          onComplete: () => {
            warning.destroy();

            // 레이저 발사
            const laser = pos.horizontal
              ? this.scene.add.rectangle(640, pos.y!, 1280, 25, 0x00ced1)
              : this.scene.add.rectangle(pos.x!, 360, 25, 720, 0x00ced1);

            this.scene.tweens.add({
              targets: laser,
              alpha: 0,
              scaleX: pos.horizontal ? 1 : 3,
              scaleY: pos.horizontal ? 3 : 1,
              duration: 300,
              onComplete: () => laser.destroy(),
            });

            // 피격 체크
            const p = this.scene.player;
            if (p && !p.isDead && !p.isInvincible) {
              const hit = pos.horizontal
                ? Math.abs(p.sprite.y - pos.y!) < 25
                : Math.abs(p.sprite.x - pos.x!) < 25;

              if (hit) {
                p.takeDamage(20);
              }
            }
          },
        });
      });
    });

    this.scene.time.delayedCall(2000, () => {
      this.sprite.setTint(this.getCurrentTint());
    });
  }

  // Gemini 3 패턴: 차원 왜곡
  private galaxyWarp() {
    this.sprite.setTint(0x8a2be2);

    const { width, height } = this.scene.cameras.main;
    const warpCount = this.phase >= 2 ? 6 : 4;

    for (let i = 0; i < warpCount; i++) {
      this.scene.time.delayedCall(i * 300, () => {
        const x = Phaser.Math.Between(100, width - 100);
        const y = Phaser.Math.Between(100, height - 100);

        const warp = this.scene.add.circle(x, y, 5, 0x8a2be2);

        this.scene.tweens.add({
          targets: warp,
          scale: 8,
          alpha: { from: 1, to: 0 },
          duration: 600,
          onComplete: () => {
            warp.destroy();

            // 방사형 발사
            const bulletCount = this.phase >= 2 ? 10 : 6;
            for (let j = 0; j < bulletCount; j++) {
              const angle = (Math.PI * 2 * j) / bulletCount;

              const bullet = this.scene.bossBullets.get(
                x,
                y,
                "bullet_enemy"
              ) as Phaser.Physics.Arcade.Image;

              if (bullet) {
                bullet.setActive(true);
                bullet.setVisible(true);
                bullet.setTint(0x8a2be2);
                bullet.setVelocity(
                  Math.cos(angle) * 350,
                  Math.sin(angle) * 350
                );

                this.scene.time.delayedCall(5000, () => {
                  if (bullet.active) bullet.destroy();
                });
              }
            }
          },
        });
      });
    }

    this.scene.time.delayedCall(2500, () => {
      this.sprite.setTint(this.getCurrentTint());
    });
  }

  // 페이즈 2: 벤치마크 난사
  private benchmarkBarrage() {
    const duration = 3000;
    const interval = 80;

    const barrageTimer = this.scene.time.addEvent({
      delay: interval,
      repeat: duration / interval,
      callback: () => {
        this.fireAtPlayer(500, 0.3);
      },
    });
  }

  // 페이즈 3: 아포칼립스
  private apocalypse() {
    const { width, height } = this.scene.cameras.main;

    // 화면 어둡게
    const darkness = this.scene.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x000000,
      0
    );
    darkness.setDepth(50);

    this.scene.tweens.add({
      targets: darkness,
      alpha: 0.7,
      duration: 500,
    });

    // 경고
    const warning = this.scene.add.text(width / 2, height / 2, "APOCALYPSE", {
      fontFamily: "monospace",
      fontSize: "64px",
      color: "#FF0000",
    });
    warning.setOrigin(0.5);
    warning.setDepth(51);

    this.scene.tweens.add({
      targets: warning,
      scale: { from: 0.5, to: 1.5 },
      alpha: { from: 1, to: 0 },
      duration: 1500,
      onComplete: () => warning.destroy(),
    });

    // 전방위 공격
    this.scene.time.delayedCall(1500, () => {
      darkness.destroy();

      // 화면 전체에 폭탄
      for (let i = 0; i < 20; i++) {
        this.scene.time.delayedCall(i * 150, () => {
          const x = Phaser.Math.Between(50, width - 50);
          const y = Phaser.Math.Between(50, height - 50);

          // 경고 원
          const warn = this.scene.add.circle(x, y, 30, 0xff0000, 0.3);

          this.scene.tweens.add({
            targets: warn,
            scale: 1.5,
            alpha: 0,
            duration: 400,
            onComplete: () => {
              warn.destroy();

              // 폭발
              const explosion = this.scene.add.circle(x, y, 40, 0xff0080);

              this.scene.tweens.add({
                targets: explosion,
                scale: 2,
                alpha: 0,
                duration: 200,
                onComplete: () => explosion.destroy(),
              });

              // 피격 체크
              const player = this.scene.player;
              if (player && !player.isDead && !player.isInvincible) {
                const dist = Phaser.Math.Distance.Between(
                  player.sprite.x,
                  player.sprite.y,
                  x,
                  y
                );
                if (dist < 60) {
                  player.takeDamage(15);
                }
              }
            },
          });
        });
      }

      // 중앙에서 방사
      this.scene.time.delayedCall(3000, () => {
        this.fireCircle(24, 400);
      });
    });
  }

  private getCurrentTint(): number {
    switch (this.phase) {
      case 1:
        return 0xff0080;
      case 2:
        return 0xff00ff;
      case 3:
        return 0xffffff;
      default:
        return 0xff0080;
    }
  }
}
