import { t } from '@/lib/ui-language';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import type { QuizQuestionModalConfig } from '@/pages/admin/types';
import { QuizQuestionFields } from '@/pages/admin/quiz-question-fields';

export function QuizQuestionModal({
    target,
    close,
}: {
    target: QuizQuestionModalConfig;
    close: () => void;
}) {
    const existingOptions = target.question?.options ?? [];
    const optionCount = existingOptions.length || 4;
    const initialOptions = Array.from(
        { length: optionCount },
        (_, index) => existingOptions[index] ?? '',
    );
    const [type, setType] = useState<'multiple_choice' | 'listening'>(
        target.question?.type === 'listening' ? 'listening' : 'multiple_choice',
    );
    const [prompt, setPrompt] = useState(target.question?.prompt ?? '');
    const [options, setOptions] = useState(initialOptions);
    const [answerIndex, setAnswerIndex] = useState(() => {
        const correctIndex = existingOptions.indexOf(
            target.question?.answer?.value ?? '',
        );
        return correctIndex >= 0 ? correctIndex : 0;
    });
    const [explanation, setExplanation] = useState(
        target.question?.explanation ?? '',
    );
    const [audio, setAudio] = useState<File | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        if (processing) return;
        setProcessing(true);
        setErrors({});
        const form = new FormData();
        if (!target.question)
            form.append('exercise_id', String(target.exercise.id));
        form.append('type', type);
        form.append('prompt', prompt.trim());
        options.forEach((option, index) =>
            form.append(`options[${index}]`, option.trim()),
        );
        form.append('answer', options[answerIndex]?.trim() ?? '');
        form.append('explanation', explanation.trim());
        form.append(
            'position',
            String(
                target.question?.position ??
                    target.exercise.questions?.length ??
                    0,
            ),
        );
        if (audio) form.append('audio', audio);
        if (target.question) form.append('_method', 'PUT');
        const callbacks = {
            preserveScroll: true,
            onError: (formErrors: Record<string, string>) =>
                setErrors(formErrors),
            onSuccess: () => {
                close();
                toast.success(
                    t(
                        target.question
                            ? 'Soal kuis berhasil diperbarui.'
                            : 'Soal kuis berhasil ditambahkan.',
                    ),
                );
            },
            onFinish: () => setProcessing(false),
        };
        router.post(
            target.question
                ? `/admin/questions/${target.question.id}`
                : '/admin/questions',
            form,
            {
                ...callbacks,
                forceFormData: true,
            },
        );
    };

    return (
        <Dialog
            open
            onOpenChange={(open) => {
                if (!open && !processing) close();
            }}
        >
            <DialogContent className="max-h-[min(92dvh,820px)] overflow-y-auto border-border bg-card sm:max-w-[700px]">
                <DialogHeader className="pr-7 text-left">
                    <DialogTitle className="text-xl">
                        {t(
                            target.question
                                ? 'Ubah soal kuis'
                                : 'Tambah soal kuis',
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        {t(
                            'Pilih satu radio sebagai kunci jawaban. Pelajar akan menerima pembahasan setelah mengerjakan kuis.',
                        )}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-5 pt-2">
                    <section className="rounded-2xl bg-secondary/55 p-4">
                        <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
                            {t('Informasi kuis')}
                        </p>
                        <h2 className="mt-1 font-bold">
                            {target.exercise.title}
                        </h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {[
                                target.pathTitle,
                                target.unitTitle,
                                target.lessonTitle,
                            ]
                                .filter(Boolean)
                                .join(' / ')}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                            <span className="rounded-full bg-card px-2.5 py-1">
                                {t('Durasi')}:{' '}
                                {target.exercise.time_limit_minutes
                                    ? `${target.exercise.time_limit_minutes} ${t('menit')}`
                                    : t('Tanpa batas waktu')}
                            </span>
                            <span className="rounded-full bg-card px-2.5 py-1">
                                {t('Nilai lulus')}:{' '}
                                {target.exercise.pass_percentage ?? 70}%
                            </span>
                        </div>
                    </section>

                    <QuizQuestionFields
                        target={target}
                        type={type}
                        setType={setType}
                        audio={audio}
                        setAudio={setAudio}
                        prompt={prompt}
                        setPrompt={setPrompt}
                        options={options}
                        setOptions={setOptions}
                        answerIndex={answerIndex}
                        setAnswerIndex={setAnswerIndex}
                        explanation={explanation}
                        setExplanation={setExplanation}
                        errors={errors}
                    />
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
                            disabled={processing}
                        >
                            {processing ? t('Menyimpan...') : t('Simpan soal')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
