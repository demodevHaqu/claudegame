# AI ARENA: Code Wars

## 프로젝트 개요

Claude Code Opus 4.5의 성능을 보여주기 위한 보스 러시 액션 게임입니다.
플레이어(Claude)가 GPT, Gemini 등 경쟁 AI들을 보스로 격파하는 사이버펑크 스타일 웹 게임입니다.

**배포 URL 구조:**
- `/` - 랜딩 페이지 (게임 소개 + 실시간 리더보드)
- `/play` - 게임 플레이
- `/leaderboard` - 전체 리더보드

## 기술 스택

- **프레임워크**: Next.js 14 (App Router)
- **게임 엔진**: Phaser 3.70+
- **언어**: TypeScript (strict mode)
- **스타일링**: Tailwind CSS
- **백엔드**: Supabase (리더보드, 실시간 구독)
- **배포**: Vercel
- **디자인**: 사이버펑크, 네온, 글리치 이펙트

## 프로젝트 구조

```
ai-arena-game/
├── .claude/
│   └── CLAUDE.md
├── app/
│   ├── layout.tsx              # 루트 레이아웃
│   ├── page.tsx                # 랜딩 페이지
│   ├── play/
│   │   └── page.tsx            # 게임 페이지
│   ├── leaderboard/
│   │   └── page.tsx            # 리더보드 페이지
│   └── api/
│       └── scores/
│           └── route.ts        # 점수 API
├── components/
│   ├── landing/
│   │   ├── Hero.tsx            # 히어로 섹션
│   │   ├── Features.tsx        # 게임 특징
│   │   ├── BossShowcase.tsx    # 보스 소개
│   │   ├── LiveLeaderboard.tsx # 실시간 순위
│   │   └── CTASection.tsx      # 플레이 버튼
│   ├── game/
│   │   ├── GameCanvas.tsx      # Phaser 게임 래퍼
│   │   └── GameUI.tsx          # 오버레이 UI
│   ├── leaderboard/
│   │   ├── LeaderboardTable.tsx
│   │   └── PlayerStats.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       └── GlitchText.tsx      # 글리치 효과 텍스트
├── game/
│   ├── main.ts                 # Phaser 게임 진입점
│   ├── config.ts               # Phaser 설정
│   ├── scenes/
│   │   ├── BootScene.ts        # 에셋 로딩
│   │   ├── MenuScene.ts        # 인게임 메뉴
│   │   ├── GameScene.ts        # 메인 게임
│   │   ├── BossIntroScene.ts   # 보스 등장 연출
│   │   ├── VictoryScene.ts     # 승리 화면
│   │   └── GameOverScene.ts    # 게임오버
│   ├── entities/
│   │   ├── Player.ts           # Claude 플레이어
│   │   ├── Boss.ts             # 보스 베이스 클래스
│   │   └── bosses/
│   │       ├── GPT4oBoss.ts
│   │       ├── Gemini2Boss.ts
│   │       ├── GPT5Boss.ts
│   │       ├── Gemini3Boss.ts
│   │       └── FinalBoss.ts
│   ├── systems/
│   │   ├── CombatSystem.ts
│   │   ├── ScoreSystem.ts
│   │   └── EffectSystem.ts
│   └── utils/
│       └── assetKeys.ts
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # 브라우저 클라이언트
│   │   ├── server.ts           # 서버 클라이언트
│   │   └── types.ts            # DB 타입
│   └── utils.ts
├── public/
│   └── assets/
│       ├── sprites/
│       ├── effects/
│       ├── backgrounds/
│       ├── ui/
│       └── audio/
├── styles/
│   └── globals.css
├── supabase/
│   └── migrations/
│       └── 001_create_tables.sql
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 페이지별 설계

### 1. 랜딩 페이지 (`/`)

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   ██████╗ ██╗      █████╗ ██╗   ██╗██████╗ ███████╗    │
│  ██╔════╝██║     ██╔══██╗██║   ██║██╔══██╗██╔════╝    │
│  ██║     ██║     ███████║██║   ██║██║  ██║█████╗      │
│  ██║     ██║     ██╔══██║██║   ██║██║  ██║██╔══╝      │
│  ╚██████╗███████╗██║  ██║╚██████╔╝██████╔╝███████╗    │
│   ╚═════╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝    │
│                                                         │
│              AI ARENA: CODE WARS                        │
│                                                         │
│     "Claude가 AI 경쟁자들을 격파합니다"                 │
│                                                         │
│            [ 🎮 게임 시작하기 ]                          │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ⚔️ BOSS LINEUP                                         │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐              │
│  │GPT4o│ │Gem2 │ │GPT5 │ │Gem3 │ │ ??? │              │
│  │ ⭐  │ │ ⭐⭐ │ │⭐⭐⭐│ │⭐⭐⭐⭐│ │⭐⭐⭐⭐⭐│              │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘              │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  🏆 LIVE LEADERBOARD              [전체 보기 →]        │
│  ┌─────────────────────────────────────────────┐       │
│  │ #1  🥇 SpeedRunner    │ 45,230점 │ 4:32    │       │
│  │ #2  🥈 BossSlayer     │ 42,100점 │ 5:01    │       │
│  │ #3  🥉 NoDeathKing    │ 38,500점 │ 5:45    │       │
│  │ #4     ProGamer       │ 35,200점 │ 6:12    │       │
│  │ #5     AIHunter       │ 32,800점 │ 6:30    │       │
│  └─────────────────────────────────────────────┘       │
│                      (실시간 업데이트)                   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ✨ FEATURES                                            │
│  • 5개의 AI 보스와 대결                                 │
│  • 사이버펑크 비주얼 & 이펙트                           │
│  • 글로벌 리더보드 경쟁                                 │
│  • Claude Code Opus 4.5로 제작                         │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Made with Claude Code │ GitHub │ YouTube              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**섹션 구성:**
1. **Hero**: 타이틀 + 글리치 효과 + CTA 버튼
2. **Boss Showcase**: 5개 보스 카드 (호버 시 패턴 미리보기)
3. **Live Leaderboard**: Supabase 실시간 구독으로 Top 5 표시
4. **Features**: 게임 특징 3-4개
5. **Footer**: 링크들

### 2. 게임 페이지 (`/play`)

- Phaser 캔버스가 전체 화면
- Next.js는 래퍼 역할만
- 게임 종료 시 점수 제출 모달

### 3. 리더보드 페이지 (`/leaderboard`)

- 전체 순위 테이블 (페이지네이션)
- 필터: 일간/주간/전체
- 검색: 닉네임으로 검색
- 개인 통계 표시

## 게임 설계

### 플레이어: Claude

- **외형**: 황금 로브의 마법사, 코드 지팡이
- **HP**: 100
- **스킬**:
  - 기본 공격 (Z): 코드 슬래시, 데미지 10
  - 스킬 1 (X): Artifact Beam, 데미지 25, 쿨타임 3초
  - 스킬 2 (C): Thinking Shield, 2초 무적+반사, 쿨타임 8초
  - 궁극기 (Space): Claude Code Execute, 데미지 50, 게이지 필요

### 보스 라인업

| Stage | 보스 | HP | 난이도 | 핵심 패턴 |
|-------|------|-----|--------|----------|
| 1 | GPT-4o "Rookie" | 200 | ⭐ | 돌진, 3연속 펀치 |
| 2 | Gemini 2.0 "Flash" | 350 | ⭐⭐ | 순간이동, 별 소환, 은하 회전 |
| 3 | GPT-5 "Titan" | 500 | ⭐⭐⭐ | 레이저 빔, 분신 생성, AI 폭격 |
| 4 | Gemini 3 Pro "Galaxy Master" | 700 | ⭐⭐⭐⭐ | 멀티모달 공격, 차원 왜곡, 2페이즈 |
| 5 | ??? "The Benchmark" | 1000 | ⭐⭐⭐⭐⭐ | 모든 보스 패턴 + 최종 변신 |

### 점수 시스템

- 보스 처치: 스테이지 × 1000점
- 남은 HP: HP × 10점
- 시간 보너스: 60초 이내 +500, 30초 이내 +1000
- 노데스 클리어: ×1.5 배율
- 전체 5분 이내: ×2.0 배율
- 퍼펙트: ×3.0 배율

## Next.js + Phaser 통합 방법

### GameCanvas 컴포넌트

```typescript
// components/game/GameCanvas.tsx
'use client';

