"use client";

import { useEffect, useState } from "react";

type Row = {
  rank: number;
  sessionId: string;
  points: number;
  updatedAt?: string;
};

export default function LeaderboardClient() {
  const [rows, setRows] = useState<Row[]>([]);
  const [status, setStatus] = useState<string>("");

  async function load() {
    setStatus("Loading...");
    const res = await fetch("/api/paper/leaderboard?limit=25");
    const j = await res.json();
    if (!j?.ok) {
      setStatus(`Not ready: ${j?.error || "unknown"}`);
      return;
    }
    setRows(j.rows || []);
    setStatus("");
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="card" style={{ marginTop: 16 }}>
      {status ? <div style={{ opacity: 0.85 }}>{status}</div> : null}

      {rows.length ? (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", opacity: 0.7 }}>
              <th style={{ padding: "10px 6px" }}>Rank</th>
              <th style={{ padding: "10px 6px" }}>Miner</th>
              <th style={{ padding: "10px 6px" }}>Points</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.sessionId} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <td style={{ padding: "10px 6px" }}>{r.rank}</td>
                <td style={{ padding: "10px 6px" }}>
                  <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace" }}>
                    {r.sessionId.slice(0, 10)}…
                  </span>
                </td>
                <td style={{ padding: "10px 6px", fontWeight: 800 }}>{r.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : !status ? (
        <div style={{ opacity: 0.85 }}>No miners yet.</div>
      ) : null}

      <div style={{ opacity: 0.65, marginTop: 10, fontSize: 13 }}>
        Note: v0 leaderboard is session-based (no wallet required). Later we’ll add optional wallet attach.
      </div>
    </div>
  );
}
