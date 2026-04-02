import { NextResponse } from "next/server";
import { supabaseServerAdmin } from "../_supabase";

export const runtime = "nodejs";

export async function GET() {
  const missing: string[] = [];
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!process.env.RUN_SIGNING_KEY) missing.push("RUN_SIGNING_KEY");

  if (missing.length) {
    return NextResponse.json({ ok: false, error: "missing_env", missing }, { status: 500 });
  }

  let sb;
  try {
    sb = supabaseServerAdmin();
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: "supabase_init_failed", detail: String(e?.message || e) }, { status: 500 });
  }

  // Schema probe: check core tables exist
  const probes: Record<string, any> = {};
  for (const t of ["paper_balances", "paper_challenges", "paper_submissions", "paper_session_state"]) {
    const { error } = await sb.from(t).select("*").limit(1);
    probes[t] = error ? { ok: false, error: error.message } : { ok: true };
  }

  return NextResponse.json({ ok: true, probes });
}
