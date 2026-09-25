import { t } from "@/lib/ui-language";
import { Head, Link, router } from "@inertiajs/react";
import { ArrowLeft, ArrowRight, BookOpen, Bookmark, BookmarkCheck, CheckCircle2, ChevronRight, Lightbulb, List, MessageSquareText, Volume2 } from "lucide-react";
import { useState } from "react";
import { pathUrl, type Lesson, type Block } from "@/types/learning";

function registerExplanation(register: string) {
    const value = register.toLocaleLowerCase("id");
    if (value.includes("loma")) return t("Ragam loma digunakan dalam percakapan akrab. Sesuaikan dengan hubungan dan situasi.");
    if (value.includes("lemes") || value.includes("halus")) return t("Ragam lemes digunakan untuk berbicara dengan sopan dan menghormati lawan bicara.");
    return t("Tingkat tutur dapat berubah sesuai lawan bicara dan situasi.");
}

function cleanBlockTitle(block: Block) {
    return (block.title ?? "")
        .replace(/^(?:Kosakata|Aksara|Fokus pelajaran|Fokus aksara):\s*/i, "")
        .trim();
}

function isAudioAttribution(value: string) {
    return /(?:CC\s?BY|CC0|Wikimedia|OpenSLR|Lingua Libre|audio .* oleh)/iu.test(value);
}

