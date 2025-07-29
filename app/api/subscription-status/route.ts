import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  // 1) identify the user
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // 2) query their subscription
  const { data, error } = await supabase
    .from("subscriptions")
    .select("status, current_period_end")
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows
    console.error("DB error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // If no subscription row or status isn’t “active”, we treat them as unpaid
  const active =
    data?.status === "active" && new Date(data.current_period_end) > new Date();

  return NextResponse.json({
    active,
    status: data?.status || "none",
    expires_at: data?.current_period_end || null,
  });
}
