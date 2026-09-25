import PaginationControls, { type PaginationMeta } from "@/components/pagination-controls";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { t } from "@/lib/ui-language";
import { Head, Link, router } from "@inertiajs/react";
import { ArrowRight, ClipboardCheck, Clock3, GraduationCap, Headphones, RotateCcw, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Exercise } from "@/types/learning";

type Quiz = Exercise & {
    questions_count: number;
    listening_questions_count: number;
    time_limit_minutes: number | null;
    pass_percentage: number;
    attempt_limit: number | null;
    lesson: NonNullable<Exercise["lesson"]> & {
        unit: { title: string; path: { title: string } };
    };
};
type QuizFilters = { q: string; path: string; type: "all" | "standard" | "listening"; status: "all" | "started" | "unstarted" };

export default function QuizzesPage({
    quizzes,
    quizCount,
    attempts,
    pagination,
    filters: appliedFilters,
    pathOptions,
}: {
    quizzes: Quiz[];
    quizCount: number;
    attempts: Record<number, number>;
    pagination: PaginationMeta;
    filters: QuizFilters;
    pathOptions: { slug: string; title: string }[];
}) {
    const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
    const [filters, setFilters] = useState<QuizFilters>(appliedFilters);
    const hasFilters = Boolean(filters.q || filters.path || filters.type !== "all" || filters.status !== "all");

    useEffect(() => setFilters(appliedFilters), [appliedFilters.q, appliedFilters.path, appliedFilters.type, appliedFilters.status]);

    const applyFilters = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.get(
            "/kuis",
            {
                q: filters.q.trim() || undefined,
                path: filters.path || undefined,
                type: filters.type === "all" ? undefined : filters.type,
                status: filters.status === "all" ? undefined : filters.status,
            },
            { preserveScroll: true, preserveState: true, replace: true },
        );
    };

    return (
        <div className="page-wrap py-7 md:py-9">
            <Head title={t("Kuis & evaluasi")} />
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="stitch-kicker">{t("EVALUASI BELAJAR")}</p>
                    <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{t("Kuis & evaluasi")}</h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                        {t("Uji pemahaman materi. Setiap kuis menampilkan aturan waktu, nilai kelulusan, dan sisa percobaan sebelum dimulai.")}
                    </p>
                </div>
                <span className="rounded-full bg-[#efedff] px-3 py-2 text-xs font-bold text-[#493ee5]">{quizCount} {t("kuis ditemukan")}</span>
            </header>

            <form onSubmit={applyFilters} className="stitch-card mt-6 grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-[minmax(14rem,1.5fr)_repeat(3,minmax(10rem,1fr))_auto]">
                <label className="relative block min-w-0 sm:col-span-2 xl:col-span-1">
                    <span className="sr-only">{t("Cari kuis atau materi")}</span>
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                    <input
                        type="search"
                        value={filters.q}
                        onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
                        placeholder={t("Cari kuis atau materi")}
                        className="min-h-11 w-full rounded-xl border border-input bg-card pr-3 pl-9 text-sm outline-none transition focus-visible:border-[#493ee5] focus-visible:ring-2 focus-visible:ring-[#493ee5]/20"
                    />
                </label>
                <label className="min-w-0">
                    <span className="sr-only">{t("Kelas belajar")}</span>
                    <select
                        value={filters.path}
                        onChange={(event) => setFilters((current) => ({ ...current, path: event.target.value }))}
                        className="min-h-11 w-full rounded-xl border border-input bg-card px-3 text-sm outline-none focus-visible:border-[#493ee5] focus-visible:ring-2 focus-visible:ring-[#493ee5]/20"
                    >
                        <option value="">{t("Semua kelas")}</option>
                        {pathOptions.map((path) => <option key={path.slug} value={path.slug}>{path.title}</option>)}
                    </select>
                </label>
                <label className="min-w-0">
                    <span className="sr-only">{t("Jenis kuis")}</span>
                    <select
                        value={filters.type}
                        onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value as QuizFilters["type"] }))}
                        className="min-h-11 w-full rounded-xl border border-input bg-card px-3 text-sm outline-none focus-visible:border-[#493ee5] focus-visible:ring-2 focus-visible:ring-[#493ee5]/20"
                    >
                        <option value="all">{t("Semua jenis")}</option>
                        <option value="standard">{t("Pilihan ganda")}</option>
                        <option value="listening">{t("Ada soal menyimak")}</option>
                    </select>
                </label>
                <label className="min-w-0">
                    <span className="sr-only">{t("Status pengerjaan")}</span>
                    <select
                        value={filters.status}
                        onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value as QuizFilters["status"] }))}
                        className="min-h-11 w-full rounded-xl border border-input bg-card px-3 text-sm outline-none focus-visible:border-[#493ee5] focus-visible:ring-2 focus-visible:ring-[#493ee5]/20"
                    >
                        <option value="all">{t("Semua status")}</option>
                        <option value="unstarted">{t("Belum dikerjakan")}</option>
                        <option value="started">{t("Pernah dikerjakan")}</option>
                    </select>
                </label>
                <div className="flex items-center gap-2 sm:col-span-2 xl:col-span-1">
                    <Button type="submit" className="min-h-11 flex-1 xl:flex-none">{t("Terapkan")}</Button>
                    {hasFilters && <Link href="/kuis" preserveScroll className="btn-secondary min-h-11 px-3">{t("Atur ulang")}</Link>}
                </div>
            </form>

            {quizzes.length ? (
                <section className="stitch-card mt-6 overflow-hidden" aria-label={t("Daftar kuis")}>
                    <div className="grid gap-3 p-4 md:grid-cols-2">
                        {quizzes.map((quiz) => {
                            const used = Number(attempts[quiz.id] ?? 0);
                            const remaining = quiz.attempt_limit === null ? null : Math.max(quiz.attempt_limit - used, 0);
                            const unavailable = remaining === 0;
                            const hasListeningQuestions = quiz.listening_questions_count > 0;
                            return (
                                <article key={quiz.id} className="flex min-w-0 flex-col rounded-2xl border bg-card p-5">
                                    <div className="flex items-start gap-3">
                                        <span
                                            className={`relative flex size-11 shrink-0 items-center justify-center rounded-xl ${hasListeningQuestions ? "bg-[#eaf5ff] text-[#235c8b]" : "bg-[#efedff] text-[#493ee5]"}`}
                                            title={hasListeningQuestions ? t("Kuis ini memiliki soal menyimak audio") : t("Kuis pilihan")}
                                            aria-label={hasListeningQuestions ? t("Kuis ini memiliki soal menyimak audio") : t("Kuis pilihan")}
                                        >
                                            {hasListeningQuestions ? <Headphones className="size-5" /> : <ClipboardCheck className="size-5" />}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[11px] font-bold uppercase tracking-wide text-link">{quiz.lesson.unit.path.title} · {quiz.lesson.unit.title}</p>
                                            <h2 className="mt-1 line-clamp-2 text-base font-extrabold">{quiz.title}</h2>
                                            <p className="mt-1 text-xs text-muted-foreground">{quiz.lesson.title}</p>
                                            {hasListeningQuestions && (
                                                <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#eaf5ff] px-2.5 py-1 text-[10px] font-bold text-[#235c8b]">
                                                    <Headphones className="size-3.5" aria-hidden="true" />
                                                    {quiz.listening_questions_count} {t("soal menyimak audio")}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-secondary/60 p-3 text-center">
                                        <div>
                                            <p className="text-sm font-extrabold">{quiz.questions_count}</p>
                                            <p className="text-[10px] text-muted-foreground">{t("soal")}</p>
                                        </div>
                                        <div>
                                            <p className="flex items-center justify-center gap-1 text-sm font-extrabold">
                                                {quiz.time_limit_minutes ? <><Clock3 className="size-3.5" /> {quiz.time_limit_minutes}m</> : "—"}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground">{t("waktu")}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-extrabold">{quiz.pass_percentage}%</p>
                                            <p className="text-[10px] text-muted-foreground">{t("nilai lulus")}</p>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                                        <span>{quiz.attempt_limit ? `${t("Percobaan tersisa")}: ${remaining}` : t("Percobaan tanpa batas")}</span>
                                        <span>{used > 0 ? `${used} ${t("kali dikerjakan")}` : t("Belum dikerjakan")}</span>
                                    </div>
                                    <button
                                        type="button"
                                        disabled={unavailable}
                                        onClick={() => {
                                            toast.info(t("Periksa informasi kuis sebelum mulai."), { id: "quiz-start-validation" });
                                            setSelectedQuiz(quiz);
                                        }}
                                        className={`mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold ${unavailable ? "bg-secondary text-muted-foreground" : "bg-[#493ee5] text-white hover:bg-[#372bc7]"}`}
                                    >
                                        {unavailable ? <><RotateCcw className="size-4" /> {t("Percobaan habis")}</> : <>{used ? t("Lanjutkan kuis") : t("Mulai kuis")} <ArrowRight className="size-4" /></>}
                                    </button>
                                </article>
                            );
                        })}
                    </div>
                    <PaginationControls pagination={pagination} />
                </section>
            ) : (
                <section className="stitch-card mt-6 p-8 text-center">
                    <GraduationCap className="mx-auto size-9 text-muted-foreground" />
                    <h2 className="mt-3 font-extrabold">{hasFilters ? t("Tidak ada kuis yang cocok") : t("Belum ada kuis tersedia")}</h2>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                        {hasFilters ? t("Ubah atau hapus filter untuk melihat kuis lain.") : t("Kuis akan muncul setelah admin menerbitkan kuis yang memiliki soal.")}
                    </p>
                    {hasFilters ? <Link href="/kuis" className="btn-primary mt-5">{t("Hapus filter")}</Link> : <Link href="/dashboard" className="btn-primary mt-5">{t("Kembali ke Beranda")}</Link>}
                </section>
            )}

            <Dialog open={selectedQuiz !== null} onOpenChange={(open) => { if (!open) setSelectedQuiz(null); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("Siap memulai kuis?")}</DialogTitle>
                        <DialogDescription>
                            {t("Periksa aturan kuis sebelum mulai. Waktu mulai dihitung saat kuis dibuka, dan jawaban dikirim setelah Anda mengumpulkan kuis.")}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedQuiz && (
                        <div className="rounded-xl bg-secondary/60 p-4">
                            <p className="font-bold">{selectedQuiz.title}</p>
                            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                                <div>
                                    <p className="font-extrabold">{selectedQuiz.questions_count}</p>
                                    <p className="text-xs text-muted-foreground">{t("soal")}</p>
                                </div>
                                <div>
                                    <p className="font-extrabold">{selectedQuiz.time_limit_minutes ? `${selectedQuiz.time_limit_minutes} ${t("menit")}` : "—"}</p>
                                    <p className="text-xs text-muted-foreground">{t("waktu")}</p>
                                </div>
                                <div>
                                    <p className="font-extrabold">{selectedQuiz.attempt_limit === null ? "∞" : Math.max(selectedQuiz.attempt_limit - Number(attempts[selectedQuiz.id] ?? 0), 0)}</p>
                                    <p className="text-xs text-muted-foreground">{t("Percobaan tersisa")}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setSelectedQuiz(null)}>{t("Batal")}</Button>
                        <Button
                            type="button"
                            disabled={!selectedQuiz}
                            onClick={() => {
                                if (!selectedQuiz) return;
                                const quizId = selectedQuiz.id;
                                setSelectedQuiz(null);
                                toast.info(t("Kuis dimulai. Selamat mengerjakan!"), { id: "quiz-start" });
                                router.visit(`/kuis/${quizId}`);
                            }}
                        >
                            {t("Mulai sekarang")} <ArrowRight className="size-4" />
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
