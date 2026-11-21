// Progres tamu disimpan di browser: { idPelajaran: skorTerbaik }.
const K = "ebw-guest";
export function readGuest(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(K) || "{}"); } catch { return {}; }
}
export function writeGuest(id: string, score: number) {
  try { const g = readGuest(); g[id] = Math.max(g[id] ?? 0, score); localStorage.setItem(K, JSON.stringify(g)); } catch { /* penyimpanan dimatikan */ }
}
export function clearGuest() {
  try { localStorage.removeItem(K); } catch { /* abaikan */ }
}

// Kata yang salah dijawab: { inggris: { id: artiIndonesia, n: sisaJawabanBenarYangDibutuhkan } }.
// shortcut: hanya tersimpan di perangkat ini (tidak masuk akun); pindahkan ke tabel Supabase bila perlu lintas perangkat.
export type Miss = Record<string, { id: string; n: number }>;
const M = "ebw-miss";
export function readMiss(): Miss {
  try { return JSON.parse(localStorage.getItem(M) || "{}"); } catch { return {}; }
}
export function markMiss(en: string, id: string, ok: boolean) {
  try {
    const m = readMiss();
    const n = ok ? (m[en]?.n ?? 0) - 1 : 2; // salah: perlu 2 jawaban benar untuk lulus dari daftar ulang
    if (n > 0) m[en] = { id, n }; else delete m[en];
    localStorage.setItem(M, JSON.stringify(m));
  } catch { /* penyimpanan dimatikan */ }
}
