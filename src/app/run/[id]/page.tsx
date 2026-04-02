import type { Metadata } from "next";
import Image from "next/image";

import { AppShell } from "../../ui/AppShell";
import { avatarUrlFromSessionId, codenameFromSessionId } from "../../_identity";

export const dynamic = "force-dynamic";

type Run = {
  id: string;
  sessionId: string;
  points: number;
  verdict: string;
  meta: any;
  createdAt?: string;
};

async function getRun(id: string): Promise<Run | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/paper/run?id=${encodeURIComponent(id)}`, {
    cache: "no-store",
  }).catch(() => null);
  if (!res || !res.ok) return null;
  const j = await res.json().catch(() => null);
  if (!j?.ok) return null;
  return j.run as Run;
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const id = params.id;
  const title = `Run Card #${id.slice(0, 6).toUpperCase()}`;
  const site = process.env.NEXT_PUBLIC_SITE_URL || "";
  const og = site ? `${site}/api/og/run?id=${encodeURIComponent(id)}` : `/api/og/run?id=${encodeURIComponent(id)}`;
  return {
    title,
    openGraph: {
      title,
      images: [{ url: og, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      images: [og],
    },
  };
}

export default async function RunPage({ params }: { params: { id: string } }) {
  const run = await getRun(params.id);

  if (!run) {
    return (
      <AppShell>
        <h1 style={{ marginTop: 0 }}>Run not found</h1>
      </AppShell>
    );
  }

  const name = codenameFromSessionId(run.sessionId);
  const avatar = avatarUrlFromSessionId(run.sessionId);

  const score = Number(run?.meta?.score || 0);
  const maxCombo = Number(run?.meta?.maxCombo || 0);
  const hits = Number(run?.meta?.hits || 0);
  const misses = Number(run?.meta?.misses || 0);

  return (
    <AppShell>
      <div className="card" style={{ maxWidth: 780 }}>
        <div className="cardBody" style={{ display: "grid", gap: 14 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Image src={avatar} alt={name} width={52} height={52} style={{ borderRadius: 16 }} />
            <div>
              <div style={{ opacity: 0.75, fontSize: 12 }}>RUN CARD</div>
              <div style={{ fontWeight: 950, letterSpacing: -0.3, fontSize: 20 }}>{name}</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 12 }}>
            <div className="card" style={{ margin: 0 }}>
              <div className="cardBody">
                <div className="kicker">Score</div>
                <div style={{ fontSize: 34, fontWeight: 950, lineHeight: 1 }}>{score}</div>
              </div>
            </div>
            <div className="card" style={{ margin: 0 }}>
              <div className="cardBody">
                <div className="kicker">Hash earned</div>
                <div style={{ fontSize: 34, fontWeight: 950, lineHeight: 1 }}>{run.points}</div>
              </div>
            </div>
          </div>

          <div style={{ opacity: 0.9, lineHeight: 1.8 }}>
            Max combo: <b>{maxCombo}</b> · Hits: <b>{hits}</b> · Misses: <b>{misses}</b>
          </div>

          <div style={{ opacity: 0.65, fontSize: 13 }}>
            Run id: <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace" }}>{run.id}</span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
