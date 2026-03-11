"use client";

import "@rainbow-me/rainbowkit/styles.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { base } from "wagmi/chains";
import { useMemo } from "react";

const queryClient = new QueryClient();

// WalletConnect Cloud project id is public (not a secret). We default to the workspace id so Vercel imports build cleanly.
const wcProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "e442eaaa1d55a9f4a094cccd35c0d0ad";

export function Web3Providers({ children }: { children: React.ReactNode }) {
  // Avoid any wallet config initialization during server prerender.
  if (typeof window === "undefined") return <>{children}</>;

  const wagmiConfig = useMemo(() => {
    return getDefaultConfig({
      appName: "PAPER Protocol",
      projectId: wcProjectId,
      chains: [base],
      ssr: false,
    });
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
