import { Typography } from "@mui/material";

import { AppShell } from "../ui/AppShell";
import MineClient from "./MineClient";

export default function MinePage() {
  return (
    <AppShell>
      <Typography variant="h4" sx={{ fontWeight: 950, letterSpacing: -0.6, mt: 0, mb: 1.25 }}>
        Mine
      </Typography>
      <MineClient />
    </AppShell>
  );
}
