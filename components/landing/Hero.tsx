"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import GlitchText from "@/components/ui/GlitchText";
import Button from "@/components/ui/Button";

const BOSS_NAMES = ["GPT-4o", "Gemini 2.0", "GPT-5", "Gemini 3 Pro", "???"];
const TAGLINES = [
  "The benchmark war has begun.",
  "Only one AI will reign supreme.",
  "Fight. Survive. Dominate.",
  "Claude vs. The World.",
];

export default function Hero() {
  const [showTitle, setShowTitle] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showTagline, setShowTagline] = useState(false);
  const [showCTA, setShowCTA] = useState(false);
  const [currentBoss, setCurrentBoss] = useState(0);
  const [currentTagline, setCurrentTagline] = useState(0);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);
  const containerRef = useRef<HTMLElement>(null);

  // 시네마틱 시퀀스
  useEffect(() => {
    const timers = [
      setTimeout(() => setShowTitle(true), 500),
      setTimeout(() => setShowSubtitle(true), 1500),
      setTimeout(() => setShowTagline(true), 2500),
      setTimeout(() => setShowCTA(true), 3500),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  // 보스 이름 로테이션
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBoss((prev) => (prev + 1) % BOSS_NAMES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // 태그라인 로테이션
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTagline((prev) => (prev + 1) % TAGLINES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // 파티클 생성
  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden"
    >
      {/* 배경 그라데이션 */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#0f1525] to-[#0a0a0f]" />

      {/* 그리드 배경 */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* 파티클 효과 */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 rounded-full bg-cyan-400 opacity-30"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animation: `float ${5 + particle.delay}s ease-in-out infinite`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}

      {/* 좌우 글로우 효과 */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[150px]" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-[150px]" />

      {/* 메인 콘텐츠 */}
      <div className="relative z-10 max-w-5xl mx-auto">
        {/* "PRESENTING" 텍스트 */}
        <div
          className={`transition-all duration-1000 ${
            showTitle ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
        >
          <p className="text-gray-500 font-mono text-sm tracking-[0.5em] mb-8">
            PRESENTING
          </p>
        </div>

        {/* ASCII 타이틀 */}
        <div
          className={`transition-all duration-1000 delay-300 ${
            showTitle ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          <pre className="text-yellow-400 text-[8px] sm:text-xs md:text-sm font-mono mb-6 leading-tight hidden sm:block drop-shadow-[0_0_30px_rgba(255,215,0,0.5)]">
            {`  ██████╗██╗      █████╗ ██╗   ██╗██████╗ ███████╗
 ██╔════╝██║     ██╔══██╗██║   ██║██╔══██╗██╔════╝
 ██║     ██║     ███████║██║   ██║██║  ██║█████╗
 ██║     ██║     ██╔══██║██║   ██║██║  ██║██╔══╝
 ╚██████╗███████╗██║  ██║╚██████╔╝██████╔╝███████╗
  ╚═════╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝`}
          </pre>

          {/* 모바일 타이틀 */}
          <h1 className="sm:hidden text-6xl font-bold text-yellow-400 mb-4 drop-shadow-[0_0_30px_rgba(255,215,0,0.5)]">
            CLAUDE
          </h1>
        </div>

        {/* 서브타이틀 */}
        <div
          className={`transition-all duration-1000 ${
            showSubtitle ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <GlitchText
            text="AI ARENA: CODE WARS"
            as="h2"
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-8 tracking-tight"
          />
        </div>

        {/* VS 디스플레이 */}
        <div
          className={`mb-8 transition-all duration-1000 ${
            showSubtitle ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex items-center justify-center gap-4 sm:gap-8">
            <div className="text-right">
              <p className="text-cyan-400 font-mono text-lg sm:text-2xl font-bold">
                CLAUDE
              </p>
              <p className="text-gray-500 text-xs font-mono">Anthropic</p>
            </div>

            <div className="relative">
              <span className="text-4xl sm:text-6xl font-bold text-red-500 animate-pulse">
                VS
              </span>
              <div className="absolute inset-0 bg-red-500/20 blur-xl" />
            </div>

            <div className="text-left">
              <p
                className="font-mono text-lg sm:text-2xl font-bold transition-all duration-500"
                style={{
                  color:
                    currentBoss === 0
                      ? "#00FFFF"
                      : currentBoss === 1
                      ? "#9400D3"
                      : currentBoss === 2
                      ? "#00CED1"
                      : currentBoss === 3
                      ? "#8A2BE2"
                      : "#FF0080",
                }}
              >
                {BOSS_NAMES[currentBoss]}
              </p>
              <p className="text-gray-500 text-xs font-mono">
                {currentBoss < 2 ? "OpenAI" : currentBoss < 4 ? "Google" : "???"}
              </p>
            </div>
          </div>
        </div>

        {/* 태그라인 */}
        <div
          className={`mb-12 h-8 transition-all duration-1000 ${
            showTagline ? "opacity-100" : "opacity-0"
          }`}
        >
          <p className="text-gray-400 font-mono text-lg italic transition-opacity duration-500">
            "{TAGLINES[currentTagline]}"
          </p>
        </div>

        {/* CTA 버튼 */}
        <div
          className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-1000 ${
            showCTA ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <Link href="/play">
            <Button variant="primary" size="lg" className="relative group overflow-hidden">
              <span className="relative z-10 flex items-center gap-2">
                <span className="text-lg">PLAY NOW</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          </Link>

          <Link href="/dashboard">
            <Button variant="secondary" size="lg">
              <span className="flex items-center gap-2">
                <span>DASHBOARD</span>
              </span>
            </Button>
          </Link>
        </div>

        {/* 통계 바 */}
        <div
          className={`mt-16 grid grid-cols-4 gap-8 transition-all duration-1000 delay-500 ${
            showCTA ? "opacity-100" : "opacity-0"
          }`}
        >
          <StatItem value="5" label="BOSSES" />
          <StatItem value="4" label="DIFFICULTIES" />
          <StatItem value="20+" label="ACHIEVEMENTS" />
          <StatItem value="5" label="MIN CONTENT" />
        </div>
      </div>

      {/* 스크롤 인디케이터 */}
      <div
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-1000 ${
          showCTA ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex flex-col items-center gap-2">
          <p className="text-gray-500 font-mono text-xs tracking-wider">SCROLL</p>
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-cyan-400/50 rounded-full animate-bounce" />
          </div>
        </div>
      </div>

      {/* CSS 애니메이션 */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) translateX(0);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-100px) translateX(20px);
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-3xl sm:text-4xl font-bold text-yellow-400 font-mono">
        {value}
      </p>
      <p className="text-xs text-gray-500 font-mono tracking-wider">{label}</p>
    </div>
  );
}
