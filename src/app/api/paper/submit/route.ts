import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "node:crypto";
import { supabaseServerAdmin } from "../../_supabase";

export const runtime = "nodejs";

const BodySchema = z
  .object({
    sessionId: z.string().min(8),
    challengeId: z.string().min(5),
    artifact: z.string().min(2).max(10000),
  })
  .strict();

function dayMT() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Denver",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function signReceipt(payload: any, key: string) {
  const msg = JSON.stringify(payload);
  const sig = crypto.createHmac("sha256", key).update(msg).digest("hex");
  return { msg, sig };
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => ({}));
  const body = BodySchema.safeParse(json);
  if (!body.success) {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const { sessionId, challengeId, artifact } = body.data;

  const sb = supabaseServerAdmin();

  const { data: ch, error: chErr } = await sb
    .from("paper_challenges")
    .select("id, session_id, seed, expires_at")
    .eq("id", challengeId)
    .maybeSingle();

  if (chErr || !ch) return NextResponse.json({ ok: false, error: "challenge_not_found" }, { status: 404 });
  if (ch.session_id !== sessionId) return NextResponse.json({ ok: false, error: "challenge_session_mismatch" }, { status: 403 });
  if (new Date(ch.expires_at).getTime() < Date.now()) return NextResponse.json({ ok: false, error: "challenge_expired" }, { status: 400 });

  let a: any = null;
  try {
    a = JSON.parse(artifact);
  } catch {
    a = null;
  }

  const mode = a?.mode === "combo_tap" ? "combo_tap" : "unknown";
  const score = Number.isFinite(Number(a?.score)) ? Math.max(0, Math.min(999, Math.round(Number(a?.score)))) : 0;
  const hits = Number.isFinite(Number(a?.hits)) ? Math.max(0, Math.min(500, Math.round(Number(a?.hits)))) : 0;
  const misses = Number.isFinite(Number(a?.misses)) ? Math.max(0, Math.min(500, Math.round(Number(a?.misses)))) : 0;
  const maxCombo = Number.isFinite(Number(a?.maxCombo)) ? Math.max(0, Math.min(500, Math.round(Number(a?.maxCombo)))) : 0;
  const elapsedMs = Number.isFinite(Number(a?.elapsedMs)) ? Math.max(0, Math.min(120000, Math.round(Number(a?.elapsedMs)))) : 0;

  // Award curve (fast feedback, capped)
  // score 0..999 -> points 1..18-ish
  let basePoints = 1 + Math.floor(score / 70); // 1..15
  if (maxCombo >= 25) basePoints += 2;
  if (maxCombo >= 40) basePoints += 2;
  basePoints = Math.min(basePoints, 20);

  const submissionId = `sub_${crypto.randomUUID().replace(/-/g, "")}`;

  const { error: subErr } = await sb.from("paper_submissions").insert({
    id: submissionId,
    challenge_id: challengeId,
    session_id: sessionId,
    artifact,
    points: basePoints,
    verdict: mode === "combo_tap" ? "ok" : "rejected",
    meta: { mode, score, hits, misses, maxCombo, elapsedMs },
  });

  if (subErr) {
    return NextResponse.json({ ok: false, error: "db_insert_failed", detail: subErr.message }, { status: 500 });
  }

  // Streak multiplier (best-effort)
  let awardedPoints = basePoints;
  let streak = 0;

  try {
    const today = dayMT();
    const { data: st } = await sb
      .from("paper_session_state")
      .select("session_id, streak, day, submissions_total")
      .eq("session_id", sessionId)
      .maybeSingle();

    const sameDay = String((st as any)?.day || "") === today;
    const prevStreak = Number((st as any)?.streak || 0);
    const nextStreak = prevStreak + 1;

    const mult = Math.min(1 + 0.03 * nextStreak, 1.35);
    awardedPoints = Math.max(1, Math.round(basePoints * mult));
    streak = nextStreak;

    await sb.from("paper_session_state").upsert(
      {
        session_id: sessionId,
        day: today,
        streak: nextStreak,
        submissions_total: (sameDay ? Number((st as any)?.submissions_total || 0) : 0) + 1,
        updated_at: new Date().toISOString(),
      } as any,
      { onConflict: "session_id" }
    );
  } catch {
    // ignore
  }

  if (awardedPoints > 0) {
    await sb.rpc("paper_add_points", { p_session_id: sessionId, p_points: awardedPoints });
  }

  const key = process.env.RUN_SIGNING_KEY || "";
  const receiptPayload = {
    v: 1,
    sessionId,
    challengeId,
    submissionId,
    mode,
    score,
    hits,
    misses,
    maxCombo,
    elapsedMs,
    points: awardedPoints,
    ts: new Date().toISOString(),
  };
  const receipt = key ? signReceipt(receiptPayload, key) : null;

  return NextResponse.json({
    ok: true,
    submission: {
      id: submissionId,
      points: awardedPoints,
      verdict: mode === "combo_tap" ? "ok" : "rejected",
      details: { score, hits, misses, maxCombo, streak },
      receipt,
    },
  });
}
