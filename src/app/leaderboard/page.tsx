import Link from "next/link";
import { Box, Chip, Stack, Typography } from "@mui/material";

import { AppShell } from "../ui/AppShell";
import LeaderboardClient from "./LeaderboardClient";

const PRIZE_UNLOCK_MC_USD = 50_000_000;
const PRIZE_UNLOCK_DAYS = 7;

function fmtUsd(n: number) {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(0)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}

export default function LeaderboardPage() {
  return (
    <AppShell>
      <Stack spacing={1.25}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }} justifyContent="space-between">
          <Typography variant="h4" sx={{ fontWeight: 950, letterSpacing: -0.6 }}>
            Leaderboard
          </Typography>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
            <Chip
              label={`Grand Prize: Lamborghini (LOCKED)`}
              color="warning"
              variant="outlined"
              sx={{ fontWeight: 900, borderColor: "rgba(253,209,4,0.55)" }}
            />
            <Typography sx={{ opacity: 0.75, fontSize: 13 }}>
              Unlocks when MC ≥ <b>{fmtUsd(PRIZE_UNLOCK_MC_USD)}</b> for <b>{PRIZE_UNLOCK_DAYS}</b> days. <Link href="/prize">Rules</Link>
            </Typography>
          </Box>
        </Stack>

        <LeaderboardClient />
      </Stack>
    </AppShell>
  );
}
