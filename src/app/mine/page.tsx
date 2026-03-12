import { AppShell } from "../ui/AppShell";
import MineClient from "./MineClient";

export default function MinePage() {
  return (
    <AppShell>
      <h1 style={{ marginTop: 0 }}>Mine</h1>
      <p style={{ opacity: 0.85, maxWidth: 820 }}>
        Mining is offchain (no wallet signatures). You earn claimable PAPER points via deterministic challenges + verification.
      </p>

      <MineClient />
    </AppShell>
  );
}
