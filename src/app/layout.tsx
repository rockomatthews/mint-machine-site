import type { Metadata } from "next";

import "./globals.css";
import { Providers } from "./Providers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL("https://mint-machine-site.vercel.app"),
  title: "Mint Machine — Arcade Mining",
  description: "Start a run. Stop in the window. Earn hash.",
  openGraph: {
    title: "Mint Machine",
    description: "Start a run. Stop in the window. Earn hash.",
    url: "https://mint-machine-site.vercel.app",
    siteName: "Mint Machine",
    images: [{ url: "/ChatGPT%20Image%20Mar%2031%2C%202026%2C%2006_07_38%20PM.png", width: 1024, height: 1024 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mint Machine",
    description: "Start a run. Stop in the window. Earn hash.",
    images: ["/ChatGPT%20Image%20Mar%2031%2C%202026%2C%2006_07_38%20PM.png"],
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
