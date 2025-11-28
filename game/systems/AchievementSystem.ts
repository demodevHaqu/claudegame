// 업적/도전과제 시스템

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "combat" | "skill" | "progress" | "challenge";
  condition: (stats: GameStats) => boolean;
  reward?: number; // 보너스 점수
  secret?: boolean; // 숨겨진 업적
}

export interface GameStats {
  totalKills: number;
  totalDeaths: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  maxCombo: number;
  totalComboHits: number;
  perfectBosses: number; // 무피격 보스 처치
  fastestBossKill: number; // ms
  totalPlayTime: number; // ms
  bossesDefeated: string[]; // 처치한 보스 목록
  highestStage: number;
  totalUltimatesUsed: number;
  totalShieldsUsed: number;
  totalBeamsUsed: number;
  nightmareCompleted: boolean;
  allBossesDefeated: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  // === Combat 업적 ===
  {
    id: "first_blood",
    name: "First Blood",
    description: "Defeat your first boss",
    icon: "🩸",
    category: "combat",
    condition: (stats) => stats.totalKills >= 1,
    reward: 100,
  },
  {
    id: "combo_starter",
    name: "Combo Starter",
    description: "Achieve a 10-hit combo",
    icon: "🔥",
    category: "combat",
    condition: (stats) => stats.maxCombo >= 10,
    reward: 200,
  },
  {
    id: "combo_master",
    name: "Combo Master",
    description: "Achieve a 50-hit combo",
    icon: "💥",
    category: "combat",
    condition: (stats) => stats.maxCombo >= 50,
    reward: 500,
  },
  {
    id: "combo_legend",
    name: "Combo Legend",
    description: "Achieve a 100-hit combo",
    icon: "⚡",
    category: "combat",
    condition: (stats) => stats.maxCombo >= 100,
    reward: 1000,
  },
  {
    id: "damage_dealer",
    name: "Damage Dealer",
    description: "Deal 10,000 total damage",
    icon: "⚔️",
    category: "combat",
    condition: (stats) => stats.totalDamageDealt >= 10000,
    reward: 300,
  },

  // === Skill 업적 ===
  {
    id: "beam_enthusiast",
    name: "Beam Enthusiast",
    description: "Use Artifact Beam 50 times",
    icon: "✨",
    category: "skill",
    condition: (stats) => stats.totalBeamsUsed >= 50,
    reward: 250,
  },
  {
    id: "defensive_player",
    name: "Defensive Player",
    description: "Use Thinking Shield 30 times",
    icon: "🛡️",
    category: "skill",
    condition: (stats) => stats.totalShieldsUsed >= 30,
    reward: 250,
  },
  {
    id: "ultimate_unleashed",
    name: "Ultimate Unleashed",
    description: "Use Ultimate ability 10 times",
    icon: "💫",
    category: "skill",
    condition: (stats) => stats.totalUltimatesUsed >= 10,
    reward: 300,
  },

  // === Progress 업적 ===
  {
    id: "gpt_slayer",
    name: "GPT Slayer",
    description: "Defeat GPT-4o",
    icon: "🤖",
    category: "progress",
    condition: (stats) => stats.bossesDefeated.includes("GPT-4o"),
    reward: 200,
  },
  {
    id: "gemini_hunter",
    name: "Gemini Hunter",
    description: "Defeat Gemini 2.0",
    icon: "💎",
    category: "progress",
    condition: (stats) => stats.bossesDefeated.includes("Gemini 2.0"),
    reward: 300,
  },
  {
    id: "titan_breaker",
    name: "Titan Breaker",
    description: "Defeat GPT-5",
    icon: "🏆",
    category: "progress",
    condition: (stats) => stats.bossesDefeated.includes("GPT-5"),
    reward: 500,
  },
  {
    id: "galaxy_conqueror",
    name: "Galaxy Conqueror",
    description: "Defeat Gemini 3 Pro",
    icon: "🌌",
    category: "progress",
    condition: (stats) => stats.bossesDefeated.includes("Gemini 3 Pro"),
    reward: 700,
  },
  {
    id: "true_champion",
    name: "True Champion",
    description: "Defeat the Final Boss",
    icon: "👑",
    category: "progress",
    condition: (stats) => stats.allBossesDefeated,
    reward: 2000,
  },

