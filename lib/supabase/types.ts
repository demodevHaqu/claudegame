export interface GameRecord {
  id: string;
  user_id?: string; // Clerk user ID
  player_name: string;
  total_time: number;
  total_score: number;
  deaths: number;
  created_at: string;
  updated_at?: string;
  stage1_time: number | null;
  stage2_time: number | null;
  stage3_time: number | null;
  stage4_time: number | null;
  stage5_time: number | null;
  no_death_bonus: boolean;
  speed_run_bonus: boolean;
}

export interface LeaderboardEntry extends GameRecord {
  rank: number;
}

export type ScoreSubmission = {
  userId?: string; // Clerk user ID
  playerName: string;
  totalScore: number;
  totalTime: number;
  deaths: number;
  stage1Time?: number;
  stage2Time?: number;
  stage3Time?: number;
  stage4Time?: number;
  stage5Time?: number;
  noDeathBonus?: boolean;
  speedRunBonus?: boolean;
};
