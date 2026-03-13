import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServerAdmin } from "../../_supabase";

export const runtime = "nodejs";

const QuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : 25))
    .refine((n) => Number.isFinite(n) && n >= 1 && n <= 200),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = QuerySchema.safeParse({ limit: url.searchParams.get("limit") || undefined });
  if (!q.success) {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  let sb;
  try {
    sb = supabaseServerAdmin();
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: "missing_env", detail: String(e?.message || e) }, { status: 500 });
  }

  const { data, error } = await sb
    .from("paper_balances")
    .select("session_id, points, updated_at")
    .order("points", { ascending: false })
    .order("updated_at", { ascending: true })
    .limit(q.data.limit);

  if (error) {
    return NextResponse.json({ ok: false, error: "db_read_failed", detail: error.message }, { status: 500 });
  }

  const rows = (data || []).map((r, idx) => ({
    rank: idx + 1,
    sessionId: r.session_id,
    points: r.points,
    updatedAt: r.updated_at,
  }));

  return NextResponse.json({ ok: true, rows });
}
