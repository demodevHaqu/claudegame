import * as Phaser from "phaser";
import { Boss } from "../Boss";
import type { GameScene } from "../../scenes/GameScene";

export class Gemini3Boss extends Boss {
  private phase: number = 1;
  private phaseTransitioning: boolean = false;

  constructor(scene: GameScene, x: number, y: number) {
    super(scene, x, y, "boss_gemini3", "Gemini 3 Pro", 700);
    this.sprite.setTint(0x8a2be2);
  }

  protected setupPatterns() {
    this.patterns = [
      {
        name: "Multimodal Attack",
        duration: 2500,
        cooldown: 4000,
        execute: () => this.multimodalAttack(),
      },
      {
        name: "Dimension Warp",
        duration: 3000,
        cooldown: 5000,
        execute: () => this.dimensionWarp(),
      },
      {
        name: "Galaxy Burst",
        duration: 2000,
        cooldown: 3500,
        execute: () => this.galaxyBurst(),
      },
    ];
  }

  protected updateBehavior(_delta: number) {
    // 페이즈 체크
    if (this.hp <= this.maxHp * 0.5 && this.phase === 1 && !this.phaseTransitioning) {
      this.enterPhase2();
    }
  }

  private enterPhase2() {
    this.phaseTransitioning = true;
    this.phase = 2;

    // 페이즈 전환 연출
    this.scene.cameras.main.flash(500, 138, 43, 226);

    // 무적 시간
    const originalHp = this.hp;
    this.hp = 99999;

    // 화면 중앙으로 이동
    this.scene.tweens.add({
      targets: this.sprite,
      x: this.scene.cameras.main.width / 2,
      y: this.scene.cameras.main.height / 2,
      duration: 1000,
      onComplete: () => {
        // 변신 이펙트
        this.sprite.setScale(2);
        this.sprite.setTint(0xff00ff);

        // 원형 폭발
        this.fireCircle(16, 200);

        this.scene.time.delayedCall(500, () => {
          this.hp = originalHp;
          this.phaseTransitioning = false;

          // 더 강한 패턴 추가
          this.patterns.push({
            name: "Chaos Storm",
            duration: 4000,
            cooldown: 6000,
            execute: () => this.chaosStorm(),
          });

          // 원위치
          this.moveTo(this.initialX, this.initialY, 800);
        });
      },
    });
  }

  private multimodalAttack() {
    const player = this.scene.player;
    if (!player) return;

    // 3가지 동시 공격

    // 1. 직선 레이저
    const laser = this.scene.add.rectangle(
      this.sprite.x - 200,
      this.sprite.y,
      400,
      10,
      0x8a2be2,
      0.8
    );
    laser.setOrigin(1, 0.5);

    this.scene.tweens.add({
      targets: laser,
      scaleX: 3,
      alpha: 0,
      duration: 500,
      onComplete: () => laser.destroy(),
    });

    // 2. 유도 미사일
    this.scene.time.delayedCall(300, () => {
      const missile = this.scene.add.triangle(
        this.sprite.x - 20,
        this.sprite.y,
        0, 15, 15, 0, 0, -15,
        0x8a2be2
      );

      let missileUpdate: Phaser.Time.TimerEvent;
      missileUpdate = this.scene.time.addEvent({
        delay: 50,
        repeat: 40,
        callback: () => {
          if (!player.isDead && missile.active) {
            const angle = Phaser.Math.Angle.Between(
              missile.x,
              missile.y,
              player.sprite.x,
              player.sprite.y
            );
            missile.rotation = angle;
            missile.x += Math.cos(angle) * 8;
            missile.y += Math.sin(angle) * 8;

            // 충돌 체크
            const dist = Phaser.Math.Distance.Between(
              missile.x,
              missile.y,
              player.sprite.x,
              player.sprite.y
            );
            if (dist < 30) {
              player.takeDamage(15);
              missile.destroy();
              missileUpdate.remove();
            }
          }
        },
      });

      this.scene.time.delayedCall(2500, () => {
        if (missile.active) missile.destroy();
      });
    });

    // 3. 확산탄
    this.scene.time.delayedCall(600, () => {
      for (let i = -2; i <= 2; i++) {
        const angle = Math.PI + i * 0.3;
        const bullet = this.scene.bossBullets.get(
          this.sprite.x,
          this.sprite.y,
          "bullet_enemy"
        ) as Phaser.Physics.Arcade.Image;

        if (bullet) {
          bullet.setActive(true);
          bullet.setVisible(true);
          bullet.setTint(0x8a2be2);
          bullet.setVelocity(Math.cos(angle) * 350, Math.sin(angle) * 350);

          this.scene.time.delayedCall(5000, () => {
            if (bullet.active) bullet.destroy();
          });
        }
      }
    });
  }

