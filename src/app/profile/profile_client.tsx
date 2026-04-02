"use client";

import Image from "next/image";
import { useMemo, useState, useEffect } from "react";
import { Box, Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";

import { avatarUrlFromSessionId, codenameFromSessionId } from "../_identity";

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

const PRESET_STYLES = [
  "bottts",
  "open-peeps",
  "micah",
  "identicon",
  "big-ears-neutral",
  "big-smile",
  "adventurer",
  "lorelei",
];

function presetAvatar(style: string, seed: string) {
  const s = encodeURIComponent(seed);
  return `https://api.dicebear.com/7.x/${style}/png?seed=${s}&backgroundColor=0a0a0f&radius=50&size=256`;
}

export default function ProfileClient() {
  const sessionId = useMemo(() => getSessionId(), []);

  const defaultName = useMemo(() => codenameFromSessionId(sessionId), [sessionId]);
  const defaultAvatar = useMemo(() => avatarUrlFromSessionId(sessionId), [sessionId]);

  const [username, setUsername] = useState(defaultName);
  const [avatarUrl, setAvatarUrl] = useState(defaultAvatar);
  const [status, setStatus] = useState<string>("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setStatus("");
    const res = await fetch(`/api/profile/get?sessionId=${encodeURIComponent(sessionId)}`);
    const j = await res.json().catch(() => null);
    if (!res.ok || !j?.ok) {
      setStatus("Profile backend not ready.");
      return;
    }

    const p = j.profile || {};
    if (p.username) setUsername(p.username);
    if (p.avatar_url) setAvatarUrl(p.avatar_url);
  }

  async function save() {
    setSaving(true);
    setStatus("");
    const res = await fetch("/api/profile/set", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, username, avatarUrl }),
    });
    const j = await res.json().catch(() => null);
    setSaving(false);

    if (!res.ok || !j?.ok) {
      setStatus("Could not save.");
      return;
    }

    setStatus("Saved.");
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Stack spacing={2} sx={{ maxWidth: 820 }}>
      <Stack spacing={0.5}>
        <Typography variant="h4" sx={{ fontWeight: 950, letterSpacing: -0.6 }}>
          Profile
        </Typography>
        <Typography sx={{ opacity: 0.8 }}>
          Optional. If you don’t set this, we’ll keep using a generated operator name.
        </Typography>
      </Stack>

      <Card>
        <CardContent>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
            <Image src={avatarUrl} alt={username} width={84} height={84} style={{ borderRadius: 24 }} />

            <Box sx={{ flex: 1 }}>
              <TextField
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                fullWidth
                inputProps={{ maxLength: 24 }}
              />
              <Typography sx={{ opacity: 0.7, fontSize: 12, mt: 0.75 }}>
                Allowed: letters, numbers, space, _ and - (max 24)
              </Typography>
            </Box>

            <Button onClick={save} variant="contained" color="primary" size="large" disabled={saving} sx={{ fontWeight: 950 }}>
              Save
            </Button>
          </Stack>

          {status ? <Typography sx={{ mt: 1.25, opacity: 0.85 }}>{status}</Typography> : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 950, mb: 1 }}>
            Choose an avatar
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "repeat(4, 1fr)", sm: "repeat(8, 1fr)" },
              gap: 1,
            }}
          >
            {PRESET_STYLES.map((style) => {
              const url = presetAvatar(style, sessionId);
              const selected = url === avatarUrl;
              return (
                <button
                  key={style}
                  onClick={() => setAvatarUrl(url)}
                  style={{
                    padding: 0,
                    borderRadius: 18,
                    border: selected ? "2px solid rgba(253,209,4,0.85)" : "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.04)",
                    cursor: "pointer",
                    overflow: "hidden",
                  }}
                  aria-label={style}
                >
                  <Image src={url} alt={style} width={96} height={96} style={{ width: "100%", height: "auto", display: "block" }} />
                </button>
              );
            })}
          </Box>
        </CardContent>
      </Card>
    </Stack>
  );
}
