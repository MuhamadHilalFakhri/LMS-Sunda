import { t } from "@/lib/ui-language";
import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, CircleHelp, PenLine } from "lucide-react";
import type { Exercise, Question } from "@/types/learning";

const sundaneseCharacters = [
    "ᮃ",
    "ᮄ",
    "ᮅ",
    "ᮊ",
    "ᮌ",
    "ᮍ",
    "ᮎ",
    "ᮏ",
    "ᮑ",
    "ᮒ",
    "ᮓ",
    "ᮔ",
    "ᮕ",
    "ᮘ",
    "ᮙ",
    "ᮚ",
    "ᮛ",
    "ᮜ",
    "ᮝ",
    "ᮞ",
    "ᮠ",
    "ᮥ",
    "ᮤ",
    "᮪",
];

function AnswerField({
    question,
    value,
    onChange,
}: {
    question: Question;
    value: string;
    onChange: (value: string) => void;
}) {
    if (question.type === "multiple_choice" || question.type === "matching")
        return (
            <div className="grid gap-3 sm:grid-cols-2">
                {question.options?.map((option) => (
                    <label
                        key={option}
                        className={`flex min-h-16 cursor-pointer items-center gap-3 rounded-2xl border px-4 text-sm font-semibold transition-colors ${value === option ? "border-[#493ee5] bg-[#efedff] text-[#493ee5]" : "bg-[#faf9ff] hover:border-[#aaa4ff] dark:bg-secondary"}`}
                    >
                        <input
                            type="radio"
                            name={`q-${question.id}`}
                            checked={value === option}
                            onChange={() => onChange(option)}
                        />
                        <span lang={question.type === "matching" ? "su" : undefined}>{option}</span>
                    </label>
                ))}
            </div>
        );
    if (question.type === "ordering")
        return (
            <>
                <p className="mb-3 text-sm text-muted-foreground">
                    {t("Ketuk bagian sesuai urutan. Gunakan Hapus urutan untuk memulai kembali.")}
                </p>
                <div className="mb-4 min-h-14 rounded-2xl border bg-card p-3">
                    {value || t("Urutan jawaban Anda akan muncul di sini.")}
                </div>
                <div className="flex flex-wrap gap-2">
                    {question.options?.map((part, i) => (
                        <button
                            key={`${part}-${i}`}
                            type="button"
                            className="btn-secondary"
                            onClick={() => onChange(value ? `${value} ${part}` : part)}
                        >
                            {part}
                        </button>
                    ))}
                </div>
                <button
                    type="button"
                    onClick={() => onChange("")}
                    className="mt-3 text-sm font-semibold text-link"
                >
                    {t("Hapus urutan")}
                </button>
            </>
        );
    return (
        <>
            <label className="field-label" htmlFor={`answer-${question.id}`}>
                {t("Jawaban Anda")}
            </label>
            <input
                id={`answer-${question.id}`}
                lang={question.type === "script" ? "su" : undefined}
                className={`field ${question.type === "script" ? "sunda-script text-xl" : ""}`}
                value={value}
                onChange={(event) => onChange(event.target.value)}
            />
            {question.type === "script" && (
                <div className="mt-4">
                    <p className="mb-2 text-sm text-muted-foreground">
                        {t("Palet aksara · pilih karakter atau gunakan papan ketik")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {sundaneseCharacters.map((character) => (
                            <button
                                key={character}
                                type="button"
                                aria-label={`Tambahkan aksara ${character}`}
                                onClick={() => onChange(value + character)}
                                className="sunda-script flex min-h-11 min-w-11 items-center justify-center rounded-xl border bg-card text-xl hover:border-[#493ee5]"
                            >
                                {character}
                            </button>
                        ))}
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => onChange(Array.from(value).slice(0, -1).join(""))}
                        >
                            {t("Hapus")}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default function ExercisePage({
    exercise,
}: {
    exercise: Exercise & { questions: Question[] };
}) {
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [index, setIndex] = useState(0);
    const [startedAt] = useState(Date.now);
    const [processing, setProcessing] = useState(false);
    const question = exercise.questions[index];
    const submit = () => {
        setProcessing(true);
        router.post(
            `/latihan/${exercise.id}`,
            {
                answers,
                duration_seconds: Math.floor((Date.now() - startedAt) / 1000),
            },
            { onFinish: () => setProcessing(false) },
        );
    };
    return (
        <div className="page-wrap py-7 md:py-9">
            <Head title={exercise.title} />
            <div className="mb-5 text-xs font-semibold text-muted-foreground">
                <Link href="/dashboard" className="hover:text-link">
                    {t("Beranda")}
                </Link>{" "}
                /{" "}
                <Link href="/latihan-aksara" className="hover:text-link">
                    {t("Latihan")}
                </Link>{" "}
                / <span className="text-foreground">{exercise.title}</span>
            </div>
            <div className="rounded-[28px] bg-[#eeeaff] p-7 text-[#1b1b24] md:p-9">
                <p className="stitch-kicker">{t("RUANG LATIHAN")}</p>
                <h1 className="mt-2 text-2xl font-extrabold tracking-tight md:text-3xl">
                    {exercise.title}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    {exercise.lesson?.title} · {exercise.questions.length} {t("soal")}
                </p>
            </div>
            {!question ? (
                <div className="stitch-card mt-8 p-8">
                    {t("Latihan ini belum memiliki soal. Kembali ke pelajaran dan coba lagi nanti.")}
                </div>
            ) : (
                <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
                    <div className="min-w-0">
                        <div className="mb-3 flex justify-between text-sm font-semibold">
                            <span>
                                {t("Soal")} {index + 1} {t("dari")} {exercise.questions.length}
                            </span>
                            <span>{Math.round((index / exercise.questions.length) * 100)}%</span>
                        </div>
                        <div className="progress-track">
                            <div
                                className="progress-fill"
                                style={{
                                    width: `${(index / exercise.questions.length) * 100}%`,
                                }}
                            />
                        </div>
                        <section className="stitch-card mt-6 p-6 md:p-8">
                            <span className="stitch-kicker">
                                {t("SOAL")} {String(index + 1).padStart(2, "0")}
                            </span>
                            <h2 className="mb-7 mt-2 text-xl leading-8 font-extrabold">
                                {question.prompt}
                            </h2>
                            <AnswerField
                                question={question}
                                value={answers[question.id] ?? ""}
                                onChange={(value) =>
                                    setAnswers({ ...answers, [question.id]: value })
                                }
                            />
                        </section>
                        <div className="mt-6 flex justify-between gap-4">
                            <button
                                type="button"
                                className="btn-secondary"
                                disabled={index === 0}
                                onClick={() => setIndex(index - 1)}
                            >
                                {t("Sebelumnya")}
                            </button>
                            {index < exercise.questions.length - 1 ? (
                                <button
                                    type="button"
                                    className="btn-primary"
                                    disabled={!answers[question.id]?.trim()}
                                    onClick={() => setIndex(index + 1)}
                                >
                                    {t("Soal berikutnya")} <ArrowRight className="ml-2 size-4" />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="btn-primary"
                                    disabled={
                                        processing ||
                                        exercise.questions.some((q) => !answers[q.id]?.trim())
                                    }
                                    onClick={submit}
                                >
                                    {t(processing ? "Menyimpan..." : "Kirim jawaban")}
                                </button>
                            )}
                        </div>
                    </div>
                    <aside className="space-y-4">
                        <div className="stitch-card p-5">
                            <span className="flex size-10 items-center justify-center rounded-xl bg-[#efedff] text-[#493ee5]">
                                <PenLine className="size-5" />
                            </span>
                            <h2 className="mt-4 text-sm font-extrabold">{t("Progres latihan")}</h2>
                            <p className="mt-2 text-xs text-muted-foreground">
                                {t("Soal")} {index + 1} {t("dari")} {exercise.questions.length}
                            </p>
                            <div className="stitch-progress mt-4">
                                <span
                                    style={{
                                        width: `${(index / exercise.questions.length) * 100}%`,
                                    }}
                                />
                            </div>
                        </div>
                        <div className="rounded-2xl bg-[#ecfdf5] p-5 text-[#064e3b]">
                            <CircleHelp className="size-6" />
                            <h3 className="mt-3 text-sm font-extrabold">{t("Petunjuk")}</h3>
                            <p className="mt-2 text-xs leading-5">
                                {question.type === "script"
                                    ? t("Ketuk karakter pada palet aksara untuk menyusun jawaban, atau ketik langsung.")
                                    : t("Baca soal dengan teliti. Jawaban dan penjelasan muncul setelah seluruh soal dikirim.")}
                            </p>
                        </div>
                        <Link
                            href={`/pelajaran/${exercise.lesson?.id}`}
                            className="inline-flex items-center gap-2 text-xs font-bold text-link"
                        >
                            <ArrowLeft className="size-4" /> {t("Kembali ke pelajaran")}
                        </Link>
                    </aside>
                </div>
            )}
        </div>
    );
}