import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { gameConfig } from '@/game/config';

export default function GameCanvas() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
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

  return <div ref={containerRef} className="w-full h-screen" />;
}
```

### 게임 페이지

```typescript
// app/play/page.tsx
import dynamic from 'next/dynamic';

const GameCanvas = dynamic(
  () => import('@/components/game/GameCanvas'),
  { ssr: false }
);

export default function PlayPage() {
  return (
    <main className="w-full h-screen bg-black">
      <GameCanvas />
    </main>
  );
}
```

## Supabase 설정

### 환경 변수

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 데이터베이스 스키마

```sql
-- 게임 기록 테이블
CREATE TABLE game_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  player_name VARCHAR(20) NOT NULL,
  total_time INTEGER NOT NULL,
  total_score INTEGER NOT NULL,
  deaths INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 스테이지별 기록
  stage1_time INTEGER,
  stage2_time INTEGER,
  stage3_time INTEGER,
  stage4_time INTEGER,
  stage5_time INTEGER,
  
  -- 보너스
  no_death_bonus BOOLEAN DEFAULT FALSE,
  speed_run_bonus BOOLEAN DEFAULT FALSE
);

-- 인덱스
CREATE INDEX idx_score ON game_records(total_score DESC);
CREATE INDEX idx_created_at ON game_records(created_at DESC);

