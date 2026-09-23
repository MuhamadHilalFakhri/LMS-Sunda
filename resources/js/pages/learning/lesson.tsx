import { t } from "@/lib/ui-language";
import { Head, Link, router } from "@inertiajs/react";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, ChevronRight, Volume2 } from "lucide-react";
import { useState } from "react";
import { pathUrl, type Lesson, type Block } from "@/types/learning";

function ContentBlock({ block }: { block: Block }) {
    return (
        <section className="stitch-card overflow-hidden">
            <div className="p-6 md:p-8">
                {block.title && <h2 className="text-xl font-extrabold">{block.title}</h2>}
                {block.body && <p className="mt-4 leading-8 whitespace-pre-line">{block.body}</p>}
                {(block.latin || block.sundanese) && (
                    <div className="mt-5 rounded-2xl bg-[#f5f2ff] px-5 py-4 dark:bg-secondary">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            {block.latin && (
                                <p lang="su" className="text-[24px] font-semibold">
                                    {block.latin}
                                </p>
                            )}
                            {block.sundanese && (
                                <p lang="su" className="sunda-script text-[30px]">
                                    {block.sundanese}
                                </p>
                            )}
                        </div>
                        {block.translation && (
                            <p className="mt-2 text-sm text-muted-foreground">
                                {block.translation}
                            </p>
                        )}
                    </div>
                )}
                {!block.latin && !block.sundanese && block.translation && (
                    <p className="mt-3 text-muted-foreground">{block.translation}</p>
                )}
                {(block.region || block.register || block.context) && (
                    <div className="mt-5 rounded-2xl bg-[#ecfdf5] p-4 text-[#064e3b]">
                        <p className="text-xs font-semibold text-muted-foreground">
                            {t("KONTEKS PEMAKAIAN")}
                        </p>
                        <p className="mt-2 text-sm font-semibold">
                            {[
                                block.region && `Ragam ${block.region}`,
                                block.register && `Tingkat tutur: ${block.register}`,
                            ]
                                .filter(Boolean)
                                .join(" · ")}
                        </p>
                        {block.context && (
                            <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                {block.context}
                            </p>
                        )}
                    </div>
                )}
            </div>
            {block.audio_path && (
                <div className="border-t bg-secondary/40 px-6 py-4 md:px-8">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                        <Volume2 className="size-4" /> {t("Dengarkan")}{" "}
                        {block.latin || block.title || "contoh pelafalan"}
                    </div>
                    <audio
                        controls
                        preload="none"
                        src={`/storage/${block.audio_path}`}
                        className="max-w-full"
                    >
                        {t("Audio tidak dapat diputar di browser ini.")}
                    </audio>
                </div>
            )}
        </section>
    );
}

export default function LessonPage({ lesson }: { lesson: Lesson }) {
    const [processing, setProcessing] = useState(false);
    const back = lesson.unit?.path ? pathUrl(lesson.unit.path) : "/dashboard";
    return (
        <div className="page-wrap py-7 md:py-9">
            <Head title={lesson.title} />
            <div className="mb-5 text-xs font-semibold text-muted-foreground">
                <Link href="/dashboard" className="hover:text-link">
                    {t("Beranda")}
                </Link>{" "}
                <ChevronRight className="mx-1 inline size-3" />
                <Link href={back} className="hover:text-link">
                    {lesson.unit?.path?.title}
                </Link>{" "}
                <ChevronRight className="mx-1 inline size-3" />
                {lesson.title}
            </div>
            <div className="rounded-[28px] bg-[#eeeaff] p-7 text-[#1b1b24] md:p-10">
                <p className="stitch-kicker">{lesson.unit?.title} {t("· PELAJARAN")}</p>
                <h1 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
                    {lesson.title}
                </h1>
                {lesson.summary && (
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                        {lesson.summary}
                    </p>
                )}
            </div>
            <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
                <div className="min-w-0 space-y-5">
                    {lesson.blocks?.map((block) => (
                        <ContentBlock key={block.id} block={block} />
                    ))}
                    {!lesson.blocks?.length && (
                        <div className="stitch-card p-6 text-sm text-muted-foreground">
                            {t("Isi pelajaran belum tersedia.")}
                        </div>
                    )}
                    {!!lesson.exercises?.length && (
                        <section className="pt-5">
                            <div className="mb-4 flex items-center gap-2">
                                <BookOpen className="size-5 text-link" />
                                <h2 className="text-xl font-semibold">{t("Uji pemahaman")}</h2>
                            </div>
                            <p className="mb-5 text-sm leading-6 text-muted-foreground">
                                {t("Kerjakan latihan untuk melihat jawaban dan penjelasannya.")}
                            </p>
                            <div className="space-y-3">
                                {lesson.exercises.map((exercise) => (
                                    <Link
                                        key={exercise.id}
                                        href={`/latihan/${exercise.id}`}
                                        className="stitch-card flex min-h-16 items-center justify-between gap-3 px-5 font-semibold hover:border-[#aaa4ff]"
                                    >
                                        {exercise.title}
                                        <ArrowRight className="size-4 text-link" />
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-6">
                        <Link href={back} className="btn-secondary">
                            {t("Kembali ke kelas")}
                        </Link>
                        <button
                            type="button"
                            disabled={processing}
                            className="btn-primary"
                            onClick={() => {
                                setProcessing(true);
                                router.post(
                                    `/pelajaran/${lesson.id}/selesai`,
                                    {},
                                    { onFinish: () => setProcessing(false) },
                                );
                            }}
                        >
                            {t(processing ? "Menyimpan..." : "Tandai selesai")}
                        </button>
                    </div>
                </div>
                <aside className="space-y-4">
                    <div className="stitch-card p-5">
                        <span className="flex size-10 items-center justify-center rounded-xl bg-[#efedff] text-[#493ee5]">
                            <BookOpen className="size-5" />
                        </span>
                        <h2 className="mt-4 text-sm font-extrabold">{t("Dalam pelajaran ini")}</h2>
                        <p className="mt-2 text-xs leading-6 text-muted-foreground">
                            {lesson.blocks?.length ?? 0} {t("bagian materi ·")}{" "}
                            {lesson.exercises?.length ?? 0} {t("latihan")}
                        </p>
                    </div>
                    <div className="rounded-2xl bg-[#ecfdf5] p-5 text-[#064e3b]">
                        <CheckCircle2 className="size-6" />
                        <h3 className="mt-3 text-sm font-extrabold">{t("Selesai membaca?")}</h3>
                        <p className="mt-2 text-xs leading-5">
                            {t("Tandai pelajaran selesai agar progres belajar tersimpan.")}
                        </p>
                    </div>
                </aside>
            </div>
        </div>
    );
}
