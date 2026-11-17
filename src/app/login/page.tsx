import Link from "next/link";
import { signIn, signUp, signInGoogle } from "./actions";

export default function Login({ searchParams }: { searchParams: { error?: string; info?: string } }) {
  const field = "mt-1 w-full rounded-xl border-2 border-cream px-4 py-3";
  return (
    <main className="mx-auto max-w-md px-5 py-16">
      <h1 className="font-display text-3xl font-semibold">Masuk atau daftar</h1>
      <p className="mt-2 text-navy/70">Akun membuat progres, XP, dan streak tersimpan di semua perangkat.</p>
      {searchParams.error && <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-red-800">{searchParams.error}</p>}
      {searchParams.info && <p role="status" className="mt-5 rounded-xl bg-cream px-4 py-3">{searchParams.info}</p>}
      <form className="mt-6">
        <label className="block font-bold" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" className={field} />
        <label className="mt-4 block font-bold" htmlFor="password">Kata sandi</label>
        <input id="password" name="password" type="password" required minLength={8} autoComplete="current-password" className={field} />
        <div className="mt-6 flex flex-wrap gap-3">
          <button className="btn" formAction={signIn}>Masuk</button>
          <button className="btn-sec" formAction={signUp}>Buat akun baru</button>
        </div>
      </form>
      <form action={signInGoogle} className="mt-4"><button className="btn-sec w-full">Lanjutkan dengan Google</button></form>
      <p className="mt-8"><Link className="underline" href="/belajar">Belajar dulu tanpa akun</Link></p>
    </main>
  );
}
