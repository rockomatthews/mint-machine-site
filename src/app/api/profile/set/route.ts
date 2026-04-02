import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServerAdmin } from "../../_supabase";

export const runtime = "nodejs";

const BodySchema = z
  .object({
    sessionId: z.string().min(8),
    username: z
      .string()
      .trim()
      .min(1)
      .max(24)
      .regex(/^[a-zA-Z0-9_\- ]+$/, "bad_username"),
    avatarUrl: z.string().url().max(512),
  })
  .strict();

export async function POST(req: Request) {
  const json = await req.json().catch(() => ({}));
  const body = BodySchema.safeParse(json);
  if (!body.success) {
    return NextResponse.json({ ok: false, error: "bad_request", detail: body.error.flatten() }, { status: 400 });
  }

  let sb;
  try {
    sb = supabaseServerAdmin();
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: "missing_env", detail: String(e?.message || e) }, { status: 500 });
  }

  const { error } = await sb.from("mint_profiles").upsert(
    {
      session_id: body.data.sessionId,
      username: body.data.username,
      avatar_url: body.data.avatarUrl,
      updated_at: new Date().toISOString(),
    } as any,
    { onConflict: "session_id" }
  );

  if (error) return NextResponse.json({ ok: false, error: "db_write_failed", detail: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
