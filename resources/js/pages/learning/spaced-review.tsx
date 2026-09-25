import { t } from "@/lib/ui-language";
import { Head, Link, router } from "@inertiajs/react";
import { ArrowLeft, ArrowRight, BookOpen, Check, Headphones, RotateCcw, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

type ReviewCard = {
    id: number;
    lesson_block_id: number;
    type: "vocabulary" | "script";
    title: string | null;
    body: string | null;
    latin: string | null;
    sundanese: string | null;
    translation: string | null;
    context: string | null;
    audio_path: string | null;
    lesson_id: number;
    lesson_title: string;
    path_title: string;
};

const ratings = [
    { value: "again", label: "Belum ingat", hint: "Ulangi sebentar lagi", icon: RotateCcw, className: "border-[#f2c6c3] bg-[#fff3f2] text-[#a03a39] hover:bg-[#ffe7e5]" },
    { value: "hard", label: "Sulit", hint: "Jadwalkan lebih cepat", icon: ArrowLeft, className: "border-[#ead7b4] bg-[#fff9ea] text-[#8b5a0a] hover:bg-[#fff1cf]" },
    { value: "good", label: "Ingat", hint: "Lanjutkan jadwal", icon: Check, className: "border-[#b9e1c9] bg-[#effaf3] text-[#17633a] hover:bg-[#e1f5e9]" },
    { value: "easy", label: "Mudah", hint: "Jadwalkan lebih lama", icon: Sparkles, className: "border-[#d4cef9] bg-[#f4f1ff] text-[#493ee5] hover:bg-[#ebe7ff]" },
] as const;

export default function SpacedReviewPage({
    cards,
    dueCount,
    totalCount,
    nextReviewAt,
}: {
    cards: ReviewCard[];
    dueCount: number;
    totalCount: number;
    nextReviewAt: string | null;
}) {
    const [revealed, setRevealed] = useState(false);
    const [processing, setProcessing] = useState(false);
    const card = cards[0];

    useEffect(() => setRevealed(false), [card?.id]);

    const rateCard = (rating: string) => {
        if (!card || processing) return;
        setProcessing(true);
        router.post(`/ulangan/${card.lesson_block_id}`, { rating }, {
            preserveScroll: true,
            onSuccess: () => setRevealed(false),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <div className="page-wrap py-7 md:py-9">
            <Head title={t("Ulangan terjadwal")} />
            <div className="mb-5 text-xs font-semibold text-muted-foreground">
                <Link href="/dashboard" className="hover:text-link">{t("Beranda")}</Link> / {t("Ulangan terjadwal")}
            </div>
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="stitch-kicker">{t("INGAT LEBIH LAMA")}</p>
                    <h1 className="mt-1 text-3xl font-extrabold tracking-tight">{t("Ulangan terjadwal")}</h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                        {t("Ulangi kosakata dan aksara yang sudah dipelajari. Beri nilai seberapa mudah Anda mengingatnya agar jadwal berikutnya menyesuaikan.")}
                    </p>
                </div>
                <div className="flex gap-2 text-xs font-bold">
                    <span className="rounded-full bg-[#efedff] px-3 py-2 text-[#493ee5]">{dueCount} {t("perlu diulang")}</span>
                    <span className="rounded-full bg-secondary px-3 py-2 text-muted-foreground">{totalCount} {t("tersimpan")}</span>
                </div>
            </header>

            {card ? (
                <section className="stitch-card mx-auto mt-7 max-w-3xl overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 md:px-7">
                        <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                            <span className="rounded-full bg-secondary px-2.5 py-1 font-bold text-foreground">{t(card.type === "script" ? "AKSARA" : "KOSAKATA")}</span>
                            <span className="truncate">{card.path_title} · {card.lesson_title}</span>
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground">{dueCount} {t("tersisa hari ini")}</span>
                    </div>
                    <div className="p-5 md:p-8">
                        {card.audio_path && (
                            <div className="mb-5 rounded-2xl border border-[#d8eaf6] bg-[#f1f8fc] p-4">
                                <p className="mb-2 flex items-center gap-2 text-sm font-bold text-[#194568]"><Headphones className="size-4"/>{t("Dengarkan sebelum menjawab")}</p>
                                <audio controls preload="none" src={`/storage/${card.audio_path}`} className="h-10 w-full" />
                            </div>
                        )}
                        <div className="rounded-2xl bg-[#f4f1ff] px-5 py-8 text-center md:px-8 md:py-10">
                            <p className="text-xs font-bold uppercase tracking-wide text-[#5548d8]">{t("Coba ingat artinya")}</p>
                            <p lang={card.type === "script" ? "su" : undefined} className={`mt-4 break-words font-extrabold text-[#25223b] ${card.type === "script" ? "sunda-script text-6xl" : "text-3xl"}`}>
                                {card.type === "script" ? (card.sundanese || card.latin || card.body) : (card.latin || card.title || card.body)}
                            </p>
                            {card.type === "script" && card.latin && <p className="mt-2 text-sm text-muted-foreground">{t("Bunyi atau bacaan aksara ini apa?")}</p>}
                        </div>
                        {revealed ? (
                            <div className="mt-4 rounded-2xl border border-[#b9e1c9] bg-[#effaf3] p-5">
                                <p className="text-xs font-bold uppercase tracking-wide text-[#17633a]">{t("Jawaban")}</p>
                                {card.type === "script" && card.latin && <p className="mt-2 text-lg font-extrabold">{card.latin}</p>}
                                {card.translation && <p className="mt-2 text-lg font-extrabold">{card.translation}</p>}
                                {card.body && card.type === "script" && <p className="mt-2 text-sm">{card.body}</p>}
                                {card.context && <p className="mt-3 border-t border-[#cfe9d9] pt-3 text-sm leading-6 text-[#385a47]">{card.context}</p>}
                                <Link href={`/pelajaran/${card.lesson_id}`} className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-link hover:underline">
                                    <BookOpen className="size-3.5"/>{t("Buka materi lengkap")}<ArrowRight className="size-3.5"/>
                                </Link>
                            </div>
                        ) : (
                            <button type="button" onClick={() => setRevealed(true)} className="btn-primary mt-4 w-full justify-center">
                                {t("Tampilkan arti dan jawaban")}
                            </button>
                        )}
                        {revealed && (
                            <div className="mt-5">
                                <p className="mb-3 text-center text-sm font-bold">{t("Seberapa mudah Anda mengingatnya?")}</p>
                                <div className="grid gap-2 sm:grid-cols-4">
                                    {ratings.map(({ value, label, hint, icon: Icon, className }) => (
                                        <button key={value} type="button" disabled={processing} onClick={() => rateCard(value)} className={`flex min-h-16 items-center gap-2 rounded-xl border px-3 text-left transition-colors disabled:opacity-50 ${className}`}>
                                            <Icon className="size-4 shrink-0"/>
                                            <span><strong className="block text-sm">{t(label)}</strong><small className="text-[10px] opacity-75">{t(hint)}</small></span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            ) : (
                <section className="stitch-card mx-auto mt-7 max-w-3xl p-7 text-center md:p-10">
                    <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#effaf3] text-[#17633a]"><Check className="size-6"/></span>
                    <h2 className="mt-4 text-xl font-extrabold">{totalCount === 0 ? t("Mulai kumpulkan kartu belajar") : t("Semua kartu sudah ditinjau")}</h2>
                    <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                        {totalCount === 0
                            ? t("Buka pelajaran Bahasa Sunda atau Aksara Sunda. Kosakata dan karakter yang Anda pelajari akan masuk ke sini secara otomatis.")
                            : nextReviewAt
                                ? `${t("Kartu berikutnya dijadwalkan pada")} ${new Date(nextReviewAt).toLocaleString()}. ${t("Anda bisa kembali saat waktunya tiba.")}`
                                : t("Belum ada kartu yang jatuh tempo. Kartu baru akan muncul setelah Anda membuka pelajaran.")}
                    </p>
                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                        <Link href="/belajar/bahasa-sunda" className="btn-primary">{t("Buka materi belajar")}</Link>
                        <Link href="/dashboard" className="btn-secondary">{t("Kembali ke beranda")}</Link>
                    </div>
                </section>
            )}
        </div>
    );
}
