import { t } from "@/lib/ui-language";
import { Head, Link } from "@inertiajs/react";
import { ArrowRight, CheckCircle2, PenLine, Sparkles } from "lucide-react";
import type { Exercise } from "@/types/learning";

type Attempt = { correct_count: number; total_count: number };

export default function ScriptExercises({
    exercises,
    attempts,
}: {
    exercises: (Exercise & { questions_count: number })[];
    attempts: Record<number, Attempt>;
}) {
    return (
        <div className="page-wrap py-8 md:py-10">
            <Head title={t("Latihan Aksara Sunda")} />
            <div className="mb-6 text-sm text-muted-foreground">
                <Link href="/dashboard" className="hover:text-link">
                    {t("Beranda")}
                </Link>{" "}
                / <span className="text-foreground">{t("Latihan Aksara")}</span>
            </div>
            <div className="relative overflow-hidden rounded-[28px] bg-[#eeeaff] p-7 text-[#1b1b24] md:p-10">
                <div className="relative z-10 max-w-[650px]">
                    <span className="stitch-kicker">{t("RUANG LATIHAN")}</span>
                    <h1 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
                        {t("Mengenal dan menulis Aksara Sunda")}
                    </h1>
                    <p className="mt-3 max-w-xl leading-7 text-muted-foreground">
                        {t("Pilih latihan dari materi yang tersedia. Kerjakan soal baca, susun, dan tulis aksara sesuai langkah belajar Anda.")}
                    </p>
                </div>
                <div
                    lang="su"
                    aria-hidden="true"
                    className="sunda-script absolute -bottom-10 right-5 hidden rotate-[-12deg] text-[130px] font-bold text-[#493ee5]/15 md:block"
                >
                    {t("ᮃᮊ᮪ᮞᮛ")}
                </div>
            </div>
            <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_290px]">
                <section>
                    <div className="mb-4 flex items-end justify-between">
                        <div>
                            <p className="stitch-kicker">{t("PILIH LATIHAN")}</p>
                            <h2 className="mt-1 text-xl font-extrabold">{t("Semua latihan aksara")}</h2>
                        </div>
                        <span className="text-sm text-muted-foreground">
                            {exercises.length} {t("latihan")}
                        </span>
                    </div>
                    <div className="space-y-3">
                        {exercises.length ? (
                            exercises.map((exercise, index) => (
                                <Link
                                    key={exercise.id}
                                    href={`/latihan/${exercise.id}`}
                                    className="stitch-card group flex items-center gap-4 p-4 hover:border-[#aaa4ff] md:p-5"
                                >
                                    <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#efedff] text-[#493ee5]">
                                        <PenLine className="size-6" />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="text-[11px] font-bold text-[#493ee5]">
                                            {t("LATIHAN")} {String(index + 1).padStart(2, "0")} ·{" "}
                                            {exercise.lesson?.unit?.title}
                                        </span>
                                        <strong className="mt-1 block text-base group-hover:text-link">
                                            {exercise.title}
                                        </strong>
                                        <span className="mt-1 block text-xs text-muted-foreground">
                                            {exercise.questions_count} {t("soal ·")}{" "}
                                            {exercise.lesson?.title}
                                        </span>
                                    </span>
                                    {attempts[exercise.id] ? (
                                        <span className="hidden items-center gap-1 text-xs font-bold text-[#006c4a] sm:flex">
                                            <CheckCircle2 className="size-4" />{" "}
                                            {attempts[exercise.id].correct_count}/
                                            {attempts[exercise.id].total_count}
                                        </span>
                                    ) : null}
                                    <ArrowRight className="size-4 shrink-0 text-[#493ee5]" />
                                </Link>
                            ))
                        ) : (
                            <div className="stitch-card p-7 text-sm text-muted-foreground">
                                {t("Latihan aksara belum diterbitkan. Buka kelas Aksara Sunda untuk melihat materi yang sudah tersedia.")}
                            </div>
                        )}
                    </div>
                </section>
                <aside className="space-y-4">
                    <div className="stitch-card p-5">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-[#ecfdf5] text-[#006c4a]">
                            <Sparkles className="size-5" />
                        </div>
                        <h3 className="mt-4 font-extrabold">{t("Mulai dari materi")}</h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            {t("Kenali bentuk aksara dan cara membacanya sebelum menjawab soal.")}
                        </p>
                        <Link
                            href="/belajar/aksara-sunda"
                            className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-link"
                        >
                            {t("Buka kelas Aksara")} <ArrowRight className="size-4" />
                        </Link>
                    </div>
                    <div className="rounded-2xl bg-[#493ee5] p-5 text-white">
                        <p className="text-xs font-bold tracking-wide text-white/75">
                            {t("AKSARA SUNDA")}
                        </p>
                        <p lang="su" className="sunda-script mt-2 text-4xl">
                            {t("ᮘᮞ ᮞᮥᮔ᮪ᮓ")}
                        </p>
                        <p className="mt-3 text-xs leading-5 text-white/80">
                            {t("Gunakan palet aksara pada soal menulis jika papan ketik belum mendukung.")}
                        </p>
                    </div>
                </aside>
            </div>
        </div>
    );
}
