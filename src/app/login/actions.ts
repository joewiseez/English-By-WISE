"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Origin dari permintaan: benar di localhost, Vercel, dan pratinjau tanpa mengatur NEXT_PUBLIC_SITE_URL.
const site = () => headers().get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const back = (key: "error" | "info", msg: string): never => redirect(`/login?${key}=${encodeURIComponent(msg)}`);

export async function signIn(formData: FormData) {
  const sb = await createClient();
  const { error } = await sb.auth.signInWithPassword({ email: String(formData.get("email")), password: String(formData.get("password")) });
  if (error) back("error", "Email atau kata sandi salah, atau email belum dikonfirmasi.");
  redirect("/belajar");
}
export async function signUp(formData: FormData) {
  const sb = await createClient();
  const password = String(formData.get("password"));
  if (password.length < 8) back("error", "Kata sandi minimal 8 karakter.");
  const { error } = await sb.auth.signUp({ email: String(formData.get("email")), password, options: { emailRedirectTo: `${site()}/auth/callback` } });
  if (error) back("error", "Pendaftaran gagal. Periksa email kamu atau coba masuk.");
  back("info", "Cek email kamu untuk mengonfirmasi akun, lalu masuk.");
}
export async function signInGoogle() {
  const sb = await createClient();
  const { data, error } = await sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${site()}/auth/callback` } });
  if (error || !data.url) back("error", "Masuk dengan Google belum aktif di proyek Supabase ini.");
  redirect(data.url!);
}
export async function signOut() {
  const sb = await createClient();
  await sb.auth.signOut();
  redirect("/");
}
