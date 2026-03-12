import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServerAdmin } from "../../_supabase";

export const runtime = "nodejs";

const BodySchema = z
  .object({
    sessionId: z.string().min(8),
    challengeId: z.string().min(5),
    artifact: z.string().min(10).max(5000),
  })
  .strict();

function scoreArtifact(artifact: string) {
  // MVP deterministic verifier:
  // - length under 120 words
  // - must contain 4 sections keywords (very simple heuristic)
  const words = artifact.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const mustHave = ["entry", "exit", "risk", "fail"];
  const lower = artifact.toLowerCase();
  const hits = mustHave.filter((k) => lower.includes(k));

  const ok = wordCount <= 140 && hits.length >= 3;
  const points = ok ? 10 : 0;

  return { ok, points, wordCount, hits };
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => ({}));
  const body = BodySchema.safeParse(json);
  if (!body.success) {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const { sessionId, challengeId, artifact } = body.data;

  const sb = supabaseServerAdmin();

  // Fetch challenge and validate ownership + expiry.
  const { data: ch, error: chErr } = await sb
    .from("paper_challenges")
    .select("id, session_id, seed, expires_at")
    .eq("id", challengeId)
    .maybeSingle();

  if (chErr || !ch) {
    return NextResponse.json({ ok: false, error: "challenge_not_found" }, { status: 404 });
  }

  if (ch.session_id !== sessionId) {
    return NextResponse.json({ ok: false, error: "challenge_session_mismatch" }, { status: 403 });
  }

  if (new Date(ch.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ ok: false, error: "challenge_expired" }, { status: 400 });
  }

  const verdict = scoreArtifact(artifact);

  const submissionId = `sub_${crypto.randomUUID().replace(/-/g, "")}`;

  const { error: subErr } = await sb.from("paper_submissions").insert({
    id: submissionId,
    challenge_id: challengeId,
    session_id: sessionId,
    artifact,
    points: verdict.points,
    verdict: verdict.ok ? "ok" : "rejected",
    meta: {
      wordCount: verdict.wordCount,
      hits: verdict.hits,
    },
  });

  if (subErr) {
    return NextResponse.json({ ok: false, error: "db_insert_failed" }, { status: 500 });
  }

  // Update balance (simple accumulator).
  if (verdict.points > 0) {
    await sb.rpc("paper_add_points", {
      p_session_id: sessionId,
      p_points: verdict.points,
    });
  }

  return NextResponse.json({
    ok: true,
    submission: {
      id: submissionId,
      points: verdict.points,
      verdict: verdict.ok ? "ok" : "rejected",
      details: {
        wordCount: verdict.wordCount,
        hits: verdict.hits,
      },
    },
  });
}
