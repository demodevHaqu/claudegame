import Hero from "@/components/landing/Hero";
import BossShowcase from "@/components/landing/BossShowcase";
import LiveLeaderboard from "@/components/landing/LiveLeaderboard";
import Features from "@/components/landing/Features";
import CTASection from "@/components/landing/CTASection";

export default function Home() {
  return (
    <main className="min-h-screen bg-cyber-dark">
      <Hero />
      <BossShowcase />
      <LiveLeaderboard />
      <Features />
      <CTASection />

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            Made with Claude Code Opus 4.5
          </p>
          <div className="flex gap-6">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://claude.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Claude
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
