"use client";

import Link from "next/link";
import Image from "next/image";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 5,
          backdropFilter: "blur(10px)",
          background: "rgba(7, 9, 13, 0.65)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Link href="/" style={{ fontWeight: 800, letterSpacing: -0.2, display: "flex", alignItems: "center", gap: 10 }}>
              <Image src="/logo.png" alt="Mint Machine" width={28} height={28} priority style={{ borderRadius: 8 }} />
              Mint Machine
            </Link>
            <nav style={{ display: "flex", gap: 12, opacity: 0.9 }}>
              <Link href="/mine">Mine</Link>
              <Link href="/leaderboard">Leaderboard</Link>
              <Link href="/profile">Profile</Link>
            </nav>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 16px" }}>{children}</main>

      <footer style={{ maxWidth: 1100, margin: "0 auto", padding: "30px 16px", opacity: 0.7, fontSize: 13 }}>
        Mint Machine — arcade mining. Wallet connect + onchain claim comes later.
      </footer>
    </div>
  );
}
