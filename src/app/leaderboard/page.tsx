import { AppShell } from "../ui/AppShell";
import LeaderboardClient from "./LeaderboardClient";

export default function LeaderboardPage() {
  return (
    <AppShell>
      <h1 style={{ marginTop: 0 }}>Leaderboard</h1>
      <LeaderboardClient />
    </AppShell>
  );
}
