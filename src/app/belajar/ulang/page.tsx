import { createClient } from "@/lib/supabase/server";
import { categories } from "@/lib/content";
import ReviewRunner from "./ReviewRunner";

export default async function Ulang() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  const pool = categories.flatMap((c) => c.lessons.flatMap((l) => l.v)); // sumber pilihan jawaban pengecoh
  return <main className="mx-auto max-w-xl px-5 py-10"><ReviewRunner pool={pool} loggedIn={!!user} /></main>;
}
