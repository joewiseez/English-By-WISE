import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="font-display text-5xl font-semibold leading-tight">Mulai bahasa Inggris dari nol, tanpa rasa takut salah.</h1>
      <p className="mt-5 max-w-xl text-lg text-navy/70">Pelajaran pendek dengan penjelasan dalam Bahasa Indonesia. Gratis untuk semua pemula.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link className="btn" href="/belajar">Mulai belajar gratis</Link>
        <Link className="btn-sec" href="/login">Masuk atau daftar</Link>
      </div>
    </main>
  );
}
