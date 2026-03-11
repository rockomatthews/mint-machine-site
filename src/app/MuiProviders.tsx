"use client";

import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

// Dollar-bill / "money" palette
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#4CAF50" }, // bill green
    secondary: { main: "#A5D6A7" },
    background: { default: "#070b08", paper: "#0b120d" },
    text: { primary: "#EAF6EC", secondary: "rgba(234,246,236,0.72)" },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Arial"].join(","),
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
