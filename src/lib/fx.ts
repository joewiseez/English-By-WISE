// Efek kecil: suara, konfeti, dan tombol senyap. Semuanya berjalan di browser dan gagal diam-diam.
const MUTE = "ebw-mute";
export const isMuted = () => { try { return localStorage.getItem(MUTE) === "1"; } catch { return false; } };
export const setMuted = (m: boolean) => { try { localStorage.setItem(MUTE, m ? "1" : "0"); } catch { /* abaikan */ } };

const NOTES: Record<"ok" | "no" | "done", [number, number][]> = {
  ok: [[660, 0], [880, 0.09]],
  no: [[220, 0], [180, 0.11]],
  done: [[523, 0], [659, 0.1], [784, 0.2], [1047, 0.3]],
};
let ctx: AudioContext | undefined;
export function sfx(kind: "ok" | "no" | "done") {
  if (isMuted()) return;
  try {
    const c = (ctx = ctx ?? new AudioContext());
    NOTES[kind].forEach(([hz, at]) => {
      const o = c.createOscillator(), g = c.createGain(), t = c.currentTime + at;
      o.type = kind === "no" ? "triangle" : "sine";
      o.frequency.value = hz;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.14, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      o.connect(g); g.connect(c.destination);
      o.start(t); o.stop(t + 0.25);
    });
  } catch { /* browser tanpa audio */ }
}

export function burst() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const w = document.createElement("div");
  w.className = "conf";
  w.setAttribute("aria-hidden", "true");
  const colors = ["#14213D", "#FFC845", "#7C88A3", "#E3D6BC"];
  for (let i = 0; i < 30; i++) {
    const e = document.createElement("i");
    e.style.cssText = `left:${Math.random() * 100}%;background:${colors[i % 4]};animation-delay:${Math.random() * 0.4}s;animation-duration:${1.4 + Math.random()}s;rotate:${Math.random() * 360}deg`;
    w.appendChild(e);
  }
  document.body.appendChild(w);
  setTimeout(() => w.remove(), 2800);
}
