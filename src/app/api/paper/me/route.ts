import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServerAdmin } from "../../_supabase";

export const runtime = "nodejs";

const QuerySchema = z.object({
  sessionId: z.string().min(8),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = QuerySchema.safeParse({ sessionId: url.searchParams.get("sessionId") || "" });
  if (!q.success) {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const sb = supabaseServerAdmin();
  const { data, error } = await sb
    .from("paper_balances")
    .select("session_id, points")
    .eq("session_id", q.data.sessionId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ ok: false, error: "db_read_failed" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    me: {
      sessionId: q.data.sessionId,
      points: data?.points ?? 0,
    },
  });
}
