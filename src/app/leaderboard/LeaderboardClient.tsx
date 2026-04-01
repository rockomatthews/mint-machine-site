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
  const [scope, setScope] = useState<"today" | "alltime">("today");

  async function load(nextScope: "today" | "alltime") {
    setStatus("Loading...");
    const res = await fetch(`/api/paper/leaderboard?limit=25&scope=${nextScope}`);
    const j = await res.json();
    if (!j?.ok) {
      setStatus(`Not ready: ${j?.error || "unknown"}`);
      return;
    }
    setRows(j.rows || []);
    setStatus("");
  }

  useEffect(() => {
    load(scope);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div className="cardBody" style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="button"
            onClick={() => setScope("today")}
            style={{ opacity: scope === "today" ? 1 : 0.65 }}
          >
            Today
          </button>
          <button
            className="button"
            onClick={() => setScope("alltime")}
            style={{ opacity: scope === "alltime" ? 1 : 0.65 }}
          >
            All‑time
          </button>
        </div>
        <button className="button" onClick={() => load(scope)}>
          Refresh
        </button>
      </div>

      {status ? <div style={{ opacity: 0.85, padding: "0 16px 16px" }}>{status}</div> : null}

      {rows.length ? (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", opacity: 0.7 }}>
              <th style={{ padding: "10px 16px" }}>Rank</th>
              <th style={{ padding: "10px 6px" }}>Miner</th>
              <th style={{ padding: "10px 16px", textAlign: "right" }}>Hash</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.sessionId} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <td style={{ padding: "10px 16px" }}>{r.rank}</td>
                <td style={{ padding: "10px 6px" }}>
                  <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace" }}>
                    {r.sessionId.slice(0, 10)}…
                  </span>
                </td>
                <td style={{ padding: "10px 16px", fontWeight: 900, textAlign: "right" }}>{r.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : !status ? (
        <div style={{ opacity: 0.85, padding: "0 16px 16px" }}>No miners yet.</div>
      ) : null}
    </div>
  );
}
