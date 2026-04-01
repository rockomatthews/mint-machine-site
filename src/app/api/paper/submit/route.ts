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
    .select("id, session_id, seed, expires_at, instructions")
    .eq("id", challengeId)
    .maybeSingle();

  if (chErr || !ch) return NextResponse.json({ ok: false, error: "challenge_not_found" }, { status: 404 });
  if (ch.session_id !== sessionId) return NextResponse.json({ ok: false, error: "challenge_session_mismatch" }, { status: 403 });
  if (new Date(ch.expires_at).getTime() < Date.now()) return NextResponse.json({ ok: false, error: "challenge_expired" }, { status: 400 });

  // Parse run artifact (client-reported for MVP; tightened later)
  let a: any = null;
  try {
    a = JSON.parse(artifact);
  } catch {
    a = null;
  }

  const mode = a?.mode === "timing_window" ? "timing_window" : "unknown";
  const rawScore = Number(a?.score);
  const score = Number.isFinite(rawScore) ? Math.max(0, Math.min(100, Math.round(rawScore))) : 0;

  // Award curve (simple + fun)
  // - Always give at least 1 for participation.
  // - More for higher scores.
  let basePoints = 1 + Math.floor(score / 12); // 1..9
  if (score >= 95) basePoints += 2; // sweet spot bonus

  const submissionId = `sub_${crypto.randomUUID().replace(/-/g, "")}`;

  const { error: subErr } = await sb.from("paper_submissions").insert({
    id: submissionId,
    challenge_id: challengeId,
    session_id: sessionId,
    artifact,
    points: basePoints,
    verdict: mode === "timing_window" ? "ok" : "rejected",
    meta: {
      mode,
      score,
    },
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

    // multiplier = min(1 + 0.04*streak, 1.5)
    const mult = Math.min(1 + 0.04 * nextStreak, 1.5);
    awardedPoints = Math.max(1, Math.round(basePoints * mult));
    streak = nextStreak;

    await sb
      .from("paper_session_state")
      .upsert(
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

  // Update balance
  if (awardedPoints > 0) {
    await sb.rpc("paper_add_points", { p_session_id: sessionId, p_points: awardedPoints });
  }

  // Signed receipt (for future onchain claims)
  const key = process.env.RUN_SIGNING_KEY || "";
  const receiptPayload = {
    v: 1,
    sessionId,
    challengeId,
    submissionId,
    mode,
    score,
    points: awardedPoints,
    ts: new Date().toISOString(),
  };
  const receipt = key ? signReceipt(receiptPayload, key) : null;

  return NextResponse.json({
    ok: true,
    submission: {
      id: submissionId,
      points: awardedPoints,
      verdict: mode === "timing_window" ? "ok" : "rejected",
      details: { score, streak },
      receipt,
    },
  });
}
