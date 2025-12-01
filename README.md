# 🤖 AI ARENA: Code Wars

Claude가 AI 경쟁자들을 격파하는 보스 러시 액션 게임

## 🚀 기능

- 🎮 **5개 보스 전투**: GPT-4o, Gemini 2.0, GPT-5, Gemini 3 Pro, ???와의 전투
- 🏆 **실시간 리더보드**: Supabase를 통한 실시간 점수 순위
- 👤 **사용자 인증**: Clerk를 통한 사용자 관리
- 📊 **게임 통계**: 상세한 플레이 데이터 및 업적 시스템
- 🎨 **사이버펑크 UI**: 모던한 디자인과 부드러운 애니메이션

## 🛠 기술 스택

- **Frontend**: Next.js 16, React 19, TypeScript
- **Backend**: Supabase (Database & Auth)
- **Auth**: Clerk (사용자 인증)
- **Game Engine**: Phaser 3
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## 📋 사전 준비

### 1. Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. SQL Editor에서 다음 쿼리 실행:

```sql
-- 게임 기록 테이블 생성
CREATE TABLE IF NOT EXISTS game_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  total_score INTEGER NOT NULL,
  total_time INTEGER NOT NULL,
  deaths INTEGER DEFAULT 0,
  stage1_time INTEGER,
  stage2_time INTEGER,
  stage3_time INTEGER,
  stage4_time INTEGER,
  stage5_time INTEGER,
  no_death_bonus BOOLEAN DEFAULT false,
  speed_run_bonus BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_game_records_user_id ON game_records(user_id);
CREATE INDEX IF NOT EXISTS idx_game_records_total_score ON game_records(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_game_records_created_at ON game_records(created_at DESC);

-- Row Level Security 활성화
ALTER TABLE game_records ENABLE ROW LEVEL SECURITY;

-- RLS 정책 설정
CREATE POLICY "Anyone can view game records" ON game_records FOR SELECT USING (true);
CREATE POLICY "Users can insert their own records" ON game_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own records" ON game_records FOR UPDATE USING (auth.uid() = user_id);

-- 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_game_records_updated_at
  BEFORE UPDATE ON game_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

3. Settings > API에서 URL과 anon key 복사

### 2. Clerk 설정

1. [Clerk](https://clerk.com)에서 새 애플리케이션 생성
2. Quickstart에서 Next.js 선택
3. API Keys에서 publishable key와 secret key 복사

## ⚙️ 환경 변수 설정

프로젝트 루트에 `.env.local` 파일 생성:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here

# Clerk URLs (필요한 경우 설정)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🚀 로컬 개발

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 열기

## 📦 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## 🎯 게임 플레이

1. **메인 페이지**: 게임 소개 및 리더보드 확인
2. **플레이**: 게임 시작 (로그인 권장)
3. **대시보드**: 개인 통계 및 업적 확인
4. **리더보드**: 전역 순위표 확인

## 🔧 프로젝트 구조

```
├── app/                    # Next.js App Router
│   ├── api/scores/        # 점수 API
│   ├── dashboard/         # 플레이어 대시보드
│   ├── leaderboard/       # 리더보드
│   ├── play/             # 게임 페이지
│   └── layout.tsx        # 루트 레이아웃
├── components/            # React 컴포넌트
│   ├── game/             # 게임 관련 컴포넌트
│   ├── landing/          # 랜딩 페이지 컴포넌트
│   └── ui/               # UI 컴포넌트
├── game/                 # Phaser 게임 로직
│   ├── entities/         # 게임 개체 (플레이어, 보스)
│   ├── scenes/          # 게임 씬
│   └── systems/         # 게임 시스템
├── lib/                  # 유틸리티 및 설정
│   ├── supabase/        # Supabase 클라이언트
│   └── utils.ts         # 유틸리티 함수
└── hooks/               # React 훅
```

## 📚 개발 가이드라인

프로젝트는 다음과 같은 원칙을 따릅니다:

- **SOLID + 선언적 프로그래밍**
- **불필요한 추상화 금지**
- **Spacing-First 정책**: padding + gap 우선 사용
- **Tailwind CSS 우선**: 인라인 스타일 금지
- **TypeScript 엄격 모드**

자세한 가이드라인은 `.cursor/rules/my-custom-rule.mdc` 참고

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
