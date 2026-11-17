import data from "../../content/lessons.json";

export type Lesson = {
  id: string; t: string; note: string; ph: number;
  v: [string, string][];             // [Inggris, Indonesia]
  f: [string, string, string[], string][]; // [kalimat ber-___, jawaban, pilihan, petunjuk]
  o: [string, string][];             // [kalimat Inggris, terjemahan] untuk latihan susun kalimat
};
export type Category = { n: string; desc: string; lessons: Lesson[] };

export const categories = data.categories as unknown as Category[];
export const allLessons = categories.flatMap((c) => c.lessons);
export const findLesson = (id: string) => allLessons.find((l) => l.id === id);
// Kuis akhir kategori memakai id q0, q1, dan seterusnya (sesuai urutan kategori).
export const isQuizId = (id: string) => /^q\d$/.test(id) && Number(id.slice(1)) < categories.length;
export const isValidId = (id: string) => !!findLesson(id) || isQuizId(id);
