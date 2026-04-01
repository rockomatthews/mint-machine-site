"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MintMachineHero } from "../ui/MintMachineHero";

type Challenge = {
  id: string;
  seed: string;
  instructions: string;
  expiresAt: string;
  meta?: {
    mode: "combo_tap";
    durationMs: number;
    targetCount: number;
    targetSize: number; // px
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

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

type Target = {
  i: number;
  x: number; // 0..1
  y: number; // 0..1
  shownAtMs: number;
  hitAtMs?: number;
  miss?: boolean;
};

export default function MineClient() {
  const sessionId = useMemo(() => getSessionId(), []);

  const [points, setPoints] = useState<number>(0);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [status, setStatus] = useState<string>("");
  const [printing, setPrinting] = useState<boolean>(false);

  // run state
  const [running, setRunning] = useState(false);
  const [timeLeftMs, setTimeLeftMs] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [score, setScore] = useState<number | null>(null);

  const targetsRef = useRef<Target[]>([]);
  const activeIndexRef = useRef<number>(0);
  const tickTimerRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);
  const seedRandRef = useRef<(() => number) | null>(null);

  async function refreshMe() {
    const res = await fetch(`/api/paper/me?sessionId=${encodeURIComponent(sessionId)}`);
    const j = await res.json();
    if (j?.ok) setPoints(j.me.points || 0);
  }

  async function newChallenge() {
    setStatus("");
    setScore(null);
    setRunning(false);

    const res = await fetch("/api/paper/challenge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, mode: "combo_tap" }),
    });
    const j = await res.json();
    if (!j?.ok) {
      setStatus("Not ready");
      return;
    }
    setChallenge(j.challenge);
  }

  function buildTargets(seed: string, meta: NonNullable<Challenge["meta"]>) {
    const rand = mulberry32(hashSeed(seed));
    seedRandRef.current = rand;

    const t: Target[] = [];
    const count = meta.targetCount;
    for (let i = 0; i < count; i++) {
      // keep away from edges
      const x = 0.08 + rand() * 0.84;
      const y = 0.12 + rand() * 0.76;
      t.push({ i, x, y, shownAtMs: i === 0 ? 0 : -1 });
    }
    targetsRef.current = t;
    activeIndexRef.current = 0;
  }

  function startRun() {
    if (!challenge?.meta) return;

    setPrinting(true);
    window.setTimeout(() => setPrinting(false), 650);

    setStatus("");
    setRunning(true);
    setScore(null);
    setCombo(0);
    setMaxCombo(0);
    setHits(0);
    setMisses(0);

    startedAtRef.current = performance.now();
    setTimeLeftMs(challenge.meta.durationMs);
    buildTargets(challenge.seed, challenge.meta);

    // mark first shown
    targetsRef.current[0].shownAtMs = 0;

    if (tickTimerRef.current) window.clearInterval(tickTimerRef.current);
    tickTimerRef.current = window.setInterval(() => {
      const elapsed = performance.now() - startedAtRef.current;
      const left = Math.max(0, challenge.meta!.durationMs - elapsed);
      setTimeLeftMs(left);
      if (left <= 0) stopRun(true);
    }, 60);
  }

  async function stopRun(auto = false) {
    if (!challenge?.meta) return;
    if (!running) return;

    setRunning(false);
    if (tickTimerRef.current) window.clearInterval(tickTimerRef.current);
    tickTimerRef.current = null;

    const durationMs = challenge.meta.durationMs;
    const elapsedMs = clamp(performance.now() - startedAtRef.current, 0, durationMs);

    // compute score: skill * speed * accuracy
    const total = hits + misses;
    const accuracy = total ? hits / total : 0;
    const speed = hits ? Math.min(1.6, (hits / (elapsedMs / 1000)) / 6) : 0; // normalized

    // base score favors maxCombo heavily (skill ceiling)
    const raw = Math.round(maxCombo * 18 + hits * 4 + accuracy * 40 + speed * 25 - misses * 3);
    const finalScore = clamp(raw, 0, 999);
    setScore(finalScore);

    // submit receipt
    setStatus(auto ? "Time!" : "");
    const res = await fetch("/api/paper/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        challengeId: challenge.id,
        artifact: JSON.stringify({
          mode: "combo_tap",
          score: finalScore,
          hits,
          misses,
          maxCombo,
          elapsedMs: Math.round(elapsedMs),
        }),
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
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 }, colors: ["#FDD104", "#013473", "#E6E7E6"] });
        })
        .catch(() => {});
    }

    setStatus(`+${gained} hash`);
    await refreshMe();

    // auto-refresh challenge for “one more run”
    await newChallenge();
  }

  function onHitTarget() {
    if (!running || !challenge?.meta) return;

    const idx = activeIndexRef.current;
    const t = targetsRef.current[idx];
    if (!t) return;

    const elapsed = performance.now() - startedAtRef.current;
    t.hitAtMs = Math.round(elapsed);

    const nextCombo = combo + 1;
    setCombo(nextCombo);
    setMaxCombo((m) => Math.max(m, nextCombo));
    setHits((h) => h + 1);

    // next target
    const nextIdx = idx + 1;
    activeIndexRef.current = nextIdx;
    if (targetsRef.current[nextIdx]) {
      targetsRef.current[nextIdx].shownAtMs = Math.round(elapsed);
    } else {
      // loop more targets by regenerating a new one based on seedRand
      const rand = seedRandRef.current || Math.random;
      const x = 0.08 + rand() * 0.84;
      const y = 0.12 + rand() * 0.76;
      targetsRef.current.push({ i: nextIdx, x, y, shownAtMs: Math.round(elapsed) });
    }

    // force rerender for target move
    setTimeLeftMs((x) => x);
  }

  function onMiss() {
    if (!running) return;
    setCombo(0);
    setMisses((m) => m + 1);
  }

  useEffect(() => {
    refreshMe();
    newChallenge();
    return () => {
      if (tickTimerRef.current) window.clearInterval(tickTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const meta = challenge?.meta;
  const targetSize = meta?.targetSize ?? 74;

  const idx = activeIndexRef.current;
  const target = targetsRef.current[idx];

  const questA = maxCombo >= 20;
  const questB = hits >= 25;
  const questC = misses <= 3 && hits >= 20;

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
              <button className="button" onClick={startRun} disabled={!challenge?.meta}>
                Start run
              </button>
            ) : (
              <button className="button" onClick={() => stopRun(false)}>
                Stop
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="cardTitle">Combo Tap</div>
        <div className="cardBody" style={{ display: "grid", gap: 12 }}>
          <div
            onClick={onMiss}
            style={{
              height: 320,
              borderRadius: 18,
              background:
                "radial-gradient(900px 420px at 20% 0%, rgba(253,209,4,0.10), transparent 60%), radial-gradient(900px 420px at 85% 20%, rgba(1,52,115,0.22), transparent 55%), rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.10)",
              position: "relative",
              overflow: "hidden",
              cursor: running ? "crosshair" : "default",
              userSelect: "none",
            }}
          >
            {/* HUD */}
            <div
              style={{
                position: "absolute",
                top: 12,
                left: 12,
                right: 12,
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
                fontSize: 13,
                opacity: 0.9,
              }}
            >
              <div>
                Time: <b>{Math.ceil(timeLeftMs / 1000)}</b>s
              </div>
              <div>
                Combo: <b>{combo}</b> (max {maxCombo})
              </div>
              <div>
                Hits: <b>{hits}</b> · Miss: {misses}
              </div>
            </div>

            {/* Active target */}
            {running && target ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onHitTarget();
                }}
                style={{
                  position: "absolute",
                  left: `calc(${(target.x * 100).toFixed(2)}% - ${targetSize / 2}px)`,
                  top: `calc(${(target.y * 100).toFixed(2)}% - ${targetSize / 2}px)`,
                  width: targetSize,
                  height: targetSize,
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.20)",
                  background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.85), rgba(253,209,4,0.95) 45%, rgba(1,52,115,0.85))",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
                  cursor: "pointer",
                }}
                aria-label="target"
              />
            ) : null}

            {/* Results overlay */}
            {!running && score !== null ? (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "grid",
                  placeItems: "center",
                  padding: 18,
                }}
              >
                <div
                  style={{
                    background: "rgba(0,0,0,0.45)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    borderRadius: 18,
                    padding: 18,
                    width: "min(520px, 95%)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
                    <div style={{ fontWeight: 950, fontSize: 20, letterSpacing: -0.4 }}>Run complete</div>
                    <div style={{ opacity: 0.8 }}>Score: <b>{score}</b></div>
                  </div>
                  <div style={{ opacity: 0.85, marginTop: 8, lineHeight: 1.6 }}>
                    Max combo <b>{maxCombo}</b> · Hits <b>{hits}</b> · Misses <b>{misses}</b>
                  </div>
                  {status ? <div style={{ marginTop: 10, fontWeight: 900 }}>{status}</div> : null}
                </div>
              </div>
            ) : null}

            {!running && score === null ? (
              <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", opacity: 0.85 }}>
                Click <b>Start run</b>.
              </div>
            ) : null}
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            {status ? <div style={{ opacity: 0.9 }}>{status}</div> : null}
            {running ? <div style={{ opacity: 0.7, fontSize: 13 }}>Tap the glowing dot. Clicking empty space breaks combo.</div> : null}
          </div>

          {/* Daily quests (directive, not questions) */}
          <div style={{ opacity: 0.85, fontSize: 13, lineHeight: 1.7 }}>
            <b>Daily quests</b>
            <br />• Hit a 20x combo {questA ? "✓" : ""}
            <br />• Get 25 hits in one run {questB ? "✓" : ""}
            <br />• Finish with ≤ 3 misses (and 20+ hits) {questC ? "✓" : ""}
          </div>
        </div>
      </div>
    </div>
  );
}
