import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServerAdmin } from "../../_supabase";

export const runtime = "nodejs";

const BodySchema = z
  .object({
    sessionId: z.string().min(8),
  })
  .strict();

function newId(prefix: string) {
  // short, URL-safe
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "")}`;
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => ({}));
  const body = BodySchema.safeParse(json);
  if (!body.success) {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const challengeId = newId("ch");
  const now = Date.now();
  const expiresAt = new Date(now + 1000 * 60 * 20).toISOString(); // 20m

  // Deterministic seed. Keep it simple for MVP.
  const seed = crypto.randomUUID();

  const instructions = [
    "You are mining PAPER by doing market-sim comprehension.",
    "Write a concise trade plan for a 1-minute BTC UP/DOWN round.",
    "Include: entry condition, exit condition, risk cap, and one reason it might fail.",
    "Keep it under 120 words.",
  ].join("\n");

  const sb = supabaseServerAdmin();
  const { error } = await sb.from("paper_challenges").insert({
    id: challengeId,
    session_id: body.data.sessionId,
    seed,
    instructions,
    expires_at: expiresAt,
  });

  if (error) {
    return NextResponse.json({ ok: false, error: "db_insert_failed" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    challenge: {
      id: challengeId,
      seed,
      instructions,
      expiresAt,
    },
  });
}
