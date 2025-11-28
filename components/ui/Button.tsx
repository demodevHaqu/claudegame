"use client";

import { cn } from "@/lib/utils";
import type { ReactNode, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    "cyber-btn font-mono font-bold tracking-wider transition-all duration-300 border-2";

  const variants = {
    primary:
      "bg-claude-primary text-cyber-dark border-claude-secondary hover:bg-claude-secondary hover:shadow-[0_0_20px_rgba(255,215,0,0.5)]",
    secondary:
      "bg-gpt-primary text-cyber-dark border-gpt-secondary hover:bg-gpt-secondary hover:shadow-[0_0_20px_rgba(0,255,255,0.5)]",
    outline:
      "bg-transparent text-white border-white hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
