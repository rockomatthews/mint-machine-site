import { AppShell } from "../ui/AppShell";
import LeaderboardClient from "./LeaderboardClient";

export default function LeaderboardPage() {
  return (
    <AppShell>
      <h1 style={{ marginTop: 0 }}>Leaderboard</h1>
      <p style={{ opacity: 0.85 }}>
        This is live from the offchain ledger (Supabase). Mine on <a href="/mine">/mine</a> to show up.
      </p>

      <LeaderboardClient />
    </AppShell>
  );
}
