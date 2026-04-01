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
  scope: z.enum(["today", "alltime"]).optional().default("today"),
});

function dayStartIsoMT() {
  // 00:00 America/Denver
  const day = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Denver",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return `${day}T00:00:00.000-06:00`; // close enough; DB uses timestamptz
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = QuerySchema.safeParse({
    limit: url.searchParams.get("limit") || undefined,
    scope: (url.searchParams.get("scope") as any) || undefined,
  });
  if (!q.success) {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  let sb;
  try {
    sb = supabaseServerAdmin();
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: "missing_env", detail: String(e?.message || e) }, { status: 500 });
  }

  if (q.data.scope === "alltime") {
    const { data, error } = await sb
      .from("paper_balances")
      .select("session_id, points, updated_at")
      .order("points", { ascending: false })
      .order("updated_at", { ascending: true })
      .limit(q.data.limit);

    if (error) return NextResponse.json({ ok: false, error: "db_read_failed", detail: error.message }, { status: 500 });

    const rows = (data || []).map((r, idx) => ({
      rank: idx + 1,
      sessionId: r.session_id,
      points: r.points,
      updatedAt: r.updated_at,
    }));

    return NextResponse.json({ ok: true, scope: "alltime", rows });
  }

  // today: aggregate from submissions since local day start
  const startIso = dayStartIsoMT();
  const { data, error } = await sb
    .from("paper_submissions")
    .select("session_id, points, created_at")
    .gte("created_at", startIso)
    .limit(5000);

  if (error) return NextResponse.json({ ok: false, error: "db_read_failed", detail: error.message }, { status: 500 });

  const map = new Map<string, { points: number; updatedAt: string }>();
  for (const r of data || []) {
    const sid = String((r as any).session_id);
    const pts = Number((r as any).points || 0);
    const ts = String((r as any).created_at || "");
    const prev = map.get(sid);
    if (!prev) map.set(sid, { points: pts, updatedAt: ts });
    else {
      prev.points += pts;
      if (ts > prev.updatedAt) prev.updatedAt = ts;
    }
  }

  const rows = Array.from(map.entries())
    .map(([sessionId, v]) => ({ sessionId, points: v.points, updatedAt: v.updatedAt }))
    .sort((a, b) => b.points - a.points || a.updatedAt.localeCompare(b.updatedAt))
    .slice(0, q.data.limit)
    .map((r, idx) => ({ rank: idx + 1, ...r }));

  return NextResponse.json({ ok: true, scope: "today", rows });
}
