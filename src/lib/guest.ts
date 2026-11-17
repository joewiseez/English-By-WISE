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
