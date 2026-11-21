"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { Lesson } from "@/lib/content";
import { saveProgress } from "@/app/belajar/actions";
import { markMiss, writeGuest } from "@/lib/guest";
import { burst, isMuted, setMuted, sfx } from "@/lib/fx";

type Pick = { k: "ch" | "fi"; q: string; a: string; o: string[]; h?: string };
type Ord = { k: "or"; en: string; id: string };
type Ex = Pick | Ord;

function shuf<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
}
function say(t: string) {
  try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = "en-US"; u.rate = 0.85; speechSynthesis.speak(u); } catch { /* browser tanpa suara */ }
}
function build(l: Lesson, quiz: boolean, focus?: [string, string][]): Ex[] {
  if (focus) { // sesi ulang: hanya kata yang pernah salah, pengecoh dari seluruh kosa kata
    return shuf(focus).slice(0, 10).map((w) => ({ k: "ch", q: w[0], a: w[1], o: shuf([w[1], ...shuf(l.v.filter((x) => x[1] !== w[1])).slice(0, 2).map((x) => x[1])]) }));
  }
  if (quiz) {
    const dist = (w: [string, string]) => shuf([w[1], ...shuf(l.v.filter((x) => x !== w)).slice(0, 2).map((x) => x[1])]);
    const ch: Ex[] = shuf(l.v).slice(0, 8).map((w) => ({ k: "ch", q: w[0], a: w[1], o: dist(w) }));
    const fi: Ex[] = shuf(l.f).slice(0, 3).map((f) => ({ k: "fi", q: f[0], a: f[1], o: shuf(f[2]), h: f[3] }));
    const or: Ex[] = shuf(l.o).slice(0, 3).map((o) => ({ k: "or", en: o[0], id: o[1] }));
    return shuf([...ch, ...fi, ...or]);
  }
  const pool = l.v.length > 10 ? shuf(l.v).slice(0, 10) : l.v;
  const ch: Ex[] = pool.map((w) => ({ k: "ch", q: w[0], a: w[1], o: shuf([w[1], ...shuf(l.v.filter((x) => x !== w)).slice(0, 2).map((x) => x[1])]) }));
  const fi: Ex[] = l.f.map((f) => ({ k: "fi", q: f[0], a: f[1], o: shuf(f[2]), h: f[3] }));
  const or: Ex[] = (l.ph ? shuf(l.v).slice(0, 3) : l.o).map((o) => ({ k: "or", en: o[0], id: o[1] }));
  return [...ch, ...fi, ...or];
}

function Choice({ x, onAnswer }: { x: Pick; onAnswer: (ok: boolean) => void }) {
  const [p, setP] = useState<string | null>(null);
  return (
    <div>
      {x.k === "ch" ? (
        <div className="mb-5 flex items-center gap-3">
          <p className="font-display text-3xl font-semibold">{x.q}</p>
          <button type="button" className="chip" aria-label={`Dengarkan ${x.q}`} onClick={() => say(x.q)}>Dengar</button>
        </div>
      ) : (
        <>
          <p className="mb-1 font-display text-2xl font-semibold">{x.q}</p>
          <p className="mb-5 text-navy/70">{x.h}</p>
        </>
      )}
      <div className="grid gap-3">
        {x.o.map((o) => {
          const st = p === null ? "hover:border-navy" : o === x.a ? "border-emerald-700 bg-emerald-50" : o === p ? "border-red-700 bg-red-50" : "";
          return (
            <button key={o} type="button" disabled={p !== null} className={`rounded-2xl border-2 border-b-4 border-cream px-4 py-3 text-left font-bold ${st}`}
              onClick={() => { setP(o); if (x.k === "fi" && o === x.a) say(x.q.replace("___", x.a)); onAnswer(o === x.a); }}>{o}</button>
          );
        })}
      </div>
    </div>
  );
}

function Order({ x, onAnswer }: { x: Ord; onAnswer: (ok: boolean) => void }) {
  const [bank, setBank] = useState(() => shuf(x.en.split(" ").map((w, i) => ({ w, i }))));
  const [ans, setAns] = useState<{ w: string; i: number }[]>([]);
  const [done, setDone] = useState(false);
  return (
    <div>
      <p className="mb-1 text-navy/70">Susun kalimat ini dalam bahasa Inggris</p>
      <p className="mb-5 font-display text-2xl font-semibold">{x.id}</p>
      <div className="mb-4 flex min-h-14 flex-wrap gap-2 border-b-2 border-cream py-2">
        {ans.map((c) => <button key={c.i} type="button" disabled={done} className="chip" onClick={() => { setAns(ans.filter((z) => z !== c)); setBank([...bank, c]); }}>{c.w}</button>)}
      </div>
      <div className="flex flex-wrap gap-2">
        {bank.map((c) => <button key={c.i} type="button" className="chip" onClick={() => { setBank(bank.filter((z) => z !== c)); setAns([...ans, c]); }}>{c.w}</button>)}
      </div>
      {!done && <button type="button" className="btn mt-5" disabled={bank.length > 0}
        onClick={() => { setDone(true); const ok = ans.map((c) => c.w).join(" ") === x.en; if (ok) say(x.en); onAnswer(ok); }}>Periksa</button>}
    </div>
  );
}

