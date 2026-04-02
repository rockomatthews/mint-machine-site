export function hash32(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const ADJ = [
  "Neon",
  "Cipher",
  "Spectre",
  "Vector",
  "Rogue",
  "Solar",
  "Midnight",
  "Chrome",
  "Quantum",
  "Ghost",
  "Nova",
  "Zero",
  "Ion",
  "Turbo",
  "Flux",
  "Vanta",
];

const NOUN = [
  "Operator",
  "Runner",
  "Miner",
  "Pilot",
  "Assembler",
  "Smith",
  "Agent",
  "Mechanic",
  "Courier",
  "Warden",
  "Drifter",
  "Spark",
  "Circuit",
  "Latch",
  "Hammer",
  "Needle",
];

export function codenameFromSessionId(sessionId: string) {
  const h = hash32(sessionId);
  const a = ADJ[h % ADJ.length];
  const b = NOUN[(Math.floor(h / 97) >>> 0) % NOUN.length];
  const tag = (h % 46656).toString(36).toUpperCase().padStart(3, "0");
  return `${a}_${b}_${tag}`;
}

export function avatarUrlFromSessionId(sessionId: string) {
  // Dicebear: stable, zero-setup
  const seed = encodeURIComponent(sessionId);
  return `https://api.dicebear.com/7.x/bottts/png?seed=${seed}&backgroundColor=0a0a0f&radius=50&size=128`;
}
