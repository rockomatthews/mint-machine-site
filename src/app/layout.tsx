import type { Metadata } from "next";

import "./globals.css";
import { Providers } from "./Providers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL("https://paperprotocol.xyz"),
  title: "PAPER Protocol — Mine by Playing",
  description: "Fun market-sim comprehension mining. Earn $PAPER, tip creators, and build the arena.",
  openGraph: {
    title: "PAPER Protocol",
    description: "Fun market-sim comprehension mining. Earn $PAPER, tip creators, and build the arena.",
    url: "https://paperprotocol.xyz",
    siteName: "PAPER Protocol",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PAPER Protocol",
    description: "Fun market-sim comprehension mining. Earn $PAPER, tip creators, and build the arena.",
    images: ["/og.png"],
  },
  icons: {
    icon: [{ url: "/favicon-32.png" }, { url: "/favicon-16.png" }],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
