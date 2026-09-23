import { t } from "@/lib/ui-language";
import { Head, Link } from "@inertiajs/react";
import { ArrowRight, BookOpen, Check, ChevronRight, CirclePlay, PenLine } from "lucide-react";
import { lessonUrl, type LearningPath } from "@/types/learning";

export default function Path({
    path,
    progress,
}: {
    path: LearningPath;
    progress: Record<number, string>;
}) {
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
            <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_290px]">
                <div className="min-w-0">
                    <div className="mb-5">
                        <p className="stitch-kicker">{t("KURIKULUM")}</p>
                        <h2 className="mt-1 text-xl font-extrabold">{t("Daftar unit & pelajaran")}</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {t("Pelajari materi sesuai urutan atau buka topik yang ingin ditinjau.")}
                        </p>
                    </div>
                    <div className="space-y-5">
                        {path.units?.map((unit, index) => (
                            <section key={unit.id} className="stitch-card overflow-hidden">
                                <div className="flex gap-4 border-b bg-[#faf9ff] p-5 md:p-6 dark:bg-secondary">
                                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#efedff] text-sm font-extrabold text-[#493ee5]">
                                        {String(index + 1).padStart(2, "0")}
                                    </span>
                                    <div>
                                        <h3 className="text-base font-extrabold">{unit.title}</h3>
                                        {unit.description && (
                                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                                {unit.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {unit.lessons?.length ? (
                                    <ol className="divide-y px-5 md:px-6">
                                        {unit.lessons.map((lesson, i) => {
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
                            </section>
                        ))}
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
                <aside className="space-y-4">
                    <div className="stitch-card p-5">
                        <p className="stitch-kicker">{t("PROGRES KELAS")}</p>
                        <p className="mt-3 text-3xl font-extrabold">
                            {Math.round(lessons.length ? (completed / lessons.length) * 100 : 0)}%
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {completed} {t("dari")} {lessons.length} {t("pelajaran selesai")}
                        </p>
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
                            className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-link"
                        >
                            {t("Lihat semua progres")} <ArrowRight className="size-4" />
                        </Link>
                    </div>
                    <div className="stitch-card p-5">
                        <span className="flex size-10 items-center justify-center rounded-xl bg-[#ecfdf5] text-[#006c4a]">
                            <CirclePlay className="size-5" />
                        </span>
                        <h3 className="mt-4 text-sm font-extrabold">{t("Belajar lewat latihan")}</h3>
                        <p className="mt-2 text-xs leading-5 text-muted-foreground">
                            {t("Setiap pelajaran dapat memuat latihan untuk mencoba materi yang baru dibaca.")}
                        </p>
                        {aksara && (
                            <Link
                                href="/latihan-aksara"
                                className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-link"
                            >
                                {t("Ruang latihan aksara")} <ArrowRight className="size-4" />
                            </Link>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
}
