import { t } from "@/lib/ui-language";
import { Head, Link } from "@inertiajs/react";
import { ArrowRight, BookOpen, Check, ChevronDown, ChevronRight, CirclePlay, PenLine } from "lucide-react";
import { useState } from "react";
import { lessonUrl, type LearningPath } from "@/types/learning";

export default function Path({
    path,
    progress,
}: {
    path: LearningPath;
    progress: Record<number, string>;
}) {
    const [visibleLessonCounts, setVisibleLessonCounts] = useState<Record<number, number>>({});
    const lessons = path.units?.flatMap((unit) => unit.lessons ?? []) ?? [];
    const completed = lessons.filter((lesson) => progress[lesson.id] === "completed").length;
    const aksara = path.slug.includes("aksara");
    const next = lessons.find((lesson) => progress[lesson.id] !== "completed");
    return (
        <div className="page-wrap py-7 md:py-9">
            <Head title={t(path.title)} />
            <div className="mb-5 text-xs font-semibold text-muted-foreground">
                <Link href="/dashboard" className="hover:text-link">
                    {t("Beranda")}
                </Link>{" "}
                <ChevronRight className="mx-1 inline size-3" /> {t("Kelas Belajar")}{" "}
                <ChevronRight className="mx-1 inline size-3" />{" "}
                <span className="text-foreground">{path.title}</span>
            </div>
            <section className="relative overflow-hidden rounded-[28px] bg-[#eeeaff] text-[#1b1b24]">
                <div
                    className="absolute inset-y-0 right-0 hidden w-[46%] bg-cover bg-center opacity-90 [mask-image:linear-gradient(to_right,transparent,black)] md:block"
                    style={{
                        backgroundImage: `url('${aksara ? "/stitch/aksara-scroll.jpg" : "/stitch/classroom.jpg"}')`,
                    }}
                />
                <div className="relative z-10 max-w-[690px] p-7 md:p-10">
                    <p className="stitch-kicker">{t("KELAS BELAJAR ·")} {t(aksara ? "AKSARA" : "BAHASA")}</p>
                    <h1 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
                        {path.title}
                    </h1>
                    <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
                        {path.description}
                    </p>
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-white px-3 py-2 text-xs font-bold text-[#493ee5]">
                            {path.units?.length ?? 0} {t("unit")}
                        </span>
                        <span className="rounded-full bg-white px-3 py-2 text-xs font-bold text-[#493ee5]">
                            {lessons.length} {t("pelajaran")}
                        </span>
                        {next && (
                            <Link href={lessonUrl(next)} className="btn-primary gap-2">
                                {t(progress[next.id] ? "Lanjutkan" : "Mulai belajar")}{" "}
                                <ArrowRight className="size-4" />
                            </Link>
                        )}
                    </div>
                </div>
            </section>
            <aside className="mt-5 grid gap-4 md:grid-cols-2" aria-label={t("Ringkasan kelas")}>
                <div className="stitch-card p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="stitch-kicker">{t("PROGRES KELAS")}</p>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {completed} {t("dari")} {lessons.length} {t("pelajaran selesai")}
                            </p>
                        </div>
                        <p className="text-3xl font-extrabold">
                            {Math.round(lessons.length ? (completed / lessons.length) * 100 : 0)}%
                        </p>
                    </div>
                    <div
                        className="stitch-progress mt-4"
                        role="progressbar"
                        aria-label={`Progres ${path.title}`}
                        aria-valuenow={completed}
                        aria-valuemin={0}
                        aria-valuemax={lessons.length || 1}
                    >
                        <span
                            style={{
                                width: `${lessons.length ? (completed / lessons.length) * 100 : 0}%`,
                            }}
                        />
                    </div>
                    <Link
                        href="/progres"
                        className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-link"
                    >
                        {t("Lihat semua progres")} <ArrowRight className="size-4" />
                    </Link>
                </div>
                <div className="stitch-card p-5">
                    <div className="flex items-start gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#ecfdf5] text-[#006c4a]">
                            <CirclePlay className="size-5" />
                        </span>
                        <div>
                            <h3 className="text-sm font-extrabold">{t("Belajar lewat latihan")}</h3>
                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                {t("Setiap pelajaran dapat memuat latihan untuk mencoba materi yang baru dibaca.")}
                            </p>
                        </div>
                    </div>
                    {aksara && (
                        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t pt-3">
                            <Link href="/latihan-aksara" className="inline-flex items-center gap-2 text-xs font-bold text-link">
                                {t("Ruang latihan aksara")} <ArrowRight className="size-4" />
                            </Link>
                            <Link href="/aksara-sunda/kumpulan" className="inline-flex items-center gap-2 text-xs font-bold text-link">
                                {t("Lihat semua Aksara Sunda")} <ArrowRight className="size-4" />
                            </Link>
                        </div>
                    )}
                </div>
            </aside>
            <div className="mt-8">
                <div className="mb-5">
                    <p className="stitch-kicker">{t("KURIKULUM")}</p>
                    <h2 className="mt-1 text-xl font-extrabold">{t("Daftar unit & pelajaran")}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {t("Pelajari materi sesuai urutan atau buka topik yang ingin ditinjau.")}
                    </p>
                </div>
                <div className="space-y-3">
                    {path.units?.map((unit, index) => {
                        const unitLessons = unit.lessons ?? [];
                        const visibleCount = visibleLessonCounts[unit.id] ?? 10;

                        return (
                        <details key={unit.id} open={index === 0} className="stitch-card group overflow-hidden">
                            <summary className="flex cursor-pointer list-none items-center gap-4 bg-[#faf9ff] p-5 marker:hidden dark:bg-secondary md:p-6 [&::-webkit-details-marker]:hidden">
                                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#efedff] text-sm font-extrabold text-[#493ee5]">
                                    {String(index + 1).padStart(2, "0")}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-base font-extrabold">{unit.title}</h3>
                                    <p className="mt-1 text-xs text-muted-foreground">{unit.lessons?.length ?? 0} {t("pelajaran")}</p>
                                    {unit.description && (
                                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                            {unit.description}
                                        </p>
                                    )}
                                </div>
                                <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                            </summary>
                            {unitLessons.length ? (
                                <ol className="divide-y border-t px-5 md:px-6">
                                    {unitLessons.slice(0, visibleCount).map((lesson, i) => {
                                        const state = progress[lesson.id];
                                        return (
                                            <li key={lesson.id}>
                                                <Link
                                                    href={lessonUrl(lesson)}
                                                    className="group flex min-h-20 items-center gap-4 py-4"
                                                >
                                                    <span
                                                        className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${state === "completed" ? "bg-[#ecfdf5] text-[#006c4a]" : "bg-[#f5f2ff] text-[#493ee5]"}`}
                                                    >
                                                        {state === "completed" ? (
                                                            <Check className="size-5" />
                                                        ) : aksara ? (
                                                            <PenLine className="size-5" />
                                                        ) : (
                                                            <BookOpen className="size-5" />
                                                        )}
                                                    </span>
                                                    <span className="min-w-0 flex-1">
                                                        <span className="text-[10px] font-extrabold tracking-wide text-[#493ee5]">
                                                            {t("PELAJARAN")}{" "}
                                                            {String(i + 1).padStart(2, "0")}
                                                        </span>
                                                        <strong className="mt-0.5 block text-sm group-hover:text-link">
                                                            {lesson.title}
                                                        </strong>
                                                        {lesson.summary && (
                                                            <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                                                                {lesson.summary}
                                                            </span>
                                                        )}
                                                    </span>
                                                    <span className="hidden text-xs text-muted-foreground sm:block">
                                                        {t(state === "completed"
                                                            ? "Selesai"
                                                            : state
                                                              ? "Berjalan"
                                                              : "Mulai")}
                                                    </span>
                                                    <ChevronRight className="size-4 shrink-0 text-[#493ee5]" />
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ol>
                            ) : (
                                <p className="p-6 text-sm text-muted-foreground">
                                    {t("Belum ada pelajaran terbit dalam unit ini.")}
                                </p>
                            )}
                            {unitLessons.length > visibleCount && (
                                <div className="border-t px-5 py-3 md:px-6">
                                    <button type="button" onClick={() => setVisibleLessonCounts((counts) => ({ ...counts, [unit.id]: Math.min(unitLessons.length, visibleCount + 10) }))} className="text-sm font-bold text-link hover:underline">
                                        {t("Tampilkan 10 pelajaran lagi")} · {unitLessons.length - visibleCount} {t("tersisa")}
                                    </button>
                                </div>
                            )}
                        </details>
                        );
                    })}
                    {!path.units?.length && (
                        <div className="stitch-card p-7">
                            <h3 className="font-bold">{t("Materi sedang disiapkan")}</h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {t("Unit akan muncul setelah diterbitkan oleh admin.")}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
