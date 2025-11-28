"use client";

import { useEffect, useRef } from "react";
import * as Phaser from "phaser";
import { gameConfig } from "@/game/config";

export default function GameCanvas() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (gameRef.current) return;

    gameRef.current = new Phaser.Game({
      ...gameConfig,
      parent: containerRef.current!,
    });

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-screen flex items-center justify-center bg-cyber-dark"
    />
  );
}
