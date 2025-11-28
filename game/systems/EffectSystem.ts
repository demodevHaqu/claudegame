import * as Phaser from "phaser";

export class EffectSystem {
  private scene: Phaser.Scene;
  private particles: Phaser.GameObjects.Particles.ParticleEmitter[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.createParticleTextures();
  }

  private createParticleTextures() {
    // 기본 파티클 텍스처 생성
    if (!this.scene.textures.exists("particle_circle")) {
      const graphics = this.scene.make.graphics({ x: 0, y: 0 });
      graphics.fillStyle(0xffffff);
      graphics.fillCircle(8, 8, 8);
      graphics.generateTexture("particle_circle", 16, 16);
      graphics.destroy();
    }

    if (!this.scene.textures.exists("particle_star")) {
      const graphics = this.scene.make.graphics({ x: 0, y: 0 });
      graphics.fillStyle(0xffffff);
      // 별 모양
      const cx = 12, cy = 12, spikes = 5, outerR = 12, innerR = 5;
      graphics.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const angle = (i * Math.PI) / spikes - Math.PI / 2;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (i === 0) graphics.moveTo(x, y);
        else graphics.lineTo(x, y);
      }
      graphics.closePath();
      graphics.fillPath();
      graphics.generateTexture("particle_star", 24, 24);
      graphics.destroy();
    }

