import React from "react";
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

import { avatarUrlFromSessionId, codenameFromSessionId } from "../../../_identity";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") || "";

  // Fetch run from our own API (best-effort)
  let run: any = null;
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL || `${req.nextUrl.protocol}//${req.nextUrl.host}`;
    const res = await fetch(`${base}/api/paper/run?id=${encodeURIComponent(id)}`, { cache: "no-store" });
    const j = await res.json();
    if (j?.ok) run = j.run;
  } catch {
    run = null;
  }

  const sessionId = String(run?.sessionId || run?.session_id || "unknown");
  const name = codenameFromSessionId(sessionId);
  const avatar = avatarUrlFromSessionId(sessionId);

  const score = Number(run?.meta?.score || 0);
  const maxCombo = Number(run?.meta?.maxCombo || 0);
  const hash = Number(run?.points || 0);

  const Card = (label: string, value: string, color?: string) =>
    React.createElement(
      "div",
      {
        style: {
          flex: 1,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: 28,
          padding: 26,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        },
      },
      React.createElement("div", { style: { opacity: 0.7, fontSize: 18 } }, label),
      React.createElement(
        "div",
        { style: { fontSize: 72, fontWeight: 950, color: color || "#E6E7E6" } },
        value
      )
    );

  return new ImageResponse(
    React.createElement(
      "div",
      {
        style: {
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 56,
          background:
            "radial-gradient(1200px 600px at 20% 0%, rgba(253,209,4,0.18), transparent 60%), radial-gradient(1100px 520px at 85% 20%, rgba(1,52,115,0.38), transparent 55%), #141517",
          color: "#E6E7E6",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial",
        },
      },
      React.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 18 } },
        React.createElement("img", { src: avatar, width: 92, height: 92, style: { borderRadius: 26 } } as any),
        React.createElement(
          "div",
          { style: { display: "flex", flexDirection: "column" } },
          React.createElement("div", { style: { opacity: 0.75, fontSize: 20, letterSpacing: 2 } }, "RUN CARD"),
          React.createElement("div", { style: { fontSize: 46, fontWeight: 900, letterSpacing: -1 } }, name)
        )
      ),
      React.createElement(
        "div",
        { style: { display: "flex", gap: 18 } },
        Card("Score", String(score), "#FDD104"),
        Card("Hash earned", String(hash)),
        Card("Max combo", String(maxCombo))
      ),
      React.createElement(
        "div",
        { style: { display: "flex", justifyContent: "space-between", opacity: 0.75, fontSize: 18 } },
        React.createElement("div", null, "Mint Machine"),
        React.createElement("div", null, `#${id.slice(0, 10).toUpperCase()}`)
      )
    ),
    { width: 1200, height: 630 }
  );
}