function ContentBlock({ block, saved, onToggleSave, ordinal }: { block: Block; saved: boolean; onToggleSave: () => void; ordinal?: number }) {
    const vocabulary = block.type === "vocabulary";
    const script = block.type === "script";
    const dialogue = block.type === "dialogue";
    const title = cleanBlockTitle(block);
    const term = block.latin || title || t("Bagian materi");
    const titleIsTerm = vocabulary && title.toLocaleLowerCase("id") === term.toLocaleLowerCase("id");
    const introduction = block.type === "text" && /^Fokus pelajaran:/iu.test(block.title ?? "");
    const context = block.context?.trim() || "";
    const genericContext = /^pasangan kata dan arti untuk latihan pengenalan kosakata\.?$/iu.test(context);
    const audioAttribution = context && isAudioAttribution(context) ? context : "";
    const learnerContext = context && !genericContext && !audioAttribution ? context : "";
    const kindLabel = vocabulary ? "KOSAKATA" : script ? "AKSARA SUNDA" : dialogue ? "DIALOG" : introduction ? "PENGANTAR MATERI" : "PENJELASAN";

    return (
        <section id={`block-${block.id}`} className="stitch-card scroll-mt-24 overflow-hidden">
            <header className="flex items-start justify-between gap-4 border-b bg-card px-5 py-4 md:px-6">
                <div className="min-w-0">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#493ee5]">
                        {t(kindLabel)}{vocabulary && ordinal ? ` · ${String(ordinal).padStart(2, "0")}` : ""}
                    </p>
                    {(!vocabulary || (title && !titleIsTerm)) && <h2 className="mt-1 text-lg font-extrabold leading-snug md:text-xl">{title || t("Bagian materi")}</h2>}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    {(block.type === "vocabulary" || block.type === "script" || block.type === "dialogue") && (
                        <button
                            type="button"
                            aria-pressed={saved}
                            aria-label={t(saved ? "Hapus dari materi tersimpan" : "Simpan materi")}
                            title={t(saved ? "Hapus dari materi tersimpan" : "Simpan materi")}
                            onClick={onToggleSave}
                            className={`flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors ${saved ? "bg-[#efedff] text-[#493ee5]" : "text-muted-foreground hover:bg-secondary hover:text-[#493ee5]"}`}
                        >
                            {saved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
                        </button>
                    )}
                </div>
            </header>
            <div className="space-y-4 p-4 md:p-5">
                {vocabulary && (
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl bg-[#f5f2ff] p-4 dark:bg-secondary">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{t("Kata dalam Bahasa Sunda")}</p>
                            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                                <p lang="su" className="text-2xl font-extrabold">{term}</p>
                                {block.sundanese && <p lang="su" className="sunda-script text-3xl text-[#493ee5]">{block.sundanese}</p>}
                            </div>
                        </div>
                        <div className="rounded-xl border bg-card p-4">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{t("Arti dalam Bahasa Indonesia")}</p>
                            <p className="mt-2 text-lg font-bold">{block.translation || t("Arti belum ditulis")}</p>
                        </div>
                    </div>
                )}

                {script && (
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border bg-card p-4">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{t("Bunyi yang dibaca")}</p>
                            <p lang="su" className="mt-2 text-2xl font-extrabold">{block.latin || title || "—"}</p>
                        </div>
                        <div className="rounded-xl bg-[#f5f2ff] p-4 dark:bg-secondary">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{t("Bentuk Aksara Sunda")}</p>
                            <p lang="su" className="sunda-script mt-1 text-4xl text-[#493ee5]">{block.sundanese || "—"}</p>
                        </div>
                        {block.translation && <p className="sm:col-span-2 text-sm leading-6 text-muted-foreground">{block.translation}</p>}
                    </div>
                )}

                {block.body && (
                    <div className={`rounded-xl p-4 ${vocabulary ? "bg-[#ecfdf5] text-[#064e3b]" : "bg-secondary/60"}`}>
                        <div className="flex items-center gap-2 text-xs font-bold">
                            {vocabulary ? <MessageSquareText className="size-4" /> : <BookOpen className="size-4 text-[#493ee5]" />}
                            {t(vocabulary ? "Contoh pemakaian" : dialogue ? "Isi dialog" : introduction ? "Cara mempelajari bagian ini" : "Penjelasan materi")}
                        </div>
                        <p className="mt-2 whitespace-pre-line text-sm leading-6">{block.body}</p>
                        {dialogue && block.translation && (
                            <p className="mt-3 border-t border-current/10 pt-3 text-sm leading-6">
                                <span className="font-bold">{t("Maksud dialog")}: </span>{block.translation}
                            </p>
                        )}
                    </div>
                )}

                {!vocabulary && !script && !dialogue && block.translation && (
                    <div className="rounded-xl border bg-card p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{t("Arti dalam Bahasa Indonesia")}</p>
                        <p className="mt-2 text-sm leading-6">{block.translation}</p>
                    </div>
                )}

                {(block.register || block.region || learnerContext) && (
                    <div className="grid gap-3 sm:grid-cols-2">
                        {block.register && (
                            <div className="rounded-xl bg-[#ecfdf5] p-4 text-[#064e3b]">
                                <p className="text-[10px] font-bold uppercase tracking-wide text-[#087653]">{t("Ragam tutur")}</p>
                                <p className="mt-1 text-sm font-extrabold capitalize">{block.register}</p>
                                <p className="mt-1 text-xs leading-5">{registerExplanation(block.register)}</p>
                            </div>
                        )}
                        {block.region && (
                            <div className="rounded-xl bg-secondary/60 p-4">
                                <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{t("Ragam daerah")}</p>
                                <p className="mt-1 text-sm font-semibold">{block.region}</p>
                            </div>
                        )}
                        {learnerContext && (
                            <div className="rounded-xl border bg-card p-4 sm:col-span-2">
                                <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{t("Kapan digunakan")}</p>
                                <p className="mt-2 text-sm leading-6">{learnerContext}</p>
                            </div>
                        )}
                    </div>
                )}

                {vocabulary && !block.body && !learnerContext && !block.register && !block.region && (
                    <div className="flex gap-2 rounded-xl border border-[#dedbff] bg-[#f8f7ff] p-3 text-xs leading-5 text-muted-foreground">
                        <Lightbulb className="mt-0.5 size-4 shrink-0 text-[#493ee5]" />
                        {t("Cocokkan kata dengan artinya, lalu perhatikan contoh saat kata ini digunakan dalam kalimat.")}
                    </div>
                )}
                {audioAttribution && !block.audio_path && (
                    <p className="text-xs leading-5 text-muted-foreground">{t("Sumber audio")}: {audioAttribution}</p>
                )}
            </div>
            {block.audio_path && (
                <div className="border-t bg-secondary/30 px-4 py-4 md:px-5">
                    <div className="flex items-start gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#efedff] text-[#493ee5]"><Volume2 className="size-4" /></span>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold">{t("Dengarkan pelafalan")}</p>
                            <p lang="su" className="mt-0.5 text-xs text-muted-foreground">{block.latin || title || t("Contoh pelafalan")}</p>
                        </div>
                    </div>
                    <audio
                        controls
                        preload="none"
                        src={`/storage/${block.audio_path}`}
                        className="mt-3 h-10 w-full max-w-xl"
                    >
                        {t("Audio tidak dapat diputar di browser ini.")}
                    </audio>
                    {audioAttribution && <p className="mt-2 max-w-2xl text-[11px] leading-4 text-muted-foreground">{t("Sumber audio")}: {audioAttribution}</p>}
                </div>
            )}
        </section>
    );
}

export default function LessonPage({ lesson, savedBlockIds = [] }: { lesson: Lesson; savedBlockIds: number[] }) {
    const [processing, setProcessing] = useState(false);
    const back = lesson.unit?.path ? pathUrl(lesson.unit.path) : "/dashboard";
    let vocabularyOrdinal = 0;
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
                    {lesson.blocks?.map((block) => {
                        const ordinal = block.type === "vocabulary" ? ++vocabularyOrdinal : undefined;
                        return (
                            <ContentBlock
                                key={block.id}
                                block={block}
                                ordinal={ordinal}
                                saved={savedBlockIds.includes(block.id)}
                                onToggleSave={() => savedBlockIds.includes(block.id)
                                    ? router.delete(`/materi-tersimpan/${block.id}`, { preserveScroll: true })
                                    : router.post(`/materi-tersimpan/${block.id}`, {}, { preserveScroll: true })}
                            />
                        );
                    })}
                    {!lesson.blocks?.length && (
                        <div className="stitch-card p-6 text-sm text-muted-foreground">
                            {t("Isi pelajaran belum tersedia.")}
                        </div>
                    )}
                    {!!lesson.exercises?.length && (
                        <section className="pt-5">
                            <div className="mb-4 flex items-center gap-2">
                                <BookOpen className="size-5 text-link" />
                                <h2 className="text-xl font-semibold">{t("Latihan & kuis")}</h2>
                            </div>
                            <p className="mb-5 text-sm leading-6 text-muted-foreground">
                                {t("Latihan membantu mengulang materi; kuis digunakan untuk evaluasi dan nilai kelulusan.")}
                            </p>
                            <div className="space-y-3">
                                {lesson.exercises.map((exercise) => (
                                    <Link
                                        key={exercise.id}
                                        href={`/${exercise.kind === "quiz" ? "kuis" : "latihan"}/${exercise.id}`}
                                        className="stitch-card flex min-h-16 items-center justify-between gap-3 px-5 font-semibold hover:border-[#aaa4ff]"
                                    >
                                        <span className="flex min-w-0 items-center gap-3">
                                            <span className="truncate">{exercise.title}</span>
                                            <span className="shrink-0 rounded-full bg-[#efedff] px-2.5 py-1 text-[10px] font-bold text-[#493ee5]">{t(exercise.kind === "quiz" ? "Kuis" : "Latihan")}</span>
                                        </span>
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
                    {!!lesson.blocks?.length && (
                        <nav className="stitch-card sticky top-20 p-5" aria-label={t("Navigasi materi pelajaran")}>
                            <div className="flex items-center gap-2">
                                <List className="size-4 text-link" />
                                <h2 className="text-sm font-extrabold">{t("Isi pelajaran")}</h2>
                            </div>
                            <div className="mt-3 max-h-[38vh] space-y-1 overflow-y-auto pr-1">
                                {lesson.blocks.map((block, index) => (
                                    <a key={block.id} href={`#block-${block.id}`} className="block rounded-lg px-2.5 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">
                                        <span className="mr-2 font-bold text-link">{String(index + 1).padStart(2, "0")}</span>
                                        <span className="line-clamp-2">{cleanBlockTitle(block) || block.latin || t("Bagian materi")}</span>
                                    </a>
                                ))}
                            </div>
                        </nav>
                    )}
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
