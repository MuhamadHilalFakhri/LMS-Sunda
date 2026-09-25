import PaginationControls, { type PaginationMeta } from "@/components/pagination-controls";
import { t } from "@/lib/ui-language";
import { Head, Link } from "@inertiajs/react";
import { ArrowRight, BookOpen, RotateCcw, TriangleAlert } from "lucide-react";

type ReviewItem = {
    id: number;
    exerciseId: number;
    kind: "practice" | "quiz";
    exerciseTitle: string;
    lessonId: number;
    lessonTitle: string;
    pathTitle: string;
    prompt: string;
    submitted: string | null;
    answer: string;
    explanation: string;
    createdAt: string;
};

export default function ReviewPage({
    items,
    pagination,
    reviewCount,
}: {
    items: ReviewItem[];
    pagination: PaginationMeta;
    reviewCount: number;
}) {
    return (
        <div className="page-wrap py-7 md:py-9">
            <Head title={t("Ulasan jawaban") } />
            <p className="stitch-kicker">{t("BELAJAR DARI HASIL")}</p>
            <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">{t("Ulasan jawaban")}</h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                        {t("Tinjau jawaban yang keliru dari percobaan terakhir tiap soal, lalu ulangi latihan untuk memperkuat pemahaman.")}
                    </p>
                </div>
                <span className="rounded-full bg-[#fff3d8] px-3 py-2 text-xs font-bold text-[#a34b05]">{reviewCount} {t("soal untuk ditinjau")}</span>
            </div>

            {items.length ? (
                <section className="stitch-card mt-6 overflow-hidden">
                    <div className="divide-y">
                        {items.map((item, index) => (
                            <article key={`${item.exerciseId}-${item.id}`} className="p-5 md:p-6">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex min-w-0 items-center gap-2 text-xs font-bold text-muted-foreground">
                                        <span className="rounded-md bg-secondary px-2 py-1">No. {pagination.from + index}</span>
                                        <span className="truncate">{item.pathTitle} · {item.lessonTitle}</span>
                                    </div>
                                    <Link href={`/${item.kind === "quiz" ? "kuis" : "latihan"}/${item.exerciseId}`} className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-[#493ee5] px-3 text-xs font-bold text-white hover:bg-[#372bc7]">
                                        <RotateCcw className="size-3.5" /> {t(item.kind === "quiz" ? "Coba kuis lagi" : "Ulangi latihan")}
                                    </Link>
                                </div>
                                <h2 className="mt-4 text-base font-extrabold leading-6">{item.prompt}</h2>
                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-xl bg-[#fff1f0] p-3">
                                        <p className="text-[10px] font-bold uppercase tracking-wide text-[#a03a39]">{t("Jawaban Anda")}</p>
                                        <p lang="su" className="sunda-script mt-1 break-words text-base font-semibold">{item.submitted || t("Tidak dijawab")}</p>
                                    </div>
                                    <div className="rounded-xl bg-[#ecfdf5] p-3">
                                        <p className="text-[10px] font-bold uppercase tracking-wide text-[#17633a]">{t("Jawaban benar")}</p>
                                        <p lang="su" className="sunda-script mt-1 break-words text-base font-semibold">{item.answer}</p>
                                    </div>
                                </div>
                                {item.explanation && <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.explanation}</p>}
                                <Link href={`/pelajaran/${item.lessonId}`} className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-link hover:underline">
                                    <BookOpen className="size-3.5" /> {t("Buka materi terkait")} <ArrowRight className="size-3.5" />
                                </Link>
                            </article>
                        ))}
                    </div>
                    <PaginationControls pagination={pagination} />
                </section>
            ) : (
                <section className="stitch-card mt-6 p-8 text-center">
                    <TriangleAlert className="mx-auto size-9 text-[#006c4a]" />
                    <h2 className="mt-3 font-extrabold">{t("Semua jawaban terbaru sudah benar")}</h2>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{t("Setelah mengerjakan latihan, bagian yang perlu dipelajari ulang akan muncul di sini.")}</p>
                    <Link href="/dashboard" className="btn-primary mt-5">{t("Pilih pelajaran")}</Link>
                </section>
            )}
        </div>
    );
}
