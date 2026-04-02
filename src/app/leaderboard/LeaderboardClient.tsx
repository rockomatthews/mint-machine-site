"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { avatarUrlFromSessionId, codenameFromSessionId } from "../_identity";

type Row = {
  rank: number;
  sessionId: string;
  points: number;
  updatedAt?: string;
};

type Profile = { username?: string; avatar_url?: string };

export default function LeaderboardClient() {
  const [rows, setRows] = useState<Row[]>([]);
  const [status, setStatus] = useState<string>("");
  const [scope, setScope] = useState<"today" | "alltime">("today");
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});

  async function load(nextScope: "today" | "alltime") {
    setStatus("Loading...");
    const res = await fetch(`/api/paper/leaderboard?limit=25&scope=${nextScope}`);
    const j = await res.json();
    if (!j?.ok) {
      setStatus(`Not ready: ${j?.error || "unknown"}`);
      return;
    }
    const nextRows: Row[] = j.rows || [];
    setRows(nextRows);
    setStatus("");

    // Best-effort profile hydration for top rows (no blocking)
    const map: Record<string, Profile> = {};
    await Promise.all(
      nextRows.map(async (r) => {
        try {
          const pr = await fetch(`/api/profile/get?sessionId=${encodeURIComponent(r.sessionId)}`);
          const pj = await pr.json();
          if (pj?.ok && pj?.profile) {
            map[r.sessionId] = { username: pj.profile.username, avatar_url: pj.profile.avatar_url };
          }
        } catch {}
      })
    );
    setProfiles(map);
  }

  useEffect(() => {
    load(scope);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);

  const headerRight = useMemo(() => {
    return (
      <div style={{ display: "flex", gap: 8 }}>
        <button className="button" onClick={() => setScope("today")} style={{ opacity: scope === "today" ? 1 : 0.65 }}>
          Today
        </button>
        <button className="button" onClick={() => setScope("alltime")} style={{ opacity: scope === "alltime" ? 1 : 0.65 }}>
          All‑time
        </button>
      </div>
    );
  }, [scope]);

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div className="cardBody" style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
        {headerRight}
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
              <th style={{ padding: "10px 6px" }}>Operator</th>
              <th style={{ padding: "10px 16px", textAlign: "right" }}>Hash</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const p = profiles[r.sessionId];
              const name = p?.username || codenameFromSessionId(r.sessionId);
              const avatar = p?.avatar_url || avatarUrlFromSessionId(r.sessionId);
              return (
                <tr key={r.sessionId} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <td style={{ padding: "10px 16px" }}>{r.rank}</td>
                  <td style={{ padding: "10px 6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Image src={avatar} alt={name} width={28} height={28} style={{ borderRadius: 10 }} />
                      <div style={{ fontWeight: 900 }}>{name}</div>
                    </div>
                  </td>
                  <td style={{ padding: "10px 16px", fontWeight: 900, textAlign: "right" }}>{r.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : !status ? (
        <div style={{ opacity: 0.85, padding: "0 16px 16px" }}>No miners yet.</div>
      ) : null}
    </div>
  );
}
