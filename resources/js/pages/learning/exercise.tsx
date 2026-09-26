import { t } from '@/lib/ui-language';

import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Headphones } from 'lucide-react';

import { AnswerField } from '@/pages/learning/exercise-answer-field';
import { ExerciseHeader } from '@/pages/learning/exercise-header';
import { ExerciseSidebar } from '@/pages/learning/exercise-sidebar';
import type { ExercisePageData } from '@/pages/learning/exercise-page-types';
import { ExerciseConfirmationDialogs } from '@/pages/learning/exercise-confirmation-dialogs';
import { useExerciseSession } from '@/pages/learning/use-exercise-session';

export default function ExercisePage({
    exercise,
}: {
    exercise: ExercisePageData;
}) {
    const {
        isQuiz,
        answers,
        setAnswers,
        index,
        setIndex,
        processing,
        finishDialogOpen,
        setFinishDialogOpen,
        leaveDialogOpen,
        remainingSeconds,
        answeredCount,
        unansweredQuestions,
        requestSubmit,
        handleLeaveOpenChange,
        reviewUnanswered,
        submitConfirmed,
        confirmLeave,
    } = useExerciseSession(exercise);
    const question = exercise.questions[index];
    return (
        <div className="page-wrap py-7 md:py-9">
            <Head title={exercise.title} />
            <div className="mb-5 text-xs font-semibold text-muted-foreground">
                <Link href="/dashboard" className="hover:text-link">
                    {t('Beranda')}
                </Link>{' '}
                /{' '}
                <Link href="/latihan-aksara" className="hover:text-link">
                    {t('Latihan')}
                </Link>{' '}
                / <span className="text-foreground">{exercise.title}</span>
            </div>
            <ExerciseHeader
                exercise={exercise}
                isQuiz={isQuiz}
                remainingSeconds={remainingSeconds}
            />
            {isQuiz && exercise.attempts_remaining === 0 ? (
                <div className="stitch-card mt-7 p-8 text-center">
                    <h2 className="text-lg font-extrabold">
                        {t('Batas percobaan kuis tercapai')}
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {t(
                            'Anda sudah menggunakan semua kesempatan untuk kuis ini.',
                        )}
                    </p>
                    <Link href="/progres" className="btn-primary mt-5">
                        {t('Lihat progres')}
                    </Link>
                </div>
            ) : !question ? (
                <div className="stitch-card mt-8 p-8">
                    {t(
                        isQuiz
                            ? 'Kuis ini belum memiliki soal. Kembali ke daftar kuis nanti.'
                            : 'Latihan ini belum memiliki soal. Kembali ke pelajaran dan coba lagi nanti.',
                    )}
                </div>
            ) : (
                <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
                    <div className="min-w-0">
                        <div className="mb-3 flex justify-between text-sm font-semibold">
                            <span>
                                {t('Soal')} {index + 1} {t('dari')}{' '}
                                {exercise.questions.length}
                            </span>
                            <span>
                                {Math.round(
                                    (index / exercise.questions.length) * 100,
                                )}
                                % · {answeredCount}/{exercise.questions.length}{' '}
                                {t('dijawab')}
                            </span>
                        </div>
                        <div className="progress-track">
                            <div
                                className="progress-fill"
                                style={{
                                    width: `${(index / exercise.questions.length) * 100}%`,
                                }}
                            />
                        </div>
                        <section
                            className={`stitch-card mt-6 border-t-4 p-6 md:p-8 ${isQuiz ? 'border-t-[#e9a323]' : 'border-t-[#55a87c]'}`}
                        >
                            <div className="flex flex-wrap items-center gap-2">
                                <span
                                    className={`text-[11px] font-extrabold tracking-wide ${isQuiz ? 'text-[#a34b05]' : 'text-[#006c4a]'}`}
                                >
                                    {t(isQuiz ? 'SOAL KUIS' : 'SOAL LATIHAN')}{' '}
                                    {String(index + 1).padStart(2, '0')}
                                </span>
                                {question.type === 'listening' && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf5ff] px-2.5 py-1 text-[11px] font-bold text-[#235c8b]">
                                        <Headphones className="size-3.5" />
                                        {t('MENYIMAK')}
                                    </span>
                                )}
                            </div>
                            {question.type === 'listening' &&
                                question.audio_path && (
                                    <div className="my-5 rounded-2xl border border-[#d8eaf6] bg-[#f1f8fc] p-4 md:p-5">
                                        <div className="flex items-center gap-3">
                                            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#235c8b]">
                                                <Headphones className="size-5" />
                                            </span>
                                            <div>
                                                <p className="text-sm font-bold text-[#194568]">
                                                    {t('Dengarkan kalimatnya')}
                                                </p>
                                                <p className="mt-0.5 text-xs text-[#496b83]">
                                                    {t(
                                                        'Putar audio, lalu pilih kalimat yang paling sesuai.',
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <audio
                                            controls
                                            preload="none"
                                            src={`/storage/${question.audio_path}`}
                                            className="mt-4 h-11 w-full"
                                        >
                                            {t(
                                                'Peramban Anda tidak mendukung pemutar audio.',
                                            )}
                                        </audio>
                                    </div>
                                )}
                            <h2 className="mt-2 mb-7 text-xl leading-8 font-extrabold">
                                {question.prompt}
                            </h2>
                            <AnswerField
                                question={question}
                                value={answers[question.id] ?? ''}
                                onChange={(value) =>
                                    setAnswers({
                                        ...answers,
                                        [question.id]: value,
                                    })
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
                                {t('Sebelumnya')}
                            </button>
                            {index < exercise.questions.length - 1 ? (
                                <button
                                    type="button"
                                    className={
                                        isQuiz
                                            ? 'inline-flex min-h-11 items-center rounded-xl bg-[#a34b05] px-5 text-sm font-bold text-white hover:bg-[#843b03]'
                                            : 'btn-primary'
                                    }
                                    disabled={
                                        !isQuiz && !answers[question.id]?.trim()
                                    }
                                    onClick={() => setIndex(index + 1)}
                                >
                                    {t('Soal berikutnya')}{' '}
                                    <ArrowRight className="ml-2 size-4" />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className={
                                        isQuiz
                                            ? 'inline-flex min-h-11 items-center rounded-xl bg-[#a34b05] px-5 text-sm font-bold text-white hover:bg-[#843b03]'
                                            : 'btn-primary'
                                    }
                                    disabled={
                                        processing ||
                                        (!isQuiz &&
                                            exercise.questions.some(
                                                (q) => !answers[q.id]?.trim(),
                                            ))
                                    }
                                    onClick={requestSubmit}
                                >
                                    {t(
                                        processing
                                            ? 'Menyimpan...'
                                            : isQuiz
                                              ? 'Kumpulkan kuis'
                                              : 'Kirim jawaban',
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                    <ExerciseSidebar
                        exercise={exercise}
                        question={question}
                        index={index}
                        answers={answers}
                        answeredCount={answeredCount}
                        isQuiz={isQuiz}
                        setIndex={setIndex}
                    />
                </div>
            )}

            <ExerciseConfirmationDialogs
                finishOpen={finishDialogOpen}
                leaveOpen={leaveDialogOpen}
                isQuiz={isQuiz}
                processing={processing}
                unansweredCount={unansweredQuestions.length}
                onFinishOpenChange={setFinishDialogOpen}
                onLeaveOpenChange={handleLeaveOpenChange}
                onReviewUnanswered={reviewUnanswered}
                onSubmit={submitConfirmed}
                onConfirmLeave={confirmLeave}
            />
        </div>
    );
}
