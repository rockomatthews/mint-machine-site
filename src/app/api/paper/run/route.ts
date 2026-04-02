import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServerAdmin } from "../../_supabase";

export const runtime = "nodejs";

const QuerySchema = z.object({
  id: z.string().min(8),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = QuerySchema.safeParse({ id: url.searchParams.get("id") || "" });
  if (!q.success) return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });

  let sb;
  try {
    sb = supabaseServerAdmin();
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: "missing_env", detail: String(e?.message || e) }, { status: 500 });
  }

  const { data, error } = await sb
    .from("paper_submissions")
    .select("id, session_id, points, verdict, meta, created_at")
    .eq("id", q.data.id)
    .maybeSingle();

  if (error) return NextResponse.json({ ok: false, error: "db_read_failed", detail: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  return NextResponse.json({
    ok: true,
    run: {
      id: data.id,
      sessionId: data.session_id,
      points: data.points,
      verdict: data.verdict,
      meta: data.meta || {},
      createdAt: data.created_at,
    },
  });
}
