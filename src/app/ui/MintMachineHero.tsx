"use client";

import dynamic from "next/dynamic";

// Keep three.js out of SSR to avoid build/runtime issues.
const MintMachine3D = dynamic(async () => (await import("./MintMachine3D")).MintMachine3D, {
  ssr: false,
});

export function MintMachineHero({ printing }: { printing?: boolean }) {
  return (
    <div style={{ marginTop: 10 }}>
      <MintMachine3D printing={!!printing} height={280} />
    </div>
  );
}
