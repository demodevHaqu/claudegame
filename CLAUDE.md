# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Arena: Code Wars - A boss rush action game where Claude battles AI competitors (GPT, Gemini).
Built with Next.js 14 + Phaser 3 + TypeScript + Tailwind CSS.

## Commands

```bash
npm run dev          # Development server (localhost:3000)
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint check
```

## Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Game Engine**: Phaser 3.90+ (client-side only)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **Backend**: Supabase (leaderboard, optional)
- **Deployment**: Vercel

### Project Structure

```
app/                    # Next.js App Router pages
├── page.tsx           # Landing page
├── play/page.tsx      # Game page (client component)
├── leaderboard/       # Leaderboard page
└── api/scores/        # Score API routes

components/
├── landing/           # Landing page sections
├── game/              # Game wrapper components
├── leaderboard/       # Leaderboard components
└── ui/                # Reusable UI components

game/                   # Phaser game code
├── config.ts          # Phaser configuration
├── scenes/            # Game scenes (Boot, Menu, Game, etc.)
├── entities/          # Player and Boss classes
│   ├── Player.ts
│   ├── Boss.ts
│   └── bosses/        # Individual boss implementations
├── systems/           # Game systems
└── utils/             # Asset keys and utilities

lib/
├── supabase/          # Supabase client setup
└── utils.ts           # Utility functions
```

### Key Patterns

**Phaser Integration**:
- Use `dynamic import` with `ssr: false` for game components
- Import Phaser as `import * as Phaser from "phaser"`
- Game page must be a client component

**Boss System**:
- All bosses extend `Boss` base class
- Each boss has unique patterns defined in `setupPatterns()`
- Patterns execute on cooldown timers

**Score System**:
- Memory-based storage (works without Supabase)
- API routes handle score submission and retrieval
- Supabase integration ready (commented code in routes)

## Coding Conventions

### TypeScript
- Class names: PascalCase
- Methods/variables: camelCase
- Constants: UPPER_SNAKE_CASE
- Interfaces: PascalCase (no `I` prefix)

### Tailwind Classes Order
1. Layout (flex, grid, position)
2. Box model (w, h, p, m)
3. Typography (font, text)
4. Visual (bg, border, shadow)
5. Animation (transition, animate)
6. Responsive (sm:, md:, lg:)

### Custom CSS Classes
- `.glitch` - Glitch text effect
- `.neon-pulse` - Pulsing neon glow
- `.cyber-btn` - Cyberpunk button style
- `.card-glow` - Hover glow effect
- `.text-neon-gold/cyan/purple` - Neon text shadows

## Color Palette

```css
--claude-primary: #FFD700   /* Gold */
--gpt-primary: #00FFFF      /* Cyan */
--gemini-primary: #9400D3   /* Purple */
--neon-pink: #ff00ff
--cyber-dark: #0a0a0f
--cyber-mid: #1a1a2e
```

## Game Controls

- Arrow Keys: Move
- Z: Basic Attack (10 dmg)
- X: Artifact Beam (25 dmg, 3s cooldown)
- C: Thinking Shield (2s invincibility, 8s cooldown)
- Space: Ultimate (50 dmg, requires gauge)

## Important Notes

1. **Phaser SSR**: Always use dynamic import for Phaser components
2. **Game page**: Must have `"use client"` directive
3. **Supabase**: Optional - game works with in-memory storage
4. **Assets**: Placeholder graphics generated at runtime in BootScene
