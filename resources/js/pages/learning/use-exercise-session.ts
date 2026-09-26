import { t } from '@/lib/ui-language';
import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { ExercisePageData } from '@/pages/learning/exercise-page-types';

export function useExerciseSession(exercise: ExercisePageData) {
    const isQuiz = exercise.kind === 'quiz';
    const [answers, setAnswers] = useState<Record<number, string>>(() =>
        Object.fromEntries(exercise.questions.map((item) => [item.id, ''])),
    );
    const [index, setIndex] = useState(0);
    const [startedAt] = useState(() =>
        exercise.started_at ? exercise.started_at * 1000 : Date.now(),
    );
    const [processing, setProcessing] = useState(false);
    const [finishDialogOpen, setFinishDialogOpen] = useState(false);
    const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState<string | null>(
        null,
    );
    const timeLimitSeconds =
        exercise.kind === 'quiz' && exercise.time_limit_minutes
            ? exercise.time_limit_minutes * 60
            : null;
    const [remainingSeconds, setRemainingSeconds] = useState(() =>
        timeLimitSeconds === null
            ? null
            : Math.max(
                  0,
                  timeLimitSeconds -
                      Math.floor((Date.now() - startedAt) / 1000),
              ),
    );
    const answersRef = useRef(answers);
    const submittingRef = useRef(false);
    const submitRef = useRef<() => void>(() => {});
    const navigationApprovedRef = useRef(false);
    answersRef.current = answers;
    const answeredCount = Object.values(answers).filter(
        (answer) => answer.trim().length > 0,
    ).length;
    const unansweredQuestions = exercise.questions.filter(
        (item) => !answers[item.id]?.trim(),
    );
    const submit = () => {
        if (submittingRef.current || exercise.attempts_remaining === 0) return;
        submittingRef.current = true;
        setProcessing(true);
        if (isQuiz)
            toast.info(t('Jawaban kuis sedang dikirim...'), {
                id: 'quiz-submit',
            });
        router.post(
            `${exercise.kind === 'quiz' ? '/kuis' : '/latihan'}/${exercise.id}`,
            {
                answers: answersRef.current,
                duration_seconds: Math.floor((Date.now() - startedAt) / 1000),
            },
            {
                onSuccess: () => {
                    if (isQuiz)
                        toast.success(t('Jawaban kuis berhasil dikumpulkan.'), {
                            id: 'quiz-submit',
                        });
                },
                onError: (errors) => {
                    if (!isQuiz) return;
                    const firstError = Object.values(errors).find(
                        (message): message is string =>
                            typeof message === 'string' && message.length > 0,
                    );
                    toast.error(
                        firstError
                            ? t(firstError)
                            : t(
                                  'Jawaban kuis gagal dikirim. Periksa kembali sebelum mencoba lagi.',
                              ),
                        { id: 'quiz-submit' },
                    );
                },
                onHttpException: () => {
                    if (isQuiz)
                        toast.error(
                            t(
                                'Server tidak dapat memproses jawaban kuis. Coba lagi.',
                            ),
                            { id: 'quiz-submit' },
                        );
                },
                onNetworkError: () => {
                    if (isQuiz)
                        toast.error(
                            t('Koneksi terputus. Jawaban kuis belum terkirim.'),
                            { id: 'quiz-submit' },
                        );
                },
                onFinish: () => {
                    setProcessing(false);
                    submittingRef.current = false;
                },
            },
        );
    };
    submitRef.current = submit;

    const requestSubmit = () => {
        if (processing || exercise.attempts_remaining === 0) return;
        if (isQuiz) {
            if (answeredCount === 0) {
                toast.warning(
                    t('Pilih minimal satu jawaban sebelum mengumpulkan kuis.'),
                    { id: 'quiz-submit-validation' },
                );
                setIndex(0);
                return;
            }
            if (unansweredQuestions.length > 0) {
                toast.warning(
                    `${t('Masih ada')} ${unansweredQuestions.length} ${t('soal belum dijawab. Periksa kembali sebelum mengumpulkan.')}`,
                    { id: 'quiz-submit-validation' },
                );
            } else {
                toast.info(
                    t(
                        'Semua soal sudah dijawab. Periksa sekali lagi sebelum dikumpulkan.',
                    ),
                    { id: 'quiz-submit-validation' },
                );
            }
            setFinishDialogOpen(true);
            return;
        }
        submit();
    };

    useEffect(() => {
        if (
            !isQuiz ||
            exercise.attempts_remaining === 0 ||
            exercise.questions.length === 0
        )
            return;

        const removeBeforeListener = router.on('before', (event) => {
            if (submittingRef.current) return;
            if (navigationApprovedRef.current) {
                navigationApprovedRef.current = false;
                return;
            }

            const destination = event.detail.visit.url;
            if (
                destination.origin === window.location.origin &&
                destination.pathname === window.location.pathname
            )
                return;

            event.preventDefault();
            setPendingNavigation(destination.href);
            setLeaveDialogOpen(true);
            toast.warning(
                t(
                    'Jawaban belum dikumpulkan. Konfirmasi sebelum meninggalkan kuis.',
                ),
                { id: 'quiz-navigation-warning' },
            );
        });

        const warnBeforeUnload = (event: BeforeUnloadEvent) => {
            if (submittingRef.current) return;
            event.preventDefault();
            event.returnValue = '';
        };
        window.addEventListener('beforeunload', warnBeforeUnload);

        return () => {
            removeBeforeListener();
            window.removeEventListener('beforeunload', warnBeforeUnload);
        };
    }, [exercise.attempts_remaining, exercise.questions.length, isQuiz]);

    useEffect(() => {
        if (timeLimitSeconds === null || exercise.attempts_remaining === 0)
            return;
        let timer: number | undefined;
        const updateTimer = () => {
            const remaining = Math.max(
                0,
                timeLimitSeconds - Math.floor((Date.now() - startedAt) / 1000),
            );
            setRemainingSeconds(remaining);
            if (remaining === 0) {
                if (timer !== undefined) window.clearInterval(timer);
                window.setTimeout(() => submitRef.current(), 0);
            }
        };
        updateTimer();
        timer = window.setInterval(updateTimer, 1000);

        return () => {
            if (timer !== undefined) window.clearInterval(timer);
        };
    }, [startedAt, timeLimitSeconds, exercise.attempts_remaining]);

    const handleLeaveOpenChange = (open: boolean) => {
        setLeaveDialogOpen(open);
        if (!open) setPendingNavigation(null);
    };
    const reviewUnanswered = () => {
        setIndex(
            exercise.questions.findIndex((item) => !answers[item.id]?.trim()),
        );
        setFinishDialogOpen(false);
    };
    const submitConfirmed = () => {
        setFinishDialogOpen(false);
        submit();
    };
    const confirmLeave = () => {
        const destination = pendingNavigation;
        setLeaveDialogOpen(false);
        setPendingNavigation(null);
        if (!destination) return;
        navigationApprovedRef.current = true;
        toast.info(t('Kuis ditinggalkan. Jawaban belum dikumpulkan.'), {
            id: 'quiz-navigation-warning',
        });
        router.visit(destination);
    };

    return {
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
    };
}
