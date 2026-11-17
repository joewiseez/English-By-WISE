import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { findLesson } from "@/lib/content";
import LessonPlayer from "./LessonPlayer";

export default async function LessonPage({ params }: { params: { id: string } }) {
  const lesson = findLesson(params.id);
  if (!lesson) notFound();
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  return <main className="mx-auto max-w-xl px-5 py-10"><LessonPlayer lesson={lesson} loggedIn={!!user} /></main>;
}
