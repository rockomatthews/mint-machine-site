import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServerAdmin } from "../../_supabase";

export const runtime = "nodejs";

const BodySchema = z
  .object({
    sessionId: z.string().min(8),
    mode: z.enum(["combo_tap"]).optional(),
  })
  .strict();

function newId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "")}`;
}

function dayMT() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Denver",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => ({}));
  const body = BodySchema.safeParse(json);
  if (!body.success) {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const challengeId = newId("ch");
  const now = Date.now();
  const expiresAt = new Date(now + 1000 * 60 * 10).toISOString();

  const seed = crypto.randomUUID();

  const sb = supabaseServerAdmin();

  // Best-effort daily cap. (Quiet protection; doesn’t bother the user)
  const today = dayMT();
  const maxPerDay = 400;

  const { data: st, error: stErr } = await sb
    .from("paper_session_state")
    .select("session_id, day, challenges_issued")
    .eq("session_id", body.data.sessionId)
    .maybeSingle();

  if (!stErr && st) {
    const day = String((st as any).day || "");
    const issued = Number((st as any).challenges_issued || 0);
    const used = day === today ? issued : 0;
    if (used >= maxPerDay) {
      return NextResponse.json({ ok: false, error: "daily_cap" }, { status: 429 });
    }
  }

  try {
    await sb.from("paper_session_state").upsert(
      {
        session_id: body.data.sessionId,
        day: today,
        challenges_issued:
          (st && String((st as any).day || "") === today ? Number((st as any).challenges_issued || 0) : 0) + 1,
        updated_at: new Date().toISOString(),
      } as any,
      { onConflict: "session_id" }
    );
  } catch {
    // ignore
  }

  // Combo Tap params
  const durationMs = 35_000;
  const targetCount = 80; // may extend beyond via client regen
  const targetSize = 74;

  const instructions = "Tap targets to build combo. Miss breaks combo.";

  const { error } = await sb.from("paper_challenges").insert({
    id: challengeId,
    session_id: body.data.sessionId,
    seed,
    instructions,
    expires_at: expiresAt,
  });

  if (error) {
    return NextResponse.json({ ok: false, error: "db_insert_failed", detail: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    challenge: {
      id: challengeId,
      seed,
      instructions,
      expiresAt,
      meta: {
        mode: "combo_tap",
        durationMs,
        targetCount,
        targetSize,
      },
    },
  });
}
