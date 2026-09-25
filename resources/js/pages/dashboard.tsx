import { t } from "@/lib/ui-language";
import { Head, Link, router, usePage } from "@inertiajs/react";
import {
    ArrowRight,
    BookOpen,
    Bookmark,
    CaseSensitive,
    CheckCircle2,
    ChevronRight,
    CircleHelp,
    Flame,
    MessageSquareText,
    PenLine,
    Play,
    Sparkles,
    Target,
    RotateCcw,
} from "lucide-react";
import { useState } from "react";
import type { Auth } from "@/types";
import { lessonUrl, pathUrl, type LearningPath } from "@/types/learning";

export default function Dashboard({
    paths,
    progress,
    recentLesson,
    learningGoal,
    reviewDueCount,
}: {
    paths: LearningPath[];
    progress: Record<number, string>;
    recentLesson: number | null;
    learningGoal: { target: number; completedToday: number; streak: number };
    reviewDueCount: number;
}) {
    const [savingGoal, setSavingGoal] = useState(false);
    const [pathPage, setPathPage] = useState(1);
    const { auth } = usePage<{ auth: Auth }>().props;
    const allLessons = paths.flatMap(
        (path) => path.units?.flatMap((unit) => unit.lessons ?? []) ?? [],
    );
    const completed = allLessons.filter((lesson) => progress[lesson.id] === "completed").length;
    const featured =
        allLessons.find((lesson) => lesson.id === recentLesson) ??
        allLessons.find((lesson) => progress[lesson.id] !== "completed") ??
        allLessons[0];
    const firstName = auth.user.name.split(" ")[0];
    const pathsPerPage = 4;
    const pageCount = Math.max(1, Math.ceil(paths.length / pathsPerPage));
    const visiblePaths = paths.slice((pathPage - 1) * pathsPerPage, pathPage * pathsPerPage);
    const featuredInProgressId = featured && progress[featured.id] === "in_progress" ? featured.id : null;
    const nextLessonsByPath = paths.map((path) =>
            (path.units ?? []).flatMap((unit) =>
                (unit.lessons ?? [])
                    .filter((lesson) => progress[lesson.id] !== "completed" && lesson.id !== featuredInProgressId)
                    .map((lesson) => ({ lesson, path, unit })),
            ),
    );
    const nextLessons = nextLessonsByPath.flatMap((lessons) => lessons.slice(0, 2)).slice(0, 4);
    return (
        <div className="page-wrap py-7 md:py-9">
            <Head title={t("Dasbor belajar")} />
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <div>
                    <p className="stitch-kicker">{t("RUANG BELAJAR")}</p>
                    <h1 className="mt-1 text-2xl font-extrabold tracking-tight md:text-[30px]">
                        {t("Wilujeng sumping,")} {firstName}!
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {t("Lanjutkan langkah belajar Bahasa dan Aksara Sunda hari ini.")}
                    </p>
                </div>
                <Link href="/progres" className="text-sm font-bold text-link hover:underline">
                    {t("Lihat progres saya")} <ArrowRight className="ml-1 inline size-4" />
                </Link>
            </div>
            <section className="relative min-h-[265px] overflow-hidden rounded-[28px] bg-gradient-to-r from-[#493ee5] via-[#6556ec] to-[#9b86f3] text-white">
                <div
                    className="absolute inset-y-0 right-0 w-[45%] bg-cover bg-center opacity-80 [mask-image:linear-gradient(to_right,transparent,black)]"
                    style={{ backgroundImage: "url('/stitch/hero-student.jpg')" }}
                />
                <div className="relative z-10 max-w-[660px] p-7 md:p-9">
                    <span className="rounded-full bg-white/20 px-3 py-1.5 text-[11px] font-extrabold tracking-wide">
                        {t("BELAJAR SESUAI LANGKAHMU")}
                    </span>
                    <h2 className="mt-5 text-2xl font-extrabold leading-tight md:text-[33px]">
                        {t(featured
                            ? "Sedikit demi sedikit, makin mahir berbahasa Sunda."
                            : "Mulai perjalanan belajarmu hari ini.")}
                    </h2>
                    <p className="mt-3 max-w-lg text-sm leading-6 text-white/90">
                        {featured
                            ? `${t("Lanjutkan")} “${featured.title}” ${t("dan temukan hal baru di setiap pelajaran.")}`
                            : t("Pilih kelas Bahasa Sunda atau Aksara Sunda untuk membuka pelajaran pertama.")}
                    </p>
                    <Link
                        href={featured ? lessonUrl(featured) : "#kelas-belajar"}
                        className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-extrabold text-[#493ee5] hover:bg-[#f5f2ff]"
                    >
                        <Play className="size-4 fill-current" />
                        {t(featured ? "Lanjutkan belajar" : "Lihat kelas belajar")}
                    </Link>
                </div>
            </section>
            <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_290px]">
                <div className="min-w-0">
                    <section className="grid gap-3 sm:grid-cols-3">
                        <div className="stitch-card p-5">
                            <span className="flex size-10 items-center justify-center rounded-xl bg-[#efedff] text-[#493ee5]">
                                <BookOpen className="size-5" />
                            </span>
                            <p className="mt-4 text-2xl font-extrabold">{paths.length}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{t("Kelas belajar")}</p>
                        </div>
                        <div className="stitch-card p-5">
                            <span className="flex size-10 items-center justify-center rounded-xl bg-[#ecfdf5] text-[#006c4a]">
                                <CheckCircle2 className="size-5" />
                            </span>
                            <p className="mt-4 text-2xl font-extrabold">
                                {completed}
                                <span className="text-base font-medium text-muted-foreground">
                                    {" "}
                                    / {allLessons.length}
                                </span>
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">{t("Pelajaran selesai")}</p>
                        </div>
                        <div className="stitch-card p-5">
                            <span className="flex size-10 items-center justify-center rounded-xl bg-[#fff3d8] text-[#a34b05]">
                                <Sparkles className="size-5" />
                            </span>
                            <p className="mt-4 text-2xl font-extrabold">
                                {Math.round(
                                    allLessons.length ? (completed / allLessons.length) * 100 : 0,
                                )}
                                %
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {t("Progres keseluruhan")}
                            </p>
                        </div>
                    </section>
                    <Link href="/ulangan" className="stitch-card mt-4 flex flex-wrap items-center justify-between gap-4 p-4 transition-colors hover:border-[#aaa4ff] hover:bg-[#fcfbff]">
                        <span className="flex items-center gap-3">
                            <span className="flex size-10 items-center justify-center rounded-xl bg-[#efedff] text-[#493ee5]"><RotateCcw className="size-5"/></span>
                            <span><strong className="block text-sm">{t("Ulangan terjadwal")}</strong><small className="mt-1 block text-xs text-muted-foreground">{t("Ulangi kosakata dan aksara agar lebih mudah diingat.")}</small></span>
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#efedff] px-3 py-2 text-xs font-bold text-[#493ee5]">{reviewDueCount} {t("perlu diulang")} <ArrowRight className="size-3.5"/></span>
                    </Link>
                    <section id="kelas-belajar" className="mt-8">
                        <div className="mb-4 flex items-end justify-between gap-3">
                            <div>
                                <p className="stitch-kicker">{t("KURIKULUM BELAJAR")}</p>
                                <h2 className="mt-1 text-xl font-extrabold tracking-tight">
                                    {t("Pilih kelas belajarmu")}
                                </h2>
                            </div>
                            <span className="text-xs text-muted-foreground">
                                {t("Bahasa & aksara terpisah")}
                            </span>
                        </div>
                        <div className="grid gap-4 lg:grid-cols-2">
                            {visiblePaths.map((path) => {
                                const lessons =
                                    path.units?.flatMap((unit) => unit.lessons ?? []) ?? [];
                                const done = lessons.filter(
                                    (lesson) => progress[lesson.id] === "completed",
                                ).length;
                                const aksara = path.slug.includes("aksara");
                                return (
                                    <article key={path.id} className="stitch-card overflow-hidden">
                                        <div className="relative h-32 overflow-hidden bg-[#e8e2ff]">
                                            <img
                                                src={
                                                    aksara
                                                        ? "/stitch/aksara-scroll.jpg"
                                                        : "/stitch/classroom.jpg"
                                                }
                                                alt=""
                                                className="h-full w-full object-cover"
                                            />
                                            <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[11px] font-extrabold text-[#493ee5]">
                                                {t(aksara ? "AKSARA SUNDA" : "BAHASA SUNDA")}
                                            </span>
                                        </div>
                                        <div className="p-5">
                                            <div className="flex items-start gap-3">
                                                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#efedff] text-[#493ee5]">
                                                    {aksara ? (
                                                        <PenLine className="size-5" />
                                                    ) : (
                                                        <BookOpen className="size-5" />
                                                    )}
                                                </span>
                                                <div>
                                                    <h3 className="text-base font-extrabold">
                                                        {t(path.title)}
                                                    </h3>
                                                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                                        {path.description}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-5 flex justify-between text-xs">
                                                <span className="text-muted-foreground">
                                                    {done} {t("dari")} {lessons.length} {t("pelajaran")}
                                                </span>
                                                <strong>
                                                    {Math.round(
                                                        lessons.length
                                                            ? (done / lessons.length) * 100
                                                            : 0,
                                                    )}
                                                    %
                                                </strong>
                                            </div>
                                            <div className="stitch-progress mt-2">
                                                <span
                                                    style={{
                                                        width: `${lessons.length ? (done / lessons.length) * 100 : 0}%`,
                                                    }}
                                                />
                                            </div>
                                            <Link
                                                href={pathUrl(path)}
                                                className="mt-5 flex items-center justify-between border-t pt-4 text-sm font-bold text-link"
                                            >
                                                {t("Buka kelas")} <ChevronRight className="size-4" />
                                            </Link>
                                        </div>
                                    </article>
                                );
                            })}
                            {paths.length === 0 && (
                                <div className="stitch-card p-6 text-sm text-muted-foreground">
                                    {t("Kelas belajar belum tersedia.")}
                                </div>
                            )}
                        </div>
                        {pageCount > 1 && (
                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card px-4 py-3">
                                <span className="text-xs text-muted-foreground">
                                    {t("Menampilkan")} {(pathPage - 1) * pathsPerPage + 1}–{Math.min(pathPage * pathsPerPage, paths.length)} {t("dari")} {paths.length} {t("kelas")}
                                </span>
                                <div className="flex gap-2">
                                    <button type="button" disabled={pathPage <= 1} onClick={() => setPathPage((page) => Math.max(1, page - 1))} className="btn-secondary min-h-9 px-3 text-xs disabled:opacity-40">{t("Sebelumnya")}</button>
                                    <button type="button" disabled={pathPage >= pageCount} onClick={() => setPathPage((page) => Math.min(pageCount, page + 1))} className="btn-secondary min-h-9 px-3 text-xs disabled:opacity-40">{t("Berikutnya")}</button>
                                </div>
                            </div>
                        )}
                    </section>
                    <section className="mt-8">
                        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                            <div>
                                <p className="stitch-kicker">{t("LANGKAH BERIKUTNYA")}</p>
                                <h2 className="mt-1 text-xl font-extrabold tracking-tight">{t("Pelajaran berikutnya")}</h2>
                            </div>
                            <p className="text-xs text-muted-foreground">{t("Buka pelajaran yang belum selesai dari kelasmu.")}</p>
                        </div>
                        {nextLessons.length > 0 ? (
                            <div className="grid gap-3 md:grid-cols-2">
                                {nextLessons.map(({ lesson, path, unit }, index) => (
                                    <Link
                                        key={lesson.id}
                                        href={lessonUrl(lesson)}
                                        className="stitch-card group flex min-h-[132px] flex-col justify-between p-4 transition-colors hover:border-[#aaa4ff] hover:bg-[#fcfbff]"
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#efedff] text-xs font-extrabold text-[#493ee5]">
                                                {String(index + 1).padStart(2, "0")}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="truncate text-[10px] font-extrabold tracking-wide text-[#493ee5]">{t(path.title)}</p>
                                                <h3 className="mt-1 line-clamp-2 text-sm font-extrabold leading-5">{lesson.title}</h3>
                                                <p className="mt-1 truncate text-xs text-muted-foreground">{unit.title}</p>
                                            </div>
                                        </div>
                                        <span className="mt-3 flex items-center justify-between border-t pt-2.5 text-xs font-bold text-link">
                                            {t(progress[lesson.id] === "in_progress" ? "Lanjutkan" : "Mulai belajar")}
                                            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="stitch-card flex flex-wrap items-center justify-between gap-3 p-4">
                                <p className="text-sm text-muted-foreground">{t("Semua pelajaran di kelas yang tersedia sudah selesai.")}</p>
                                <Link href="/progres" className="inline-flex items-center gap-2 text-sm font-bold text-link">
                                    {t("Lihat progres saya")} <ArrowRight className="size-4" />
                                </Link>
                            </div>
                        )}
                    </section>
                </div>
                <aside className="space-y-4">
                    <div className="stitch-card p-5">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="stitch-kicker">{t("TARGET HARIAN")}</p>
                                <h3 className="mt-2 text-base font-extrabold">{t("Jaga kebiasaan belajar")}</h3>
                            </div>
                            <span className="flex size-10 items-center justify-center rounded-xl bg-[#fff3d8] text-[#a34b05]"><Target className="size-5" /></span>
                        </div>
                        <div className="mt-4 flex items-end justify-between gap-3">
                            <p className="text-sm"><strong>{learningGoal.completedToday}</strong> / {learningGoal.target} {t("aktivitas hari ini")}</p>
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#a34b05]"><Flame className="size-4" /> {learningGoal.streak} {t("hari")}</span>
                        </div>
                        <div className="stitch-progress mt-3"><span style={{ width: `${Math.min(100, (learningGoal.completedToday / learningGoal.target) * 100)}%` }} /></div>
                        <p className="mt-4 text-xs text-muted-foreground">{t("Pilih target aktivitas per hari")}</p>
                        <div className="mt-2 grid grid-cols-4 gap-2">
                            {[1, 2, 3, 5].map((goal) => (
                                <button key={goal} type="button" disabled={savingGoal} aria-pressed={learningGoal.target === goal} onClick={() => { setSavingGoal(true); router.patch("/target-belajar", { daily_goal: goal }, { preserveScroll: true, onFinish: () => setSavingGoal(false) }); }} className={`min-h-9 rounded-lg border text-xs font-bold ${learningGoal.target === goal ? "border-[#493ee5] bg-[#efedff] text-[#493ee5]" : "bg-card text-muted-foreground hover:border-[#aaa4ff]"}`}>{goal}</button>
                            ))}
                        </div>
                    </div>
                    <div className="stitch-card p-5">
                        <p className="stitch-kicker">{t("PELAJARAN TERAKHIR")}</p>
                        {featured ? (
                            <>
                                <h3 className="mt-2 text-base font-extrabold">{featured.title}</h3>
                                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                                    {featured.summary}
                                </p>
                                <Link
                                    href={lessonUrl(featured)}
                                    className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-link"
                                >
                                    {t("Buka pelajaran")} <ArrowRight className="size-4" />
                                </Link>
                            </>
                        ) : (
                            <p className="mt-2 text-sm text-muted-foreground">
                                {t("Belum ada pelajaran yang dibuka.")}
                            </p>
                        )}
                    </div>
                    <div className="rounded-[22px] bg-[#e8fbf2] p-5 text-[#064e3b]">
                        <span className="flex size-10 items-center justify-center rounded-xl bg-white">
                            <MessageSquareText className="size-5" />
                        </span>
                        <h3 className="mt-4 text-base font-extrabold">{t("Butuh teman belajar?")}</h3>
                        <p className="mt-2 text-xs leading-5">
                            {t("Tanyakan materi atau latih percakapan bersama Tutor AI.")}
                        </p>
                        <Link
                            href="/tutor"
                            className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold"
                        >
                            {t("Buka Tutor AI")} <ArrowRight className="size-4" />
                        </Link>
                    </div>
                    <Link
                        href="/latihan-aksara"
                        className="stitch-card flex items-center justify-between gap-3 p-5"
                    >
                        <div>
                            <p className="stitch-kicker">{t("LATIHAN KHUSUS")}</p>
                            <h3 className="mt-1 text-sm font-extrabold">{t("Ruang Aksara Sunda")}</h3>
                        </div>
                        <PenLine className="size-5 text-[#493ee5]" />
                    </Link>
                    <div className="stitch-card p-5">
                        <p className="stitch-kicker">{t("AKSES CEPAT")}</p>
                        <div className="mt-3 divide-y">
                            <Link href="/kuis" className="flex min-h-12 items-center gap-3 text-sm font-semibold hover:text-link"><CircleHelp className="size-4 text-link" /> {t("Kuis & evaluasi")} <ArrowRight className="ml-auto size-4" /></Link>
                            <Link href="/ulasan" className="flex min-h-12 items-center gap-3 text-sm font-semibold hover:text-link"><CheckCircle2 className="size-4 text-link" /> {t("Ulasan jawaban")} <ArrowRight className="ml-auto size-4" /></Link>
                            <Link href="/materi-tersimpan" className="flex min-h-12 items-center gap-3 text-sm font-semibold hover:text-link"><Bookmark className="size-4 text-link" /> {t("Materi tersimpan")} <ArrowRight className="ml-auto size-4" /></Link>
                            <Link href="/aksara-sunda/kumpulan" className="flex min-h-12 items-center gap-3 text-sm font-semibold hover:text-link"><CaseSensitive className="size-4 text-link" /> {t("Kumpulan Aksara")} <ArrowRight className="ml-auto size-4" /></Link>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
