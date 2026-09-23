import { t } from "@/lib/ui-language";
import { Head, Link, usePage } from "@inertiajs/react";
import {
    ArrowRight,
    BookOpen,
    CheckCircle2,
    ChevronRight,
    MessageSquareText,
    PenLine,
    Play,
    Sparkles,
} from "lucide-react";
import type { Auth } from "@/types";
import { lessonUrl, pathUrl, type LearningPath } from "@/types/learning";

export default function Dashboard({
    paths,
    progress,
    recentLesson,
}: {
    paths: LearningPath[];
    progress: Record<number, string>;
    recentLesson: number | null;
}) {
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
    return (
        <div className="page-wrap py-7 md:py-9">
            <Head title={t("Dasbor belajar")} />
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <div>
                    <p className="stitch-kicker">{t("RUANG BELAJAR")}</p>
                    <h1 className="mt-1 text-2xl font-extrabold tracking-tight md:text-[30px]">
                        {t("Wilujeng sumping,")} {firstName}! <span aria-hidden="true">👋</span>
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
                            {paths.map((path) => {
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
                    </section>
                </div>
                <aside className="space-y-4">
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
                </aside>
            </div>
        </div>
    );
}
