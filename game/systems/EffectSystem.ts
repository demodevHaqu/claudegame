import * as Phaser from "phaser";

export class EffectSystem {
  private scene: Phaser.Scene;
  private particles: Phaser.GameObjects.Particles.ParticleEmitter[] = [];
  private activeTrails: Map<string, Phaser.Time.TimerEvent> = new Map();

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

    // 글로우 파티클 (소프트 원)
    if (!this.scene.textures.exists("particle_glow")) {
      const graphics = this.scene.make.graphics({ x: 0, y: 0 });
      // 그라데이션 효과를 위한 여러 레이어
      for (let i = 16; i > 0; i -= 2) {
        const alpha = 0.1 + (16 - i) * 0.05;
        graphics.fillStyle(0xffffff, alpha);
        graphics.fillCircle(16, 16, i);
      }
      graphics.generateTexture("particle_glow", 32, 32);
      graphics.destroy();
    }

    // 레이저 파티클
    if (!this.scene.textures.exists("particle_laser")) {
      const graphics = this.scene.make.graphics({ x: 0, y: 0 });
      graphics.fillStyle(0xffffff, 1);
      graphics.fillEllipse(16, 4, 32, 8);
      graphics.generateTexture("particle_laser", 32, 8);
      graphics.destroy();
    }

