import * as Phaser from "phaser";
import { Player } from "../entities/Player";
import { Boss } from "../entities/Boss";
import { GPT4oBoss } from "../entities/bosses/GPT4oBoss";
import { Gemini2Boss } from "../entities/bosses/Gemini2Boss";
import { GPT5Boss } from "../entities/bosses/GPT5Boss";
import { Gemini3Boss } from "../entities/bosses/Gemini3Boss";
import { FinalBoss } from "../entities/bosses/FinalBoss";
import { EffectSystem } from "../systems/EffectSystem";
import { ComboSystem } from "../systems/ComboSystem";
import { ScoreSystem } from "../systems/ScoreSystem";
import { AudioSystem } from "../systems/AudioSystem";

export interface GameState {
  stage: number;
  score: number;
  deaths: number;
  startTime: number;
  stageTimes: number[];
  difficulty: "easy" | "normal" | "hard" | "nightmare";
}

export class GameScene extends Phaser.Scene {
  public player!: Player;
  public boss!: Boss;
  public playerBullets!: Phaser.Physics.Arcade.Group;
  public bossBullets!: Phaser.Physics.Arcade.Group;

  // 시스템
  public effectSystem!: EffectSystem;
  public comboSystem!: ComboSystem;
  public scoreSystem!: ScoreSystem;
  public audioSystem!: AudioSystem;

  private stage: number = 1;
  private gameState!: GameState;
  private stageStartTime: number = 0;
  private isPaused: boolean = false;

