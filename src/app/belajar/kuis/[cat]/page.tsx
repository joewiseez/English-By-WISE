import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { categories, type Lesson } from "@/lib/content";
import LessonPlayer from "@/app/belajar/[id]/LessonPlayer";

export default async function QuizPage({ params }: { params: { cat: string } }) {
  const ci = Number(params.cat);
  const c = Number.isInteger(ci) ? categories[ci] : undefined;
  if (!c) notFound();
  // Kuis memakai gabungan seluruh isi kategori; LessonPlayer memilih soal acak dari sini.
  const quiz: Lesson = {
    id: `q${ci}`, t: `Kuis akhir ${c.n}`, note: "", ph: 0,
    v: c.lessons.flatMap((l) => l.v),
    f: c.lessons.flatMap((l) => l.f),
    o: c.lessons.flatMap((l) => (l.ph ? [l.v[Math.floor(Math.random() * l.v.length)]] : l.o)),
  };
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  return <main className="mx-auto max-w-xl px-5 py-10"><LessonPlayer lesson={quiz} loggedIn={!!user} quiz /></main>;
}
