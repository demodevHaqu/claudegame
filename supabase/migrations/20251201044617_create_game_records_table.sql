-- ============================================
-- AI Arena: Code Wars - Game Records Schema
-- Clerk + Supabase Integration (2025 Best Practices)
-- ============================================

-- Helper function to get Clerk user ID from JWT
-- This extracts the 'sub' claim from the JWT token
CREATE OR REPLACE FUNCTION requesting_user_id()
RETURNS TEXT
LANGUAGE SQL STABLE
AS $$
  SELECT NULLIF(
    current_setting('request.jwt.claims', true)::json->>'sub',
    ''
  )::TEXT;
$$;

-- Alternative: Direct JWT access function for flexibility
CREATE OR REPLACE FUNCTION auth_user_id()
RETURNS TEXT
LANGUAGE SQL STABLE
AS $$
  SELECT COALESCE(
    auth.jwt()->>'sub',
    ''
  )::TEXT;
$$;

-- ============================================
-- Main game_records table
-- ============================================
CREATE TABLE IF NOT EXISTS game_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- User identification (Clerk uses string IDs like 'user_2abc123...')
  -- NULL for anonymous/guest players
  user_id TEXT,

  -- Player display name (required)
  player_name TEXT NOT NULL CHECK (char_length(player_name) BETWEEN 1 AND 20),

  -- Score data
  total_score INTEGER NOT NULL CHECK (total_score >= 0),
  total_time INTEGER NOT NULL CHECK (total_time >= 0), -- in milliseconds
  deaths INTEGER DEFAULT 0 CHECK (deaths >= 0),

  -- Stage completion times (milliseconds, NULL if not completed)
  stage1_time INTEGER CHECK (stage1_time IS NULL OR stage1_time >= 0),
  stage2_time INTEGER CHECK (stage2_time IS NULL OR stage2_time >= 0),
  stage3_time INTEGER CHECK (stage3_time IS NULL OR stage3_time >= 0),
  stage4_time INTEGER CHECK (stage4_time IS NULL OR stage4_time >= 0),
  stage5_time INTEGER CHECK (stage5_time IS NULL OR stage5_time >= 0),

  -- Bonus flags
  no_death_bonus BOOLEAN DEFAULT FALSE,
  speed_run_bonus BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes for performance
-- ============================================
-- Primary leaderboard query optimization
CREATE INDEX IF NOT EXISTS idx_game_records_total_score
  ON game_records(total_score DESC);

-- User-specific queries
CREATE INDEX IF NOT EXISTS idx_game_records_user_id
  ON game_records(user_id)
  WHERE user_id IS NOT NULL;

-- Time-based queries (daily/weekly leaderboards)
CREATE INDEX IF NOT EXISTS idx_game_records_created_at
  ON game_records(created_at DESC);

-- Composite index for leaderboard with date filtering
CREATE INDEX IF NOT EXISTS idx_game_records_score_date
  ON game_records(total_score DESC, created_at DESC);

-- ============================================
-- Enable Row Level Security
-- ============================================
ALTER TABLE game_records ENABLE ROW LEVEL SECURITY;

-- Enable REPLICA IDENTITY for real-time subscriptions
ALTER TABLE game_records REPLICA IDENTITY FULL;

-- ============================================
-- RLS Policies for Clerk Integration
-- ============================================

-- 1. Public read access (leaderboard)
-- Anyone can view all game records
CREATE POLICY "Public read access for leaderboard"
  ON game_records
  FOR SELECT
  USING (true);

-- 2. Authenticated users can insert records
-- Logged-in users must set their own user_id
CREATE POLICY "Authenticated users can insert own records"
  ON game_records
  FOR INSERT
  WITH CHECK (
    -- Either anonymous (user_id is NULL and no JWT)
    (user_id IS NULL AND requesting_user_id() = '')
    OR
    -- Or authenticated with matching user_id
    (user_id IS NOT NULL AND user_id = requesting_user_id())
  );

-- 3. Anonymous guests can insert (user_id = NULL)
-- This allows guests to submit scores without logging in
CREATE POLICY "Anonymous guests can insert records"
  ON game_records
  FOR INSERT
  WITH CHECK (
    user_id IS NULL
  );