    if (!this.scene.textures.exists("particle_spark")) {
      const graphics = this.scene.make.graphics({ x: 0, y: 0 });
      graphics.fillStyle(0xffffff);
      graphics.fillRect(0, 3, 16, 2);
      graphics.fillRect(7, 0, 2, 8);
      graphics.generateTexture("particle_spark", 16, 8);
      graphics.destroy();
    }
  }

  // 히트 이펙트 (피격 시)
  hitEffect(x: number, y: number, color: number = 0xffffff) {
    const emitter = this.scene.add.particles(x, y, "particle_circle", {
      speed: { min: 100, max: 300 },
      scale: { start: 0.8, end: 0 },
      lifespan: 300,
      quantity: 10,
      tint: color,
      emitting: false,
    });

    emitter.explode(10);

    this.scene.time.delayedCall(500, () => {
      emitter.destroy();
    });
  }

  // 대미지 숫자 표시
  damageNumber(x: number, y: number, damage: number, isCritical: boolean = false) {
    const text = this.scene.add.text(x, y, damage.toString(), {
      fontFamily: "monospace",
      fontSize: isCritical ? "32px" : "24px",
      color: isCritical ? "#FF0000" : "#FFFFFF",
      stroke: "#000000",
      strokeThickness: 4,
    });
    text.setOrigin(0.5);
    text.setDepth(100);

    this.scene.tweens.add({
      targets: text,
      y: y - 50,
      alpha: 0,
      scale: isCritical ? 1.5 : 1.2,
      duration: 800,
      ease: "Cubic.easeOut",
      onComplete: () => text.destroy(),
    });
  }

  // 콤보 이펙트
  comboEffect(x: number, y: number, combo: number) {
    // 콤보 텍스트
    const comboText = this.scene.add.text(x, y, `${combo} COMBO!`, {
      fontFamily: "monospace",
      fontSize: "28px",
      color: combo >= 10 ? "#FFD700" : combo >= 5 ? "#00FFFF" : "#FFFFFF",
      stroke: "#000000",
      strokeThickness: 4,
    });
    comboText.setOrigin(0.5);
    comboText.setDepth(100);

    this.scene.tweens.add({
      targets: comboText,
      scale: { from: 0.5, to: 1.3 },
      alpha: { from: 1, to: 0 },
      y: y - 30,
      duration: 600,
      ease: "Back.easeOut",
      onComplete: () => comboText.destroy(),
    });

    // 높은 콤보일 때 파티클
    if (combo >= 5) {
      const emitter = this.scene.add.particles(x, y, "particle_star", {
        speed: { min: 50, max: 150 },
        scale: { start: 0.6, end: 0 },
        lifespan: 500,
        quantity: combo >= 10 ? 15 : 8,
        tint: combo >= 10 ? 0xffd700 : 0x00ffff,
        emitting: false,
      });
      emitter.explode(combo >= 10 ? 15 : 8);
      this.scene.time.delayedCall(600, () => emitter.destroy());
    }
  }

  // 스킬 이펙트 - 빔
  beamEffect(startX: number, startY: number, endX: number, color: number = 0xffd700) {
    const width = endX - startX;

    // 메인 빔
    const beam = this.scene.add.rectangle(startX, startY, width, 20, color, 0.9);
    beam.setOrigin(0, 0.5);
    beam.setDepth(50);

    // 글로우 효과
    const glow = this.scene.add.rectangle(startX, startY, width, 40, color, 0.3);
    glow.setOrigin(0, 0.5);
    glow.setDepth(49);

    // 파티클
    const particles = this.scene.add.particles(endX, startY, "particle_spark", {
      speed: { min: 100, max: 300 },
      angle: { min: -30, max: 30 },
      scale: { start: 1, end: 0 },
      lifespan: 300,
      quantity: 5,
      tint: color,
      emitting: false,
    });
    particles.explode(20);

    // 애니메이션
    this.scene.tweens.add({
      targets: [beam, glow],
      alpha: 0,
      scaleY: 3,
      duration: 200,
      onComplete: () => {
        beam.destroy();
        glow.destroy();
      },
    });

    this.scene.time.delayedCall(400, () => particles.destroy());

    // 화면 흔들림
    this.scene.cameras.main.shake(100, 0.01);
  }

  // 쉴드 이펙트
  shieldEffect(x: number, y: number, duration: number = 2000) {
    const shield = this.scene.add.graphics();
    shield.setDepth(60);

    const drawShield = (time: number) => {
      shield.clear();
      const pulse = Math.sin(time / 100) * 5;

      // 외곽 원
      shield.lineStyle(3, 0x00ffff, 0.8);
      shield.strokeCircle(x, y, 50 + pulse);

      // 내부 채우기
      shield.fillStyle(0x00ffff, 0.15);
      shield.fillCircle(x, y, 50 + pulse);

      // 육각형 패턴
      shield.lineStyle(1, 0x00ffff, 0.4);
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3 + time / 500;
        const px = x + Math.cos(angle) * 35;
        const py = y + Math.sin(angle) * 35;
        shield.strokeCircle(px, py, 8);
      }
    };

    let elapsed = 0;
    const updateEvent = this.scene.time.addEvent({
      delay: 16,
      repeat: duration / 16,
      callback: () => {
        elapsed += 16;
        drawShield(elapsed);
      },
    });

    this.scene.time.delayedCall(duration, () => {
      this.scene.tweens.add({
        targets: shield,
        alpha: 0,
        duration: 200,
        onComplete: () => {
          updateEvent.remove();
          shield.destroy();
        },
      });
    });

    return shield;
  }

  // 궁극기 이펙트
  ultimateEffect(centerX: number, centerY: number) {
    const { width, height } = this.scene.cameras.main;

    // 화면 플래시
    this.scene.cameras.main.flash(300, 255, 215, 0);
    this.scene.cameras.main.shake(500, 0.03);

    // 중앙에서 퍼지는 웨이브
    for (let i = 0; i < 3; i++) {
      this.scene.time.delayedCall(i * 100, () => {
        const wave = this.scene.add.circle(centerX, centerY, 10, 0xffd700, 0);
        wave.setStrokeStyle(4, 0xffd700, 1);
        wave.setDepth(100);

        this.scene.tweens.add({
          targets: wave,
          radius: 500,
          alpha: 0,
          duration: 600,
          ease: "Cubic.easeOut",
          onComplete: () => wave.destroy(),
        });
      });
    }

    // 파티클 폭발
    const emitter = this.scene.add.particles(centerX, centerY, "particle_star", {
      speed: { min: 200, max: 500 },
      scale: { start: 1, end: 0 },
      lifespan: 800,
      quantity: 50,
      tint: [0xffd700, 0xffa500, 0xff8c00],
      emitting: false,
    });
    emitter.explode(50);
    this.scene.time.delayedCall(1000, () => emitter.destroy());

    // "CLAUDE CODE EXECUTE" 텍스트
    const text = this.scene.add.text(width / 2, height / 2, "CLAUDE CODE EXECUTE!", {
      fontFamily: "monospace",
      fontSize: "48px",
      color: "#FFD700",
      stroke: "#000000",
      strokeThickness: 6,
    });
    text.setOrigin(0.5);
    text.setDepth(101);
    text.setAlpha(0);

    this.scene.tweens.add({
      targets: text,
      alpha: 1,
      scale: { from: 0.5, to: 1.2 },
      duration: 300,
      yoyo: true,
      hold: 400,
      onComplete: () => text.destroy(),
    });
  }

  // 보스 사망 이펙트
  bossDeathEffect(x: number, y: number) {
    this.scene.cameras.main.shake(1000, 0.04);

    // 연속 폭발
    for (let i = 0; i < 15; i++) {
      this.scene.time.delayedCall(i * 80, () => {
        const offsetX = x + Phaser.Math.Between(-80, 80);
        const offsetY = y + Phaser.Math.Between(-80, 80);

        // 폭발 원
        const explosion = this.scene.add.circle(offsetX, offsetY, 10, 0xff8800);
        explosion.setDepth(90);

        this.scene.tweens.add({
          targets: explosion,
          radius: 50,
          alpha: 0,
          duration: 400,
          onComplete: () => explosion.destroy(),
        });

        // 파티클
        const particles = this.scene.add.particles(offsetX, offsetY, "particle_circle", {
          speed: { min: 100, max: 300 },
          scale: { start: 0.8, end: 0 },
          lifespan: 400,
          quantity: 8,
          tint: [0xff8800, 0xff4400, 0xffff00],
          emitting: false,
        });
        particles.explode(8);
        this.scene.time.delayedCall(500, () => particles.destroy());
      });
    }

    // 최종 대폭발
    this.scene.time.delayedCall(1200, () => {
      this.scene.cameras.main.flash(500, 255, 255, 255);

      const finalExplosion = this.scene.add.circle(x, y, 20, 0xffffff);
      finalExplosion.setDepth(100);

      this.scene.tweens.add({
        targets: finalExplosion,
        radius: 300,
        alpha: 0,
        duration: 500,
        onComplete: () => finalExplosion.destroy(),
      });
    });
  }

  // 스크린 이펙트
  screenFlash(color: number = 0xffffff, duration: number = 100) {
    const r = (color >> 16) & 0xff;
    const g = (color >> 8) & 0xff;
    const b = color & 0xff;
    this.scene.cameras.main.flash(duration, r, g, b);
  }

  screenShake(duration: number = 100, intensity: number = 0.01) {
    this.scene.cameras.main.shake(duration, intensity);
  }

  // 슬로우 모션
  slowMotion(duration: number = 500, scale: number = 0.3) {
    this.scene.time.timeScale = scale;
    this.scene.time.delayedCall(duration * scale, () => {
      this.scene.time.timeScale = 1;
    });
  }
}
