"use client";

import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#f5b041" },
    background: { default: "#07090d", paper: "#0b0f17" },
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