  private dimensionWarp() {
    const { width, height } = this.scene.cameras.main;

    // 4개의 워프 포인트 생성
    const points = [
      { x: 200, y: 200 },
      { x: width - 200, y: 200 },
      { x: 200, y: height - 200 },
      { x: width - 200, y: height - 200 },
    ];

    points.forEach((point, i) => {
      this.scene.time.delayedCall(i * 500, () => {
        // 워프 이펙트
        const warp = this.scene.add.circle(point.x, point.y, 10, 0x8a2be2, 0);

        this.scene.tweens.add({
          targets: warp,
          scale: 5,
          alpha: { from: 0, to: 0.5 },
          duration: 400,
          yoyo: true,
          onComplete: () => {
            warp.destroy();

            // 워프 포인트에서 발사
            this.fireFromWarp(point.x, point.y);
          },
        });
      });
    });
  }

  private fireFromWarp(x: number, y: number) {
    const player = this.scene.player;
    if (!player) return;

    const angle = Phaser.Math.Angle.Between(x, y, player.sprite.x, player.sprite.y);

    for (let i = -1; i <= 1; i++) {
      const bullet = this.scene.bossBullets.get(x, y, "bullet_enemy") as Phaser.Physics.Arcade.Image;
      if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        bullet.setTint(0xff00ff);
        bullet.setScale(1.3);
        bullet.setVelocity(
          Math.cos(angle + i * 0.15) * 450,
          Math.sin(angle + i * 0.15) * 450
        );

        this.scene.time.delayedCall(5000, () => {
          if (bullet.active) bullet.destroy();
        });
      }
    }
  }

  private galaxyBurst() {
    // 나선형 발사
    const waves = this.phase === 2 ? 3 : 2;
    const bulletsPerWave = this.phase === 2 ? 12 : 8;

    for (let wave = 0; wave < waves; wave++) {
      this.scene.time.delayedCall(wave * 400, () => {
        const baseAngle = (wave * Math.PI) / 6;

        for (let i = 0; i < bulletsPerWave; i++) {
          const angle = baseAngle + (Math.PI * 2 * i) / bulletsPerWave;

          const bullet = this.scene.bossBullets.get(
            this.sprite.x,
            this.sprite.y,
            "bullet_enemy"
          ) as Phaser.Physics.Arcade.Image;

          if (bullet) {
            bullet.setActive(true);
            bullet.setVisible(true);
            bullet.setTint(this.phase === 2 ? 0xff00ff : 0x8a2be2);
            bullet.setVelocity(
              Math.cos(angle) * (250 + wave * 50),
              Math.sin(angle) * (250 + wave * 50)
            );

            this.scene.time.delayedCall(5000, () => {
              if (bullet.active) bullet.destroy();
            });
          }
        }
      });
    }
  }

  private chaosStorm() {
    // 페이즈 2 전용 - 혼돈의 폭풍
    const duration = 3000;
    const interval = 100;

    const stormTimer = this.scene.time.addEvent({
      delay: interval,
      repeat: duration / interval,
      callback: () => {
        // 랜덤 위치에서 발사
        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        const speed = Phaser.Math.Between(200, 400);

        const bullet = this.scene.bossBullets.get(
          this.sprite.x + Phaser.Math.Between(-30, 30),
          this.sprite.y + Phaser.Math.Between(-30, 30),
          "bullet_enemy"
        ) as Phaser.Physics.Arcade.Image;

        if (bullet) {
          bullet.setActive(true);
          bullet.setVisible(true);
          bullet.setTint(Phaser.Math.Between(0, 1) === 0 ? 0xff00ff : 0x8a2be2);
          bullet.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

          this.scene.time.delayedCall(4000, () => {
            if (bullet.active) bullet.destroy();
          });
        }
      },
    });
  }
}