  // === Challenge 업적 ===
  {
    id: "perfect_stage",
    name: "Perfect Stage",
    description: "Defeat a boss without taking damage",
    icon: "✅",
    category: "challenge",
    condition: (stats) => stats.perfectBosses >= 1,
    reward: 500,
  },
  {
    id: "speedrunner",
    name: "Speedrunner",
    description: "Defeat a boss in under 30 seconds",
    icon: "⏱️",
    category: "challenge",
    condition: (stats) => stats.fastestBossKill > 0 && stats.fastestBossKill < 30000,
    reward: 800,
  },
  {
    id: "deathless_run",
    name: "Deathless Run",
    description: "Complete the game without dying",
    icon: "💀",
    category: "challenge",
    condition: (stats) => stats.allBossesDefeated && stats.totalDeaths === 0,
    reward: 3000,
    secret: true,
  },
  {
    id: "nightmare_survivor",
    name: "Nightmare Survivor",
    description: "Complete the game on Nightmare difficulty",
    icon: "😈",
    category: "challenge",
    condition: (stats) => stats.nightmareCompleted,
    reward: 5000,
    secret: true,
  },
  {
    id: "glass_cannon",
    name: "Glass Cannon",
    description: "Deal 5000 damage without using shield",
    icon: "🔮",
    category: "challenge",
    condition: (stats) => stats.totalDamageDealt >= 5000 && stats.totalShieldsUsed === 0,
    reward: 600,
    secret: true,
  },
];

export class AchievementManager {
  private stats: GameStats;
  private unlockedAchievements: Set<string>;
  private onUnlock?: (achievement: Achievement) => void;

  constructor() {
    this.stats = this.loadStats();
    this.unlockedAchievements = this.loadUnlockedAchievements();
  }

  private getDefaultStats(): GameStats {
    return {
      totalKills: 0,
      totalDeaths: 0,
      totalDamageDealt: 0,
      totalDamageTaken: 0,
      maxCombo: 0,
      totalComboHits: 0,
      perfectBosses: 0,
      fastestBossKill: 0,
      totalPlayTime: 0,
      bossesDefeated: [],
      highestStage: 0,
      totalUltimatesUsed: 0,
      totalShieldsUsed: 0,
      totalBeamsUsed: 0,
      nightmareCompleted: false,
      allBossesDefeated: false,
    };
  }

  private loadStats(): GameStats {
    if (typeof window === "undefined") return this.getDefaultStats();

    const saved = localStorage.getItem("ai_arena_stats");
    if (saved) {
      try {
        return { ...this.getDefaultStats(), ...JSON.parse(saved) };
      } catch {
        return this.getDefaultStats();
      }
    }
    return this.getDefaultStats();
  }

  private saveStats() {
    if (typeof window === "undefined") return;
    localStorage.setItem("ai_arena_stats", JSON.stringify(this.stats));
  }

  private loadUnlockedAchievements(): Set<string> {
    if (typeof window === "undefined") return new Set();

    const saved = localStorage.getItem("ai_arena_achievements");
    if (saved) {
      try {
        return new Set(JSON.parse(saved));
      } catch {
        return new Set();
      }
    }
    return new Set();
  }

  private saveUnlockedAchievements() {
    if (typeof window === "undefined") return;
    localStorage.setItem(
      "ai_arena_achievements",
      JSON.stringify([...this.unlockedAchievements])
    );
  }

  setOnUnlock(callback: (achievement: Achievement) => void) {
    this.onUnlock = callback;
  }

  // === 통계 업데이트 메서드 ===

  addKill() {
    this.stats.totalKills++;
    this.checkAchievements();
    this.saveStats();
  }

  addDeath() {
    this.stats.totalDeaths++;
    this.saveStats();
  }

  addDamageDealt(amount: number) {
    this.stats.totalDamageDealt += amount;
    this.checkAchievements();
    this.saveStats();
  }

  addDamageTaken(amount: number) {
    this.stats.totalDamageTaken += amount;
    this.saveStats();
  }

  updateMaxCombo(combo: number) {
    if (combo > this.stats.maxCombo) {
      this.stats.maxCombo = combo;
      this.checkAchievements();
      this.saveStats();
    }
  }