-- 실시간 구독을 위한 설정
ALTER TABLE game_records REPLICA IDENTITY FULL;

-- 일간 리더보드 뷰
CREATE VIEW leaderboard_daily AS
SELECT 
  player_name,
  total_score,
  total_time,
  deaths,
  created_at,
  RANK() OVER (ORDER BY total_score DESC) as rank
FROM game_records
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY total_score DESC
LIMIT 100;

-- 전체 리더보드 뷰
CREATE VIEW leaderboard_all_time AS
SELECT 
  player_name,
  total_score,
  total_time,
  deaths,
  created_at,
  RANK() OVER (ORDER BY total_score DESC) as rank
FROM game_records
ORDER BY total_score DESC
LIMIT 100;

-- RLS 정책
ALTER TABLE game_records ENABLE ROW LEVEL SECURITY;

-- 누구나 읽기 가능
CREATE POLICY "Anyone can read records" ON game_records
  FOR SELECT USING (true);

-- 삽입은 인증 없이도 가능 (게임 점수 제출)
CREATE POLICY "Anyone can insert records" ON game_records
  FOR INSERT WITH CHECK (true);
```

### Supabase 클라이언트

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### 실시간 리더보드 훅

```typescript
// hooks/useRealtimeLeaderboard.ts
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { GameRecord } from '@/lib/supabase/types';

