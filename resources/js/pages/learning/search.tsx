import { t } from "@/lib/ui-language";
import { Head, Link } from "@inertiajs/react";
import { ArrowRight, BookOpen, Search } from "lucide-react";
import type { Lesson } from "@/types/learning";

export default function SearchPage({ query, lessons }: { query: string; lessons: Lesson[] }) {
    return (
        <div className="page-wrap py-8 md:py-10">
            <Head title={t("Cari materi")} />
            <p className="stitch-kicker">{t("PERPUSTAKAAN MATERI")}</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{t("Cari materi belajar")}</h1>
            <form
                action="/cari"
                method="get"
                role="search"
                className="stitch-card mt-6 flex max-w-2xl items-center gap-3 p-3"
            >
                <Search className="size-5 shrink-0 text-muted-foreground" />
                <input
                    name="q"
                    defaultValue={query}
                    autoFocus
                    placeholder={t("Cari pelajaran, kosakata, atau aksara")}
                    className="min-h-10 min-w-0 flex-1 bg-transparent text-sm outline-none"
                />
                <button className="btn-primary" type="submit">
                    {t("Cari")}
                </button>
            </form>
            <p className="mt-7 text-sm font-semibold text-muted-foreground">
                {query
                    ? `${lessons.length} hasil untuk “${query}”`
                    : t("Masukkan kata kunci untuk mencari materi yang sudah terbit.")}
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
                {lessons.map((lesson) => (
                    <Link
                        key={lesson.id}
                        href={`/pelajaran/${lesson.id}`}
                        className="stitch-card group flex gap-4 p-5 hover:border-[#aaa4ff]"
                    >
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#efedff] text-[#493ee5]">
                            <BookOpen className="size-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="text-xs font-bold text-link">
                                {lesson.unit?.path?.title} · {lesson.unit?.title}
                            </span>
                            <strong className="mt-1 block group-hover:text-link">
                                {lesson.title}
                            </strong>
                            <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                                {lesson.summary}
                            </span>
                        </span>
                        <ArrowRight className="size-4 shrink-0 self-center text-[#493ee5]" />
                    </Link>
                ))}
            </div>
            {query && lessons.length === 0 && (
                <div className="stitch-card mt-4 p-7 text-sm text-muted-foreground">
                    {t("Belum ada materi yang cocok. Coba kata kunci lain atau buka")}{" "}
                    <Link href="/dashboard" className="font-bold text-link">
                        {t("kelas belajar")}
                    </Link>
                    .
                </div>
            )}
        </div>
    );
}
