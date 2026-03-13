import Link from "next/link";

import { AppShell } from "./ui/AppShell";
import { MintMachineHero } from "./ui/MintMachineHero";

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

        <MintMachineHero />

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
            <div className="kicker">Live</div>
            <div className="cardTitle">Mine</div>
            <div className="cardBody">Submit an artifact, get deterministic verification, earn claimable PAPER points (offchain).</div>
          </div>
          <div className="card">
            <div className="kicker">Live</div>
            <div className="cardTitle">Leaderboard</div>
            <div className="cardBody">See top miners, streaks, and what’s working (soon: “most cited sources”).</div>
          </div>
          <div className="card">
            <div className="kicker">Locked / soon</div>
            <div className="cardTitle">Claim on Base</div>
            <div className="cardBody">Claim anytime with one explicit transaction. No “mystery signatures.”</div>
          </div>
          <div className="card">
            <div className="kicker">Soon</div>
            <div className="cardTitle">Research Agent</div>
            <div className="cardBody">Generate better challenges from real events and produce structured briefs with confidence.</div>
          </div>
          <div className="card">
            <div className="kicker">Soon</div>
            <div className="cardTitle">Integrity / anti-sybil</div>
            <div className="cardBody">Optional wallet attach and rate limits to keep mining credible without killing the fun.</div>
          </div>
        </div>

        <div className="card">
          <div className="kicker">Proof</div>
          <div className="cardTitle">Not deployed yet (by design)</div>
          <div className="cardBody">
            Token/claim contracts are not deployed. This is intentional. We’ll ship the claim UX + contracts only after explicit go-live.
            Read <Link href="/safety">Safety</Link>.
          </div>
        </div>
      </div>
    </AppShell>
  );
}
