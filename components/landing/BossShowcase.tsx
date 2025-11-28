"use client";

import { useState } from "react";

interface BossInfo {
  name: string;
  title: string;
  difficulty: number;
  color: string;
  pattern: string;
  skills: string[];
  stage: number;
}

const BOSSES: BossInfo[] = [
  {
    name: "GPT-4o",
    title: "The Rookie",
    difficulty: 1,
    color: "#00FFFF",
    pattern: "Aggressive Rush",
    skills: ["Charge Attack", "Triple Punch", "Ground Slam"],
    stage: 1,
  },
  {
    name: "Gemini 2.0",
    title: "Flash",
    difficulty: 2,
    color: "#9400D3",
    pattern: "Speed & Illusion",
    skills: ["Teleport", "Star Burst", "After Image"],
    stage: 2,
  },
  {
    name: "GPT-5",
    title: "Titan",
    difficulty: 3,
    color: "#00CED1",
    pattern: "Raw Power",
    skills: ["Laser Beam", "Clone Army", "Mega Stomp"],
    stage: 3,
  },
  {
    name: "Gemini 3 Pro",
    title: "Galaxy Master",
    difficulty: 4,
    color: "#8A2BE2",
    pattern: "Multimodal Assault",
    skills: ["Gravity Well", "Cosmic Rain", "Phase Shift"],
    stage: 4,
  },
  {
    name: "???",
    title: "The Benchmark",
    difficulty: 5,
    color: "#FF0080",
    pattern: "Ultimate Evolution",
    skills: ["All Patterns", "Final Form", "???"],
    stage: 5,
  },
];

export default function BossShowcase() {
  const [selectedBoss, setSelectedBoss] = useState<number | null>(null);
  const [hoveredBoss, setHoveredBoss] = useState<number | null>(null);

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* 배경 효과 */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#12121a] to-[#0a0a0f]" />

      {/* 좌우 그라데이션 */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1/3 pointer-events-none"
        style={{
          background: hoveredBoss !== null
            ? `radial-gradient(ellipse at left, ${BOSSES[hoveredBoss].color}10, transparent 70%)`
            : "transparent",
          transition: "background 0.5s ease",
        }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-1/3 pointer-events-none"
        style={{
          background: hoveredBoss !== null
            ? `radial-gradient(ellipse at right, ${BOSSES[hoveredBoss].color}10, transparent 70%)`
            : "transparent",
          transition: "background 0.5s ease",
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* 섹션 타이틀 */}
        <div className="text-center mb-16">
          <p className="text-gray-500 font-mono text-sm tracking-[0.3em] mb-4">
            MEET YOUR OPPONENTS
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            BOSS LINEUP
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Face off against 5 formidable AI competitors. Each boss brings unique
            attack patterns and challenges.
          </p>
        </div>

        {/* 보스 카드 그리드 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {BOSSES.map((boss, index) => (
            <div
              key={boss.name}
              className="relative group cursor-pointer"
              onMouseEnter={() => setHoveredBoss(index)}
              onMouseLeave={() => setHoveredBoss(null)}
              onClick={() => setSelectedBoss(selectedBoss === index ? null : index)}
            >
              {/* 카드 배경 글로우 */}
              <div
                className="absolute -inset-1 rounded-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 blur-xl"
                style={{ backgroundColor: boss.color }}
              />

              {/* 메인 카드 */}
              <div
                className="relative bg-[#1a1a2e] rounded-xl p-6 border transition-all duration-300 group-hover:scale-[1.02] group-hover:-translate-y-2"
                style={{
                  borderColor:
                    hoveredBoss === index ? boss.color : "rgba(255,255,255,0.1)",
                }}
              >
                {/* 스테이지 뱃지 */}
                <div
                  className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-sm"
                  style={{
                    backgroundColor: boss.color,
                    color: "#0a0a0f",
                    boxShadow: `0 0 20px ${boss.color}50`,
                  }}
                >
                  {boss.stage}
                </div>

                {/* 보스 아이콘 */}
                <div
                  className="w-20 h-20 mx-auto mb-4 rounded-xl flex items-center justify-center relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${boss.color}20, ${boss.color}05)`,
                    border: `1px solid ${boss.color}30`,
                  }}
                >
                  {/* 스캔라인 효과 */}
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      background: `repeating-linear-gradient(
                        0deg,
                        transparent,
                        transparent 2px,
                        ${boss.color}10 2px,
                        ${boss.color}10 4px
                      )`,
                    }}
                  />

                  {/* 아이콘 */}
                  <span
                    className="text-4xl font-bold relative z-10 transition-transform duration-300 group-hover:scale-110"
                    style={{ color: boss.color }}
                  >
                    {boss.name === "???" ? "?" : boss.name.charAt(0)}
                  </span>
                </div>

                {/* 보스 이름 */}
                <h3
                  className="font-bold text-lg mb-1 text-center transition-colors"
                  style={{ color: boss.color }}
                >
                  {boss.name}
                </h3>

                {/* 타이틀 */}
                <p className="text-sm text-gray-400 text-center mb-3 italic">
                  &quot;{boss.title}&quot;
                </p>

                {/* 난이도 별 */}
                <div className="flex justify-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={`text-lg transition-all duration-300 ${
                        i < boss.difficulty
                          ? "opacity-100 scale-100"
                          : "opacity-30 scale-75"
                      }`}
                      style={{
                        color: i < boss.difficulty ? "#FFD700" : "#333",
                        textShadow:
                          i < boss.difficulty ? "0 0 10px #FFD700" : "none",
                      }}
                    >
                      ★
                    </span>
                  ))}
                </div>

                {/* 패턴 */}
                <p className="text-xs text-gray-500 text-center font-mono">
                  {boss.pattern}
                </p>

                {/* 호버 시 스킬 리스트 */}
                <div
                  className={`mt-4 pt-4 border-t border-white/10 transition-all duration-300 ${
                    hoveredBoss === index
                      ? "opacity-100 max-h-40"
                      : "opacity-0 max-h-0 overflow-hidden"
                  }`}
                >
                  <p className="text-xs text-gray-500 mb-2 font-mono">SKILLS:</p>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {boss.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-xs px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: `${boss.color}20`,
                          color: boss.color,
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 하단 설명 */}
        <div className="mt-16 text-center">
          <p className="text-gray-500 font-mono text-sm">
            Defeat all bosses to prove Claude&apos;s supremacy
          </p>
        </div>
      </div>
    </section>
  );
}
