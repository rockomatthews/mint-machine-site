"use client";

import { useEffect, useMemo, useState } from "react";

type Challenge = {
  id: string;
  seed: string;
  instructions: string;
  expiresAt: string;
};

function getSessionId() {
  if (typeof window === "undefined") return "";
  const k = "paper_session_id";
  let v = window.localStorage.getItem(k);
  if (!v) {
    v = `sess_${crypto.randomUUID().replace(/-/g, "")}`;
    window.localStorage.setItem(k, v);
  }
  return v;
}

export default function MineClient() {
  const sessionId = useMemo(() => getSessionId(), []);

  const [points, setPoints] = useState<number>(0);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [artifact, setArtifact] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  async function refreshMe() {
    const res = await fetch(`/api/paper/me?sessionId=${encodeURIComponent(sessionId)}`);
    const j = await res.json();
    if (j?.ok) setPoints(j.me.points || 0);
  }

  async function newChallenge() {
    setStatus("Issuing challenge...");
    const res = await fetch("/api/paper/challenge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });
    const j = await res.json();
    if (!j?.ok) {
      setStatus(`Challenge failed: ${j?.error || "unknown"}`);
      return;
    }
    setChallenge(j.challenge);
    setArtifact("");
    setStatus("Challenge ready.");
  }

  async function submit() {
    if (!challenge) return;
    setStatus("Submitting...");
    const res = await fetch("/api/paper/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        challengeId: challenge.id,
        artifact,
      }),
    });
    const j = await res.json();
    if (!j?.ok) {
      setStatus(`Submit failed: ${j?.error || "unknown"}`);
      return;
    }
    setStatus(`Verdict: ${j.submission.verdict}. +${j.submission.points} points.`);
    await refreshMe();
  }

  useEffect(() => {
    refreshMe();
  }, []);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div className="card">
        <div className="kicker">Your balance</div>
        <div className="cardTitle">Claimable PAPER (offchain for now)</div>
        <div className="cardBody">
          <div style={{ fontSize: 28, fontWeight: 800 }}>{points}</div>
          <div style={{ opacity: 0.8, marginTop: 6 }}>
            No wallet signatures during mining. Claim will be a separate step later.
          </div>
        </div>
      </div>

      <div className="card">
        <div className="kicker">Challenge</div>
        <div className="cardTitle">Market-sim comprehension task</div>
        <div className="cardBody" style={{ display: "grid", gap: 10 }}>
          <button className="button" onClick={newChallenge}>
            New challenge
          </button>

          {challenge ? (
            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ opacity: 0.85, fontSize: 12 }}>expires: {new Date(challenge.expiresAt).toLocaleString()}</div>
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  background: "rgba(255,255,255,0.04)",
                  padding: 12,
                  borderRadius: 12,
                  margin: 0,
                }}
              >
                {challenge.instructions}
              </pre>
            </div>
          ) : (
            <div style={{ opacity: 0.8 }}>Click “New challenge” to start.</div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="kicker">Submit</div>
        <div className="cardTitle">Your artifact</div>
        <div className="cardBody" style={{ display: "grid", gap: 10 }}>
          <textarea
            value={artifact}
            onChange={(e) => setArtifact(e.target.value)}
            placeholder="Write your plan here. Include words like: entry, exit, risk, fail (verifier checks this for now)."
            rows={7}
            style={{ width: "100%", resize: "vertical" }}
          />
          <button className="button" disabled={!challenge || artifact.trim().length < 10} onClick={submit}>
            Submit
          </button>
          {status ? <div style={{ opacity: 0.85 }}>{status}</div> : null}
        </div>
      </div>

      <div className="card">
        <div className="kicker">Dev notes</div>
        <div className="cardBody" style={{ opacity: 0.85 }}>
          MVP verifier is intentionally simple/deterministic. Next iteration: real “artifact format” + stronger anti-sybil.
        </div>
      </div>
    </div>
  );
}
