"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import LessonPlayer from "@/app/belajar/[id]/LessonPlayer";
import { readMiss } from "@/lib/guest";
import type { Lesson } from "@/lib/content";

export default function ReviewRunner({ pool, loggedIn }: { pool: [string, string][]; loggedIn: boolean }) {
  const [focus, setFocus] = useState<[string, string][] | null>(null);
  useEffect(() => { setFocus(Object.entries(readMiss()).map(([en, m]) => [en, m.id] as [string, string])); }, []);
  if (!focus) return <p role="status">Menyiapkan soal...</p>;
  if (focus.length === 0) return (
    <>
      <p className="font-display text-2xl font-semibold">Tidak ada kata yang perlu diulang.</p>
      <Link className="btn mt-6" href="/belajar">Kembali ke jalur belajar</Link>
    </>
  );
  const lesson: Lesson = { id: "ulang", t: "Ulang kata yang sering salah", note: "", ph: 0, v: pool, f: [], o: [] };
  return <LessonPlayer lesson={lesson} loggedIn={loggedIn} focus={focus} />;
}
