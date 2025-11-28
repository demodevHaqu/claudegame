import * as Phaser from "phaser";

export class AudioSystem {
  private scene: Phaser.Scene;
  private bgm: Phaser.Sound.BaseSound | null = null;
  private sfxVolume: number = 0.5;
  private bgmVolume: number = 0.3;
  private muted: boolean = false;

  // Web Audio API로 효과음 생성
  private audioContext: AudioContext | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.initAudioContext();
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn("Web Audio API not supported");
    }
  }

  // 프로시저럴 사운드 생성
  private playTone(frequency: number, duration: number, type: OscillatorType = "square", volume: number = 0.3) {
    if (!this.audioContext || this.muted) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(volume * this.sfxVolume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // 노이즈 생성
  private playNoise(duration: number, volume: number = 0.2) {
    if (!this.audioContext || this.muted) return;

    const bufferSize = this.audioContext.sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    noise.buffer = buffer;
    filter.type = "lowpass";
    filter.frequency.value = 1000;

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    gainNode.gain.setValueAtTime(volume * this.sfxVolume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    noise.start();
  }

  // === 효과음 ===

  // 플레이어 공격
  playAttack() {
    this.playTone(800, 0.1, "square", 0.2);
    this.playTone(600, 0.05, "square", 0.15);
  }

  // 스킬 사용
  playSkill() {
    this.playTone(400, 0.1, "sine", 0.3);
    this.playTone(600, 0.15, "sine", 0.25);
    this.playTone(800, 0.2, "sine", 0.2);
  }

  // 빔 발사
  playBeam() {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.playTone(200 + i * 100, 0.1, "sawtooth", 0.2);
      }, i * 30);
    }
  }

  // 쉴드 활성화
  playShield() {
    this.playTone(300, 0.3, "sine", 0.3);
    this.playTone(450, 0.2, "sine", 0.25);
  }

  // 궁극기
  playUltimate() {
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        this.playTone(200 + i * 80, 0.15, "sawtooth", 0.3 - i * 0.02);
      }, i * 50);
    }
    setTimeout(() => this.playNoise(0.3, 0.3), 400);
  }

  // 피격
  playHit() {
    this.playTone(150, 0.1, "square", 0.3);
    this.playNoise(0.05, 0.2);
  }

  // 적 피격
  playEnemyHit() {
    this.playTone(300, 0.08, "square", 0.25);
  }

  // 콤보
  playCombo(combo: number) {
    const baseFreq = 400 + Math.min(combo * 20, 400);
    this.playTone(baseFreq, 0.1, "sine", 0.2);
  }

  // 마일스톤 달성
  playMilestone() {
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 0.2, "sine", 0.3);
      }, i * 100);
    });
  }

  // 보스 등장
  playBossAppear() {
    this.playTone(100, 0.5, "sawtooth", 0.4);
    setTimeout(() => this.playTone(80, 0.5, "sawtooth", 0.35), 200);
    setTimeout(() => this.playTone(60, 0.8, "sawtooth", 0.3), 400);
  }

  // 보스 사망
  playBossDeath() {
    for (let i = 0; i < 15; i++) {
      setTimeout(() => {
        this.playNoise(0.1, 0.3);
        this.playTone(100 + Math.random() * 200, 0.1, "sawtooth", 0.2);
      }, i * 80);
    }
    setTimeout(() => {
      this.playTone(200, 0.5, "sine", 0.4);
      this.playTone(400, 0.4, "sine", 0.3);
      this.playTone(600, 0.3, "sine", 0.2);
    }, 1200);
  }

  // 승리
  playVictory() {
    const melody = [523, 659, 784, 659, 784, 1047];
    melody.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 0.3, "sine", 0.3);
      }, i * 150);
    });
  }

  // 게임오버
  playGameOver() {
    const melody = [400, 350, 300, 250];
    melody.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 0.4, "sine", 0.3);
      }, i * 300);
    });
  }

  // UI 클릭
  playClick() {
    this.playTone(600, 0.05, "sine", 0.2);
  }

  // 메뉴 선택
  playSelect() {
    this.playTone(800, 0.1, "sine", 0.25);
  }

  // === BGM (심플 루프) ===

  playMenuBGM() {
    this.stopBGM();
    // 간단한 앰비언트 루프
    this.playAmbientLoop();
  }

  playBattleBGM() {
    this.stopBGM();
    this.playBattleLoop();
  }

  private ambientLoopId: number | null = null;
  private battleLoopId: number | null = null;

  private playAmbientLoop() {
    if (this.muted) return;

    const playNote = () => {
      if (this.muted) return;
      const notes = [200, 250, 300, 250];
      const note = notes[Math.floor(Math.random() * notes.length)];
      this.playTone(note, 2, "sine", 0.1 * this.bgmVolume);
    };

    playNote();
    this.ambientLoopId = window.setInterval(playNote, 2000);
  }

  private playBattleLoop() {
    if (this.muted) return;

    let beat = 0;
    const playBeat = () => {
      if (this.muted) return;

      // 베이스 드럼
      if (beat % 4 === 0) {
        this.playTone(60, 0.1, "sine", 0.3 * this.bgmVolume);
      }
      // 하이햇
      if (beat % 2 === 0) {
        this.playNoise(0.05, 0.1 * this.bgmVolume);
      }
      // 신스 노트
      if (beat % 8 === 0) {
        const notes = [200, 250, 300, 350];
        this.playTone(notes[Math.floor(beat / 8) % 4], 0.2, "sawtooth", 0.15 * this.bgmVolume);
      }

      beat++;
    };

    this.battleLoopId = window.setInterval(playBeat, 150);
  }

  stopBGM() {
    if (this.ambientLoopId) {
      clearInterval(this.ambientLoopId);
      this.ambientLoopId = null;
    }
    if (this.battleLoopId) {
      clearInterval(this.battleLoopId);
      this.battleLoopId = null;
    }
  }

  // === 볼륨 컨트롤 ===

  setSFXVolume(volume: number) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  setBGMVolume(volume: number) {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) {
      this.stopBGM();
    }
    return this.muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  destroy() {
    this.stopBGM();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}
