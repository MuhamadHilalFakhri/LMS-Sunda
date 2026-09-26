import { t } from '@/lib/ui-language';
import { BookOpen, ClipboardCheck, Clock3, PenLine } from 'lucide-react';
import type { ExercisePageData } from '@/pages/learning/exercise-page-types';

type Props = {
    exercise: ExercisePageData;
    isQuiz: boolean;
    remainingSeconds: number | null;
};

export function ExerciseHeader({ exercise, isQuiz, remainingSeconds }: Props) {
    const formatTime = (seconds: number) =>
        `${Math.floor(seconds / 60)
            .toString()
            .padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    return (
        <div
            className={`flex flex-wrap items-center justify-between gap-5 rounded-[28px] p-6 text-[#1b1b24] md:p-8 ${isQuiz ? 'bg-[#fff3d8]' : 'bg-[#e9f8ef]'}`}
        >
            <div className="flex min-w-0 items-start gap-4">
                <span
                    className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${isQuiz ? 'bg-white text-[#a34b05]' : 'bg-white text-[#006c4a]'}`}
                >
                    {isQuiz ? (
                        <ClipboardCheck className="size-6" />
                    ) : (
                        <PenLine className="size-6" />
                    )}
                </span>
                <div className="min-w-0">
                    <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-wide ${isQuiz ? 'bg-white text-[#a34b05]' : 'bg-white text-[#006c4a]'}`}
                    >
                        {t(isQuiz ? 'KUIS EVALUASI' : 'LATIHAN MANDIRI')}
                    </span>
                    <h1 className="mt-2 text-2xl font-extrabold tracking-tight md:text-3xl">
                        {exercise.title}
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {exercise.lesson?.title} · {exercise.questions.length}{' '}
                        {t('soal')}
                    </p>
                </div>
            </div>
            {isQuiz ? (
                <div className="flex flex-wrap gap-2 text-xs font-bold">
                    <span
                        className={`inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 ${remainingSeconds !== null && remainingSeconds < 60 ? 'text-[#a03a39]' : 'text-[#513b1c]'}`}
                    >
                        <Clock3 className="size-4" />
                        {remainingSeconds !== null
                            ? formatTime(remainingSeconds)
                            : t('Tanpa batas waktu')}
                    </span>
                    <span className="rounded-xl bg-white px-3 py-2 text-[#513b1c]">
                        {t('Nilai lulus')} {exercise.pass_percentage}%
                    </span>
                    <span className="rounded-xl bg-white px-3 py-2 text-[#513b1c]">
                        {exercise.attempt_limit
                            ? `${t('Percobaan tersisa')}: ${exercise.attempts_remaining}`
                            : t('Percobaan tanpa batas')}
                    </span>
                </div>
            ) : (
                <span className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-bold text-[#006c4a]">
                    <BookOpen className="size-4" />{' '}
                    {t('Bisa diulang · tanpa batas waktu')}
                </span>
            )}
        </div>
    );
}
