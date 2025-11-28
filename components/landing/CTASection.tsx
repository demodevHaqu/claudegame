"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";

interface Particle {
  id: number;
  left: number;
  top: number;
  duration: number;
  delay: number;
}

export default function CTASection() {
  const [pulse, setPulse] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // 클라이언트에서만 파티클 생성
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 2 + Math.random() * 3,
      delay: Math.random() * 2,
    }));
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 1000);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-32 px-4 relative overflow-hidden">
      {/* 배경 */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#0f1525] to-[#0a0a0f]" />

      {/* 글로우 효과 */}
      <div
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full transition-all duration-1000 ${
          pulse ? "opacity-30 scale-110" : "opacity-10 scale-100"
        }`}
        style={{
          background:
            "radial-gradient(ellipse, rgba(255, 215, 0, 0.3), transparent 70%)",
        }}
      />

      {/* 파티클 */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-yellow-400 rounded-full opacity-30"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animation: `pulse ${particle.duration}s ease-in-out infinite`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* 타이틀 */}
        <p className="text-gray-500 font-mono text-sm tracking-[0.3em] mb-6">
          THE BATTLE AWAITS
        </p>

        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
          Ready to prove
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-cyan-400 to-purple-500">
            AI supremacy?
          </span>
        </h2>

        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
          Join the arena. Defeat the competition. Show the world what Claude can
          do.
        </p>

        {/* 버튼 그룹 */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link href="/play">
            <Button variant="primary" size="lg" className="relative group">
              <span className="relative z-10 flex items-center gap-2">
                <span>START BATTLE</span>
                <svg
                  className="w-5 h-5 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </span>
            </Button>
          </Link>

          <Link href="/leaderboard">
            <Button variant="secondary" size="lg">
              VIEW RANKINGS
            </Button>
          </Link>
        </div>

        {/* 추가 정보 */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>Free to Play</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            <span>No Download Required</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            <span>5 Minutes of Action</span>
          </div>
        </div>
      </div>

      {/* 스타일 */}
      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.5);
          }
        }
      `}</style>
    </section>
  );
}
