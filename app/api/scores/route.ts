import { NextRequest, NextResponse } from "next/server";
import { createAnonymousClient, createClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    console.log("[POST /api/scores] userId:", userId);

    // 로그인 사용자도 일단 anonymous client로 처리 (RLS 디버깅용)
    // JWT 토큰 문제가 있을 수 있으므로 user_id를 null로 설정
    const supabase = await createAnonymousClient();
    const body = await request.json();
    console.log("[POST /api/scores] body:", body);

    // Validation
    if (!body.playerName || typeof body.totalScore !== "number") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const record = {
      user_id: null, // 임시: anonymous client 사용시 user_id는 null로 설정
      player_name: body.playerName.slice(0, 20), // 최대 20자
      total_score: body.totalScore,
      total_time: body.totalTime || 0,
      deaths: body.deaths || 0,
      stage1_time: body.stage1Time || null,
      stage2_time: body.stage2Time || null,
      stage3_time: body.stage3Time || null,
      stage4_time: body.stage4Time || null,
      stage5_time: body.stage5Time || null,
      no_death_bonus: body.noDeathBonus || false,
      speed_run_bonus: body.speedRunBonus || false,
    };

    const { data, error } = await supabase
      .from("game_records")
      .insert(record)
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to save score to database" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error saving score:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to save score", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createAnonymousClient();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const period = searchParams.get("period") || "all";

    let query = supabase
      .from("game_records")
      .select("*")
      .order("total_score", { ascending: false })
      .limit(limit);

    if (period === "daily") {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      query = query.gte("created_at", yesterday.toISOString());
    } else if (period === "weekly") {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      query = query.gte("created_at", lastWeek.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch scores from database" },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Error fetching scores:", error);
    return NextResponse.json(
      { error: "Failed to fetch scores" },
      { status: 500 }
    );
  }
}
