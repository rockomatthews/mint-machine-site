import Link from "next/link";
import { Box, Button, Card, CardContent, Chip, Container, Stack, Typography } from "@mui/material";

import { AppShell } from "./ui/AppShell";
import { MintMachineHero } from "./ui/MintMachineHero";

export default function Home() {
  return (
    <AppShell>
      <Container disableGutters>
        <Stack spacing={2.25}>
          <Stack spacing={0.75}>
            <Typography variant="h3" sx={{ fontWeight: 950, letterSpacing: -0.9, lineHeight: 1.05 }}>
              Mint Machine
            </Typography>
            <Typography sx={{ opacity: 0.86, maxWidth: 780 }}>
              Start a run. Stop in the window. Earn hash.
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
            <Card>
              <CardContent>
                <Chip label="STEP 1" size="small" sx={{ fontWeight: 900, mb: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 950, letterSpacing: -0.6 }}>
                  Play
                </Typography>
                <Typography sx={{ opacity: 0.85, mt: 0.75, lineHeight: 1.55 }}>
                  Tap <b>Start</b>, then <b>Stop</b> inside the green window.
                </Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Chip label="STEP 2" size="small" sx={{ fontWeight: 900, mb: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 950, letterSpacing: -0.6 }}>
                  Earn
                </Typography>
                <Typography sx={{ opacity: 0.85, mt: 0.75, lineHeight: 1.55 }}>
                  Your score converts to <b>hash</b>. Higher skill = higher hash.
                </Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Chip label="STEP 3" size="small" sx={{ fontWeight: 900, mb: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 950, letterSpacing: -0.6 }}>
                  Compete
                </Typography>
                <Typography sx={{ opacity: 0.85, mt: 0.75, lineHeight: 1.55 }}>
                  Climb the leaderboard. Prizes unlock later when the project is big enough.
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Primary actions */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
            <Button component={Link} href="/mine" variant="contained" size="large" sx={{ fontWeight: 950 }}>
              Start run
            </Button>
            <Button component={Link} href="/leaderboard" variant="outlined" size="large" sx={{ fontWeight: 900 }}>
              Leaderboard
            </Button>
            <Button component={Link} href="/prize" variant="text" size="large" sx={{ fontWeight: 900 }}>
              Prize
            </Button>
          </Stack>

          <Typography sx={{ opacity: 0.7, fontSize: 13, lineHeight: 1.7 }}>
            No seed phrases. No private keys. Wallet connect + onchain claim comes later.
          </Typography>
        </Stack>
      </Container>
    </AppShell>
  );
}
