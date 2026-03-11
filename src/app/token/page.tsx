import { AppShell } from "../ui/AppShell";

export default function TokenPage() {
  return (
    <AppShell>
      <h1 style={{ marginTop: 0 }}>$PAPER Token</h1>
      <p style={{ opacity: 0.85, maxWidth: 860 }}>
        Brand: <b>$PAPER</b>. Onchain token: <b>Paper Protocol (PAPER)</b> on Base.
      </p>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="kicker">Supply</div>
        <div className="cardTitle">1,000,000,000 PAPER</div>
        <div className="cardBody">Fixed supply. No taxes. No blacklist. No weird transfer rules.</div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="kicker">Distribution (v0 proposal)</div>
        <div className="cardTitle">70 / 20 / 10</div>
        <div className="cardBody">
          <ul>
            <li>70% — mining rewards treasury (claim-anytime)</li>
            <li>20% — community/tips/promotions</li>
            <li>10% — dev/ops (time-locked vesting)</li>
          </ul>
          We can set dev/ops to 0% if you want a pure-community launch.
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="kicker">Status</div>
        <div className="cardTitle">Not deployed yet</div>
        <div className="cardBody">
          Per policy: no onchain deployment without explicit “go live / deploy” approval.
        </div>
      </div>
    </AppShell>
  );
}
