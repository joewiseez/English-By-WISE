import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { categories } from "@/lib/content";
import { signOut } from "../login/actions";
import PathView from "./PathView";
import GuestSync from "./GuestSync";

const GOAL = 50;

export default async function Belajar() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  const done: Record<string, number> = {};
  let profile: { xp: number; streak: number; daily_xp: number; daily_date: string | null } | null = null;
  if (user) {
    const [p, r] = await Promise.all([
      sb.from("profiles").select("xp,streak,daily_xp,daily_date").eq("id", user.id).single(),
      sb.from("lesson_progress").select("lesson_id,best_score").eq("user_id", user.id),
    ]);
    profile = p.data;
    (r.data ?? []).forEach((x) => { done[x.lesson_id] = x.best_score; });
  }
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
  const dailyXp = profile?.daily_date === today ? profile.daily_xp : 0;
  const level = Math.floor((profile?.xp ?? 0) / 100) + 1;
  const cats = categories.map((c) => ({ n: c.n, desc: c.desc, lessons: c.lessons.map((l) => ({ id: l.id, t: l.t })) }));

  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      {user && <GuestSync />}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="font-display text-xl font-semibold">English by Wise</Link>
        {user ? (
          <form action={signOut} className="flex flex-wrap items-center gap-3">
            <span className="rounded-xl bg-cream px-3 py-1 font-bold">Level {level}, {profile?.streak ?? 0} hari beruntun</span>
            <button className="btn-sec !px-4 !py-2">Keluar</button>
          </form>
        ) : (
          <Link className="btn-sec !px-4 !py-2" href="/login">Masuk untuk menyimpan progres</Link>
        )}
      </header>
      {user && (
        <div className="mt-6">
          <div className="flex justify-between"><b>Target harian</b><span>{Math.min(dailyXp, GOAL)} dari {GOAL} XP</span></div>
          <div className="mt-2 h-3 rounded-full bg-cream" role="progressbar" aria-valuemin={0} aria-valuemax={GOAL} aria-valuenow={Math.min(dailyXp, GOAL)}>
            <div className="h-full rounded-full bg-navy" style={{ width: `${Math.min(1, dailyXp / GOAL) * 100}%` }} />
          </div>
        </div>
      )}
      <PathView cats={cats} done={done} loggedIn={!!user} />
    </main>
  );
}
