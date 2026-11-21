import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { categories } from "@/lib/content";

export default async function Profil() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");

  const [p, r] = await Promise.all([
    sb.from("profiles").select("display_name,xp,streak").eq("id", user.id).single(),
    sb.from("lesson_progress").select("lesson_id,best_score").eq("user_id", user.id),
  ]);
  const done: Record<string, number> = {};
  (r.data ?? []).forEach((x) => { done[x.lesson_id] = x.best_score; });

  const xp: number = p.data?.xp ?? 0;
  const rows = categories.map((c, i) => {
    const ls = c.lessons.filter((l) => done[l.id] !== undefined);
    const avg = ls.length ? Math.round(ls.reduce((n, l) => n + done[l.id], 0) / ls.length) : null;
    return { n: c.n, total: c.lessons.length, finished: ls.length, avg, quiz: done[`q${i}`] as number | undefined, words: ls.reduce((n, l) => n + l.v.length, 0) };
  });
  const words = rows.reduce((n, c) => n + c.words, 0);
  const finished = rows.reduce((n, c) => n + c.finished, 0);
  const total = rows.reduce((n, c) => n + c.total, 0);
  const stats: [string, string][] = [
    ["Level", String(Math.floor(xp / 100) + 1)],
    ["Total XP", String(xp)],
    ["Hari beruntun", String(p.data?.streak ?? 0)],
    ["Kata dipelajari", String(words)],
    ["Pelajaran selesai", `${finished} dari ${total}`],
  ];

  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <Link href="/belajar" className="underline">Kembali ke jalur belajar</Link>
      <h1 className="mt-4 font-display text-3xl font-semibold">{p.data?.display_name ?? "Profil"}</h1>
      <p className="text-navy/70">{user.email}</p>
      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map(([k, v]) => (
          <div key={k} className="rounded-2xl bg-cream px-4 py-3">
            <dd className="font-display text-2xl font-semibold">{v}</dd>
            <dt className="text-navy/70">{k}</dt>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-navy/70">{100 - (xp % 100)} XP lagi menuju level berikutnya.</p>
      <h2 className="mt-10 font-display text-2xl font-semibold">Per kategori</h2>
      <ul className="mt-3 grid gap-3">
        {rows.map((c) => (
          <li key={c.n} className="rounded-2xl border-2 border-b-4 border-cream px-4 py-3">
            <div className="flex justify-between gap-3">
              <b>{c.n}</b>
              <span>{c.finished} dari {c.total} pelajaran</span>
            </div>
            <div className="mt-2 h-3 rounded-full bg-cream" role="progressbar" aria-label={`Progres ${c.n}`} aria-valuemin={0} aria-valuemax={c.total} aria-valuenow={c.finished}>
              <div className="h-full rounded-full bg-navy" style={{ width: `${(c.finished / c.total) * 100}%` }} />
            </div>
            <p className="mt-2 text-navy/70">
              {c.avg === null ? "Belum ada skor." : `Rata-rata skor ${c.avg}%.`}{" "}
              Kuis akhir: {c.quiz === undefined ? "belum dicoba" : c.quiz >= 70 ? `lulus, ${c.quiz}%` : `${c.quiz}%, belum lulus`}.
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
