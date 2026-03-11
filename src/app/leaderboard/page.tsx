import { AppShell } from "../ui/AppShell";

const demo = [
  { rank: 1, handle: "@architect", score: 1280, streak: 7 },
  { rank: 2, handle: "@soundtech", score: 1110, streak: 4 },
  { rank: 3, handle: "@promoter", score: 980, streak: 3 },
];

export default function LeaderboardPage() {
  return (
    <AppShell>
      <h1 style={{ marginTop: 0 }}>Leaderboard (demo)</h1>
      <p style={{ opacity: 0.85 }}>
        Once we add the coordinator + claims ledger, this becomes real-time and room-specific.
      </p>

      <div className="card" style={{ marginTop: 16 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", opacity: 0.7 }}>
              <th style={{ padding: "10px 6px" }}>Rank</th>
              <th style={{ padding: "10px 6px" }}>Handle</th>
              <th style={{ padding: "10px 6px" }}>Score</th>
              <th style={{ padding: "10px 6px" }}>Streak</th>
            </tr>
          </thead>
          <tbody>
            {demo.map((r) => (
              <tr key={r.rank} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <td style={{ padding: "10px 6px" }}>{r.rank}</td>
                <td style={{ padding: "10px 6px" }}>{r.handle}</td>
                <td style={{ padding: "10px 6px" }}>{r.score}</td>
                <td style={{ padding: "10px 6px" }}>{r.streak}d</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
