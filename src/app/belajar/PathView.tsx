"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { readGuest } from "@/lib/guest";

type Cat = { n: string; desc: string; lessons: { id: string; t: string }[] };

export default function PathView({ cats, done, loggedIn }: { cats: Cat[]; done: Record<string, number>; loggedIn: boolean }) {
  const [scores, setScores] = useState<Record<string, number>>(done);
  useEffect(() => { setScores(loggedIn ? done : readGuest()); }, [done, loggedIn]);
  const row = "flex items-center justify-between rounded-2xl border-2 border-b-4 border-cream px-4 py-3";
  return (
    <>
      {cats.map((c, ci) => {
        // shortcut: kuis hanya terkunci di tampilan, server tetap menerima skornya; tambahkan cek di saveProgress bila ini jadi masalah.
        const allDone = c.lessons.every((l) => scores[l.id] !== undefined);
        const q = scores[`q${ci}`];
        return (
          <section key={c.n} className="mt-10">
            <h2 className="font-display text-2xl font-semibold">{c.n}</h2>
            <p className="mb-3 text-navy/70">{c.desc}</p>
            <ul className="grid gap-3">
              {c.lessons.map((l, i) => {
                const open = i === 0 || scores[c.lessons[i - 1].id] !== undefined;
                const label = scores[l.id] !== undefined ? `Selesai, skor ${scores[l.id]}%` : open ? "Mulai" : "Terkunci";
                return (
                  <li key={l.id}>
                    {open ? <Link href={`/belajar/${l.id}`} className={`${row} hover:border-navy`}><b>{l.t}</b><span>{label}</span></Link>
                      : <div aria-disabled="true" className={`${row} text-navy/60`}><b>{l.t}</b><span>{label}</span></div>}
                  </li>
                );
              })}
              <li>
                {allDone ? (
                  <Link href={`/belajar/kuis/${ci}`} className={`${row} border-navy hover:bg-cream`}>
                    <b>Kuis akhir</b>
                    <span>{q === undefined ? "Mulai, lulus 70%" : q >= 70 ? `Lulus, skor ${q}%` : `Terakhir ${q}%, coba lagi`}</span>
                  </Link>
                ) : (
                  <div aria-disabled="true" className={`${row} text-navy/60`}><b>Kuis akhir</b><span>Selesaikan semua pelajaran dulu</span></div>
                )}
              </li>
            </ul>
          </section>
        );
      })}
    </>
  );
}
