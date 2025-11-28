"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  glowColor?: "gold" | "cyan" | "purple" | "pink";
}

export default function Card({
  children,
  className,
  glow = false,
  glowColor = "cyan",
}: CardProps) {
  const glowColors = {
    gold: "hover:shadow-[0_0_30px_rgba(255,215,0,0.5)]",
    cyan: "hover:shadow-[0_0_30px_rgba(0,255,255,0.5)]",
    purple: "hover:shadow-[0_0_30px_rgba(148,0,211,0.5)]",
    pink: "hover:shadow-[0_0_30px_rgba(255,0,128,0.5)]",
  };

  return (
    <div
      className={cn(
        "bg-cyber-mid border border-white/10 rounded-lg p-6 transition-all duration-300",
        glow && "card-glow",
        glow && glowColors[glowColor],
        className
      )}
    >
      {children}
    </div>
  );
}
