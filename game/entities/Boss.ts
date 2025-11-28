import * as Phaser from "phaser";
import type { GameScene } from "../scenes/GameScene";

export type BossState = "idle" | "attacking" | "stunned" | "dead";

export interface BossPattern {
  name: string;
  duration: number;
  cooldown: number;
  execute: () => void;
}

export abstract class Boss {
  public sprite: Phaser.Physics.Arcade.Sprite;
  public hp: number;
  public maxHp: number;
  public name: string;
  public isDead: boolean = false;
  public deathHandled: boolean = false;

  protected scene: GameScene;
  protected state: BossState = "idle";
  protected patterns: BossPattern[] = [];
  protected currentPatternIndex: number = 0;
  protected patternTimer: number = 0;
  protected patternCooldown: number = 0;

  protected initialX: number;
  protected initialY: number;

  constructor(
    scene: GameScene,
    x: number,
    y: number,
    texture: string,
    name: string,
    maxHp: number
  ) {
    this.scene = scene;
    this.name = name;
    this.maxHp = maxHp;
    this.hp = maxHp;
    this.initialX = x;
    this.initialY = y;

    this.sprite = scene.physics.add.sprite(x, y, texture);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(5);
    this.sprite.setScale(1.5);

    this.setupPatterns();
  }

  protected abstract setupPatterns(): void;

  update(delta: number) {
    if (this.isDead) return;

    this.patternTimer += delta;
    this.patternCooldown -= delta;

    if (this.patternCooldown <= 0 && this.patterns.length > 0) {
      this.executePattern();
    }

    this.updateBehavior(delta);
  }

  protected updateBehavior(_delta: number) {
    // 기본 동작 - 서브클래스에서 오버라이드
  }

  protected executePattern() {
    const pattern = this.patterns[this.currentPatternIndex];
    pattern.execute();
    this.patternCooldown = pattern.cooldown;
    this.currentPatternIndex = (this.currentPatternIndex + 1) % this.patterns.length;
  }

  takeDamage(amount: number) {
    if (this.isDead) return;

    this.hp -= amount;

    // 피격 이펙트
    this.sprite.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      if (!this.isDead) {
        this.sprite.clearTint();
      }
    });

    // 사망 체크
    if (this.hp <= 0) {
      this.hp = 0;
      this.die();
    }
  }

  protected die() {
    this.isDead = true;
    this.state = "dead";

    // 사망 이펙트
    this.scene.cameras.main.shake(500, 0.02);

    // 폭발 이펙트
    for (let i = 0; i < 10; i++) {
      this.scene.time.delayedCall(i * 100, () => {
        const x = this.sprite.x + Phaser.Math.Between(-50, 50);
        const y = this.sprite.y + Phaser.Math.Between(-50, 50);
        const explosion = this.scene.add.circle(x, y, 20, 0xff8800);

        this.scene.tweens.add({
          targets: explosion,
          scale: 3,
          alpha: 0,
          duration: 300,
          onComplete: () => explosion.destroy(),
        });
      });
    }

    // 페이드 아웃
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      scale: 2,
      duration: 1000,
      onComplete: () => {
        this.sprite.destroy();
      },
    });
  }

  // 유틸리티 메서드
  protected fireAtPlayer(speed: number = 400, spread: number = 0) {
    const player = this.scene.player;
    if (!player || player.isDead) return;

    const angle = Phaser.Math.Angle.Between(
      this.sprite.x,
      this.sprite.y,
      player.sprite.x,
      player.sprite.y
    );

    const spreadAngle = spread > 0 ? Phaser.Math.FloatBetween(-spread, spread) : 0;
    const finalAngle = angle + spreadAngle;

    const bullet = this.scene.bossBullets.get(
      this.sprite.x,
      this.sprite.y,
      "bullet_enemy"
    ) as Phaser.Physics.Arcade.Image;

    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocity(
        Math.cos(finalAngle) * speed,
        Math.sin(finalAngle) * speed
      );

      this.scene.time.delayedCall(5000, () => {
        if (bullet.active) bullet.destroy();
      });
    }
  }

  protected fireCircle(bulletCount: number, speed: number = 300) {
    const angleStep = (Math.PI * 2) / bulletCount;

    for (let i = 0; i < bulletCount; i++) {
      const angle = angleStep * i;

      const bullet = this.scene.bossBullets.get(
        this.sprite.x,
        this.sprite.y,
        "bullet_enemy"
      ) as Phaser.Physics.Arcade.Image;

      if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        bullet.setVelocity(
          Math.cos(angle) * speed,
          Math.sin(angle) * speed
        );

        this.scene.time.delayedCall(5000, () => {
          if (bullet.active) bullet.destroy();
        });
      }
    }
  }

  protected moveTo(x: number, y: number, duration: number) {
    this.scene.tweens.add({
      targets: this.sprite,
      x,
      y,
      duration,
      ease: "Sine.easeInOut",
    });
  }
}