-- 4. Users can update their own records only
CREATE POLICY "Users can update own records"
  ON game_records
  FOR UPDATE
  USING (
    user_id IS NOT NULL
    AND user_id = requesting_user_id()
  )
  WITH CHECK (
    user_id IS NOT NULL
    AND user_id = requesting_user_id()
  );

-- 5. Users can delete their own records only
CREATE POLICY "Users can delete own records"
  ON game_records
  FOR DELETE
  USING (
    user_id IS NOT NULL
    AND user_id = requesting_user_id()
  );

-- ============================================
-- Auto-update timestamp trigger
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_game_records_updated_at
  BEFORE UPDATE ON game_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Leaderboard Views
-- ============================================

-- All-time leaderboard (top 100)
CREATE OR REPLACE VIEW leaderboard_all_time AS
SELECT
  id,
  player_name,
  total_score,
  total_time,
  deaths,
  no_death_bonus,
  speed_run_bonus,
  created_at,
  user_id,
  RANK() OVER (ORDER BY total_score DESC, total_time ASC) as rank
FROM game_records
ORDER BY total_score DESC, total_time ASC
LIMIT 100;

-- Daily leaderboard (last 24 hours)
CREATE OR REPLACE VIEW leaderboard_daily AS
SELECT
  id,
  player_name,
  total_score,
  total_time,
  deaths,
  no_death_bonus,
  speed_run_bonus,
  created_at,
  user_id,
  RANK() OVER (ORDER BY total_score DESC, total_time ASC) as rank
FROM game_records
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY total_score DESC, total_time ASC
LIMIT 100;

-- Weekly leaderboard (last 7 days)
CREATE OR REPLACE VIEW leaderboard_weekly AS
SELECT
  id,
  player_name,
  total_score,
  total_time,
  deaths,
  no_death_bonus,
  speed_run_bonus,
  created_at,
  user_id,
  RANK() OVER (ORDER BY total_score DESC, total_time ASC) as rank
FROM game_records
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY total_score DESC, total_time ASC
LIMIT 100;

-- ============================================
-- User Statistics Function
-- ============================================
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id TEXT)
RETURNS TABLE (
  total_games BIGINT,
  best_score INTEGER,
  best_time INTEGER,
  total_deaths BIGINT,
  avg_score NUMERIC,
  no_death_runs BIGINT,
  speed_runs BIGINT
)
LANGUAGE SQL STABLE
AS $$
  SELECT
    COUNT(*) as total_games,
    MAX(total_score) as best_score,
    MIN(total_time) as best_time,
    SUM(deaths) as total_deaths,
    ROUND(AVG(total_score), 2) as avg_score,
    COUNT(*) FILTER (WHERE no_death_bonus = true) as no_death_runs,
    COUNT(*) FILTER (WHERE speed_run_bonus = true) as speed_runs
  FROM game_records
  WHERE user_id = p_user_id;
$$;

-- ============================================
-- Get user's rank function
-- ============================================
CREATE OR REPLACE FUNCTION get_user_rank(p_user_id TEXT)
RETURNS TABLE (
  rank BIGINT,
  best_score INTEGER,
  player_name TEXT
)
LANGUAGE SQL STABLE
AS $$
  WITH ranked AS (
    SELECT
      user_id,
      player_name,
      total_score,
      RANK() OVER (ORDER BY total_score DESC) as rank
    FROM game_records
    WHERE user_id IS NOT NULL
  ),
  user_best AS (
    SELECT
      user_id,
      player_name,
      MAX(total_score) as best_score
    FROM game_records
    WHERE user_id = p_user_id
    GROUP BY user_id, player_name
  )
  SELECT
    r.rank,
    ub.best_score::INTEGER,
    ub.player_name
  FROM user_best ub
  JOIN ranked r ON r.user_id = ub.user_id AND r.total_score = ub.best_score
  LIMIT 1;
$$;

-- ============================================
-- Grant permissions for authenticated role
-- ============================================
GRANT SELECT ON leaderboard_all_time TO authenticated, anon;
GRANT SELECT ON leaderboard_daily TO authenticated, anon;
GRANT SELECT ON leaderboard_weekly TO authenticated, anon;