  // UI
  private playerHealthBar!: Phaser.GameObjects.Graphics;
  private bossHealthBar!: Phaser.GameObjects.Graphics;
  private bossHealthBg!: Phaser.GameObjects.Rectangle;
  private stageText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private skillIcons!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: "GameScene" });
  }

  init(data: { stage: number; gameState?: GameState }) {
    this.stage = data.stage || 1;

    if (data.gameState) {
      this.gameState = data.gameState;
    } else {
      this.gameState = {
        stage: this.stage,
        score: 0,
        deaths: 0,
        startTime: Date.now(),
        stageTimes: [],
        difficulty: "normal",
      };
    }
  }

  create() {
    const { width, height } = this.cameras.main;
    this.cameras.main.fadeIn(500);

    // 시스템 초기화
    this.effectSystem = new EffectSystem(this);
    this.comboSystem = new ComboSystem(this);
    this.scoreSystem = new ScoreSystem(this);
    this.audioSystem = new AudioSystem(this);

    // 이전 점수 복원
    if (this.gameState.score > 0) {
      this.scoreSystem.addScore(this.gameState.score, 1, false);
    }

    // 배경
    this.createBackground();

    // 투사체 그룹
    this.playerBullets = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      maxSize: 50,
      runChildUpdate: true,
    });

    this.bossBullets = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      maxSize: 200,
      runChildUpdate: true,
    });

    // 플레이어 생성
    this.player = new Player(this, width / 4, height / 2);

    // 보스 생성
    this.boss = this.createBoss();

    // 충돌 처리
    this.setupCollisions();

    // UI 생성
    this.createUI();

    // 스테이지 시작 시간
    this.stageStartTime = Date.now();

    // BGM 시작
    this.audioSystem.playBattleBGM();

    // 키보드 이벤트
    this.input.keyboard?.on("keydown-ESC", () => this.togglePause());
    this.input.keyboard?.on("keydown-M", () => {
      const muted = this.audioSystem.toggleMute();
      this.showMessage(muted ? "SOUND OFF" : "SOUND ON");
    });
  }

  private createBackground() {
    const { width, height } = this.cameras.main;

    // 배경 그라데이션
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0a0f, 0x0a0a0f, 0x1a1a2e, 0x1a1a2e);
    bg.fillRect(0, 0, width, height);

    // 그리드 라인
    bg.lineStyle(1, 0x00ffff, 0.05);
    for (let i = 0; i < width; i += 50) {
      bg.moveTo(i, 0);
      bg.lineTo(i, height);
    }
    for (let i = 0; i < height; i += 50) {
      bg.moveTo(0, i);
      bg.lineTo(width, i);
    }
    bg.strokePath();

    // 움직이는 파티클 배경
    const particles = this.add.particles(0, 0, "particle_circle", {
      x: { min: 0, max: width },
      y: { min: 0, max: height },
      scale: { min: 0.1, max: 0.3 },
      alpha: { min: 0.1, max: 0.3 },
      speed: 20,
      lifespan: 10000,
      quantity: 1,
      frequency: 500,
      tint: 0x00ffff,
    });
    particles.setDepth(-1);
  }

  private createBoss(): Boss {
    const { width, height } = this.cameras.main;
    const x = width * 0.75;
    const y = height / 2;

    switch (this.stage) {
      case 1:
        return new GPT4oBoss(this, x, y);
      case 2:
        return new Gemini2Boss(this, x, y);
      case 3:
        return new GPT5Boss(this, x, y);
      case 4:
        return new Gemini3Boss(this, x, y);
      case 5:
        return new FinalBoss(this, x, y);
      default:
        return new GPT4oBoss(this, x, y);
    }
  }

  private setupCollisions() {
    // 플레이어 투사체 -> 보스
    this.physics.add.overlap(
      this.playerBullets,
      this.boss.sprite,
      (_, bullet) => {
        const b = bullet as Phaser.Physics.Arcade.Image;
        const damage = 10;

        this.boss.takeDamage(damage);
        this.effectSystem.hitEffect(b.x, b.y, 0xffd700);
        this.effectSystem.damageNumber(b.x, b.y - 20, damage);
        this.audioSystem.playEnemyHit();

        // 콤보 시스템
        const multiplier = this.comboSystem.addHit();
        this.scoreSystem.updateMaxCombo(this.comboSystem.getCombo());
        this.scoreSystem.addDamageDealt(damage);

        // 콤보에 따른 점수
        const comboScore = this.comboSystem.calculateBonusScore(10);
        this.scoreSystem.addScore(comboScore, 1, false);

        // 콤보 사운드
        this.audioSystem.playCombo(this.comboSystem.getCombo());

        b.destroy();
      }
    );

    // 보스 투사체 -> 플레이어
    this.physics.add.overlap(
      this.bossBullets,
      this.player.sprite,
      (_, bullet) => {
        if (this.player.isInvincible) return;
        const b = bullet as Phaser.Physics.Arcade.Image;
        const damage = this.getDifficultyDamage(10);

        this.player.takeDamage(damage);
        this.effectSystem.hitEffect(b.x, b.y, 0xff0000);
        this.effectSystem.screenShake(150, 0.015);
        this.audioSystem.playHit();
        this.scoreSystem.addDamageTaken(damage);

        b.destroy();
      }
    );

    // 보스 -> 플레이어 충돌
    this.physics.add.overlap(
      this.player.sprite,
      this.boss.sprite,
      () => {
        if (this.player.isInvincible) return;
        const damage = this.getDifficultyDamage(15);
        this.player.takeDamage(damage);
        this.effectSystem.screenShake(200, 0.02);
        this.audioSystem.playHit();
        this.scoreSystem.addDamageTaken(damage);
      }
    );
  }

  private getDifficultyDamage(baseDamage: number): number {
    const multipliers = {
      easy: 0.5,
      normal: 1,
      hard: 1.5,
      nightmare: 2,
    };
    return Math.floor(baseDamage * multipliers[this.gameState.difficulty]);
  }

  private createUI() {
    const { width, height } = this.cameras.main;

    // 플레이어 HP 바
    const playerHpBg = this.add.rectangle(160, 40, 260, 24, 0x333333);
    playerHpBg.setStrokeStyle(2, 0xffd700);
    this.playerHealthBar = this.add.graphics();

    // 플레이어 라벨
    const playerLabel = this.add.text(40, 25, "CLAUDE", {
      fontFamily: "monospace",
      fontSize: "14px",
      color: "#FFD700",
    });

    // HP 텍스트
    this.add.text(40, 48, "HP", {
      fontFamily: "monospace",
      fontSize: "12px",
      color: "#888888",
    });

    // 보스 HP 바
    this.bossHealthBg = this.add.rectangle(width - 160, 40, 260, 24, 0x333333);
    this.bossHealthBg.setStrokeStyle(2, 0x00ffff);
    this.bossHealthBar = this.add.graphics();

    // 보스 라벨
    this.add.text(width - 280, 25, this.boss.name, {
      fontFamily: "monospace",
      fontSize: "14px",
      color: "#00FFFF",
    });

    // 스테이지 표시
    this.stageText = this.add.text(width / 2, 20, `STAGE ${this.stage}`, {
      fontFamily: "monospace",
      fontSize: "18px",
      color: "#FFFFFF",
    }).setOrigin(0.5);

    // 타이머
    this.timerText = this.add.text(width / 2, 120, "0:00", {
      fontFamily: "monospace",
      fontSize: "24px",
      color: "#888888",
    }).setOrigin(0.5);

    // 스킬 아이콘
    this.createSkillIcons();

    // 조작법 힌트
    this.add.text(width / 2, height - 30, "Z:Attack  X:Skill  C:Shield  SPACE:Ultimate  M:Mute  ESC:Pause", {
      fontFamily: "monospace",
      fontSize: "12px",
      color: "#444444",
    }).setOrigin(0.5);
  }

  private createSkillIcons() {
    const { height } = this.cameras.main;
    this.skillIcons = this.add.container(80, height - 80);

    const skills = [
      { key: "Z", name: "Attack", color: 0xffd700 },
      { key: "X", name: "Beam", color: 0xff8c00 },
      { key: "C", name: "Shield", color: 0x00ffff },
      { key: "SPC", name: "Ultimate", color: 0xff00ff },
    ];

    skills.forEach((skill, i) => {
      const x = i * 70;

      // 아이콘 배경
      const bg = this.add.rectangle(x, 0, 50, 50, 0x1a1a2e);
      bg.setStrokeStyle(2, skill.color);

      // 키 표시
      const key = this.add.text(x, -5, skill.key, {
        fontFamily: "monospace",
        fontSize: "16px",
        color: Phaser.Display.Color.IntegerToColor(skill.color).rgba,
      }).setOrigin(0.5);

      // 이름
      const name = this.add.text(x, 35, skill.name, {
        fontFamily: "monospace",
        fontSize: "10px",
        color: "#666666",
      }).setOrigin(0.5);

      this.skillIcons.add([bg, key, name]);
    });
  }

  private togglePause() {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      this.physics.pause();
      this.audioSystem.stopBGM();
      this.showPauseMenu();
    } else {
      this.physics.resume();
      this.audioSystem.playBattleBGM();
      this.hidePauseMenu();
    }
  }

  private pauseMenu?: Phaser.GameObjects.Container;

  private showPauseMenu() {
    const { width, height } = this.cameras.main;

    this.pauseMenu = this.add.container(width / 2, height / 2);
    this.pauseMenu.setDepth(500);

    // 어두운 배경
    const bg = this.add.rectangle(0, 0, width, height, 0x000000, 0.7);

    // PAUSED 텍스트
    const pauseText = this.add.text(0, -50, "PAUSED", {
      fontFamily: "monospace",
      fontSize: "48px",
      color: "#FFFFFF",
    }).setOrigin(0.5);

    // 안내
    const hint = this.add.text(0, 20, "Press ESC to resume", {
      fontFamily: "monospace",
      fontSize: "20px",
      color: "#888888",
    }).setOrigin(0.5);

    // 메뉴로 돌아가기
    const menuBtn = this.add.text(0, 80, "[ Press M for Main Menu ]", {
      fontFamily: "monospace",
      fontSize: "16px",
      color: "#666666",
    }).setOrigin(0.5);

    this.pauseMenu.add([bg, pauseText, hint, menuBtn]);

    // 메인 메뉴 키
    this.input.keyboard?.once("keydown-M", () => {
      if (this.isPaused) {
        this.scene.start("MenuScene");
      }
    });
  }

  private hidePauseMenu() {
    this.pauseMenu?.destroy();
  }

  private showMessage(text: string) {
    const { width, height } = this.cameras.main;
    const msg = this.add.text(width / 2, height / 2, text, {
      fontFamily: "monospace",
      fontSize: "24px",
      color: "#FFFFFF",
      backgroundColor: "#000000",
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setDepth(400);

    this.tweens.add({
      targets: msg,
      alpha: 0,
      y: height / 2 - 30,
      duration: 1000,
      delay: 500,
      onComplete: () => msg.destroy(),
    });
  }

  update(_time: number, delta: number) {
    if (this.isPaused) return;

    this.player.update(delta);
    this.boss.update(delta);
    this.comboSystem.update(delta);

    this.updateUI();

    // 보스 사망 체크
    if (this.boss.isDead && !this.boss.deathHandled) {
      this.boss.deathHandled = true;
      this.onBossDefeated();
    }

    // 플레이어 사망 체크
    if (this.player.isDead) {
      this.onPlayerDeath();
    }
  }

  private updateUI() {
    const { width } = this.cameras.main;

    // 플레이어 체력바
    this.playerHealthBar.clear();
    const playerHealthRatio = this.player.hp / this.player.maxHp;
    const playerHealthColor = playerHealthRatio > 0.5 ? 0xffd700 : playerHealthRatio > 0.25 ? 0xff8800 : 0xff0000;
    this.playerHealthBar.fillStyle(playerHealthColor);
    this.playerHealthBar.fillRect(35, 30, 250 * playerHealthRatio, 20);

    // 보스 체력바
    this.bossHealthBar.clear();
    const bossHealthRatio = this.boss.hp / this.boss.maxHp;
    const bossHealthColor = bossHealthRatio > 0.5 ? 0x00ffff : bossHealthRatio > 0.25 ? 0x00ff00 : 0xff0000;
    this.bossHealthBar.fillStyle(bossHealthColor);
    this.bossHealthBar.fillRect(width - 285, 30, 250 * bossHealthRatio, 20);

    // 타이머
    const elapsed = Date.now() - this.stageStartTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    this.timerText.setText(`${minutes}:${seconds.toString().padStart(2, "0")}`);

    // 시간에 따른 색상
    if (elapsed > 60000) this.timerText.setColor("#ff8800");
    if (elapsed > 90000) this.timerText.setColor("#ff0000");
  }

  private onBossDefeated() {
    const stageTime = Date.now() - this.stageStartTime;
    this.gameState.stageTimes.push(stageTime);

    // 이펙트
    this.effectSystem.bossDeathEffect(this.boss.sprite.x, this.boss.sprite.y);
    this.audioSystem.playBossDeath();
    this.effectSystem.slowMotion(1000, 0.5);

    // 점수 계산
    this.scoreSystem.addBossKillScore(this.stage, this.player.hp, this.player.maxHp);
    this.scoreSystem.addStageClearBonus(stageTime, this.gameState.deaths);
    this.scoreSystem.saveStageResult(this.stage, stageTime, this.scoreSystem.getMaxCombo() > 0);

    // 게임 상태 업데이트
    this.gameState.score = this.scoreSystem.getScore();

    // 다음 스테이지 또는 승리
    this.time.delayedCall(2000, () => {
      this.audioSystem.stopBGM();

      if (this.stage >= 5) {
        this.scene.start("VictoryScene", { gameState: this.gameState });
      } else {
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.time.delayedCall(500, () => {
          this.scene.start("BossIntroScene", {
            stage: this.stage + 1,
            gameState: this.gameState,
          });
        });
      }
    });
  }

  private onPlayerDeath() {
    this.gameState.deaths++;
    this.audioSystem.stopBGM();
    this.audioSystem.playGameOver();

    this.scene.start("GameOverScene", {
      gameState: this.gameState,
      stage: this.stage,
    });
  }

  addScore(points: number) {
    this.scoreSystem.addScore(points, this.comboSystem.getMultiplier());
  }

  // Player에서 호출하는 이펙트 메서드들
  playAttackSound() {
    this.audioSystem.playAttack();
  }

  playSkillSound() {
    this.audioSystem.playSkill();
  }

  playBeamEffect(startX: number, startY: number, endX: number) {
    this.effectSystem.beamEffect(startX, startY, endX, 0xffd700);
    this.audioSystem.playBeam();
  }

  playShieldEffect(x: number, y: number, duration: number) {
    this.effectSystem.shieldEffect(x, y, duration);
    this.audioSystem.playShield();
  }

  playUltimateEffect(x: number, y: number) {
    this.effectSystem.ultimateEffect(x, y);
    this.audioSystem.playUltimate();
  }
}
