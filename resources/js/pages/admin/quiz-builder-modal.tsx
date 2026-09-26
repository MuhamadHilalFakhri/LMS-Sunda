import { t } from '@/lib/ui-language';
import { router } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import type { QuizLessonChoice, QuizQuestionDraft } from '@/pages/admin/types';
import { QuizBasicFields } from '@/pages/admin/quiz-basic-fields';
import { QuizSettingsFields } from '@/pages/admin/quiz-settings-fields';
import { QuizQuestionDraftCard } from '@/pages/admin/quiz-question-draft-card';

export function QuizBuilderModal({
    lessons,
    initialLessonId,
    close,
}: {
    lessons: QuizLessonChoice[];
    initialLessonId: number | null;
    close: () => void;
}) {
    const subjects = Array.from(
        new Map(
            lessons.map((lesson) => [
                lesson.pathSlug,
                { slug: lesson.pathSlug, title: lesson.pathTitle },
            ]),
        ).values(),
    );
    const initialLesson = lessons.find(
        (lesson) => lesson.id === initialLessonId,
    );
    const [pathSlug, setPathSlug] = useState(
        initialLesson?.pathSlug ?? subjects[0]?.slug ?? '',
    );
    const lessonsInPath = lessons.filter(
        (lesson) => lesson.pathSlug === pathSlug,
    );
    const units = Array.from(
        new Set(lessonsInPath.map((lesson) => lesson.unitTitle)),
    );
    const [unitTitle, setUnitTitle] = useState(
        initialLesson?.unitTitle ?? units[0] ?? '',
    );
    const lessonsInUnit = lessonsInPath.filter(
        (lesson) => lesson.unitTitle === unitTitle,
    );
    const [lessonId, setLessonId] = useState(
        String(initialLesson?.id ?? lessonsInUnit[0]?.id ?? ''),
    );
    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState('30');
    const [passPercentage, setPassPercentage] = useState('70');
    const [attemptLimit, setAttemptLimit] = useState('');
    const [questions, setQuestions] = useState<QuizQuestionDraft[]>([
        {
            key: 'question-1',
            type: 'multiple_choice',
            prompt: '',
            options: ['', '', '', ''],
            answerIndex: 0,
            explanation: '',
            audio: null,
        },
    ]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);
    const nextQuestionNumber = useRef(2);

    const errorFor = (key: string) => errors[key];
    const updateQuestion = (
        key: string,
        update: Partial<QuizQuestionDraft>,
    ) => {
        setQuestions((current) =>
            current.map((question) =>
                question.key === key ? { ...question, ...update } : question,
            ),
        );
    };
    const clearError = (key: string) => {
        setErrors((current) => {
            if (!(key in current)) return current;
            const next = { ...current };
            delete next[key];
            return next;
        });
    };
    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        if (processing) return;
        setProcessing(true);
        setErrors({});
        const form = new FormData();
        form.append('title', title.trim());
        form.append('lesson_id', lessonId);
        form.append('time_limit_minutes', duration);
        form.append('pass_percentage', passPercentage);
        if (attemptLimit.trim())
            form.append('attempt_limit', attemptLimit.trim());
        questions.forEach((question, questionIndex) => {
            const prefix = `questions[${questionIndex}]`;
            form.append(`${prefix}[type]`, question.type);
            form.append(`${prefix}[prompt]`, question.prompt.trim());
            question.options.forEach((option, optionIndex) =>
                form.append(
                    `${prefix}[options][${optionIndex}]`,
                    option.trim(),
                ),
            );
            form.append(
                `${prefix}[answer_index]`,
                String(question.answerIndex),
            );
            form.append(`${prefix}[explanation]`, question.explanation.trim());
            if (question.type === 'listening' && question.audio)
                form.append(`${prefix}[audio]`, question.audio);
        });
        router.post('/admin/quizzes', form, {
            preserveScroll: true,
            forceFormData: true,
            onError: (formErrors) => setErrors(formErrors),
            onSuccess: () => {
                close();
                toast.success(t('Kuis dan soal berhasil disimpan.'));
            },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <Dialog
            open
            onOpenChange={(open) => {
                if (!open && !processing) close();
            }}
        >
            <DialogContent className="max-h-[min(92dvh,820px)] overflow-y-auto border-border bg-card sm:max-w-[760px]">
                <DialogHeader className="pr-7 text-left">
                    <DialogTitle className="text-xl">
                        {t('Buat kuis')}
                    </DialogTitle>
                    <DialogDescription>
                        {t(
                            'Isi informasi kuis, lalu tambahkan soal dan pilih jawaban benar dengan radio.',
                        )}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-5 pt-2">
                    <section className="space-y-4 rounded-2xl bg-secondary/55 p-4">
                        <QuizBasicFields
                            title={title}
                            setTitle={setTitle}
                            clearError={clearError}
                            errorFor={errorFor}
                            subjects={subjects}
                            pathSlug={pathSlug}
                            setPathSlug={setPathSlug}
                            lessons={lessons}
                            lessonsInPath={lessonsInPath}
                            unitTitle={unitTitle}
                            setUnitTitle={setUnitTitle}
                            setLessonId={setLessonId}
                            lessonId={lessonId}
                            lessonsInUnit={lessonsInUnit}
                            duration={duration}
                            setDuration={setDuration}
                        />

                        <QuizSettingsFields
                            passPercentage={passPercentage}
                            setPassPercentage={setPassPercentage}
                            attemptLimit={attemptLimit}
                            setAttemptLimit={setAttemptLimit}
                            errorFor={errorFor}
                            clearError={clearError}
                        />
                    </section>

                    <section className="space-y-3">
                        <div className="flex flex-wrap items-end justify-between gap-2">
                            <div>
                                <h2 className="text-sm font-bold">
                                    {t('Tambah soal')}
                                </h2>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {t(
                                        'Buat soal pilihan ganda biasa atau soal menyimak dengan rekaman audio.',
                                    )}
                                </p>
                            </div>
                            <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-link">
                                {questions.length} {t('soal')}
                            </span>
                        </div>
                        {questions.map((question, questionIndex) => (
                            <QuizQuestionDraftCard
                                key={question.key}
                                question={question}
                                questionIndex={questionIndex}
                                canRemove={questions.length > 1}
                                onRemove={() =>
                                    setQuestions((current) =>
                                        current.filter(
                                            (item) => item.key !== question.key,
                                        ),
                                    )
                                }
                                updateQuestion={updateQuestion}
                                errorFor={errorFor}
                            />
                        ))}
                        {errorFor('questions') && (
                            <p role="alert" className="text-sm text-[#b42335]">
                                {errorFor('questions')}
                            </p>
                        )}
                        <Button
                            type="button"
                            variant="outline"
                            className="min-h-11 w-full"
                            onClick={() => {
                                const number = nextQuestionNumber.current++;
                                setQuestions((current) => [
                                    ...current,
                                    {
                                        key: `question-${number}`,
                                        type: 'multiple_choice',
                                        prompt: '',
                                        options: ['', '', '', ''],
                                        answerIndex: 0,
                                        explanation: '',
                                        audio: null,
                                    },
                                ]);
                            }}
                        >
                            <Plus className="mr-2 size-4" />
                            {t('Tambah soal')}
                        </Button>
                    </section>

                    <DialogFooter className="border-t pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="min-h-11"
                            onClick={close}
                            disabled={processing}
                        >
                            {t('Batal')}
                        </Button>
                        <Button
                            type="submit"
                            className="min-h-11 bg-primary text-primary-foreground hover:bg-primary/90"
                            disabled={processing || lessons.length === 0}
                        >
                            {processing ? t('Menyimpan...') : t('Simpan kuis')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
