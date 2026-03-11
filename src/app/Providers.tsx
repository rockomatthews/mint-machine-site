"use client";

import { MuiProviders } from "./MuiProviders";
import { Web3Providers } from "./Web3Providers";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MuiProviders>
      <Web3Providers>{children}</Web3Providers>
    </MuiProviders>
  );
}
