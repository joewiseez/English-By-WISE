"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { clearGuest, readGuest } from "@/lib/guest";
import { syncGuestProgress } from "./actions";

// Dipasang hanya untuk pengguna yang sudah masuk: memindahkan progres tamu ke akun, sekali.
export default function GuestSync() {
  const router = useRouter();
  useEffect(() => {
    const g = readGuest();
    if (Object.keys(g).length === 0) return;
    syncGuestProgress(g).then((r) => { if (r.ok) { clearGuest(); router.refresh(); } });
  }, [router]);
  return null;
}
