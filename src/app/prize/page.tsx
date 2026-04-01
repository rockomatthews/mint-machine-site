import Link from "next/link";
import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";

import { AppShell } from "../ui/AppShell";

const PRIZE_UNLOCK_MC_USD = 50_000_000;
const PRIZE_UNLOCK_DAYS = 7;

function fmtUsd(n: number) {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(0)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}

export default function PrizePage() {
  return (
    <AppShell>
      <Stack spacing={1.5}>
        <Stack spacing={0.5}>
          <Typography variant="h4" sx={{ fontWeight: 950, letterSpacing: -0.6 }}>
            Prize
          </Typography>
          <Typography sx={{ opacity: 0.85, maxWidth: 860 }}>
            One big, simple idea: when Mint Machine has <b>plenty of market cap</b>, we do real giveaways.
          </Typography>
        </Stack>

        <Card>
          <CardContent>
            <Stack spacing={1}>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                <Chip label="Grand Prize" color="warning" sx={{ fontWeight: 950 }} />
                <Typography variant="h6" sx={{ fontWeight: 950 }}>
                  Lamborghini (LOCKED)
                </Typography>
              </Box>

              <Typography sx={{ opacity: 0.9 }}>
                Unlock condition: Market cap ≥ <b>{fmtUsd(PRIZE_UNLOCK_MC_USD)}</b> for <b>{PRIZE_UNLOCK_DAYS}</b> consecutive days.
              </Typography>

              <Typography sx={{ opacity: 0.78, lineHeight: 1.65 }}>
                Winner selection (when unlocked):
                <br />• Competition window: 7 days
                <br />• Winner: highest <b>verified hash</b>
                <br />• Anti-bot: suspicious patterns are disqualified
              </Typography>

              <Typography sx={{ opacity: 0.72, fontSize: 13, lineHeight: 1.7 }}>
                Notes: This page is rules-only. No popups, no spam. Final prize logistics and eligibility may vary by region.
              </Typography>

              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Link href="/leaderboard">Back to leaderboard</Link>
                <span style={{ opacity: 0.55 }}>|</span>
                <Link href="/mine">Start a run</Link>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </AppShell>
  );
}
