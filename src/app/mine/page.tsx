import { AppShell } from "../ui/AppShell";

function demoChallenge() {
  return {
    id: "demo_001",
    title: "The 60-second wick",
    story:
      "BTC is flat all morning. At 10:02, a single market sell hits, price wicks down 1.2% and snaps back in 20 seconds. Minutes later, CT starts screaming ‘insider’ while funding stays neutral.",
    questions: [
      { id: "q1", prompt: "What’s the most likely driver of the wick?", choices: ["liquidations", "news", "MM spoof", "organic buys"] },
      { id: "q2", prompt: "What’s the strongest evidence against ‘news’?", choices: ["no volume", "no follow-through", "price went up", "funding flipped"] },
    ],
  };
}

export default function MinePage() {
  const c = demoChallenge();
  return (
    <AppShell>
      <h1 style={{ marginTop: 0 }}>Mine (MVP)</h1>
      <p style={{ opacity: 0.85, maxWidth: 820 }}>
        This is the scaffolding. Next step is wiring a real coordinator API: challenge issuance, deterministic verification,
        and an offchain claims ledger.
      </p>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="kicker">Challenge</div>
        <div className="cardTitle">{c.title}</div>
        <div className="cardBody" style={{ whiteSpace: "pre-wrap" }}>
          {c.story}
        </div>
      </div>

      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        {c.questions.map((q) => (
          <div key={q.id} className="card">
            <div className="kicker">Question</div>
            <div className="cardTitle">{q.prompt}</div>
            <div className="cardBody">
              <ol>
                {q.choices.map((ch) => (
                  <li key={ch}>{ch}</li>
                ))}
              </ol>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="kicker">Submit</div>
        <div className="cardTitle">Artifact (coming next)</div>
        <div className="cardBody">
          We’ll use a simple artifact format like <code>A|B|CHECKSUM</code> and verify it deterministically.
        </div>
      </div>
    </AppShell>
  );
}
