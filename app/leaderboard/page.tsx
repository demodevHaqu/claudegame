"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { formatTime, formatScore } from "@/lib/utils";
import type { GameRecord } from "@/lib/supabase/types";

// 데모 데이터
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

type Period = "all" | "daily" | "weekly";

export default function LeaderboardPage() {
  const [records, setRecords] = useState<GameRecord[]>(DEMO_DATA);
  const [period, setPeriod] = useState<Period>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await fetch(`/api/scores?limit=100&period=${period}`);
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            setRecords(data);
          }
        }
      } catch {
        // 데모 데이터 유지
      }
    };

    fetchRecords();
  }, [period]);

  const filteredRecords = records.filter((record) =>
    record.player_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-cyber-dark py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link
              href="/"
              className="text-gray-400 hover:text-white transition-colors mb-2 inline-block"
            >
              ← Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-white">LEADERBOARD</h1>
          </div>
          <Link href="/play">
            <Button variant="primary">Play Now</Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Period Filter */}
          <div className="flex gap-2">
            {(["all", "weekly", "daily"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded font-mono text-sm transition-colors ${
                  period === p
                    ? "bg-claude-primary text-cyber-dark"
                    : "bg-cyber-mid text-gray-400 hover:text-white"
                }`}
              >
                {p === "all" ? "전체" : p === "weekly" ? "주간" : "일간"}
              </button>
            ))}
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search player..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 bg-cyber-mid border border-white/10 rounded text-white placeholder-gray-500 focus:outline-none focus:border-gpt-primary"
          />
        </div>

        {/* Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-cyber-dark/50">
                  <th className="py-4 px-4 text-left text-gray-400 font-normal">
                    RANK
                  </th>
                  <th className="py-4 px-4 text-left text-gray-400 font-normal">
                    PLAYER
                  </th>
                  <th className="py-4 px-4 text-right text-gray-400 font-normal">
                    SCORE
                  </th>
                  <th className="py-4 px-4 text-right text-gray-400 font-normal hidden sm:table-cell">
                    TIME
                  </th>
                  <th className="py-4 px-4 text-center text-gray-400 font-normal hidden md:table-cell">
                    DEATHS
                  </th>
                  <th className="py-4 px-4 text-center text-gray-400 font-normal hidden lg:table-cell">
                    BONUS
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record, index) => (
                  <tr
                    key={record.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <span
                        className={`text-lg ${
                          index < 3 ? "font-bold" : "text-gray-400"
                        }`}
                      >
                        {index < 3 ? RANK_ICONS[index] : `#${index + 1}`}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-mono font-bold text-white">
                        {record.player_name}
                      </span>
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
                    <td className="py-4 px-4 text-center hidden md:table-cell">
                      <span
                        className={`font-mono ${
                          record.deaths === 0 ? "text-neon-green" : "text-gray-400"
                        }`}
                      >
                        {record.deaths}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center hidden lg:table-cell">
                      <div className="flex justify-center gap-2">
                        {record.no_death_bonus && (
                          <span className="text-xs bg-neon-green/20 text-neon-green px-2 py-1 rounded">
                            NO DEATH
                          </span>
                        )}
                        {record.speed_run_bonus && (
                          <span className="text-xs bg-claude-primary/20 text-claude-primary px-2 py-1 rounded">
                            SPEED RUN
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRecords.length === 0 && (
            <div className="py-12 text-center text-gray-400">
              No records found
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