  addComboHits(hits: number) {
    this.stats.totalComboHits += hits;
    this.saveStats();
  }

  addPerfectBoss() {
    this.stats.perfectBosses++;
    this.checkAchievements();
    this.saveStats();
  }

  updateFastestBossKill(time: number) {
    if (this.stats.fastestBossKill === 0 || time < this.stats.fastestBossKill) {
      this.stats.fastestBossKill = time;
      this.checkAchievements();
      this.saveStats();
    }
  }

  addPlayTime(time: number) {
    this.stats.totalPlayTime += time;
    this.saveStats();
  }

  defeatBoss(bossName: string) {
    if (!this.stats.bossesDefeated.includes(bossName)) {
      this.stats.bossesDefeated.push(bossName);
    }

    // 모든 보스 처치 확인
    const allBosses = ["GPT-4o", "Gemini 2.0", "GPT-5", "Gemini 3 Pro", "???"];
    this.stats.allBossesDefeated = allBosses.every(boss =>
      this.stats.bossesDefeated.includes(boss)
    );

    this.checkAchievements();
    this.saveStats();
  }

  updateHighestStage(stage: number) {
    if (stage > this.stats.highestStage) {
      this.stats.highestStage = stage;
      this.saveStats();
    }
  }

  addUltimateUsed() {
    this.stats.totalUltimatesUsed++;
    this.checkAchievements();
    this.saveStats();
  }

  addShieldUsed() {
    this.stats.totalShieldsUsed++;
    this.checkAchievements();
    this.saveStats();
  }

  addBeamUsed() {
    this.stats.totalBeamsUsed++;
    this.checkAchievements();
    this.saveStats();
  }

  completeNightmare() {
    this.stats.nightmareCompleted = true;
    this.checkAchievements();
    this.saveStats();
  }

  // === 업적 체크 ===

  private checkAchievements() {
    for (const achievement of ACHIEVEMENTS) {
      if (this.unlockedAchievements.has(achievement.id)) continue;

      if (achievement.condition(this.stats)) {
        this.unlockAchievement(achievement);
      }
    }
  }

  private unlockAchievement(achievement: Achievement) {
    this.unlockedAchievements.add(achievement.id);
    this.saveUnlockedAchievements();

    if (this.onUnlock) {
      this.onUnlock(achievement);
    }
  }

  // === 조회 메서드 ===

  getStats(): GameStats {
    return { ...this.stats };
  }

  getUnlockedAchievements(): Achievement[] {
    return ACHIEVEMENTS.filter((a) => this.unlockedAchievements.has(a.id));
  }

  getLockedAchievements(): Achievement[] {
    return ACHIEVEMENTS.filter(
      (a) => !this.unlockedAchievements.has(a.id) && !a.secret
    );
  }

  getAllAchievements(): Achievement[] {
    return ACHIEVEMENTS.map((a) => ({
      ...a,
      // 숨겨진 업적은 잠겨있으면 정보 숨김
      name: a.secret && !this.unlockedAchievements.has(a.id) ? "???" : a.name,
      description:
        a.secret && !this.unlockedAchievements.has(a.id)
          ? "Hidden achievement"
          : a.description,
      icon: a.secret && !this.unlockedAchievements.has(a.id) ? "❓" : a.icon,
    }));
  }

  isUnlocked(achievementId: string): boolean {
    return this.unlockedAchievements.has(achievementId);
  }

  getProgress(): { unlocked: number; total: number; percentage: number } {
    const unlocked = this.unlockedAchievements.size;
    const total = ACHIEVEMENTS.length;
    return {
      unlocked,
      total,
      percentage: Math.round((unlocked / total) * 100),
    };
  }

  getTotalBonusScore(): number {
    return this.getUnlockedAchievements().reduce(
      (sum, a) => sum + (a.reward || 0),
      0
    );
  }

  // 통계 리셋 (디버그용)
  resetStats() {
    this.stats = this.getDefaultStats();
    this.unlockedAchievements = new Set();
    this.saveStats();
    this.saveUnlockedAchievements();
  }
}

// 전역 인스턴스
let achievementManager: AchievementManager | null = null;

export function getAchievementManager(): AchievementManager {
  if (!achievementManager) {
    achievementManager = new AchievementManager();
  }
  return achievementManager;
}
