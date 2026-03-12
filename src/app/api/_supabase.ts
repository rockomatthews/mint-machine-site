import { createClient } from "@supabase/supabase-js";

function reqEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export function supabaseServerAdmin() {
  const url = reqEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRole = reqEnv("SUPABASE_SERVICE_ROLE_KEY");

  return createClient(url, serviceRole, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
