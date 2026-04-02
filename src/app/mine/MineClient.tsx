"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";

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

function lockBodyScroll(lock: boolean) {
  if (typeof document === "undefined") return;
  if (lock) {
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
  } else {
    document.body.style.overflow = "";
    document.body.style.touchAction = "";
  }
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
    window.setTimeout(() => setPrinting(false), 500);

    // Clear any previous canvas
    mountRef.current.innerHTML = "";

    const Phaser = (await import("phaser")).default;
    const { createRunnerGame } = await import("../../game/runner");

    setRunning(true);
    lockBodyScroll(true);
    setStatus("");
    setScore(0);

    const w = Math.min(980, Math.max(320, mountRef.current.clientWidth));
    const h = Math.round(w * 0.62);

    gameRef.current = await createRunnerGame(
      Phaser as any,
      mountRef.current,
      { seed: challenge.seed, width: w, height: h },
      {
        onScore: (s) => setScore(s),
        onGameOver: async (finalScore) => {
          setRunning(false);
          lockBodyScroll(false);

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
            if (runId) setStatus(`+${gained} hash · /run/${String(runId)}`);
            else setStatus(`+${gained} hash`);
            await refreshMe();
            await newChallenge();
          } catch {
            setStatus("Submit failed");
          }
        },
      }
    );
  }

  function stop() {
    try {
      gameRef.current?.destroy(true);
    } catch {}
    gameRef.current = null;
    setRunning(false);
    lockBodyScroll(false);
  }

  useEffect(() => {
    refreshMe();
    newChallenge();
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // mobile-first: keep controls big and stacked
  const runLink = status.includes("/run/") ? status.slice(status.indexOf("/run/")) : null;

  return (
    <Stack spacing={2}>
      <MintMachineHero printing={printing} />

      <Card>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline">
            <Box>
              <Typography variant="overline" sx={{ opacity: 0.75 }}>
                Your hash
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 950, lineHeight: 1 }}>
                {points}
              </Typography>
            </Box>
            <Button component={Link} href="/leaderboard" variant="outlined" size="large" sx={{ fontWeight: 900 }}>
              Leaderboard
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="baseline">
              <Typography variant="h6" sx={{ fontWeight: 950 }}>
                Cyber Factory Runner
              </Typography>
              <Typography sx={{ opacity: 0.8, fontSize: 13 }}>
                Tap / Space to jump
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography sx={{ opacity: 0.9 }}>
                Score: <b>{score}</b>
              </Typography>

              {!running ? (
                <Button variant="contained" color="primary" size="large" onClick={start} sx={{ fontWeight: 950 }}>
                  Start run
                </Button>
              ) : (
                <Button variant="outlined" color="warning" size="large" onClick={stop} sx={{ fontWeight: 950 }}>
                  Stop
                </Button>
              )}
            </Stack>

            <Box
              ref={mountRef}
              sx={{
                width: "100%",
                borderRadius: 3,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.10)",
                background:
                  "radial-gradient(900px 420px at 20% 0%, rgba(253,209,4,0.08), transparent 60%), radial-gradient(900px 420px at 85% 20%, rgba(1,52,115,0.20), transparent 55%), rgba(255,255,255,0.04)",
                minHeight: { xs: 260, sm: 360 },
              }}
            />

            {status ? (
              <Typography sx={{ opacity: 0.92 }}>
                {runLink ? (
                  <>
                    {status.replace(runLink, "")}
                    <Link href={runLink} style={{ fontWeight: 950 }}>
                      {runLink}
                    </Link>
                  </>
                ) : (
                  status
                )}
              </Typography>
            ) : null}

            <Typography sx={{ opacity: 0.7, fontSize: 13, lineHeight: 1.7 }}>
              Assets: Kenney Platformer Pack Industrial (CC0). Engine: Phaser (MIT).
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
