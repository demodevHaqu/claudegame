"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Clerk가 설정되어 있는지 확인
const isClerkEnabled = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

// 조건부 import
let useUser: any = () => ({ user: null });
if (isClerkEnabled) {
  try {
    useUser = require("@clerk/nextjs").useUser;
  } catch {
    // Clerk가 설치되지 않은 경우
  }
}

const GameCanvas = dynamic(() => import("@/components/game/GameCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-cyber-dark flex items-center justify-center">
      <div className="text-center">
        <div className="text-claude-primary text-2xl font-mono mb-4">
          LOADING...
        </div>
        <div className="w-64 h-2 bg-cyber-mid rounded-full overflow-hidden">
          <div className="h-full bg-claude-primary animate-pulse" style={{ width: "60%" }} />
        </div>
      </div>
    </div>
  ),
});

export default function PlayPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clerk가 활성화된 경우에만 useUser 사용
  let user = null;
  if (isClerkEnabled) {
    try {
      const userHook = useUser();
      user = userHook.user;
    } catch {
      // Clerk 컨텍스트가 없는 경우
    }
  }

  useEffect(() => {
    const checkGameResult = async () => {
      const gameResult = localStorage.getItem("gameResult");
      if (!gameResult || isSubmitting) return;

      try {
        setIsSubmitting(true);
        const result = JSON.parse(gameResult);

        // Clerk 사용자 정보와 함께 점수 제출
        const response = await fetch("/api/scores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...result,
            userId: user?.id, // Clerk 사용자 ID 추가
          }),
        });

        if (response.ok) {
          localStorage.removeItem("gameResult");
          console.log("✅ 게임 점수가 성공적으로 저장되었습니다!");
        }
      } catch (error) {
        console.error("❌ 게임 점수 저장 실패:", error);
      } finally {
        setIsSubmitting(false);
      }
    };

    // 주기적으로 게임 결과 확인
    const interval = setInterval(checkGameResult, 1000);

    return () => clearInterval(interval);
  }, [user, isSubmitting]);

  return (
    <main className="w-full h-screen bg-cyber-dark overflow-hidden">
      <GameCanvas />
      {isSubmitting && (
        <div className="fixed top-4 right-4 bg-cyber-mid p-4 rounded-lg border border-neon-green">
          <div className="text-neon-green font-mono text-sm">
            점수 저장 중...
          </div>
        </div>
      )}
    </main>
  );
}