export function useRealtimeLeaderboard(limit = 5) {
  const [records, setRecords] = useState<GameRecord[]>([]);
  const supabase = createClient();

  useEffect(() => {
    // 초기 데이터 로드
    const fetchRecords = async () => {
      const { data } = await supabase
        .from('game_records')
        .select('*')
        .order('total_score', { ascending: false })
        .limit(limit);
      
      if (data) setRecords(data);
    };

    fetchRecords();

    // 실시간 구독
    const channel = supabase
      .channel('leaderboard')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'game_records' },
        (payload) => {
          setRecords((prev) => {
            const newRecords = [payload.new as GameRecord, ...prev];
            return newRecords
              .sort((a, b) => b.total_score - a.total_score)
              .slice(0, limit);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [limit]);

  return records;
}
```

## API Routes

### 점수 제출 API

```typescript
// app/api/scores/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from('game_records')
    .insert({
      player_name: body.playerName,
      total_score: body.totalScore,
      total_time: body.totalTime,
      deaths: body.deaths,
      stage1_time: body.stage1Time,
      stage2_time: body.stage2Time,
      stage3_time: body.stage3Time,
      stage4_time: body.stage4Time,
      stage5_time: body.stage5Time,
      no_death_bonus: body.noDeathBonus,
      speed_run_bonus: body.speedRunBonus,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '10');
  const period = searchParams.get('period') || 'all';

  let query = supabase
    .from('game_records')
    .select('*')
    .order('total_score', { ascending: false })
    .limit(limit);

  if (period === 'daily') {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    query = query.gte('created_at', yesterday.toISOString());
  } else if (period === 'weekly') {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    query = query.gte('created_at', lastWeek.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
```

## 코딩 컨벤션

### TypeScript

```typescript
// 클래스명: PascalCase
class GPT5Boss extends Boss { }

// 메서드/변수: camelCase
private currentPattern: BossPattern;
public takeDamage(amount: number): void { }

// 상수: UPPER_SNAKE_CASE
const MAX_HP = 100;
const SKILL_COOLDOWN = 3000;

// 인터페이스: PascalCase (I 접두사 없음)
interface BossConfig {
  hp: number;
  patterns: BossPattern[];
}

// 타입: PascalCase
type BossState = 'idle' | 'attacking' | 'stunned' | 'dead';
```

### React 컴포넌트

```typescript
// 컴포넌트: PascalCase, 함수형
export default function BossShowcase({ bosses }: BossShowcaseProps) {
  return (/* ... */);
}

// 훅: use 접두사
export function useRealtimeLeaderboard() { }

// 이벤트 핸들러: handle 접두사
const handlePlayClick = () => { };
```

### Tailwind 클래스 순서

```
1. 레이아웃 (flex, grid, position)
2. 박스 모델 (w, h, p, m)
3. 타이포그래피 (font, text)
4. 비주얼 (bg, border, shadow)
5. 애니메이션 (transition, animate)
6. 반응형 (sm:, md:, lg:)
```

## 에셋 가이드

### 🎯 메인 에셋: Superpowers Asset Pack (추천!)

**GitHub**: https://github.com/sparklinlabs/superpowers-asset-packs

| 항목 | 내용 |
|------|------|
| **제작자** | Pixel-boy (Sparklin Labs) |
| **라이선스** | CC0 (완전 무료, 상업용 가능, 저작자 표시 불필요) |
| **용량** | 약 85.7MB |
| **포함 내용** | 1000+ 에셋 (2D 스프라이트, 타일셋, 배경, 3D 모델, 사운드) |

#### 포함된 에셋 팩

| 팩 이름 | 우리 게임 활용 |
|---------|---------------|
| `space-shooter` | 보스 이펙트, 레이저, 총알 |
| `ninja-adventure` | 플레이어 캐릭터 베이스 |
| `top-down-shooter` | UI, 이펙트 |
| `layered-backgrounds` | 사이버펑크 배경 |
| `medieval-fantasy` | 추가 캐릭터 옵션 |
| `prehistoric-platformer` | 플랫포머 타일셋 |

#### 에셋 설치 명령어

```bash
# 1. 레포 클론
git clone https://github.com/sparklinlabs/superpowers-asset-packs.git ./superpowers-assets

# 2. 프로젝트에 필요한 에셋 복사
mkdir -p ./public/assets/{sprites,backgrounds,effects,ui,audio}

# 스프라이트
cp -r ./superpowers-assets/space-shooter/* ./public/assets/sprites/
cp -r ./superpowers-assets/ninja-adventure/* ./public/assets/sprites/

# 배경
cp -r ./superpowers-assets/layered-backgrounds/* ./public/assets/backgrounds/

# 3. 임시 폴더 삭제 (선택)
rm -rf ./superpowers-assets
```

#### 게임 요소별 에셋 매핑

| 게임 요소 | 사용할 에셋 | 커스터마이징 |
|----------|------------|-------------|
| **Claude (플레이어)** | `ninja-adventure` 캐릭터 | 황금색으로 리컬러 |
| **GPT-4o 보스** | `space-shooter` 적 캐릭터 | 청록색 계열 |
| **Gemini 보스** | `space-shooter` + 이펙트 | 보라색 계열 |
| **GPT-5 보스** | `ninja-adventure` 보스 | 청록색 + 사이버 이펙트 |
| **최종 보스** | 여러 에셋 조합 | 멀티컬러 |
| **배경** | `layered-backgrounds` | 어둡게 + 네온 오버레이 |
| **UI** | `top-down-shooter` GUI | 사이버펑크 색상 적용 |
| **이펙트** | `space-shooter` 파티클 | 네온 색상 |

### 🆓 추가 무료 에셋 소스

#### GitHub 레포지토리

| 레포 | 설명 | 라이선스 |
|------|------|:--------:|
| [iwenzhou/kenney](https://github.com/iwenzhou/kenney) | Kenney 전체 에셋 팩 (60,000+) | CC0 |
| [GDQuest/game-sprites](https://github.com/GDQuest/game-sprites) | 프로토타입용 게임 에셋 | CC0 |
| [madjin/awesome-cc0](https://github.com/madjin/awesome-cc0) | CC0 에셋 총정리 목록 | CC0 |

#### 무료 에셋 웹사이트

| 사이트 | 설명 |
|--------|------|
| [Kenney.nl](https://kenney.nl/assets) | 60,000+ 무료 에셋 |
| [OpenGameArt.org](https://opengameart.org/content/cc0-resources) | CC0 게임 에셋 모음 |
| [Freesound.org](https://freesound.org/) | 무료 사운드 효과 |

### 에셋 적용 전략

#### Phase 1: 프로토타입 (빠른 개발)
- 플레이어: 단순 도형 (황금색 사각형)
- 보스: 색상으로 구분된 도형
- 이펙트: Phaser 내장 파티클
- 목표: 게임 로직 완성에 집중

#### Phase 2: 에셋 적용 (Superpowers)
- Superpowers 에셋 클론 및 적용
- 캐릭터별 색상 커스터마이징
- 애니메이션 연결

#### Phase 3: 폴리싱
- 사이버펑크 색상 오버레이
- 글리치/네온 이펙트 추가
- 사운드 효과 적용

### 스프라이트 규격

- 플레이어: 64x64px, 8프레임 애니메이션
- 보스: 128x128px ~ 256x256px
- 이펙트: 32x32px ~ 64x64px

### 색상 팔레트 (사이버펑크)

```css
:root {
  /* Claude (Gold) */
  --claude-primary: #FFD700;
  --claude-secondary: #FFA500;
  --claude-accent: #FF8C00;
  
  /* GPT (Cyan) */
  --gpt-primary: #00FFFF;
  --gpt-secondary: #00CED1;
  --gpt-accent: #008B8B;
  
  /* Gemini (Purple) */
  --gemini-primary: #9400D3;
  --gemini-secondary: #8A2BE2;
  --gemini-accent: #4B0082;
  
  /* Background */
  --bg-dark: #0a0a0f;
  --bg-mid: #1a1a2e;
  --bg-light: #16213e;
  
  /* Neon Accents */
  --neon-pink: #ff00ff;
  --neon-green: #00ff00;
  --neon-red: #ff0080;
}
```

### Tailwind 확장

```typescript
// tailwind.config.ts
const config = {
  theme: {
    extend: {
      colors: {
        claude: {
          primary: '#FFD700',
          secondary: '#FFA500',
          accent: '#FF8C00',
        },
        gpt: {
          primary: '#00FFFF',
          secondary: '#00CED1',
          accent: '#008B8B',
        },
        gemini: {
          primary: '#9400D3',
          secondary: '#8A2BE2',
          accent: '#4B0082',
        },
        cyber: {
          dark: '#0a0a0f',
          mid: '#1a1a2e',
          light: '#16213e',
        },
        neon: {
          pink: '#ff00ff',
          green: '#00ff00',
          red: '#ff0080',
        },
      },
      animation: {
        'glitch': 'glitch 1s infinite',
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
    },
  },
};
```

## 자주 사용하는 명령어

### 개발

```bash
npm run dev          # 개발 서버 (localhost:3000)
npm run build        # 프로덕션 빌드
npm run start        # 프로덕션 서버
npm run lint         # ESLint
npm run typecheck    # TypeScript 체크
```

### Supabase

```bash
npx supabase init                    # 초기화
npx supabase start                   # 로컬 Supabase
npx supabase db push                 # 마이그레이션 적용
npx supabase gen types typescript --local > lib/supabase/database.types.ts
```

### 배포

```bash
vercel                # 프리뷰 배포
vercel --prod         # 프로덕션 배포
```

## 주의사항

1. **Phaser SSR 방지**: `dynamic import`로 클라이언트 전용 로드
2. **Supabase 실시간**: 테이블에 `REPLICA IDENTITY FULL` 필수
3. **이미지 최적화**: Next.js Image 컴포넌트 활용
4. **모바일 터치**: 게임에 가상 조이스틱 추가 필요
5. **환경변수**: `NEXT_PUBLIC_` 접두사로 클라이언트 노출

## 개발 우선순위

1. 🔴 **Phase 1**: 프로젝트 초기화 (Next.js + Phaser + Tailwind + Supabase)
2. 🔴 **Phase 2**: 랜딩 페이지 (Hero + Boss Showcase + Live Leaderboard)
3. 🟠 **Phase 3**: 핵심 게임플레이 (Player, Combat, 기본 씬)
4. 🟠 **Phase 4**: 5개 보스 구현
5. 🟡 **Phase 5**: 점수 시스템 + Supabase 연동
6. 🟢 **Phase 6**: 폴리싱 (이펙트, 사운드, 애니메이션)
7. 🔵 **Phase 7**: 배포 및 최적화

## 참고 링크

### 공식 문서
- [Next.js Docs](https://nextjs.org/docs)
- [Phaser 3 Docs](https://photonstorm.github.io/phaser3-docs/)
- [Phaser 3 Examples](https://phaser.io/examples)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vercel Deployment](https://vercel.com/docs)

### 무료 에셋 (메인)
- ⭐ [GitHub: sparklinlabs/superpowers-asset-packs](https://github.com/sparklinlabs/superpowers-asset-packs) - **메인 에셋 (CC0, 1000+)**
- [Superpowers itch.io](https://sparklinlabs.itch.io/superpowers) - 에셋 미리보기

### 무료 에셋 (추가)
- [Kenney.nl Assets](https://kenney.nl/assets) - 60,000+ 무료 에셋
- [GitHub: iwenzhou/kenney](https://github.com/iwenzhou/kenney) - Kenney 전체 팩
- [OpenGameArt CC0](https://opengameart.org/content/cc0-resources) - CC0 에셋
- [Freesound.org](https://freesound.org/) - 무료 사운드
- [GitHub: madjin/awesome-cc0](https://github.com/madjin/awesome-cc0) - CC0 리소스 목록