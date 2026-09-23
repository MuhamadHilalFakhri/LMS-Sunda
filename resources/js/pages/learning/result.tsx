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
}: {
    attempt: { correct_count: number; total_count: number };
    exercise: { id: number; title: string; lesson_id: number };
    results: Result[];
}) {
    const percent = attempt.total_count
        ? Math.round((attempt.correct_count / attempt.total_count) * 100)
        : 0;
    return (
        <div className="read-wrap py-7 md:py-9">
            <Head title={t("Hasil latihan")} />
            <Link
                href={`/pelajaran/${exercise.lesson_id}`}
                className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-link hover:underline"
            >
                <ArrowLeft className="size-4" /> {t("Kembali ke pelajaran")}
            </Link>
            <h1 className="mt-5 text-3xl font-extrabold tracking-tight">{t("Hasil latihan")}</h1>
            <p className="mt-2 text-muted-foreground">{exercise.title}</p>
            <div className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-[28px] bg-[#eeeaff] p-6 text-[#1b1b24] md:p-8">
                <div>
                    <p className="text-sm font-semibold text-muted-foreground">{t("JAWABAN BENAR")}</p>
                    <p className="mt-2 text-4xl font-semibold">
                        {attempt.correct_count}{" "}
                        <span className="text-2xl text-muted-foreground">
                            / {attempt.total_count}
                        </span>
                    </p>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        {t("Baca penjelasan tiap soal sebelum mencoba lagi.")}
                    </p>
                </div>
                <div className="flex size-20 items-center justify-center rounded-2xl bg-white text-xl font-extrabold text-[#493ee5]">
                    {percent}%
                </div>
            </div>
            <h2 className="mt-10 text-xl font-semibold">{t("Tinjauan jawaban")}</h2>
            <div className="mt-4 space-y-4">
                {results.map((result, i) => (
                    <section key={i} className="stitch-card p-6">
                        <span
                            className={`inline-flex items-center gap-2 text-sm font-semibold ${result.correct ? "text-[#17633a] dark:text-[#b2e7c4]" : "text-[#a03a39] dark:text-[#f4aaaa]"}`}
                        >
                            {result.correct ? (
                                <Check className="size-4" />
                            ) : (
                                <X className="size-4" />
                            )}{" "}
                            {t("Soal")} {i + 1} · {t(result.correct ? "Benar" : "Perlu dipelajari lagi")}
                        </span>
                        <h3 className="mt-3 text-lg font-semibold">{result.prompt}</h3>
                        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                            <div>
                                <dt className="text-muted-foreground">{t("Jawaban Anda")}</dt>
                                <dd lang="su" className="sunda-script mt-1 text-lg font-medium">
                                    {result.submitted || t("Tidak dijawab")}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">{t("Jawaban benar")}</dt>
                                <dd lang="su" className="sunda-script mt-1 text-lg font-medium">
                                    {result.answer}
                                </dd>
                            </div>
                        </dl>
                        <p className="mt-4 border-t pt-4 text-sm leading-7 text-muted-foreground">
                            {result.explanation}
                        </p>
                    </section>
                ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
                <Link href={`/latihan/${exercise.id}`} className="btn-primary gap-2">
                    <RotateCcw className="size-4" /> {t("Coba lagi")}
                </Link>
                <Link href={`/pelajaran/${exercise.lesson_id}`} className="btn-secondary">
                    {t("Kembali ke pelajaran")}
                </Link>
            </div>
        </div>
    );
}
