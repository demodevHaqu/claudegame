"use client";

import { useEffect, useRef, useState } from "react";

const FEATURES = [
  {
    icon: "⚔️",
    title: "5 Epic Boss Battles",
    description:
      "From GPT-4o to the mysterious Final Boss. Each AI competitor has unique attack patterns and phases.",
    color: "#00FFFF",
  },
  {
    icon: "🎮",
    title: "4 Difficulty Modes",
    description:
      "Easy for beginners, Nightmare for veterans. Scale the challenge to your skill level.",
    color: "#FFD700",
  },
  {
    icon: "🏆",
    title: "20+ Achievements",
    description:
      "Unlock achievements, track your stats, and prove your mastery. Become the ultimate AI slayer.",
    color: "#9400D3",
  },
  {
    icon: "⚡",
    title: "Made by Claude",
    description:
      "Entirely built with Claude Code Opus 4.5. This game IS the benchmark.",
    color: "#FF0080",
  },
];

const SKILLS = [
  {
    key: "Z",
    name: "Attack",
    description: "Basic slash attack",
    damage: "10 DMG",
    cooldown: "None",
  },
  {
    key: "X",
    name: "Artifact Beam",
    description: "Powerful beam projectile",
    damage: "25 DMG",
    cooldown: "3s",
  },
  {
    key: "C",
    name: "Thinking Shield",
    description: "2s invincibility",
    damage: "Block",
    cooldown: "8s",
  },
  {
    key: "SPACE",
    name: "Ultimate",
    description: "Screen-wide devastation",
    damage: "50 DMG",
    cooldown: "Gauge",
  },
];

export default function Features() {
  const [visibleFeatures, setVisibleFeatures] = useState<number[]>([]);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 순차적으로 표시
            FEATURES.forEach((_, i) => {
              setTimeout(() => {
                setVisibleFeatures((prev) => [...prev, i]);
              }, i * 150);
            });
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 px-4 relative overflow-hidden">
      {/* 배경 */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#0d0d15] to-[#0a0a0f]" />

      {/* 그리드 패턴 */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 215, 0, 1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 215, 0, 1) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* 섹션 타이틀 */}
        <div className="text-center mb-20">
          <p className="text-gray-500 font-mono text-sm tracking-[0.3em] mb-4">
            WHY PLAY
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            GAME FEATURES
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            A complete boss rush experience packed with features
          </p>
        </div>

        {/* 피쳐 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {FEATURES.map((feature, index) => (
            <div
              key={feature.title}
              className={`relative group transition-all duration-700 ${
                visibleFeatures.includes(index)
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              {/* 글로우 효과 */}
              <div
                className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md"
                style={{ backgroundColor: feature.color }}
              />

              {/* 카드 */}
              <div className="relative bg-[#1a1a2e] rounded-xl p-6 border border-white/10 h-full group-hover:border-transparent transition-colors">
                {/* 아이콘 */}
                <div
                  className="w-14 h-14 rounded-lg flex items-center justify-center text-3xl mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${feature.color}20, transparent)`,
                    border: `1px solid ${feature.color}30`,
                  }}
                >
                  {feature.icon}
                </div>

                {/* 타이틀 */}
                <h3
                  className="font-bold text-lg mb-2 transition-colors"
                  style={{ color: feature.color }}
                >
                  {feature.title}
                </h3>

                {/* 설명 */}
                <p className="text-sm text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 스킬 섹션 */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <p className="text-gray-500 font-mono text-sm tracking-[0.3em] mb-4">
              MASTER YOUR SKILLS
            </p>
            <h3 className="text-3xl font-bold text-white">COMBAT SYSTEM</h3>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {SKILLS.map((skill) => (
              <div
                key={skill.key}
                className="bg-[#1a1a2e] rounded-xl p-5 border border-white/10 hover:border-yellow-500/30 transition-colors"
              >
                {/* 키 */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1.5 bg-yellow-500/20 rounded-lg font-mono font-bold text-yellow-400 text-sm">
                    {skill.key}
                  </span>
                  <span className="font-bold text-white">{skill.name}</span>
                </div>

                {/* 설명 */}
                <p className="text-sm text-gray-500 mb-3">{skill.description}</p>

                {/* 스탯 */}
                <div className="flex gap-4 text-xs font-mono">
                  <span className="text-red-400">{skill.damage}</span>
                  <span className="text-cyan-400">CD: {skill.cooldown}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 컨트롤 힌트 */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-8 px-8 py-4 bg-[#1a1a2e] rounded-xl border border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-mono text-sm">Move:</span>
              <span className="px-2 py-1 bg-white/10 rounded text-white font-mono text-sm">
                Arrow Keys
              </span>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-mono text-sm">Mute:</span>
              <span className="px-2 py-1 bg-white/10 rounded text-white font-mono text-sm">
                M
              </span>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-mono text-sm">Pause:</span>
              <span className="px-2 py-1 bg-white/10 rounded text-white font-mono text-sm">
                ESC
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
