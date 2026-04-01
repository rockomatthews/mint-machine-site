"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MintMachineHero } from "../ui/MintMachineHero";

type Challenge = {
  id: string;
  seed: string;
  instructions: string;
  expiresAt: string;
  meta?: {
    mode: "timing_window";
    windowPct: number; // 0..1
    speed: number; // px/s normalized-ish
    durationMs: number;
  };
};

function getSessionId() {
  if (typeof window === "undefined") return "";
  const k = "mint_session_id";
  let v = window.localStorage.getItem(k);
  if (!v) {
    v = `sess_${crypto.randomUUID().replace(/-/g, "")}`;
    window.localStorage.setItem(k, v);
  }
  return v;
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export default function MineClient() {
  const sessionId = useMemo(() => getSessionId(), []);

  const [points, setPoints] = useState<number>(0);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [status, setStatus] = useState<string>("");
  const [printing, setPrinting] = useState<boolean>(false);

  // run state
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1 moving bar
  const [lastScore, setLastScore] = useState<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const dirRef = useRef<1 | -1>(1);
  const tRef = useRef<number>(0);
  const startedAtRef = useRef<number>(0);
  const progressRef = useRef<number>(0);

  async function refreshMe() {
    const res = await fetch(`/api/paper/me?sessionId=${encodeURIComponent(sessionId)}`);
    const j = await res.json();
    if (j?.ok) setPoints(j.me.points || 0);
  }

  async function newChallenge() {
    setStatus("");
    setLastScore(null);
    setRunning(false);
    progressRef.current = 0;
    setProgress(0);

    const res = await fetch("/api/paper/challenge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, mode: "timing_window" }),
    });
    const j = await res.json();
    if (!j?.ok) {
      setStatus("Not ready");
      return;
    }
    setChallenge(j.challenge);
  }

  function startRun() {
    if (!challenge) return;
    setStatus("");
    setLastScore(null);
    setRunning(true);
    setPrinting(true);

    // init motion
    dirRef.current = Math.random() > 0.5 ? 1 : -1;
    tRef.current = 0;
    startedAtRef.current = performance.now();

    const durationMs = challenge.meta?.durationMs ?? 8000;
    const speed = challenge.meta?.speed ?? 0.9;

    const tick = (now: number) => {
      const dt = now - (startedAtRef.current + tRef.current);
      tRef.current += dt;

      // move progress back/forth
      const move = (dt / 1000) * speed * 0.6; // tuned for feel
      let p = progressRef.current + move * dirRef.current;
      if (p >= 1) {
        p = 1;
        dirRef.current = -1;
      }
      if (p <= 0) {
        p = 0;
        dirRef.current = 1;
      }
      progressRef.current = p;
      setProgress(p);

      if (tRef.current >= durationMs) {
        // auto-stop at end
        stopRun(true);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    window.setTimeout(() => setPrinting(false), 900);
  }

  async function stopRun(auto = false) {
    if (!challenge) return;
    if (!running) return;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;

    setRunning(false);

    const windowPct = clamp(challenge.meta?.windowPct ?? 0.14, 0.06, 0.35);
    const center = 0.5;
    const dist = Math.abs(progressRef.current - center);
    const halfWindow = windowPct / 2;

    // score: 0..100
    let score = 0;
    if (dist <= halfWindow) {
      // inside window: higher is better (closer to center)
      score = Math.round((1 - dist / halfWindow) * 100);
    } else {
      // outside: still give small score so it doesn't feel punishing
      const maxDist = 0.5;
      const outside = clamp((dist - halfWindow) / (maxDist - halfWindow), 0, 1);
      score = Math.round((1 - outside) * 15);
    }

    setLastScore(score);

    // submit to server for points + leaderboard
    setStatus(auto ? "Time!" : "");
    const res = await fetch("/api/paper/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        challengeId: challenge.id,
        artifact: JSON.stringify({ mode: "timing_window", score, progress: progressRef.current, auto }),
      }),
    });

    const j = await res.json();
    if (!j?.ok) {
      setStatus("Submit failed");
      return;
    }

    const gained = j?.submission?.points ?? 0;
    if (gained > 0) {
      import("canvas-confetti")
        .then((m: any) => {
          const confetti = m.default || m;
          confetti({ particleCount: 70, spread: 65, origin: { y: 0.7 }, colors: ["#22c55e", "#c7f9cc", "#e7f2e8"] });
        })
        .catch(() => {});
    }

    setStatus(`+${gained} hash`);
    await refreshMe();
  }

  useEffect(() => {
    refreshMe();
    newChallenge();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const windowPct = clamp(challenge?.meta?.windowPct ?? 0.14, 0.06, 0.35);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <MintMachineHero printing={printing} />

      <div className="card">
        <div className="cardBody" style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div className="kicker">Your hash</div>
            <div style={{ fontSize: 30, fontWeight: 900, lineHeight: 1 }}>{points}</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <a className="button" href="/leaderboard" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
              Leaderboard
            </a>
            <button className="button" onClick={newChallenge} disabled={running}>
              New run
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="cardTitle">Timing Window</div>
        <div className="cardBody" style={{ display: "grid", gap: 12 }}>
          <div
            style={{
              height: 44,
              borderRadius: 14,
              background: "rgba(255,255,255,0.06)",
              position: "relative",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.10)",
            }}
          >
            {/* target window */}
            <div
              style={{
                position: "absolute",
                left: `${(0.5 - windowPct / 2) * 100}%`,
                width: `${windowPct * 100}%`,
                top: 0,
                bottom: 0,
                background: "linear-gradient(90deg, rgba(34,197,94,0.18), rgba(34,197,94,0.35), rgba(34,197,94,0.18))",
              }}
            />

            {/* moving marker */}
            <div
              style={{
                position: "absolute",
                left: `${progress * 100}%`,
                top: 0,
                bottom: 0,
                width: 10,
                transform: "translateX(-5px)",
                background: "rgba(255,255,255,0.9)",
                boxShadow: "0 0 20px rgba(255,255,255,0.25)",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {!running ? (
              <button className="button" onClick={startRun} disabled={!challenge}>
                Start
              </button>
            ) : (
              <button className="button" onClick={() => stopRun(false)}>
                Stop
              </button>
            )}
            {lastScore !== null ? (
              <div style={{ opacity: 0.9, alignSelf: "center" }}>Score: <b>{lastScore}</b></div>
            ) : null}
            {status ? <div style={{ opacity: 0.85, alignSelf: "center" }}>{status}</div> : null}
          </div>

          <div style={{ opacity: 0.75, fontSize: 13 }}>
            Stop the marker inside the green window. Faster runs, higher streaks, more hash (coming).
          </div>
        </div>
      </div>
    </div>
  );
}
