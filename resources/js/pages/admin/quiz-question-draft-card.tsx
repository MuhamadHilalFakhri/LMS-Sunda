import { t } from '@/lib/ui-language';
import { Trash2 } from '@/components/meya-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { QuizQuestionDraft } from '@/pages/admin/types';
import { QuizAnswerOptions } from '@/pages/admin/quiz-answer-options';

type Props = {
    question: QuizQuestionDraft;
    questionIndex: number;
    canRemove: boolean;
    onRemove: () => void;
    updateQuestion: (key: string, update: Partial<QuizQuestionDraft>) => void;
    errorFor: (key: string) => string | undefined;
};

export function QuizQuestionDraftCard({
    question,
    questionIndex,
    canRemove,
    onRemove,
    updateQuestion,
    errorFor,
}: Props) {
    return (
        <article className="space-y-4 rounded-2xl border bg-card p-4">
            <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold">
                    {t('Soal')} {questionIndex + 1}
                </h3>
                {canRemove && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-[#b42335]"
                        onClick={onRemove}
                    >
                        <Trash2 className="mr-1.5 size-4" />
                        {t('Hapus soal')}
                    </Button>
                )}
            </div>
            <div>
                <label
                    htmlFor={`quiz-question-type-${question.key}`}
                    className="field-label"
                >
                    {t('Jenis soal')}
                </label>
                <Select
                    value={question.type}
                    onValueChange={(value: 'multiple_choice' | 'listening') =>
                        updateQuestion(question.key, {
                            type: value,
                        })
                    }
                >
                    <SelectTrigger
                        id={`quiz-question-type-${question.key}`}
                        className="h-11 w-full bg-card"
                    >
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="multiple_choice">
                            {t('Pilihan ganda')}
                        </SelectItem>
                        <SelectItem value="listening">
                            {t('Menyimak audio')}
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {question.type === 'listening' && (
                <div>
                    <label
                        htmlFor={`quiz-audio-${question.key}`}
                        className="field-label"
                    >
                        {t('Audio yang didengarkan')}
                    </label>
                    <Input
                        id={`quiz-audio-${question.key}`}
                        type="file"
                        accept=".mp3,.wav,.ogg,.m4a,.webm,audio/*"
                        required={!question.audio}
                        className="h-auto min-h-11 py-2"
                        onChange={(event) =>
                            updateQuestion(question.key, {
                                audio: event.target.files?.[0] ?? null,
                            })
                        }
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                        {t(
                            'Unggah kalimat Bahasa Sunda yang ingin ditebak pelajar. Maksimum 10 MB.',
                        )}
                    </p>
                    {errorFor(`questions.${questionIndex}.audio`) && (
                        <p role="alert" className="mt-1 text-xs text-[#b42335]">
                            {errorFor(`questions.${questionIndex}.audio`)}
                        </p>
                    )}
                </div>
            )}
            <div>
                <label
                    htmlFor={`quiz-question-${question.key}`}
                    className="field-label"
                >
                    {t(
                        question.type === 'listening'
                            ? 'Pertanyaan setelah audio'
                            : 'Pertanyaan',
                    )}
                </label>
                <textarea
                    id={`quiz-question-${question.key}`}
                    required
                    maxLength={2000}
                    className="field min-h-20 resize-y"
                    value={question.prompt}
                    onChange={(event) =>
                        updateQuestion(question.key, {
                            prompt: event.target.value,
                        })
                    }
                    placeholder={t(
                        question.type === 'listening'
                            ? 'Contoh: Kalimat Sunda apa yang Anda dengar?'
                            : 'Contoh: Apa arti kata ‘punten’?',
                    )}
                />
                {errorFor(`questions.${questionIndex}.prompt`) && (
                    <p role="alert" className="mt-1 text-xs text-[#b42335]">
                        {errorFor(`questions.${questionIndex}.prompt`)}
                    </p>
                )}
            </div>
            <QuizAnswerOptions
                question={question}
                questionIndex={questionIndex}
                updateQuestion={updateQuestion}
                errorFor={errorFor}
            />
            <div>
                <label
                    htmlFor={`quiz-explanation-${question.key}`}
                    className="field-label"
                >
                    {t('Pembahasan untuk pelajar')}
                </label>
                <textarea
                    id={`quiz-explanation-${question.key}`}
                    required
                    maxLength={2000}
                    className="field min-h-16 resize-y"
                    value={question.explanation}
                    onChange={(event) =>
                        updateQuestion(question.key, {
                            explanation: event.target.value,
                        })
                    }
                    placeholder={t(
                        'Contoh: ‘Punten’ dipakai saat meminta izin dengan sopan.',
                    )}
                />
                {errorFor(`questions.${questionIndex}.explanation`) && (
                    <p role="alert" className="mt-1 text-xs text-[#b42335]">
                        {errorFor(`questions.${questionIndex}.explanation`)}
                    </p>
                )}
            </div>
        </article>
    );
}
