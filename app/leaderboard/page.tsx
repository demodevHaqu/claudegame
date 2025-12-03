"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { formatTime, formatScore } from "@/lib/utils";
import type { GameRecord } from "@/lib/supabase/types";

const RANK_ICONS = ["🥇", "🥈", "🥉"];

type Period = "all" | "daily" | "weekly";

export default function LeaderboardPage() {
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const hasSubmittedRef = useRef(false);

  // 게임 결과 제출 (localStorage에서)
  useEffect(() => {
    const submitGameResult = async () => {
      if (hasSubmittedRef.current) return;

      const gameResultStr = localStorage.getItem("gameResult");
      if (!gameResultStr) return;

      try {
        const gameResult = JSON.parse(gameResultStr);

        // 5분 이내의 결과만 제출 (오래된 데이터 방지)
        if (Date.now() - gameResult.timestamp > 5 * 60 * 1000) {
          localStorage.removeItem("gameResult");
          return;
        }

        hasSubmittedRef.current = true;
        setSubmitting(true);

        const response = await fetch("/api/scores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(gameResult),
        });

        if (response.ok) {
          console.log("Score submitted successfully");
          localStorage.removeItem("gameResult");
        } else {
          console.error("Failed to submit score:", await response.text());
        }
      } catch (error) {
        console.error("Error submitting score:", error);
      } finally {
        setSubmitting(false);
      }
    };

    submitGameResult();
  }, []);

  // 리더보드 데이터 fetch
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await fetch(`/api/scores?limit=100&period=${period}`);
        if (response.ok) {
          const data = await response.json();
          setRecords(data);
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // 제출 완료 후 또는 즉시 fetch
    const delay = submitting ? 1000 : 0;
    const timer = setTimeout(fetchRecords, delay);
    return () => clearTimeout(timer);
  }, [period, submitting]);

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

        {/* Submission Status */}
        {submitting && (
          <div className="mb-4 p-4 bg-claude-primary/20 border border-claude-primary/50 rounded text-claude-primary text-center">
            점수 제출 중...
          </div>
        )}

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

          {isLoading ? (
            <div className="py-12 text-center text-gray-400">
              로딩 중...
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              {searchTerm ? "검색 결과가 없습니다" : "아직 기록이 없습니다. 첫 번째 기록을 남겨보세요!"}
            </div>
          ) : null}
        </Card>
      </div>
    </main>
  );
}
