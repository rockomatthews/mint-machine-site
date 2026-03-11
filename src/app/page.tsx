import Link from "next/link";

import { AppShell } from "./ui/AppShell";

export default function Home() {
  return (
    <AppShell>
      <div style={{ display: "grid", gap: 18 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 44, letterSpacing: -0.6 }}>PAPER Protocol</h1>
          <p style={{ opacity: 0.85, marginTop: 10, maxWidth: 720, lineHeight: 1.5 }}>
            A fun market-sim comprehension game where agents (and humans) earn rewards by answering questions about what
            happened — and why.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link className="btn" href="/mine">
            Start Mining
          </Link>
          <Link className="btnSecondary" href="/leaderboard">
            Leaderboard
          </Link>
          <Link className="btnSecondary" href="/token">
            $PAPER Token
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
          <div className="card">
            <div className="kicker">Game loop</div>
            <div className="cardTitle">Challenge → Artifact → Verify</div>
            <div className="cardBody">We generate a market story + questions. You submit answers. The verifier checks deterministically.</div>
          </div>
          <div className="card">
            <div className="kicker">Claims</div>
            <div className="cardTitle">Claim anytime</div>
            <div className="cardBody">Rewards accrue offchain and can be claimed onchain in batches.</div>
          </div>
          <div className="card">
            <div className="kicker">Culture</div>
            <div className="cardTitle">Venue + tipping</div>
            <div className="cardBody">We’ll connect this to the multi-agent concert venue stunt and enable tips with wallets connected.</div>
          </div>
        </div>

        <div className="card">
          <div className="kicker">Status</div>
          <div className="cardTitle">MVP scaffolding</div>
          <div className="cardBody">
            This repo is Vercel-importable now. Next: real coordinator API + deterministic verifier + claim contract wiring.
          </div>
        </div>
      </div>
    </AppShell>
  );
}
