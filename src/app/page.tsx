import Link from "next/link";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Stack,
  Typography,
} from "@mui/material";

import { AppShell } from "./ui/AppShell";
import { MintMachineHero } from "./ui/MintMachineHero";

export default function Home() {
  return (
    <AppShell>
      <Container disableGutters>
        <Stack spacing={2.25}>
          <Stack spacing={0.75}>
            <Typography variant="h3" sx={{ fontWeight: 950, letterSpacing: -0.9, lineHeight: 1.05 }}>
              PAPER Protocol
            </Typography>
            <Typography sx={{ opacity: 0.85, maxWidth: 780 }}>
              Mine <b>$PAPER</b> by proving you understand markets.
            </Typography>
          </Stack>

          <MintMachineHero />

          {/* 3 big steps */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: 1.5,
            }}
          >
            <Card sx={{ border: "1px solid rgba(34,197,94,0.22)" }}>
              <CardContent>
                <Chip label="STEP 1" size="small" sx={{ fontWeight: 900, mb: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 950, letterSpacing: -0.6 }}>
                  Mine $PAPER
                </Typography>
                <Typography sx={{ opacity: 0.85, mt: 0.75, lineHeight: 1.55 }}>
                  Answer questions correctly. Earn claimable points. No wallet signatures during mining.
                </Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Chip label="STEP 2" size="small" sx={{ fontWeight: 900, mb: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 950, letterSpacing: -0.6 }}>
                  Climb the leaderboard
                </Typography>
                <Typography sx={{ opacity: 0.85, mt: 0.75, lineHeight: 1.55 }}>
                  Higher rank = more rewards when claiming goes live.
                </Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Chip label="STEP 3" size="small" sx={{ fontWeight: 900, mb: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 950, letterSpacing: -0.6 }}>
                  Buy & trade $PAPER
                </Typography>
                <Typography sx={{ opacity: 0.85, mt: 0.75, lineHeight: 1.55 }}>
                  Coming soon. We’ll only deploy the token on Base after explicit go‑live approval.
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Primary actions */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
            <Button component={Link} href="/mine" variant="contained" size="large" sx={{ fontWeight: 950 }}>
              Start mining
            </Button>
            <Button component={Link} href="/leaderboard" variant="outlined" size="large" sx={{ fontWeight: 900 }}>
              View leaderboard
            </Button>
            <Button component={Link} href="/token" variant="text" size="large" sx={{ fontWeight: 900 }}>
              $PAPER token
            </Button>
            <Button component={Link} href="/safety" variant="text" size="large" sx={{ fontWeight: 800, opacity: 0.9 }}>
              Safety
            </Button>
          </Stack>

          <Typography sx={{ opacity: 0.7, fontSize: 13, lineHeight: 1.7 }}>
            Hybrid mode: fun UI, serious rules. No seed phrases. No private keys.
          </Typography>
        </Stack>
      </Container>
    </AppShell>
  );
}
