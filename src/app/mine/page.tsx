import { AppShell } from "../ui/AppShell";
import MineClient from "./MineClient";

export default function MinePage() {
  return (
    <AppShell>
      <h1 style={{ marginTop: 0 }}>Mine</h1>
      <MineClient />
    </AppShell>
  );
}