    // 링 파티클
    if (!this.scene.textures.exists("particle_ring")) {
      const graphics = this.scene.make.graphics({ x: 0, y: 0 });
      graphics.lineStyle(3, 0xffffff, 1);
      graphics.strokeCircle(16, 16, 13);
      graphics.generateTexture("particle_ring", 32, 32);
      graphics.destroy();
    }
  }

  // ========================================
  // 슬래시 공격 이펙트 (새로 추가)
  // ========================================
  slashEffect(x: number, y: number, direction: number = 0, color: number = 0xffd700) {
    // 슬래시 아크
    const slash = this.scene.add.graphics();
    slash.setPosition(x, y);
    slash.lineStyle(6, color, 1);
    slash.beginPath();
    slash.arc(0, 0, 60, direction - 0.9, direction + 0.9, false);
    slash.strokePath();

    // 내부 글로우
    slash.lineStyle(12, color, 0.3);
    slash.beginPath();
    slash.arc(0, 0, 60, direction - 0.9, direction + 0.9, false);
    slash.strokePath();

    slash.setBlendMode(Phaser.BlendModes.ADD);
    slash.setDepth(100);

    // 애니메이션
    this.scene.tweens.add({
      targets: slash,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 150,
      ease: "Power2",
      onComplete: () => slash.destroy(),
    });

    // 끝부분 스파크
    const endX = x + Math.cos(direction) * 60;
    const endY = y + Math.sin(direction) * 60;
    this.sparkBurst(endX, endY, color, 6);
  }

  // ========================================
  // 스파크 버스트 (새로 추가)
  // ========================================
  sparkBurst(x: number, y: number, color: number, count: number = 10) {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      const speed = 80 + Math.random() * 120;
      const size = 2 + Math.random() * 4;

      const spark = this.scene.add.circle(x, y, size, color);
      spark.setBlendMode(Phaser.BlendModes.ADD);
      spark.setDepth(100);

      this.scene.tweens.add({
        targets: spark,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed,
        alpha: 0,
        scale: 0,
        duration: 250 + Math.random() * 150,
        ease: "Power2",
        onComplete: () => spark.destroy(),
      });
    }
  }

  // ========================================
  // 레이저 라인 이펙트 (새로 추가)
  // ========================================
  laserLine(startX: number, startY: number, endX: number, endY: number, color: number = 0xff0080) {
    const angle = Math.atan2(endY - startY, endX - startX);
    const distance = Phaser.Math.Distance.Between(startX, startY, endX, endY);

    const laser = this.scene.add.graphics();
    laser.setPosition(startX, startY);
    laser.setRotation(angle);

    // 글로우 레이어 (외부 → 내부)
    laser.fillStyle(color, 0.2);
    laser.fillRect(0, -20, distance, 40);
    laser.fillStyle(color, 0.5);
    laser.fillRect(0, -10, distance, 20);
    laser.fillStyle(0xffffff, 0.9);
    laser.fillRect(0, -4, distance, 8);

    laser.setBlendMode(Phaser.BlendModes.ADD);
    laser.setDepth(100);

    this.scene.tweens.add({
      targets: laser,
      alpha: 0,
      duration: 150,
      onComplete: () => laser.destroy(),
    });

    // 시작/끝 임팩트
    this.sparkBurst(endX, endY, color, 8);
  }

  // ========================================
  // 차지 이펙트 (새로 추가)
  // ========================================
  chargeEffect(x: number, y: number, color: number, duration: number = 1000): { stop: () => void } {
    const particles: Phaser.GameObjects.Arc[] = [];
    const ringGraphics = this.scene.add.graphics();
    ringGraphics.setDepth(50);

    let elapsed = 0;
    const timer = this.scene.time.addEvent({
      delay: 50,
      loop: true,
      callback: () => {
        elapsed += 50;
        const progress = Math.min(elapsed / duration, 1);

        // 수렴하는 파티클
        const angle = Math.random() * Math.PI * 2;
        const dist = 100 - progress * 80;
        const particle = this.scene.add.circle(
          x + Math.cos(angle) * dist,
          y + Math.sin(angle) * dist,
          3,
          color,
          0.8
        );
        particle.setBlendMode(Phaser.BlendModes.ADD);
        particle.setDepth(51);
        particles.push(particle);

        this.scene.tweens.add({
          targets: particle,
          x: x,
          y: y,
          alpha: 0,
          scale: 0.5,
          duration: 300,
          onComplete: () => {
            const idx = particles.indexOf(particle);
            if (idx > -1) particles.splice(idx, 1);
            particle.destroy();
          },
        });

        // 차지 링
        ringGraphics.clear();
        ringGraphics.lineStyle(3 + progress * 3, color, 0.5 + progress * 0.5);
        ringGraphics.strokeCircle(x, y, 20 + progress * 15);
      },
    });

    return {
      stop: () => {
        timer.destroy();
        ringGraphics.destroy();
        particles.forEach(p => p.destroy());
      },
    };
  }

  // ========================================
  // 텔레포트 이펙트 (새로 추가)
  // ========================================
  teleportEffect(fromX: number, fromY: number, toX: number, toY: number, color: number) {
    // 출발점 소멸
    for (let i = 0; i < 3; i++) {
      const ring = this.scene.add.graphics();
      ring.setPosition(fromX, fromY);
      ring.lineStyle(3 - i, color, 1);
      ring.strokeCircle(0, 0, 20);
      ring.setBlendMode(Phaser.BlendModes.ADD);
      ring.setDepth(100);

      this.scene.tweens.add({
        targets: ring,
        scaleX: 0,
        scaleY: 3,
        alpha: 0,
        duration: 200 + i * 50,
        delay: i * 30,
        onComplete: () => ring.destroy(),
      });
    }

    // 도착점 출현
    this.scene.time.delayedCall(100, () => {
      for (let i = 0; i < 3; i++) {
        const ring = this.scene.add.graphics();
        ring.setPosition(toX, toY);
        ring.lineStyle(3 - i, color, 1);
        ring.strokeCircle(0, 0, 5);
        ring.setBlendMode(Phaser.BlendModes.ADD);
        ring.setDepth(100);

        this.scene.tweens.add({
          targets: ring,
          scaleX: 4,
          scaleY: 4,
          alpha: 0,
          duration: 250,
          delay: i * 30,
          onComplete: () => ring.destroy(),
        });
      }
      this.sparkBurst(toX, toY, color, 12);
    });
  }

  // ========================================
  // 경고 표시 이펙트 (새로 추가)
  // ========================================
  warningIndicator(x: number, y: number, radius: number, duration: number = 1000) {
    const warning = this.scene.add.graphics();
    warning.setDepth(5);

    let flash = false;
    const timer = this.scene.time.addEvent({
      delay: 80,
      repeat: Math.floor(duration / 80),
      callback: () => {
        flash = !flash;
        warning.clear();
        warning.lineStyle(3, 0xff0000, flash ? 1 : 0.5);
        warning.strokeCircle(x, y, radius);
        warning.fillStyle(0xff0000, flash ? 0.25 : 0.1);
        warning.fillCircle(x, y, radius);
      },
    });

    this.scene.time.delayedCall(duration, () => {
      timer.destroy();
      warning.destroy();
    });

    return warning;
  }

  // ========================================
  // 오라 이펙트 (캐릭터 주변)
  // ========================================
  auraEffect(target: Phaser.GameObjects.Sprite, color: number): Phaser.Time.TimerEvent {
    return this.scene.time.addEvent({
      delay: 100,
      loop: true,
      callback: () => {
        if (!target.active) return;

        const angle = Math.random() * Math.PI * 2;
        const dist = 20 + Math.random() * 15;
        const particle = this.scene.add.circle(
          target.x + Math.cos(angle) * dist,
          target.y + Math.sin(angle) * dist,
          3 + Math.random() * 3,
          color,
          0.6
        );
        particle.setBlendMode(Phaser.BlendModes.ADD);
        particle.setDepth(target.depth - 1);

        this.scene.tweens.add({
          targets: particle,
          y: particle.y - 30,
          alpha: 0,
          scale: 0.3,
          duration: 400,
          onComplete: () => particle.destroy(),
        });
      },
    });
  }

  // ========================================
  // 보스 등장 이펙트 (새로 추가)
  // ========================================
  bossEntranceEffect(x: number, y: number, color: number) {
    this.screenFlash(color, 200);
    this.screenShake(300, 0.02);

    // 포탈 이펙트
    let size = 0;
    const portal = this.scene.add.graphics();
    portal.setDepth(50);

    const timer = this.scene.time.addEvent({
      delay: 16,
      repeat: 80,
      callback: () => {
        size += 4;
        portal.clear();

        // 외곽 링
        portal.lineStyle(5, color, 0.9);
        portal.strokeCircle(x, y, size);

        // 내부 소용돌이
        portal.lineStyle(2, 0xffffff, 0.5);
        for (let i = 0; i < 4; i++) {
          const angle = (i / 4) * Math.PI * 2 + size * 0.05;
          const innerSize = size * 0.7;
          portal.strokeCircle(
            x + Math.cos(angle) * innerSize * 0.3,
            y + Math.sin(angle) * innerSize * 0.3,
            innerSize * 0.2
          );
        }
      },
    });

    this.scene.time.delayedCall(1500, () => {
      this.scene.tweens.add({
        targets: portal,
        alpha: 0,
        duration: 300,
        onComplete: () => {
          timer.destroy();
          portal.destroy();
        },
      });
    });
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
