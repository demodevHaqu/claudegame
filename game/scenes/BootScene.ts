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

    // 고품질 에셋 생성
    this.createPlayerAsset();
    this.createBossAssets();
    this.createProjectileAssets();
    this.createEffectAssets();
    this.createBackgroundAsset();
  }

  create() {
    this.scene.start("MenuScene");
  }

  // ==========================================
  // 플레이어 캐릭터 (Claude - 황금 마법사)
  // ==========================================
  private createPlayerAsset() {
    const size = 64;
    const g = this.make.graphics({ x: 0, y: 0 });

    // 외곽 글로우
    g.fillStyle(0xffd700, 0.3);
    g.fillCircle(size / 2, size / 2, 30);

    // 몸체 (로브)
    g.fillStyle(0x1a1a2e);
    g.fillRoundedRect(size / 2 - 16, size / 2 - 8, 32, 28, 4);

    // 로브 테두리 (황금)
    g.lineStyle(2, 0xffd700, 1);
    g.strokeRoundedRect(size / 2 - 16, size / 2 - 8, 32, 28, 4);

    // 후드/머리
    g.fillStyle(0x2a2a4e);
    g.fillCircle(size / 2, size / 2 - 12, 14);

    // 후드 테두리
    g.lineStyle(2, 0xffd700, 1);
    g.strokeCircle(size / 2, size / 2 - 12, 14);

    // 얼굴 (어두운 영역)
    g.fillStyle(0x0a0a1f);
    g.fillEllipse(size / 2, size / 2 - 10, 16, 12);

    // 눈 (빛나는 황금색)
    g.fillStyle(0xffd700);
    g.fillCircle(size / 2 - 5, size / 2 - 12, 3);
    g.fillCircle(size / 2 + 5, size / 2 - 12, 3);

    // 눈 하이라이트
    g.fillStyle(0xffffff);
    g.fillCircle(size / 2 - 4, size / 2 - 13, 1);
    g.fillCircle(size / 2 + 6, size / 2 - 13, 1);

    // 지팡이
    g.lineStyle(3, 0x8b4513, 1);
    g.moveTo(size / 2 + 20, size / 2 - 20);
    g.lineTo(size / 2 + 20, size / 2 + 20);
    g.strokePath();

    // 지팡이 상단 보석 (다이아몬드 형태)
    g.fillStyle(0xffd700, 1);
    g.fillTriangle(
      size / 2 + 20, size / 2 - 32,  // 상단
      size / 2 + 14, size / 2 - 24,  // 좌측
      size / 2 + 26, size / 2 - 24   // 우측
    );
    g.fillTriangle(
      size / 2 + 20, size / 2 - 16,  // 하단
      size / 2 + 14, size / 2 - 24,  // 좌측
      size / 2 + 26, size / 2 - 24   // 우측
    );

    // 보석 글로우
    g.fillStyle(0xffd700, 0.4);
    g.fillCircle(size / 2 + 20, size / 2 - 24, 12);

    // Claude 심볼 (가슴에)
    g.lineStyle(2, 0xffd700, 0.8);
    g.strokeCircle(size / 2, size / 2 + 5, 6);
    g.fillStyle(0xffd700, 0.5);
    g.fillCircle(size / 2, size / 2 + 5, 4);

    g.generateTexture("player", size, size);
    g.destroy();
  }

  // ==========================================
  // 보스 캐릭터들
  // ==========================================
  private createBossAssets() {
    // GPT-4o (Stage 1) - 청록색 로봇
    this.createGPT4oBoss();

    // Gemini 2.0 (Stage 2) - 보라색 별/은하
    this.createGemini2Boss();

    // GPT-5 (Stage 3) - 진화된 청록 타이탄
    this.createGPT5Boss();

    // Gemini 3 (Stage 4) - 우주적 보라색 엔티티
    this.createGemini3Boss();

    // Final Boss (Stage 5) - 멀티컬러 벤치마크
    this.createFinalBoss();
  }

  private createGPT4oBoss() {
    const size = 96;
    const g = this.make.graphics({ x: 0, y: 0 });
    const cx = size / 2, cy = size / 2;

    // 외곽 글로우
    g.fillStyle(0x00ffff, 0.2);
    g.fillCircle(cx, cy, 45);

    // 몸체 (육각형 프레임)
    g.fillStyle(0x1a3a4a);
    this.drawHexagon(g, cx, cy, 36, true);

    // 테두리
    g.lineStyle(3, 0x00ffff, 1);
    this.drawHexagon(g, cx, cy, 36, false);

    // 내부 패턴
    g.lineStyle(1, 0x00ffff, 0.5);
    this.drawHexagon(g, cx, cy, 24, false);
    this.drawHexagon(g, cx, cy, 12, false);

    // 중앙 코어 (눈)
    g.fillStyle(0x00ffff, 0.8);
    g.fillCircle(cx, cy, 12);
    g.fillStyle(0x0a0a1f);
    g.fillCircle(cx, cy, 8);
    g.fillStyle(0x00ffff);
    g.fillCircle(cx, cy, 4);

    // 외곽 노드들
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const nx = cx + Math.cos(angle) * 30;
      const ny = cy + Math.sin(angle) * 30;
      g.fillStyle(0x00ffff, 0.8);
      g.fillCircle(nx, ny, 5);
    }

    g.generateTexture("boss_gpt4o", size, size);
    g.destroy();
  }

  private createGemini2Boss() {
    const size = 112;
    const g = this.make.graphics({ x: 0, y: 0 });
    const cx = size / 2, cy = size / 2;

    // 외곽 글로우
    g.fillStyle(0x9400d3, 0.15);
    g.fillCircle(cx, cy, 52);

    // 별 모양 몸체
    g.fillStyle(0x2a1a4a);
    this.drawStar(g, cx, cy, 8, 40, 20, true);

    // 별 테두리
    g.lineStyle(3, 0x9400d3, 1);
    this.drawStar(g, cx, cy, 8, 40, 20, false);

    // 내부 원형 패턴
    g.lineStyle(2, 0x9400d3, 0.6);
    g.strokeCircle(cx, cy, 25);

    // 쌍둥이 눈 (Gemini)
    const eyeOffset = 10;
    // 왼쪽 눈
    g.fillStyle(0x9400d3, 0.8);
    g.fillCircle(cx - eyeOffset, cy - 5, 10);
    g.fillStyle(0x0a0a1f);
    g.fillCircle(cx - eyeOffset, cy - 5, 6);
    g.fillStyle(0xffffff);
    g.fillCircle(cx - eyeOffset - 2, cy - 7, 2);

    // 오른쪽 눈
    g.fillStyle(0x9400d3, 0.8);
    g.fillCircle(cx + eyeOffset, cy - 5, 10);
    g.fillStyle(0x0a0a1f);
    g.fillCircle(cx + eyeOffset, cy - 5, 6);
    g.fillStyle(0xffffff);
    g.fillCircle(cx + eyeOffset - 2, cy - 7, 2);

    // 연결선 (쌍둥이 연결)
    g.lineStyle(2, 0x9400d3, 0.5);
    g.moveTo(cx - eyeOffset, cy + 5);
    g.lineTo(cx + eyeOffset, cy + 5);
    g.strokePath();

    // 주변 작은 별들
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const dist = 35 + (i % 2) * 8;
      const sx = cx + Math.cos(angle) * dist;
      const sy = cy + Math.sin(angle) * dist;
      g.fillStyle(0x9400d3, 0.6);
      this.drawStar(g, sx, sy, 4, 5, 2, true);
    }

    g.generateTexture("boss_gemini2", size, size);
    g.destroy();
  }

  private createGPT5Boss() {
    const size = 128;
    const g = this.make.graphics({ x: 0, y: 0 });
    const cx = size / 2, cy = size / 2;

    // 강력한 외곽 글로우
    g.fillStyle(0x00ced1, 0.2);
    g.fillCircle(cx, cy, 60);
    g.fillStyle(0x00ced1, 0.1);
    g.fillCircle(cx, cy, 55);

    // 메인 몸체 (진화된 형태)
    g.fillStyle(0x0a2a3a);
    g.fillRoundedRect(cx - 35, cy - 40, 70, 80, 8);

    // 테두리
    g.lineStyle(4, 0x00ced1, 1);
    g.strokeRoundedRect(cx - 35, cy - 40, 70, 80, 8);

    // 어깨 장갑
    g.fillStyle(0x0a2a3a);
    g.fillEllipse(cx - 40, cy - 20, 25, 35);
    g.fillEllipse(cx + 40, cy - 20, 25, 35);
    g.lineStyle(3, 0x00ced1, 1);
    g.strokeEllipse(cx - 40, cy - 20, 25, 35);
    g.strokeEllipse(cx + 40, cy - 20, 25, 35);

    // 중앙 코어 (강화된)
    g.lineStyle(2, 0x00ced1, 0.5);
    g.strokeCircle(cx, cy - 10, 20);
    g.strokeCircle(cx, cy - 10, 15);

    g.fillStyle(0x00ced1, 0.9);
    g.fillCircle(cx, cy - 10, 12);
    g.fillStyle(0x0a0a1f);
    g.fillCircle(cx, cy - 10, 8);
    g.fillStyle(0x00ffff);
    g.fillCircle(cx, cy - 10, 5);

    // 추가 눈 (삼안)
    g.fillStyle(0x00ced1, 0.7);
    g.fillCircle(cx, cy - 30, 6);
    g.fillStyle(0x0a0a1f);
    g.fillCircle(cx, cy - 30, 4);
    g.fillStyle(0x00ffff);
    g.fillCircle(cx, cy - 30, 2);

    // 회로 패턴
    g.lineStyle(1, 0x00ced1, 0.4);
    for (let i = 0; i < 4; i++) {
      const y = cy + 5 + i * 10;
      g.moveTo(cx - 25, y);
      g.lineTo(cx + 25, y);
    }
    g.strokePath();

    // 에너지 노드
    const nodePositions = [
      { x: cx - 25, y: cy - 35 },
      { x: cx + 25, y: cy - 35 },
      { x: cx - 30, y: cy + 10 },
      { x: cx + 30, y: cy + 10 },
    ];
    nodePositions.forEach((pos) => {
      g.fillStyle(0x00ced1, 0.8);
      g.fillCircle(pos.x, pos.y, 5);
    });

    g.generateTexture("boss_gpt5", size, size);
    g.destroy();
  }

  private createGemini3Boss() {
    const size = 144;
    const g = this.make.graphics({ x: 0, y: 0 });
    const cx = size / 2, cy = size / 2;

    // 은하 글로우
    g.fillStyle(0x8a2be2, 0.15);
    g.fillCircle(cx, cy, 68);
    g.fillStyle(0x4b0082, 0.1);
    g.fillCircle(cx, cy, 55);

    // 외곽 링 (토성처럼)
    g.lineStyle(8, 0x8a2be2, 0.3);
    g.strokeEllipse(cx, cy, 130, 40);
    g.lineStyle(3, 0x8a2be2, 0.6);
    g.strokeEllipse(cx, cy, 120, 35);

    // 메인 구체
    g.fillStyle(0x1a0a3a);
    g.fillCircle(cx, cy, 40);
    g.lineStyle(4, 0x8a2be2, 1);
    g.strokeCircle(cx, cy, 40);

    // 내부 패턴 (은하 소용돌이)
    g.lineStyle(2, 0x8a2be2, 0.4);
    for (let i = 0; i < 3; i++) {
      const radius = 15 + i * 8;
      g.beginPath();
      g.arc(cx, cy, radius, 0, Math.PI * 1.5);
      g.strokePath();
    }

    // 듀얼 코어 (진화된 쌍둥이)
    const coreOffset = 12;
    // 코어 1
    g.fillStyle(0x8a2be2, 0.9);
    g.fillCircle(cx - coreOffset, cy, 10);
    g.fillStyle(0xffffff, 0.8);
    g.fillCircle(cx - coreOffset, cy, 5);

    // 코어 2
    g.fillStyle(0x8a2be2, 0.9);
    g.fillCircle(cx + coreOffset, cy, 10);
    g.fillStyle(0xffffff, 0.8);
    g.fillCircle(cx + coreOffset, cy, 5);

    // 코어 연결 에너지
    g.lineStyle(3, 0xffffff, 0.6);
    g.moveTo(cx - coreOffset + 5, cy);
    g.lineTo(cx + coreOffset - 5, cy);
    g.strokePath();

    // 주변 별자리
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const dist = 50 + (i % 3) * 5;
      const sx = cx + Math.cos(angle) * dist;
      const sy = cy + Math.sin(angle) * dist;
      g.fillStyle(0x8a2be2, 0.5 + (i % 2) * 0.3);
      g.fillCircle(sx, sy, 3);
    }

    g.generateTexture("boss_gemini3", size, size);
    g.destroy();
  }

  private createFinalBoss() {
    const size = 160;
    const g = this.make.graphics({ x: 0, y: 0 });
    const cx = size / 2, cy = size / 2;

    // 멀티컬러 글로우
    g.fillStyle(0xff0080, 0.1);
    g.fillCircle(cx - 10, cy, 75);
    g.fillStyle(0x00ffff, 0.1);
    g.fillCircle(cx + 10, cy, 75);
    g.fillStyle(0xffd700, 0.1);
    g.fillCircle(cx, cy - 10, 75);

    // 기하학적 외곽 (팔각형)
    g.fillStyle(0x0a0a1a);
    this.drawPolygon(g, cx, cy, 8, 55, true);
    g.lineStyle(4, 0xff0080, 1);
    this.drawPolygon(g, cx, cy, 8, 55, false);

    // 내부 삼각형 패턴
    g.lineStyle(2, 0x00ffff, 0.6);
    this.drawPolygon(g, cx, cy, 3, 40, false);
    g.lineStyle(2, 0xffd700, 0.6);
    this.drawPolygon(g, cx, cy - 5, 3, 30, false);

    // 중앙 "?" 심볼 영역
    g.fillStyle(0x1a1a2e);
    g.fillCircle(cx, cy, 25);
    g.lineStyle(3, 0xffffff, 0.8);
    g.strokeCircle(cx, cy, 25);

    // "?" 마크
    g.fillStyle(0xff0080, 1);
    g.fillCircle(cx, cy + 8, 4); // 점
    g.lineStyle(6, 0xff0080, 1);
    g.beginPath();
    g.arc(cx, cy - 8, 10, -Math.PI * 0.8, Math.PI * 0.3);
    g.strokePath();
    g.moveTo(cx, cy - 2);
    g.lineTo(cx, cy + 2);
    g.strokePath();

    // 회전하는 외곽 요소들
    const colors = [0xff0080, 0x00ffff, 0xffd700, 0x9400d3];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const ex = cx + Math.cos(angle) * 48;
      const ey = cy + Math.sin(angle) * 48;
      g.fillStyle(colors[i % 4], 0.9);
      g.fillCircle(ex, ey, 6);
      g.fillStyle(0xffffff, 0.5);
      g.fillCircle(ex, ey, 3);
    }

    // 외곽 에너지 라인
    g.lineStyle(1, 0xffffff, 0.3);
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      g.moveTo(cx + Math.cos(angle) * 30, cy + Math.sin(angle) * 30);
      g.lineTo(cx + Math.cos(angle) * 55, cy + Math.sin(angle) * 55);
    }
    g.strokePath();

    g.generateTexture("boss_final", size, size);
    g.destroy();
  }

  // ==========================================
  // 투사체
  // ==========================================
  private createProjectileAssets() {
    // 플레이어 총알 (황금 에너지볼)
    const pg = this.make.graphics({ x: 0, y: 0 });
    pg.fillStyle(0xffd700, 0.5);
    pg.fillCircle(12, 12, 12);
    pg.fillStyle(0xffd700, 0.8);
    pg.fillCircle(12, 12, 8);
    pg.fillStyle(0xffffff, 1);
    pg.fillCircle(12, 12, 4);
    pg.generateTexture("bullet_player", 24, 24);
    pg.destroy();

    // 적 총알 (핑크 에너지볼)
    const eg = this.make.graphics({ x: 0, y: 0 });
    eg.fillStyle(0xff0080, 0.5);
    eg.fillCircle(10, 10, 10);
    eg.fillStyle(0xff0080, 0.8);
    eg.fillCircle(10, 10, 6);
    eg.fillStyle(0xffffff, 1);
    eg.fillCircle(10, 10, 3);
    eg.generateTexture("bullet_enemy", 20, 20);
    eg.destroy();

    // 레이저 빔
    const lg = this.make.graphics({ x: 0, y: 0 });
    lg.fillStyle(0xff0080, 0.3);
    lg.fillRect(0, 0, 64, 20);
    lg.fillStyle(0xff0080, 0.6);
    lg.fillRect(0, 5, 64, 10);
    lg.fillStyle(0xffffff, 0.9);
    lg.fillRect(0, 8, 64, 4);
    lg.generateTexture("laser_beam", 64, 20);
    lg.destroy();
  }

  // ==========================================
  // 이펙트
  // ==========================================
  private createEffectAssets() {
    // 히트 이펙트
    const hg = this.make.graphics({ x: 0, y: 0 });
    hg.fillStyle(0xffffff, 0.8);
    hg.fillCircle(24, 24, 24);
    hg.fillStyle(0xffffff, 0.5);
    hg.fillCircle(24, 24, 16);
    hg.generateTexture("effect_hit", 48, 48);
    hg.destroy();

    // 폭발 이펙트
    const xg = this.make.graphics({ x: 0, y: 0 });
    xg.fillStyle(0xff8800, 0.6);
    xg.fillCircle(32, 32, 32);
    xg.fillStyle(0xffff00, 0.8);
    xg.fillCircle(32, 32, 20);
    xg.fillStyle(0xffffff, 1);
    xg.fillCircle(32, 32, 8);
    xg.generateTexture("effect_explosion", 64, 64);
    xg.destroy();
  }

  // ==========================================
  // 배경
  // ==========================================
  private createBackgroundAsset() {
    const g = this.make.graphics({ x: 0, y: 0 });

    // 그라데이션 배경
    g.fillGradientStyle(0x0a0a0f, 0x0a0a0f, 0x0f1525, 0x16213e);
    g.fillRect(0, 0, 1280, 720);

    // 사이버 그리드
    g.lineStyle(1, 0x00ffff, 0.05);
    for (let i = 0; i < 1280; i += 40) {
      g.moveTo(i, 0);
      g.lineTo(i, 720);
    }
    for (let i = 0; i < 720; i += 40) {
      g.moveTo(0, i);
      g.lineTo(1280, i);
    }
    g.strokePath();

    // 강조 그리드 라인
    g.lineStyle(1, 0x00ffff, 0.1);
    for (let i = 0; i < 1280; i += 200) {
      g.moveTo(i, 0);
      g.lineTo(i, 720);
    }
    for (let i = 0; i < 720; i += 200) {
      g.moveTo(0, i);
      g.lineTo(1280, i);
    }
    g.strokePath();

    // 랜덤 별/파티클
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 1280;
      const y = Math.random() * 720;
      const size = 1 + Math.random() * 2;
      const alpha = 0.2 + Math.random() * 0.3;
      g.fillStyle(0xffffff, alpha);
      g.fillCircle(x, y, size);
    }

    g.generateTexture("bg_game", 1280, 720);
    g.destroy();
  }

  // ==========================================
  // 헬퍼 메서드
  // ==========================================
  private drawHexagon(g: Phaser.GameObjects.Graphics, cx: number, cy: number, r: number, fill: boolean) {
    const points: { x: number; y: number }[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
      points.push({
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
      });
    }

    if (fill) {
      g.fillPoints(points, true);
    } else {
      g.strokePoints(points, true);
    }
  }

  private drawPolygon(g: Phaser.GameObjects.Graphics, cx: number, cy: number, sides: number, r: number, fill: boolean) {
    const points: { x: number; y: number }[] = [];
    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
      points.push({
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
      });
    }

    if (fill) {
      g.fillPoints(points, true);
    } else {
      g.strokePoints(points, true);
    }
  }

  private drawStar(g: Phaser.GameObjects.Graphics, cx: number, cy: number, spikes: number, outerR: number, innerR: number, fill: boolean) {
    const points: { x: number; y: number }[] = [];
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (i * Math.PI) / spikes - Math.PI / 2;
      points.push({
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
      });
    }

    if (fill) {
      g.fillPoints(points, true);
    } else {
      g.strokePoints(points, true);
    }
  }
}
