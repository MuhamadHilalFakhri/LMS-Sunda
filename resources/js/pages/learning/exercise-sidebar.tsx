import { t } from '@/lib/ui-language';
import { Link } from '@inertiajs/react';
import { ArrowLeft, CircleHelp, ClipboardCheck, PenLine } from 'lucide-react';
import type { Question } from '@/types/learning';
import type { ExercisePageData } from '@/pages/learning/exercise-page-types';

type Props = {
    exercise: ExercisePageData;
    question: Question;
    index: number;
    answers: Record<number, string>;
    answeredCount: number;
    isQuiz: boolean;
    setIndex: (index: number) => void;
};

export function ExerciseSidebar({
    exercise,
    question,
    index,
    answers,
    answeredCount,
    isQuiz,
    setIndex,
}: Props) {
    return (
        <aside className="space-y-4">
            <div
                className={`stitch-card p-5 ${isQuiz ? 'border-[#f0d8a7]' : 'border-[#c7e9d5]'}`}
            >
                <span
                    className={`flex size-10 items-center justify-center rounded-xl ${isQuiz ? 'bg-[#fff3d8] text-[#a34b05]' : 'bg-[#e9f8ef] text-[#006c4a]'}`}
                >
                    {isQuiz ? (
                        <ClipboardCheck className="size-5" />
                    ) : (
                        <PenLine className="size-5" />
                    )}
                </span>
                <h2 className="mt-4 text-sm font-extrabold">
                    {t(isQuiz ? 'Progres kuis' : 'Progres latihan')}
                </h2>
                <p className="mt-2 text-xs text-muted-foreground">
                    {t('Soal')} {index + 1} {t('dari')}{' '}
                    {exercise.questions.length}
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
                    <h2 className="text-sm font-extrabold">
                        {t('Nomor soal')}
                    </h2>
                    <span className="text-[11px] text-muted-foreground">
                        {answeredCount}/{exercise.questions.length}{' '}
                        {t('dijawab')}
                    </span>
                </div>
                <div className="mt-3 grid max-h-44 grid-cols-5 gap-2 overflow-y-auto pr-1">
                    {exercise.questions.map((item, itemIndex) => {
                        const isAnswered = Boolean(answers[item.id]?.trim());
                        return (
                            <button
                                key={item.id}
                                type="button"
                                aria-current={
                                    itemIndex === index ? 'step' : undefined
                                }
                                aria-label={`${t('Soal')} ${itemIndex + 1}${isAnswered ? `, ${t('sudah dijawab')}` : `, ${t('belum dijawab')}`}`}
                                onClick={() => setIndex(itemIndex)}
                                className={`min-h-9 rounded-lg border text-xs font-bold ${itemIndex === index ? (isQuiz ? 'border-[#a34b05] bg-[#a34b05] text-white' : 'border-[#493ee5] bg-[#493ee5] text-white') : isAnswered ? 'border-[#8ed1ad] bg-[#ecfdf5] text-[#006c4a]' : 'bg-card text-muted-foreground hover:border-[#aaa4ff]'}`}
                            >
                                {itemIndex + 1}
                            </button>
                        );
                    })}
                </div>
            </div>
            <div
                className={`rounded-2xl p-5 ${isQuiz ? 'bg-[#fff7e8] text-[#70420d]' : 'bg-[#ecfdf5] text-[#064e3b]'}`}
            >
                {isQuiz ? (
                    <ClipboardCheck className="size-6" />
                ) : (
                    <CircleHelp className="size-6" />
                )}
                <h3 className="mt-3 text-sm font-extrabold">
                    {t(isQuiz ? 'Sebelum mengumpulkan' : 'Petunjuk')}
                </h3>
                <p className="mt-2 text-xs leading-5">
                    {isQuiz
                        ? t('Periksa kembali jawaban sebelum kuis dikumpulkan.')
                        : question.type === 'script'
                          ? t(
                                'Ketuk karakter pada palet aksara untuk menyusun jawaban, atau ketik langsung.',
                            )
                          : t(
                                'Baca soal dengan teliti. Jawaban dan penjelasan muncul setelah seluruh soal dikirim.',
                            )}
                </p>
            </div>
            <Link
                href={`/pelajaran/${exercise.lesson?.id}`}
                className="inline-flex items-center gap-2 text-xs font-bold text-link"
            >
                <ArrowLeft className="size-4" /> {t('Kembali ke pelajaran')}
            </Link>
        </aside>
    );
}
