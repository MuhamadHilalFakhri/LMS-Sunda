import { t } from "@/lib/ui-language";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Head, Link, router } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, CircleHelp, ClipboardCheck, Clock3, Headphones, PenLine } from "lucide-react";
import { toast } from "sonner";
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
    if (["multiple_choice", "matching", "listening"].includes(question.type))
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
    exercise: Exercise & {
        questions: Question[];
        time_limit_minutes: number | null;
        pass_percentage: number;
        attempt_limit: number | null;
        attempts_used: number;
        attempts_remaining: number | null;
        started_at: number | null;
    };
}) {
    const isQuiz = exercise.kind === "quiz";
    const [answers, setAnswers] = useState<Record<number, string>>(() =>
        Object.fromEntries(exercise.questions.map((item) => [item.id, ""])),
    );
    const [index, setIndex] = useState(0);
    const [startedAt] = useState(() => exercise.started_at ? exercise.started_at * 1000 : Date.now());
    const [processing, setProcessing] = useState(false);
    const [finishDialogOpen, setFinishDialogOpen] = useState(false);
    const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
    const timeLimitSeconds = exercise.kind === "quiz" && exercise.time_limit_minutes ? exercise.time_limit_minutes * 60 : null;
    const [remainingSeconds, setRemainingSeconds] = useState(() =>
        timeLimitSeconds === null ? null : Math.max(0, timeLimitSeconds - Math.floor((Date.now() - startedAt) / 1000)),
    );
    const answersRef = useRef(answers);
    const submittingRef = useRef(false);
    const submitRef = useRef<() => void>(() => {});
    const navigationApprovedRef = useRef(false);
    answersRef.current = answers;
    const question = exercise.questions[index];
    const answeredCount = Object.values(answers).filter((answer) => answer.trim().length > 0).length;
    const unansweredQuestions = exercise.questions.filter((item) => !answers[item.id]?.trim());
    const submit = () => {
        if (submittingRef.current || exercise.attempts_remaining === 0) return;
        submittingRef.current = true;
        setProcessing(true);
        if (isQuiz) toast.info(t("Jawaban kuis sedang dikirim..."), { id: "quiz-submit" });
        router.post(
            `${exercise.kind === "quiz" ? "/kuis" : "/latihan"}/${exercise.id}`,
            {
                answers: answersRef.current,
                duration_seconds: Math.floor((Date.now() - startedAt) / 1000),
            },
            {
                onSuccess: () => {
                    if (isQuiz) toast.success(t("Jawaban kuis berhasil dikumpulkan."), { id: "quiz-submit" });
                },
                onError: (errors) => {
                    if (!isQuiz) return;
                    const firstError = Object.values(errors).find(
                        (message): message is string => typeof message === "string" && message.length > 0,
                    );
                    toast.error(
                        firstError
                            ? t(firstError)
                            : t("Jawaban kuis gagal dikirim. Periksa kembali sebelum mencoba lagi."),
                        { id: "quiz-submit" },
                    );
                },
                onHttpException: () => {
                    if (isQuiz) toast.error(t("Server tidak dapat memproses jawaban kuis. Coba lagi."), { id: "quiz-submit" });
                },
                onNetworkError: () => {
                    if (isQuiz) toast.error(t("Koneksi terputus. Jawaban kuis belum terkirim."), { id: "quiz-submit" });
                },
                onFinish: () => { setProcessing(false); submittingRef.current = false; },
            },
        );
    };
    submitRef.current = submit;

    const requestSubmit = () => {
        if (processing || exercise.attempts_remaining === 0) return;
        if (isQuiz) {
            if (answeredCount === 0) {
                toast.warning(t("Pilih minimal satu jawaban sebelum mengumpulkan kuis."), { id: "quiz-submit-validation" });
                setIndex(0);
                return;
            }
            if (unansweredQuestions.length > 0) {
                toast.warning(
                    `${t("Masih ada")} ${unansweredQuestions.length} ${t("soal belum dijawab. Periksa kembali sebelum mengumpulkan.")}`,
                    { id: "quiz-submit-validation" },
                );
            } else {
                toast.info(t("Semua soal sudah dijawab. Periksa sekali lagi sebelum dikumpulkan."), { id: "quiz-submit-validation" });
            }
            setFinishDialogOpen(true);
            return;
        }
        submit();
    };

    useEffect(() => {
        if (!isQuiz || exercise.attempts_remaining === 0 || exercise.questions.length === 0) return;

        const removeBeforeListener = router.on("before", (event) => {
            if (submittingRef.current) return;
            if (navigationApprovedRef.current) {
                navigationApprovedRef.current = false;
                return;
            }

            const destination = event.detail.visit.url;
            if (destination.origin === window.location.origin && destination.pathname === window.location.pathname) return;

            event.preventDefault();
            setPendingNavigation(destination.href);
            setLeaveDialogOpen(true);
            toast.warning(t("Jawaban belum dikumpulkan. Konfirmasi sebelum meninggalkan kuis."), { id: "quiz-navigation-warning" });
        });

        const warnBeforeUnload = (event: BeforeUnloadEvent) => {
            if (submittingRef.current) return;
            event.preventDefault();
            event.returnValue = "";
        };
        window.addEventListener("beforeunload", warnBeforeUnload);

        return () => {
            removeBeforeListener();
            window.removeEventListener("beforeunload", warnBeforeUnload);
        };
    }, [exercise.attempts_remaining, exercise.questions.length, isQuiz]);

    useEffect(() => {
        if (timeLimitSeconds === null || exercise.attempts_remaining === 0) return;
        let timer: number | undefined;
        const updateTimer = () => {
            const remaining = Math.max(0, timeLimitSeconds - Math.floor((Date.now() - startedAt) / 1000));
            setRemainingSeconds(remaining);
            if (remaining === 0) {
                if (timer !== undefined) window.clearInterval(timer);
                window.setTimeout(() => submitRef.current(), 0);
            }
        };
        updateTimer();
        timer = window.setInterval(updateTimer, 1000);

        return () => { if (timer !== undefined) window.clearInterval(timer); };
    }, [startedAt, timeLimitSeconds, exercise.attempts_remaining]);

    const formatTime = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
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
            <div className={`flex flex-wrap items-center justify-between gap-5 rounded-[28px] p-6 text-[#1b1b24] md:p-8 ${isQuiz ? "bg-[#fff3d8]" : "bg-[#e9f8ef]"}`}>
                <div className="flex min-w-0 items-start gap-4">
                    <span className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${isQuiz ? "bg-white text-[#a34b05]" : "bg-white text-[#006c4a]"}`}>
                        {isQuiz ? <ClipboardCheck className="size-6" /> : <PenLine className="size-6" />}
                    </span>
                    <div className="min-w-0">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-wide ${isQuiz ? "bg-white text-[#a34b05]" : "bg-white text-[#006c4a]"}`}>
                            {t(isQuiz ? "KUIS EVALUASI" : "LATIHAN MANDIRI")}
                        </span>
                        <h1 className="mt-2 text-2xl font-extrabold tracking-tight md:text-3xl">
                            {exercise.title}
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {exercise.lesson?.title} · {exercise.questions.length} {t("soal")}
                        </p>
                    </div>
                </div>
                {isQuiz ? (
                    <div className="flex flex-wrap gap-2 text-xs font-bold">
                        <span className={`inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 ${remainingSeconds !== null && remainingSeconds < 60 ? "text-[#a03a39]" : "text-[#513b1c]"}`}>
                            <Clock3 className="size-4" />
                            {remainingSeconds !== null ? formatTime(remainingSeconds) : t("Tanpa batas waktu")}
                        </span>
                        <span className="rounded-xl bg-white px-3 py-2 text-[#513b1c]">
                            {t("Nilai lulus")} {exercise.pass_percentage}%
                        </span>
                        <span className="rounded-xl bg-white px-3 py-2 text-[#513b1c]">
                            {exercise.attempt_limit
                                ? `${t("Percobaan tersisa")}: ${exercise.attempts_remaining}`
                                : t("Percobaan tanpa batas")}
                        </span>
                    </div>
                ) : (
                    <span className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-bold text-[#006c4a]">
                        <BookOpen className="size-4" /> {t("Bisa diulang · tanpa batas waktu")}
                    </span>
                )}
            </div>
            {isQuiz && exercise.attempts_remaining === 0 ? (
                <div className="stitch-card mt-7 p-8 text-center">
                    <h2 className="text-lg font-extrabold">{t("Batas percobaan kuis tercapai")}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">{t("Anda sudah menggunakan semua kesempatan untuk kuis ini.")}</p>
                    <Link href="/progres" className="btn-primary mt-5">{t("Lihat progres")}</Link>
                </div>
            ) : !question ? (
                <div className="stitch-card mt-8 p-8">
                    {t(isQuiz ? "Kuis ini belum memiliki soal. Kembali ke daftar kuis nanti." : "Latihan ini belum memiliki soal. Kembali ke pelajaran dan coba lagi nanti.")}
                </div>
            ) : (
                <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
                    <div className="min-w-0">
                        <div className="mb-3 flex justify-between text-sm font-semibold">
                            <span>
                                {t("Soal")} {index + 1} {t("dari")} {exercise.questions.length}
                            </span>
                            <span>{Math.round((index / exercise.questions.length) * 100)}% · {answeredCount}/{exercise.questions.length} {t("dijawab")}</span>
                        </div>
                        <div className="progress-track">
                            <div
                                className="progress-fill"
                                style={{
                                    width: `${(index / exercise.questions.length) * 100}%`,
                                }}
                            />
                        </div>
                        <section className={`stitch-card mt-6 border-t-4 p-6 md:p-8 ${isQuiz ? "border-t-[#e9a323]" : "border-t-[#55a87c]"}`}>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className={`text-[11px] font-extrabold tracking-wide ${isQuiz ? "text-[#a34b05]" : "text-[#006c4a]"}`}>
                                    {t(isQuiz ? "SOAL KUIS" : "SOAL LATIHAN")} {String(index + 1).padStart(2, "0")}
                                </span>
                                {question.type === "listening" && <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf5ff] px-2.5 py-1 text-[11px] font-bold text-[#235c8b]"><Headphones className="size-3.5"/>{t("MENYIMAK")}</span>}
                            </div>
                            {question.type === "listening" && question.audio_path && (
                                <div className="my-5 rounded-2xl border border-[#d8eaf6] bg-[#f1f8fc] p-4 md:p-5">
                                    <div className="flex items-center gap-3">
                                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#235c8b]"><Headphones className="size-5"/></span>
                                        <div>
                                            <p className="text-sm font-bold text-[#194568]">{t("Dengarkan kalimatnya")}</p>
                                            <p className="mt-0.5 text-xs text-[#496b83]">{t("Putar audio, lalu pilih kalimat yang paling sesuai.")}</p>
                                        </div>
                                    </div>
                                    <audio controls preload="none" src={`/storage/${question.audio_path}`} className="mt-4 h-11 w-full">
                                        {t("Peramban Anda tidak mendukung pemutar audio.")}
                                    </audio>
                                </div>
                            )}
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
                                    className={isQuiz ? "inline-flex min-h-11 items-center rounded-xl bg-[#a34b05] px-5 text-sm font-bold text-white hover:bg-[#843b03]" : "btn-primary"}
                                    disabled={!isQuiz && !answers[question.id]?.trim()}
                                    onClick={() => setIndex(index + 1)}
                                >
                                    {t("Soal berikutnya")} <ArrowRight className="ml-2 size-4" />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className={isQuiz ? "inline-flex min-h-11 items-center rounded-xl bg-[#a34b05] px-5 text-sm font-bold text-white hover:bg-[#843b03]" : "btn-primary"}
                                    disabled={
                                        processing ||
                                        (!isQuiz && exercise.questions.some((q) => !answers[q.id]?.trim()))
                                    }
                                    onClick={requestSubmit}
                                >
                                    {t(processing ? "Menyimpan..." : isQuiz ? "Kumpulkan kuis" : "Kirim jawaban")}
                                </button>
                            )}
                        </div>
                    </div>
                    <aside className="space-y-4">
                        <div className={`stitch-card p-5 ${isQuiz ? "border-[#f0d8a7]" : "border-[#c7e9d5]"}`}>
                            <span className={`flex size-10 items-center justify-center rounded-xl ${isQuiz ? "bg-[#fff3d8] text-[#a34b05]" : "bg-[#e9f8ef] text-[#006c4a]"}`}>
                                {isQuiz ? <ClipboardCheck className="size-5" /> : <PenLine className="size-5" />}
                            </span>
                            <h2 className="mt-4 text-sm font-extrabold">{t(isQuiz ? "Progres kuis" : "Progres latihan")}</h2>
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
                        <div className="stitch-card p-5">
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="text-sm font-extrabold">{t("Nomor soal")}</h2>
                                <span className="text-[11px] text-muted-foreground">{answeredCount}/{exercise.questions.length} {t("dijawab")}</span>
                            </div>
                            <div className="mt-3 grid max-h-44 grid-cols-5 gap-2 overflow-y-auto pr-1">
                                {exercise.questions.map((item, itemIndex) => {
                                    const isAnswered = Boolean(answers[item.id]?.trim());
                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            aria-current={itemIndex === index ? "step" : undefined}
                                            aria-label={`${t("Soal")} ${itemIndex + 1}${isAnswered ? `, ${t("sudah dijawab")}` : `, ${t("belum dijawab")}`}`}
                                            onClick={() => setIndex(itemIndex)}
                                            className={`min-h-9 rounded-lg border text-xs font-bold ${itemIndex === index ? isQuiz ? "border-[#a34b05] bg-[#a34b05] text-white" : "border-[#493ee5] bg-[#493ee5] text-white" : isAnswered ? "border-[#8ed1ad] bg-[#ecfdf5] text-[#006c4a]" : "bg-card text-muted-foreground hover:border-[#aaa4ff]"}`}
                                        >
                                            {itemIndex + 1}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className={`rounded-2xl p-5 ${isQuiz ? "bg-[#fff7e8] text-[#70420d]" : "bg-[#ecfdf5] text-[#064e3b]"}`}>
                            {isQuiz ? <ClipboardCheck className="size-6" /> : <CircleHelp className="size-6" />}
                            <h3 className="mt-3 text-sm font-extrabold">{t(isQuiz ? "Sebelum mengumpulkan" : "Petunjuk")}</h3>
                            <p className="mt-2 text-xs leading-5">
                                {isQuiz
                                    ? t("Periksa kembali jawaban sebelum kuis dikumpulkan.")
                                    : question.type === "script"
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

            <Dialog open={finishDialogOpen} onOpenChange={setFinishDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {unansweredQuestions.length > 0 ? t("Masih ada soal belum dijawab") : t("Kumpulkan kuis?")}
                        </DialogTitle>
                        <DialogDescription>
                            {unansweredQuestions.length > 0
                                ? `${t("Masih ada")} ${unansweredQuestions.length} ${t("soal yang belum dijawab. Anda bisa memeriksanya dulu atau tetap mengumpulkan kuis.")}`
                                : t("Pastikan semua jawaban sudah benar. Setelah dikumpulkan, jawaban tidak dapat diubah.")}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        {unansweredQuestions.length > 0 && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIndex(exercise.questions.findIndex((item) => !answers[item.id]?.trim()));
                                    setFinishDialogOpen(false);
                                }}
                            >
                                {t("Periksa jawaban")}
                            </Button>
                        )}
                        <Button type="button" variant="outline" onClick={() => setFinishDialogOpen(false)}>{t("Kembali ke kuis")}</Button>
                        <Button
                            type="button"
                            disabled={processing}
                            className={isQuiz ? "bg-[#a34b05] text-white hover:bg-[#843b03]" : undefined}
                            onClick={() => {
                                setFinishDialogOpen(false);
                                submit();
                            }}
                        >
                            {t(unansweredQuestions.length > 0 ? "Kumpulkan tetap" : "Kumpulkan kuis")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={leaveDialogOpen} onOpenChange={(open) => {
                setLeaveDialogOpen(open);
                if (!open) setPendingNavigation(null);
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("Keluar dari kuis?")}</DialogTitle>
                        <DialogDescription>
                            {t("Jawaban kuis ini belum dikumpulkan. Jika Anda pindah halaman sekarang, jawaban yang sudah dipilih akan hilang.")}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setLeaveDialogOpen(false)}>{t("Tetap di kuis")}</Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={() => {
                                const destination = pendingNavigation;
                                setLeaveDialogOpen(false);
                                setPendingNavigation(null);
                                if (destination) {
                                    navigationApprovedRef.current = true;
                                    toast.info(t("Kuis ditinggalkan. Jawaban belum dikumpulkan."), { id: "quiz-navigation-warning" });
                                    router.visit(destination);
                                }
                            }}
                        >
                            {t("Keluar dari kuis")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
