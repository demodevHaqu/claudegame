"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import { formatTime, formatScore } from "@/lib/utils";
import type { GameRecord } from "@/lib/supabase/types";

const RANK_ICONS = ["🥇", "🥈", "🥉"];

export default function LiveLeaderboard() {
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await fetch("/api/scores?limit=5");
        if (response.ok) {
          const data = await response.json();
          setRecords(data);
          setIsLive(data.length > 0);
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
        setIsLive(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecords();
  }, []);

  if (isLoading) {
    return (
      <section className="py-20 px-4 bg-cyber-mid/30">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center">
            <div className="text-gray-400">로딩 중...</div>
          </div>
        </div>
      </section>
    );
  }

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

          {records.length === 0 && (
            <div className="py-12 text-center text-gray-500">
              아직 기록이 없습니다.
            </div>
          )}
        </Card>

        <p className="text-center text-gray-500 text-sm mt-4">
          {isLive ? "실시간 업데이트" : "데이터를 불러올 수 없습니다"}
        </p>
      </div>
    </section>
  );
}
