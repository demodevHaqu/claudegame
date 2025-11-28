import * as Phaser from "phaser";
import type { GameScene } from "../scenes/GameScene";

export class Player {
  public sprite: Phaser.Physics.Arcade.Sprite;
  public hp: number = 100;
  public maxHp: number = 100;
  public isInvincible: boolean = false;
  public isDead: boolean = false;

  // 스킬 관련
  public skillCooldown: number = 0;
  public shieldCooldown: number = 0;
  public ultimateGauge: number = 0;

  private scene: GameScene;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: {
    Z: Phaser.Input.Keyboard.Key;
    X: Phaser.Input.Keyboard.Key;
    C: Phaser.Input.Keyboard.Key;
    SPACE: Phaser.Input.Keyboard.Key;
  };

  private attackCooldown: number = 0;
  private readonly ATTACK_COOLDOWN = 200;
  private readonly SKILL_COOLDOWN = 3000;
  private readonly SHIELD_COOLDOWN = 8000;
  private readonly SHIELD_DURATION = 2000;

  private speed: number = 300;
  private shieldActive: boolean = false;
  private shieldSprite?: Phaser.GameObjects.Graphics;

  constructor(scene: GameScene, x: number, y: number) {
    this.scene = scene;

    this.sprite = scene.physics.add.sprite(x, y, "player");
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(10);

    // 키보드 설정
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.keys = {
      Z: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Z),
      X: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.X),
      C: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.C),
      SPACE: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
    };
  }

  update(delta: number) {
    if (this.isDead) return;

    this.handleMovement();
    this.handleSkills();
    this.updateCooldowns(delta);
    this.updateShield();
  }

  private handleMovement() {
    let vx = 0;
    let vy = 0;

    if (this.cursors.left.isDown) vx = -this.speed;
    else if (this.cursors.right.isDown) vx = this.speed;

    if (this.cursors.up.isDown) vy = -this.speed;
    else if (this.cursors.down.isDown) vy = this.speed;

    // 대각선 이동 속도 보정
    if (vx !== 0 && vy !== 0) {
      vx *= 0.707;
      vy *= 0.707;
    }

    this.sprite.setVelocity(vx, vy);
  }

  private handleSkills() {
    // 기본 공격 (Z)
    if (Phaser.Input.Keyboard.JustDown(this.keys.Z) && this.attackCooldown <= 0) {
      this.attack();
    }

    // 스킬 (X) - Artifact Beam
    if (Phaser.Input.Keyboard.JustDown(this.keys.X) && this.skillCooldown <= 0) {
      this.artifactBeam();
    }

    // 쉴드 (C) - Thinking Shield
    if (Phaser.Input.Keyboard.JustDown(this.keys.C) && this.shieldCooldown <= 0) {
      this.thinkingShield();
    }

    // 궁극기 (SPACE) - Claude Code Execute
    if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE) && this.ultimateGauge >= 100) {
      this.ultimateAttack();
    }
  }

  private updateCooldowns(delta: number) {
    if (this.attackCooldown > 0) this.attackCooldown -= delta;
    if (this.skillCooldown > 0) this.skillCooldown -= delta;
    if (this.shieldCooldown > 0) this.shieldCooldown -= delta;
  }

  // 기본 공격
  private attack() {
    this.attackCooldown = this.ATTACK_COOLDOWN;

    const bullet = this.scene.playerBullets.get(
      this.sprite.x + 40,
      this.sprite.y,
      "bullet_player"
    ) as Phaser.Physics.Arcade.Image;

    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityX(600);

      // 화면 밖으로 나가면 제거
      this.scene.time.delayedCall(2000, () => {
        if (bullet.active) bullet.destroy();
      });
    }

    // 궁극기 게이지 충전
    this.ultimateGauge = Math.min(100, this.ultimateGauge + 2);
  }

  // 스킬: Artifact Beam (데미지 25)
  private artifactBeam() {
    this.skillCooldown = this.SKILL_COOLDOWN;

    // 빔 이펙트
    const beam = this.scene.add.rectangle(
      this.sprite.x + 300,
      this.sprite.y,
      600,
      20,
      0xffd700,
      0.8
    );

    this.scene.tweens.add({
      targets: beam,
      alpha: 0,
      scaleY: 2,
      duration: 300,
      onComplete: () => beam.destroy(),
    });

    // 보스에게 데미지
    if (this.scene.boss && !this.scene.boss.isDead) {
      this.scene.boss.takeDamage(25);
    }

    // 궁극기 게이지
    this.ultimateGauge = Math.min(100, this.ultimateGauge + 10);
  }

  // 쉴드: Thinking Shield (2초 무적 + 반사)
  private thinkingShield() {
    this.shieldCooldown = this.SHIELD_COOLDOWN;
    this.shieldActive = true;
    this.isInvincible = true;

    // 쉴드 비주얼
    this.shieldSprite = this.scene.add.graphics();
    this.shieldSprite.lineStyle(3, 0x00ffff, 1);
    this.shieldSprite.strokeCircle(0, 0, 50);
    this.shieldSprite.fillStyle(0x00ffff, 0.2);
    this.shieldSprite.fillCircle(0, 0, 50);

    // 펄스 효과
    this.scene.tweens.add({
      targets: this.shieldSprite,
      scaleX: { from: 0.8, to: 1.2 },
      scaleY: { from: 0.8, to: 1.2 },
      alpha: { from: 1, to: 0.5 },
      duration: 500,
      yoyo: true,
      repeat: 3,
    });

    // 쉴드 종료
    this.scene.time.delayedCall(this.SHIELD_DURATION, () => {
      this.shieldActive = false;
      this.isInvincible = false;
      if (this.shieldSprite) {
        this.shieldSprite.destroy();
        this.shieldSprite = undefined;
      }
    });
  }

  private updateShield() {
    if (this.shieldSprite) {
      this.shieldSprite.setPosition(this.sprite.x, this.sprite.y);
    }
  }

  // 궁극기: Claude Code Execute (데미지 50 + 화면 클리어)
  private ultimateAttack() {
    this.ultimateGauge = 0;

    // 화면 플래시
    this.scene.cameras.main.flash(500, 255, 215, 0);

    // 화면 클리어 이펙트
    const flash = this.scene.add.rectangle(
      this.scene.cameras.main.width / 2,
      this.scene.cameras.main.height / 2,
      this.scene.cameras.main.width,
      this.scene.cameras.main.height,
      0xffd700,
      0.5
    );
    flash.setDepth(100);

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 500,
      onComplete: () => flash.destroy(),
    });

    // 모든 적 투사체 제거
    this.scene.bossBullets.clear(true, true);

    // 보스에게 데미지
    if (this.scene.boss && !this.scene.boss.isDead) {
      this.scene.boss.takeDamage(50);
    }

    // 점수 추가
    this.scene.addScore(500);
  }

  takeDamage(amount: number) {
    if (this.isInvincible || this.isDead) return;

    // 쉴드 반사
    if (this.shieldActive) {
      // 반사 투사체 생성
      const bullet = this.scene.playerBullets.get(
        this.sprite.x + 40,
        this.sprite.y,
        "bullet_player"
      ) as Phaser.Physics.Arcade.Image;

      if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        bullet.setTint(0x00ffff);
        bullet.setVelocityX(800);
        this.scene.time.delayedCall(2000, () => {
          if (bullet.active) bullet.destroy();
        });
      }
      return;
    }

    this.hp -= amount;

    // 피격 이펙트
    this.scene.cameras.main.shake(100, 0.01);
    this.sprite.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      this.sprite.clearTint();
    });

    // 무적 시간
    this.isInvincible = true;
    this.scene.time.delayedCall(500, () => {
      this.isInvincible = false;
    });

    // 깜빡임
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: { from: 0.5, to: 1 },
      duration: 100,
      repeat: 4,
    });

    // 사망 체크
    if (this.hp <= 0) {
      this.hp = 0;
      this.isDead = true;
      this.sprite.setTint(0x888888);
      this.sprite.setVelocity(0, 0);
    }

    // 궁극기 게이지 (피격 시에도 충전)
    this.ultimateGauge = Math.min(100, this.ultimateGauge + 5);
  }
}
