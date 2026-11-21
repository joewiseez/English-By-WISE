"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { readGuest, readMiss } from "@/lib/guest";

type Cat = { n: string; desc: string; lessons: { id: string; t: string }[] };
type State = "done" | "cur" | "lock";

const OFF = [0, 38, 60, 38, 0, -38, -60, -38]; // geser kiri-kanan agar jalurnya berkelok
const PATHS = { done: "M5 12.5l4.5 4.5L19 7.5", cur: "M8 5l11 7-11 7z", lock: "M7 11h10v9H7z M8 11V8a4 4 0 0 1 8 0v3", cup: "M8 4h8v5a4 4 0 0 1-8 0z M12 13v4 M8.5 20h7" };

const LEVEL_NAME: Record<string, string> = { A1: "Pemula", A2: "Dasar" };
const levelOf = (n: string) => n.match(/^(A\d)\s/)?.[1] ?? ""; // "A2 Tata bahasa" -> "A2"
const plain = (n: string) => n.replace(/^A\d\s+/, "");

function Node({ i, href, title, sub, state, icon }: { i: number; href?: string; title: string; sub: string; state: State; icon: string }) {
  const cls = `grid h-[74px] w-[74px] place-items-center rounded-full border-b-[6px] ${state === "lock" ? "border-cream bg-cream text-navy/50" : "border-black/30 bg-navy text-white"} ${state === "cur" ? "ring-4 ring-sun ring-offset-4" : ""}`;
  const svg = <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={icon} /></svg>;
  return (
    <li className="flex flex-col items-center text-center" style={{ transform: `translateX(${OFF[i % 8]}px)` }}>
      {state === "cur" && <span className="mb-2 rounded-xl bg-navy px-3 py-0.5 font-display text-sm text-white">Mulai</span>}
      {href
        ? <Link href={href} aria-label={title} className={`${cls} hover:bg-navy/90 active:translate-y-0.5 active:border-b-2`}>{svg}</Link>
        : <div aria-disabled="true" className={cls}>{svg}</div>}
      <b className="mt-2 font-display text-lg font-medium">{title}</b>
      <small className="text-navy/70">{sub}</small>
    </li>
  );
}

export default function PathView({ cats, done, loggedIn }: { cats: Cat[]; done: Record<string, number>; loggedIn: boolean }) {
  const [scores, setScores] = useState<Record<string, number>>(done);
  const [miss, setMiss] = useState(0);
  const [pick, setPick] = useState<string | null>(null);
  useEffect(() => { setScores(loggedIn ? done : readGuest()); setMiss(Object.keys(readMiss()).length); }, [done, loggedIn]);
  useEffect(() => { try { setPick(sessionStorage.getItem("ebw-level")); } catch { /* abaikan */ } }, []);
  const choose = (lv: string) => { setPick(lv); try { sessionStorage.setItem("ebw-level", lv); } catch { /* abaikan */ } };

  const levels = Array.from(new Set(cats.map((c) => levelOf(c.n))));
  const stat = (lv: string) => {
    const ls = cats.filter((c) => levelOf(c.n) === lv).flatMap((c) => c.lessons);
    return { done: ls.filter((l) => scores[l.id] !== undefined).length, total: ls.length };
  };
  // Tingkat awal: pilihan terakhir, atau tingkat pertama yang belum selesai.
  const level = pick && levels.includes(pick) ? pick : levels.find((lv) => stat(lv).done < stat(lv).total) ?? levels[0];
  return (
    <>
      {miss > 0 && (
        <Link href="/belajar/ulang" className="mt-8 flex items-center justify-between rounded-2xl border-2 border-b-4 border-navy px-4 py-3 hover:bg-cream">
          <b>Ulang kata yang sering salah</b><span>{miss} kata</span>
        </Link>
      )}
      {levels.length > 1 && (
        <div role="group" aria-label="Pilih tingkat" className="mt-8 grid grid-cols-2 gap-3">
          {levels.map((lv) => {
            const s = stat(lv);
            const on = lv === level;
            return (
              <button key={lv} type="button" aria-pressed={on} onClick={() => choose(lv)}
                className={`rounded-2xl border-2 border-b-4 px-4 py-3 text-left ${on ? "border-navy bg-navy text-white" : "border-cream hover:border-navy"}`}>
                <span className="font-display text-xl font-semibold">{lv}</span> {LEVEL_NAME[lv]}
                <span className="block text-sm opacity-80">{s.done} dari {s.total} pelajaran</span>
              </button>
            );
          })}
        </div>
      )}
      {cats.map((c, ci) => {
        if (levelOf(c.n) !== level) return null;
        // shortcut: kuis hanya terkunci di tampilan, server tetap menerima skornya; tambahkan cek di saveProgress bila ini jadi masalah.
        const allDone = c.lessons.every((l) => scores[l.id] !== undefined);
        const q = scores[`q${ci}`];
        return (
          <section key={c.n} className="mt-10">
            <h2 className="font-display text-2xl font-semibold">{plain(c.n)}</h2>
            <p className="text-navy/70">{c.desc}</p>
            <ol className="mt-6 flex flex-col items-center gap-8 overflow-x-clip pb-4">
              {c.lessons.map((l, i) => {
                const open = i === 0 || scores[c.lessons[i - 1].id] !== undefined;
                const s = scores[l.id];
                const state: State = s !== undefined ? "done" : open ? "cur" : "lock";
                return <Node key={l.id} i={i} href={open ? `/belajar/${l.id}` : undefined} title={l.t} state={state} icon={PATHS[state]}
                  sub={s !== undefined ? `Skor ${s}%` : open ? "Belum dikerjakan" : "Terkunci"} />;
              })}
              <Node i={c.lessons.length} href={allDone ? `/belajar/kuis/${ci}` : undefined} title="Kuis akhir" icon={PATHS.cup}
                state={!allDone ? "lock" : q !== undefined && q >= 70 ? "done" : "cur"}
                sub={!allDone ? "Selesaikan semua pelajaran dulu" : q === undefined ? "Lulus di skor 70%" : q >= 70 ? `Lulus, skor ${q}%` : `Terakhir ${q}%, coba lagi`} />
            </ol>
          </section>
        );
      })}
    </>
  );
}
