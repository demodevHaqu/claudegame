import { NextRequest, NextResponse } from "next/server";

// Supabase 연결 전 임시 메모리 스토리지
let tempScores: Array<{
  id: string;
  player_name: string;
  total_score: number;
  total_time: number;
  deaths: number;
  created_at: string;
  stage1_time: number | null;
  stage2_time: number | null;
  stage3_time: number | null;
  stage4_time: number | null;
  stage5_time: number | null;
  no_death_bonus: boolean;
  speed_run_bonus: boolean;
}> = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation
    if (!body.playerName || typeof body.totalScore !== "number") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const record = {
      id: crypto.randomUUID(),
      player_name: body.playerName.slice(0, 20), // 최대 20자
      total_score: body.totalScore,
      total_time: body.totalTime || 0,
      deaths: body.deaths || 0,
      created_at: new Date().toISOString(),
      stage1_time: body.stage1Time || null,
      stage2_time: body.stage2Time || null,
      stage3_time: body.stage3Time || null,
      stage4_time: body.stage4Time || null,
      stage5_time: body.stage5Time || null,
      no_death_bonus: body.noDeathBonus || false,
      speed_run_bonus: body.speedRunBonus || false,
    };

    // Supabase 연결 시 아래 코드 사용
    // const { createClient } = await import("@/lib/supabase/server");
    // const supabase = await createClient();
    // const { data, error } = await supabase
    //   .from("game_records")
    //   .insert(record)
    //   .select()
    //   .single();

    // 임시: 메모리에 저장
    tempScores.push(record);
    tempScores.sort((a, b) => b.total_score - a.total_score);
    tempScores = tempScores.slice(0, 100); // 상위 100개만 유지

    return NextResponse.json(record);
  } catch (error) {
    console.error("Error saving score:", error);
    return NextResponse.json(
      { error: "Failed to save score" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const period = searchParams.get("period") || "all";

    // Supabase 연결 시 아래 코드 사용
    // const { createClient } = await import("@/lib/supabase/server");
    // const supabase = await createClient();
    // let query = supabase
    //   .from("game_records")
    //   .select("*")
    //   .order("total_score", { ascending: false })
    //   .limit(limit);

    // if (period === "daily") {
    //   const yesterday = new Date();
    //   yesterday.setDate(yesterday.getDate() - 1);
    //   query = query.gte("created_at", yesterday.toISOString());
    // } else if (period === "weekly") {
    //   const lastWeek = new Date();
    //   lastWeek.setDate(lastWeek.getDate() - 7);
    //   query = query.gte("created_at", lastWeek.toISOString());
    // }

    // const { data, error } = await query;

    // 임시: 메모리에서 조회
    let filtered = [...tempScores];

    if (period === "daily") {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      filtered = filtered.filter(
        (r) => new Date(r.created_at) >= yesterday
      );
    } else if (period === "weekly") {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      filtered = filtered.filter(
        (r) => new Date(r.created_at) >= lastWeek
      );
    }

    return NextResponse.json(filtered.slice(0, limit));
  } catch (error) {
    console.error("Error fetching scores:", error);
    return NextResponse.json(
      { error: "Failed to fetch scores" },
      { status: 500 }
    );
  }
}
