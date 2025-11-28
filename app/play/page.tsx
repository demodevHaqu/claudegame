"use client";

import dynamic from "next/dynamic";

const GameCanvas = dynamic(() => import("@/components/game/GameCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-cyber-dark flex items-center justify-center">
      <div className="text-center">
        <div className="text-claude-primary text-2xl font-mono mb-4">
          LOADING...
        </div>
        <div className="w-64 h-2 bg-cyber-mid rounded-full overflow-hidden">
          <div className="h-full bg-claude-primary animate-pulse" style={{ width: "60%" }} />
        </div>
      </div>
    </div>
  ),
});

export default function PlayPage() {
  return (
    <main className="w-full h-screen bg-cyber-dark overflow-hidden">
      <GameCanvas />
    </main>
  );
}
