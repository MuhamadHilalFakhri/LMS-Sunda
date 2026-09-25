import { t } from "@/lib/ui-language";
import { Head, Link } from "@inertiajs/react";
import { ArrowLeft, Check, RotateCcw, X } from "lucide-react";

type Result = {
    prompt: string;
    submitted: string | null;
    answer: string;
    correct: boolean;
    explanation: string;
};

export default function ResultPage({
    attempt,
    exercise,
    results,
    isQuiz,
    passed,
    passPercentage,
    canRetry,
}: {
    attempt: { correct_count: number; total_count: number };
    exercise: { id: number; title: string; lesson_id: number };
    results: Result[];
    isQuiz: boolean;
    passed: boolean | null;
    passPercentage: number;
    canRetry: boolean;
}) {
    const percent = attempt.total_count
        ? Math.round((attempt.correct_count / attempt.total_count) * 100)
        : 0;
    return (
        <div className="read-wrap py-7 md:py-9">
            <Head title={t(isQuiz ? "Hasil kuis" : "Hasil latihan")} />
            <Link
                href={`/pelajaran/${exercise.lesson_id}`}
                className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-link hover:underline"
            >
                <ArrowLeft className="size-4" /> {t("Kembali ke pelajaran")}
            </Link>
            <h1 className="mt-5 text-3xl font-extrabold tracking-tight">{t(isQuiz ? "Hasil kuis" : "Hasil latihan")}</h1>
            <p className="mt-2 text-muted-foreground">{exercise.title}</p>
            <div className={`mt-7 flex flex-wrap items-center justify-between gap-4 rounded-[28px] p-6 md:p-8 ${isQuiz && passed ? "bg-[#e9f8ef] text-[#123d28]" : isQuiz ? "bg-[#fff3d8] text-[#6d3b08]" : "bg-[#eeeaff] text-[#1b1b24]"}`}>
                <div>
                    <p className="text-sm font-semibold text-muted-foreground">{t(isQuiz ? passed ? "KUIS LULUS" : "BELUM LULUS" : "JAWABAN BENAR")}</p>
                    <p className="mt-2 text-4xl font-semibold">
                        {attempt.correct_count}{" "}
                        <span className="text-2xl text-muted-foreground">
                            / {attempt.total_count}
                        </span>
                    </p>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        {isQuiz ? `${t("Ambang kelulusan")}: ${passPercentage}%. ${t("Baca penjelasan dan tinjau kembali soal yang belum tepat.")}` : t("Baca penjelasan tiap soal sebelum mencoba lagi.")}
                    </p>
                </div>
                <div className="flex size-20 items-center justify-center rounded-2xl bg-white text-xl font-extrabold text-[#493ee5]">
                    {percent}%
                </div>
            </div>
            <h2 className="mt-8 text-xl font-semibold">{t("Tinjauan jawaban")}</h2>
            <div className="mt-4 space-y-3">
                {results.map((result, i) => (
                    <details key={i} open={i === 0} className="stitch-card group overflow-hidden">
                        <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-5 marker:hidden [&::-webkit-details-marker]:hidden md:p-6">
                            <span className="min-w-0">
                                <span className={`inline-flex items-center gap-2 text-sm font-semibold ${result.correct ? "text-[#17633a] dark:text-[#b2e7c4]" : "text-[#a03a39] dark:text-[#f4aaaa]"}`}>
                                    {result.correct ? <Check className="size-4" /> : <X className="size-4" />}
                                    {t("Soal")} {i + 1} · {t(result.correct ? "Benar" : "Perlu dipelajari lagi")}
                                </span>
                                <span className="mt-2 block font-semibold leading-6">{result.prompt}</span>
                            </span>
                            <span className="shrink-0 text-xs font-semibold text-link group-open:hidden">{t("Lihat jawaban")}</span>
                        </summary>
                        <div className="border-t px-5 pb-5 pt-4 md:px-6 md:pb-6">
                            <dl className="grid gap-3 text-sm sm:grid-cols-2">
                                <div>
                                    <dt className="text-muted-foreground">{t("Jawaban Anda")}</dt>
                                    <dd lang="su" className="sunda-script mt-1 text-lg font-medium">{result.submitted || t("Tidak dijawab")}</dd>
                                </div>
                                <div>
                                    <dt className="text-muted-foreground">{t("Jawaban benar")}</dt>
                                    <dd lang="su" className="sunda-script mt-1 text-lg font-medium">{result.answer}</dd>
                                </div>
                            </dl>
                            <p className="mt-4 border-t pt-4 text-sm leading-7 text-muted-foreground">{result.explanation}</p>
                        </div>
                    </details>
                ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
                {canRetry && <Link href={`${isQuiz ? "/kuis" : "/latihan"}/${exercise.id}`} className="btn-primary gap-2">
                    <RotateCcw className="size-4" /> {t(isQuiz ? "Coba kuis lagi" : "Coba lagi")}
                </Link>}
                {isQuiz && <Link href="/kuis" className="btn-secondary">{t("Lihat kuis lain")}</Link>}
                <Link href={`/pelajaran/${exercise.lesson_id}`} className="btn-secondary">
                    {t("Kembali ke pelajaran")}
                </Link>
            </div>
        </div>
    );
}
