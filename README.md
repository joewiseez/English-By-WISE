# English by Wise

Website belajar bahasa Inggris untuk pemula. Stack: Next.js 14 (App Router, TypeScript), Tailwind CSS, Supabase (Auth dan Postgres), siap di-deploy ke Vercel.

## Menjalankan di komputer

Butuh Node.js 18.18 atau lebih baru.

1. Pasang dependensi: `npm install`
2. Buat proyek di https://supabase.com, lalu buka SQL Editor dan jalankan isi `supabase/schema.sql`.
3. Salin `.env.example` menjadi `.env.local`, lalu isi URL dan anon key dari Project Settings, API.
4. Di Supabase, Authentication, URL Configuration: isi Site URL `http://localhost:3000` dan tambahkan Redirect URL `http://localhost:3000/auth/callback`.
5. Opsional: aktifkan provider Google di Authentication, Providers.
6. Jalankan: `npm run dev`, lalu buka http://localhost:3000

## Deploy ke Vercel

Impor repositori, isi tiga variabel dari `.env.example` (ganti `NEXT_PUBLIC_SITE_URL` dengan domain produksi), lalu tambahkan domain itu ke Redirect URL di Supabase.

## Struktur

- `content/lessons.json`: seluruh isi pelajaran (kategori, kosa kata, soal). Ubah isinya di sini, tanpa menyentuh kode.
- `src/app/belajar`: jalur belajar, pemutar pelajaran, dan penyimpanan progres (server action).
- `src/app/login`: masuk, daftar, dan masuk dengan Google.
- `src/middleware.ts`: menyegarkan sesi. Tamu tetap bisa belajar tanpa akun, tetapi progres hanya tersimpan untuk pengguna yang masuk.
- `supabase/schema.sql`: tabel `profiles` dan `lesson_progress` dengan Row Level Security. Setiap pengguna hanya bisa membaca dan mengubah datanya sendiri.

## Status

Kerangka ini belum dijalankan atau dibuild saat dibuat, karena lingkungan pembuatnya tidak punya akses jaringan untuk `npm install`. Jalankan `npm run build` lebih dulu dan perbaiki bila ada galat.

Belum dipindahkan dari prototipe HTML: kuis akhir kategori, target harian dan level, efek suara, konfeti, dan tampilan jalur berkelok. Skor dan XP dihitung di server, sedangkan progres tamu belum disinkronkan saat mereka mendaftar.
