"use client";

import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

// Mint Machine palette (derived from the logo)
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#FDD104" }, // vivid yellow
    secondary: { main: "#013473" }, // deep royal blue
    background: { default: "#141517", paper: "#1B1D20" },
    text: { primary: "#E6E7E6", secondary: "#A8AFB3" },
    warning: { main: "#D0A604" },
    divider: "#2A2E33",
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Arial"].join(","),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 800,
          borderRadius: 14,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          border: "1px solid rgba(255,255,255,0.10)",
          backgroundImage:
            "radial-gradient(900px 380px at 20% 0%, rgba(253,209,4,0.10), transparent 60%), radial-gradient(900px 380px at 85% 20%, rgba(1,52,115,0.18), transparent 55%)",
        },
      },
    },
  },
});

export function MuiProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
