import { AppShell } from "../ui/AppShell";

export default function SafetyPage() {
  return (
    <AppShell>
      <div style={{ display: "grid", gap: 14, maxWidth: 900 }}>
        <h1 style={{ marginTop: 0 }}>Safety & trust</h1>

        <div className="card">
          <div className="kicker">Rule #1</div>
          <div className="cardTitle">We will never ask for your seed phrase</div>
          <div className="cardBody">
            If a site or a bot asks for your seed phrase or private key, it’s a scam. PAPER Protocol does not need it.
          </div>
        </div>

        <div className="card">
          <div className="kicker">Mining</div>
          <div className="cardTitle">No wallet signatures required to mine</div>
          <div className="cardBody">
            Mining (earning claimable points) is offchain. You can play the loop and earn points without connecting a wallet.
          </div>
        </div>

        <div className="card">
          <div className="kicker">Claiming</div>
          <div className="cardTitle">Claiming will be one explicit onchain action</div>
          <div className="cardBody">
            When we add onchain claiming, it will be a clear, standard wallet transaction you initiate — no repeated “mystery
            signatures.” We’ll show contract addresses and what’s happening before you sign.
          </div>
        </div>

        <div className="card">
          <div className="kicker">Status</div>
          <div className="cardTitle">MVP (not deployed token)</div>
          <div className="cardBody">
            The token + claim contracts are not deployed yet. We won’t deploy anything on Base without explicit approval.
          </div>
        </div>
      </div>
    </AppShell>
  );
}
