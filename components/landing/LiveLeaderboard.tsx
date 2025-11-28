"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import { formatTime, formatScore } from "@/lib/utils";
import type { GameRecord } from "@/lib/supabase/types";

// 데모 데이터 (Supabase 연결 전)
const DEMO_DATA: GameRecord[] = [
  {
    id: "1",
    player_name: "SpeedRunner",
    total_score: 45230,
    total_time: 272000,
    deaths: 0,
    created_at: new Date().toISOString(),
    stage1_time: 40000,
    stage2_time: 50000,
    stage3_time: 55000,
    stage4_time: 60000,
    stage5_time: 67000,
    no_death_bonus: true,
    speed_run_bonus: true,
  },
  {
    id: "2",
    player_name: "BossSlayer",
    total_score: 42100,
    total_time: 301000,
    deaths: 1,
    created_at: new Date().toISOString(),
    stage1_time: 45000,
    stage2_time: 55000,
    stage3_time: 60000,
    stage4_time: 70000,
    stage5_time: 71000,
    no_death_bonus: false,
    speed_run_bonus: false,
  },
  {
    id: "3",
    player_name: "NoDeathKing",
    total_score: 38500,
    total_time: 345000,
    deaths: 0,
    created_at: new Date().toISOString(),
    stage1_time: 50000,
    stage2_time: 60000,
    stage3_time: 70000,
    stage4_time: 80000,
    stage5_time: 85000,
    no_death_bonus: true,
    speed_run_bonus: false,
  },
  {
    id: "4",
    player_name: "ProGamer",
    total_score: 35200,
    total_time: 372000,
    deaths: 2,
    created_at: new Date().toISOString(),
    stage1_time: 55000,
    stage2_time: 65000,
    stage3_time: 75000,
    stage4_time: 85000,
    stage5_time: 92000,
    no_death_bonus: false,
    speed_run_bonus: false,
  },
  {
    id: "5",
    player_name: "AIHunter",
    total_score: 32800,
    total_time: 390000,
    deaths: 3,
    created_at: new Date().toISOString(),
    stage1_time: 60000,
    stage2_time: 70000,
    stage3_time: 80000,
    stage4_time: 90000,
    stage5_time: 90000,
    no_death_bonus: false,
    speed_run_bonus: false,
  },
];

const RANK_ICONS = ["🥇", "🥈", "🥉"];

export default function LiveLeaderboard() {
  const [records, setRecords] = useState<GameRecord[]>(DEMO_DATA);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    // Supabase가 설정되면 실시간 데이터로 교체
    const fetchRecords = async () => {
      try {
        const response = await fetch("/api/scores?limit=5");
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            setRecords(data);
            setIsLive(true);
          }
        }
      } catch {
        // 데모 데이터 유지
      }
    };

    fetchRecords();
  }, []);

  return (
    <section className="py-20 px-4 bg-cyber-mid/30">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white">LIVE LEADERBOARD</h2>
            {isLive && (
              <span className="flex items-center gap-1 text-xs text-neon-green">
                <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
                LIVE
              </span>
            )}
          </div>
          <Link
            href="/leaderboard"
            className="text-gpt-primary hover:text-gpt-secondary transition-colors"
          >
            전체 보기 →
          </Link>
        </div>

        <Card className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-3 px-4 text-left text-gray-400 font-normal">
                  RANK
                </th>
                <th className="py-3 px-4 text-left text-gray-400 font-normal">
                  PLAYER
                </th>
                <th className="py-3 px-4 text-right text-gray-400 font-normal">
                  SCORE
                </th>
                <th className="py-3 px-4 text-right text-gray-400 font-normal hidden sm:table-cell">
                  TIME
                </th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr
                  key={record.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="py-4 px-4">
                    <span className="text-lg">
                      {index < 3 ? RANK_ICONS[index] : `#${index + 1}`}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-mono font-bold text-white">
                      {record.player_name}
                    </span>
                    {record.no_death_bonus && (
                      <span className="ml-2 text-xs text-neon-green">
                        NO DEATH
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="font-mono text-claude-primary font-bold">
                      {formatScore(record.total_score)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right hidden sm:table-cell">
                    <span className="font-mono text-gray-400">
                      {formatTime(record.total_time)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <p className="text-center text-gray-500 text-sm mt-4">
          {isLive ? "실시간 업데이트" : "데모 데이터"}
        </p>
      </div>
    </section>
  );
}