export default function LessonPlayer({ lesson, loggedIn, quiz = false, focus }: { lesson: Lesson; loggedIn: boolean; quiz?: boolean; focus?: [string, string][] }) {
  const [exs, setExs] = useState<Ex[] | null>(null);
  const [step, setStep] = useState<"note" | "list" | "play" | "done">(quiz || focus ? "play" : "note");
  const [muted, setMutedState] = useState(false);
  useEffect(() => { setMutedState(isMuted()); }, []);
  const [i, setI] = useState(0);
  const [right, setRight] = useState(0);
  const [ans, setAns] = useState<boolean | null>(null);
  const [res, setRes] = useState<{ score: number; gain: number; streak: number } | null>(null);
  useEffect(() => { setExs(build(lesson, quiz, focus)); }, [lesson, quiz, focus]);
  if (!exs) return <p role="status">Menyiapkan soal...</p>;

  async function next() {
    if (i + 1 < exs!.length) { setI(i + 1); setAns(null); return; }
    setStep("done");
    const score = Math.round((right / exs!.length) * 100);
    sfx("done");
    if (score >= 70) burst();
    if (focus) return; // sesi ulang tidak memberi skor atau XP
    if (loggedIn) { const out = await saveProgress(lesson.id, right, exs!.length); if (out.ok) setRes(out); }
    else writeGuest(lesson.id, Math.round((right / exs!.length) * 100));
  }
  const x = exs[i];
  const onAnswer = (ok: boolean) => {
    setAns(ok);
    if (ok) setRight((r) => r + 1);
    sfx(ok ? "ok" : "no");
    if (x.k === "ch") markMiss(x.q, x.a, ok);
  };

  if (step === "note") return (<><Link href="/belajar" className="underline">Keluar</Link><h1 className="mt-4 font-display text-3xl font-semibold">{lesson.t}</h1><p className="mt-4 rounded-2xl bg-cream p-5">{lesson.note}</p><button className="btn mt-6" onClick={() => setStep("list")}>Lihat kata-katanya</button></>);
  if (step === "list") return (
    <>
      <p className="mb-3 text-navy/70">Kenali semua kata ini. Tekan Dengar untuk mendengarkan.</p>
      <ul className="rounded-2xl border-2 border-cream px-4">
        {lesson.v.map((w) => (
          <li key={w[0]} className="flex items-center justify-between gap-3 border-t border-cream py-3 first:border-t-0">
            <span><b>{w[0]}</b><br /><span className="text-navy/70">{w[1]}</span></span>
            <button type="button" className="chip" aria-label={`Dengarkan ${w[0]}`} onClick={() => say(w[0])}>Dengar</button>
          </li>
        ))}
      </ul>
      <button className="btn mt-6" onClick={() => setStep("play")}>Lanjut ke latihan</button>
    </>
  );
  if (step === "done") {
    const score = Math.round((right / exs.length) * 100);
    return (
      <div className="text-center">
        <p className="mt-6 text-navy/70">{quiz ? "Kuis selesai" : "Pelajaran selesai"}: {lesson.t}</p>
        <p className="my-3 font-display text-6xl font-semibold">{score}%</p>
        <p className="font-display text-xl">{right} dari {exs.length} jawaban benar</p>
        {quiz && <p className="mt-2 font-bold">{score >= 70 ? "Kamu lulus kuis ini." : "Skor minimal untuk lulus adalah 70%. Coba lagi ya."}</p>}
        {res && <p className="mt-2 font-bold">+{res.gain} XP, streak {res.streak} hari</p>}
        {!loggedIn && <p className="mt-4 text-navy/70">Progres ini belum tersimpan. <Link className="underline" href="/login">Masuk atau daftar</Link> agar tersimpan.</p>}
        <div className="mt-8 flex flex-wrap justify-center gap-3"><Link className="btn" href="/belajar">Kembali ke jalur belajar</Link></div>
      </div>
    );
  }
  return (
    <>
      <div className="mb-8 flex items-center gap-4">
        <Link href="/belajar" className="underline">Keluar</Link>
        <div className="h-4 flex-1 rounded-full bg-cream" role="progressbar" aria-valuemin={0} aria-valuemax={exs.length} aria-valuenow={i}><div className="h-full rounded-full bg-navy" style={{ width: `${(i / exs.length) * 100}%` }} /></div>
        <button type="button" className="underline" aria-pressed={muted} onClick={() => { setMuted(!muted); setMutedState(!muted); }}>{muted ? "Suara mati" : "Suara nyala"}</button>
      </div>
      {x.k === "or" ? <Order key={i} x={x} onAnswer={onAnswer} /> : <Choice key={i} x={x} onAnswer={onAnswer} />}
      {ans !== null && (
        <div className="mt-6" role="status">
          <p className={`mb-3 rounded-xl px-4 py-3 font-bold ${ans ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>
            {ans ? "Benar" : `Kurang tepat. Jawaban: ${x.k === "or" ? x.en : x.a}`}
          </p>
          <button className="btn" onClick={next}>Lanjut</button>
        </div>
      )}
    </>
  );
}
