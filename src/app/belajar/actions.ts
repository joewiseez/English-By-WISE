"use server";
import { createClient } from "@/lib/supabase/server";
import { isQuizId, isValidId } from "@/lib/content";

const day = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });

// Skor dan XP dihitung di server dari jumlah jawaban benar, bukan dipercaya dari klien.
export async function saveProgress(lessonId: string, correct: number, total: number) {
  if (!isValidId(lessonId) || !Number.isInteger(correct) || !Number.isInteger(total) || total < 1 || total > 30 || correct < 0 || correct > total) return { ok: false as const };
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { ok: false as const };

  const score = Math.round((correct / total) * 100);
  const gain = isQuizId(lessonId) ? correct * 10 + (score >= 70 ? 40 : 0) : correct * 10 + 20;
  const { data: old } = await sb.from("lesson_progress").select("best_score").eq("user_id", user.id).eq("lesson_id", lessonId).maybeSingle();
  await sb.from("lesson_progress").upsert({ user_id: user.id, lesson_id: lessonId, best_score: Math.max(old?.best_score ?? 0, score), updated_at: new Date().toISOString() });

  const { data: p } = await sb.from("profiles").select("xp,streak,last_active,daily_xp,daily_date").eq("id", user.id).single();
  const today = day(new Date());
  const yesterday = day(new Date(Date.now() - 864e5));
  const streak = p?.last_active === today ? p.streak : p?.last_active === yesterday ? p.streak + 1 : 1;
  const daily = (p?.daily_date === today ? p.daily_xp : 0) + gain;
  await sb.from("profiles").update({ xp: (p?.xp ?? 0) + gain, streak, last_active: today, daily_xp: daily, daily_date: today }).eq("id", user.id);
  return { ok: true as const, score, gain, streak };
}

// Menggabungkan progres tamu (dari browser) ke akun setelah masuk. Hanya skor terbaik, tanpa XP.
export async function syncGuestProgress(scores: Record<string, number>) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user || typeof scores !== "object" || scores === null) return { ok: false as const };
  const entries = Object.entries(scores).filter(([id, s]) => isValidId(id) && Number.isInteger(s) && s >= 0 && s <= 100).slice(0, 100);
  if (entries.length === 0) return { ok: true as const };
  const { data: old } = await sb.from("lesson_progress").select("lesson_id,best_score").eq("user_id", user.id);
  const prev = new Map((old ?? []).map((r) => [r.lesson_id as string, r.best_score as number]));
  const now = new Date().toISOString();
  const rows = entries.map(([id, s]) => ({ user_id: user.id, lesson_id: id, best_score: Math.max(prev.get(id) ?? 0, s), updated_at: now }));
  const { error } = await sb.from("lesson_progress").upsert(rows);
  return error ? { ok: false as const } : { ok: true as const };
}
