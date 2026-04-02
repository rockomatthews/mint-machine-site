"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MintMachineHero } from "../ui/MintMachineHero";

type Challenge = {
  id: string;
  seed: string;
  instructions: string;
  expiresAt: string;
  meta?: {
    mode: "runner_v1";
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

export default function MineClient() {
  const sessionId = useMemo(() => getSessionId(), []);

  const [points, setPoints] = useState<number>(0);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [status, setStatus] = useState<string>("");
  const [printing, setPrinting] = useState<boolean>(false);
  const [running, setRunning] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  const mountRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<any>(null);

  async function refreshMe() {
    const res = await fetch(`/api/paper/me?sessionId=${encodeURIComponent(sessionId)}`);
    const j = await res.json();
    if (j?.ok) setPoints(j.me.points || 0);
  }

  async function newChallenge() {
    setStatus("");
    const res = await fetch("/api/paper/challenge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, mode: "runner_v1" }),
    });
    const j = await res.json();
    if (!j?.ok) {
      setStatus("Not ready");
      return;
    }
    setChallenge(j.challenge);
  }

  async function start() {
    if (!challenge?.meta) return;
    if (!mountRef.current) return;

    setPrinting(true);
    window.setTimeout(() => setPrinting(false), 650);

    // Clear any previous canvas
    mountRef.current.innerHTML = "";

    const Phaser = (await import("phaser")).default;
    const { createRunnerGame } = await import("../../game/runner");

    setRunning(true);
    setStatus("");
    setScore(0);

    const w = Math.min(980, Math.max(320, mountRef.current.clientWidth));
    const h = 420;

    gameRef.current = await createRunnerGame(Phaser as any, mountRef.current, { seed: challenge.seed, width: w, height: h }, {
      onScore: (s) => setScore(s),
      onGameOver: async (finalScore) => {
        setRunning(false);

        try {
          const res = await fetch("/api/paper/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId,
              challengeId: challenge.id,
              artifact: JSON.stringify({ mode: "runner_v1", score: finalScore }),
            }),
          });
          const j = await res.json();
          const gained = j?.submission?.points ?? 0;
          const runId = j?.submission?.id;
          if (runId) setStatus(`+${gained} hash · Run card: /run/${String(runId)}`);
          else setStatus(`+${gained} hash`);
          await refreshMe();
          await newChallenge();
        } catch {
          setStatus("Submit failed");
        }
      },
    });
  }

  function stop() {
    try {
      gameRef.current?.destroy(true);
    } catch {}
    gameRef.current = null;
    setRunning(false);
  }

  useEffect(() => {
    refreshMe();
    newChallenge();
    return () => {
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            {!running ? (
              <button className="button" onClick={start}>
                Start run
              </button>
            ) : (
              <button className="button" onClick={stop}>
                Stop
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="cardTitle">Cyber Factory Runner</div>
        <div className="cardBody" style={{ display: "grid", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", opacity: 0.85 }}>
            <div>
              Score: <b>{score}</b>
            </div>
            <div style={{ opacity: 0.8, fontSize: 13 }}>Tap/Space to jump</div>
          </div>

          <div
            ref={mountRef}
            style={{
              width: "100%",
              borderRadius: 18,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.10)",
              background:
                "radial-gradient(900px 420px at 20% 0%, rgba(253,209,4,0.08), transparent 60%), radial-gradient(900px 420px at 85% 20%, rgba(1,52,115,0.20), transparent 55%), rgba(255,255,255,0.04)",
              minHeight: 420,
            }}
          />

          {status ? <div style={{ opacity: 0.92 }}>{status}</div> : null}
        </div>
      </div>

      <div className="card">
        <div className="cardBody" style={{ opacity: 0.8, fontSize: 13, lineHeight: 1.7 }}>
          Assets: Kenney Platformer Pack Industrial (CC0). Engine: Phaser (MIT).
        </div>
      </div>
    </div>
  );
}
