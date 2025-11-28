"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AchievementManager,
  Achievement,
  GameStats,
  ACHIEVEMENTS,
} from "../../game/systems/AchievementSystem";

export default function DashboardPage() {
  const [stats, setStats] = useState<GameStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [progress, setProgress] = useState({ unlocked: 0, total: 0, percentage: 0 });
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    const manager = new AchievementManager();
    setStats(manager.getStats());
    setAchievements(manager.getAllAchievements());
    setProgress(manager.getProgress());
  }, []);

  const categories = [
    { key: "all", label: "All", icon: "📋" },
    { key: "combat", label: "Combat", icon: "⚔️" },
    { key: "skill", label: "Skill", icon: "✨" },
    { key: "progress", label: "Progress", icon: "📈" },
    { key: "challenge", label: "Challenge", icon: "🏆" },
  ];

  const filteredAchievements =
    selectedCategory === "all"
      ? achievements
      : achievements.filter((a) => a.category === selectedCategory);

  const isUnlocked = (id: string) => {
    const manager = new AchievementManager();
    return manager.isUnlocked(id);
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  if (!stats) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-cyan-400 font-mono animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* 배경 그리드 */}
      <div
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-sm border-b border-cyan-900/30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="text-2xl">🤖</span>
            <span className="font-mono text-xl text-cyan-400 group-hover:text-cyan-300 transition-colors">
              AI ARENA
            </span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              href="/play"
              className="font-mono text-sm text-white hover:text-yellow-400 transition-colors"
            >
              PLAY
            </Link>
            <Link
              href="/leaderboard"
              className="font-mono text-sm text-gray-400 hover:text-white transition-colors"
            >
              LEADERBOARD
            </Link>
            <Link
              href="/dashboard"
              className="font-mono text-sm text-yellow-400"
            >
              DASHBOARD
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* 타이틀 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-yellow-400 to-purple-500 mb-2">
            PLAYER DASHBOARD
          </h1>
          <p className="text-gray-500 font-mono">Track your progress and achievements</p>
        </div>

        {/* 전체 진행률 */}
        <div className="mb-12 bg-[#1a1a2e] rounded-xl p-6 border border-cyan-900/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-mono text-white">Achievement Progress</h2>
            <span className="text-2xl font-mono text-yellow-400">
              {progress.unlocked}/{progress.total}
            </span>
          </div>
          <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-yellow-400 transition-all duration-1000"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <p className="text-right mt-2 text-gray-500 font-mono text-sm">
            {progress.percentage}% Complete
          </p>
        </div>

        {/* 통계 그리드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <StatCard
            icon="🎯"
            label="Bosses Defeated"
            value={stats.totalKills}
            color="cyan"
          />
          <StatCard
            icon="💀"
            label="Total Deaths"
            value={stats.totalDeaths}
            color="red"
          />
          <StatCard
            icon="🔥"
            label="Max Combo"
            value={stats.maxCombo}
            color="yellow"
          />
          <StatCard
            icon="⚔️"
            label="Damage Dealt"
            value={stats.totalDamageDealt.toLocaleString()}
            color="purple"
          />
          <StatCard
            icon="⏱️"
            label="Play Time"
            value={formatTime(stats.totalPlayTime)}
            color="cyan"
          />
          <StatCard
            icon="✅"
            label="Perfect Bosses"
            value={stats.perfectBosses}
            color="green"
          />
          <StatCard
            icon="⚡"
            label="Fastest Kill"
            value={stats.fastestBossKill > 0 ? formatTime(stats.fastestBossKill) : "N/A"}
            color="yellow"
          />
          <StatCard
            icon="🎖️"
            label="Highest Stage"
            value={stats.highestStage}
            color="purple"
          />
        </div>

        {/* 스킬 사용 통계 */}
        <div className="mb-12 bg-[#1a1a2e] rounded-xl p-6 border border-cyan-900/30">
          <h2 className="text-xl font-mono text-white mb-6">Skill Usage</h2>
          <div className="grid grid-cols-3 gap-6">
            <SkillStat
              name="Artifact Beam"
              icon="✨"
              count={stats.totalBeamsUsed}
              color="cyan"
            />
            <SkillStat
              name="Thinking Shield"
              icon="🛡️"
              count={stats.totalShieldsUsed}
              color="yellow"
            />
            <SkillStat
              name="Ultimate"
              icon="💫"
              count={stats.totalUltimatesUsed}
              color="purple"
            />
          </div>
        </div>

        {/* 보스 진행 상황 */}
        <div className="mb-12 bg-[#1a1a2e] rounded-xl p-6 border border-cyan-900/30">
          <h2 className="text-xl font-mono text-white mb-6">Boss Progress</h2>
          <div className="grid grid-cols-5 gap-4">
            {[
              { name: "GPT-4o", color: "#00FFFF", stage: 1 },
              { name: "Gemini 2.0", color: "#9400D3", stage: 2 },
              { name: "GPT-5", color: "#00CED1", stage: 3 },
              { name: "Gemini 3 Pro", color: "#8A2BE2", stage: 4 },
              { name: "???", color: "#FF0080", stage: 5 },
            ].map((boss) => {
              const defeated = stats.bossesDefeated.includes(boss.name);
              return (
                <div
                  key={boss.name}
                  className={`text-center p-4 rounded-lg border transition-all ${
                    defeated
                      ? "border-green-500/50 bg-green-900/20"
                      : "border-gray-700 bg-gray-800/30 opacity-50"
                  }`}
                >
                  <div
                    className="text-3xl mb-2"
                    style={{ filter: defeated ? "none" : "grayscale(1)" }}
                  >
                    {defeated ? "✅" : "🔒"}
                  </div>
                  <div
                    className="font-mono text-sm"
                    style={{ color: defeated ? boss.color : "#666" }}
                  >
                    {boss.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Stage {boss.stage}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 업적 섹션 */}
        <div className="bg-[#1a1a2e] rounded-xl p-6 border border-cyan-900/30">
          <h2 className="text-xl font-mono text-white mb-6">Achievements</h2>

          {/* 카테고리 필터 */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-4 py-2 rounded-lg font-mono text-sm whitespace-nowrap transition-all ${
                  selectedCategory === cat.key
                    ? "bg-cyan-500/30 text-cyan-400 border border-cyan-500"
                    : "bg-gray-800/50 text-gray-400 border border-gray-700 hover:border-gray-600"
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>

          {/* 업적 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map((achievement) => {
              const unlocked = isUnlocked(achievement.id);
              return (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border transition-all ${
                    unlocked
                      ? "border-yellow-500/50 bg-yellow-900/10"
                      : "border-gray-700 bg-gray-800/30 opacity-60"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`text-3xl ${unlocked ? "" : "grayscale opacity-50"}`}
                    >
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3
                          className={`font-mono font-bold ${
                            unlocked ? "text-white" : "text-gray-500"
                          }`}
                        >
                          {achievement.name}
                        </h3>
                        {unlocked && (
                          <span className="text-green-400 text-sm">✓</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {achievement.description}
                      </p>
                      {achievement.reward && (
                        <p className="text-xs text-yellow-500 mt-2 font-mono">
                          +{achievement.reward} bonus points
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 플레이 버튼 */}
        <div className="mt-12 text-center">
          <Link
            href="/play"
            className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-500 to-yellow-500 text-black font-mono font-bold rounded-lg hover:scale-105 transition-transform"
          >
            CONTINUE PLAYING
          </Link>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="border-t border-gray-800 mt-20 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-500 font-mono text-sm">
          Made with Claude Code Opus 4.5
        </div>
      </footer>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string | number;
  color: "cyan" | "red" | "yellow" | "purple" | "green";
}) {
  const colorClasses = {
    cyan: "text-cyan-400 border-cyan-900/50",
    red: "text-red-400 border-red-900/50",
    yellow: "text-yellow-400 border-yellow-900/50",
    purple: "text-purple-400 border-purple-900/50",
    green: "text-green-400 border-green-900/50",
  };

  return (
    <div
      className={`bg-[#1a1a2e] rounded-xl p-4 border ${colorClasses[color]} flex flex-col items-center`}
    >
      <span className="text-2xl mb-2">{icon}</span>
      <span className={`text-2xl font-mono font-bold ${colorClasses[color].split(" ")[0]}`}>
        {value}
      </span>
      <span className="text-xs text-gray-500 font-mono mt-1">{label}</span>
    </div>
  );
}

function SkillStat({
  name,
  icon,
  count,
  color,
}: {
  name: string;
  icon: string;
  count: number;
  color: "cyan" | "yellow" | "purple";
}) {
  const colorClasses = {
    cyan: "text-cyan-400",
    yellow: "text-yellow-400",
    purple: "text-purple-400",
  };

  return (
    <div className="text-center">
      <div className="text-4xl mb-2">{icon}</div>
      <div className={`text-3xl font-mono font-bold ${colorClasses[color]}`}>
        {count}
      </div>
      <div className="text-sm text-gray-500 font-mono">{name}</div>
    </div>
  );
}
