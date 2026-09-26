import { t } from '@/lib/ui-language';
import { Input } from '@/components/ui/input';
import type { QuizQuestionDraft } from '@/pages/admin/types';

type Props = {
    question: QuizQuestionDraft;
    questionIndex: number;
    updateQuestion: (key: string, update: Partial<QuizQuestionDraft>) => void;
    errorFor: (key: string) => string | undefined;
};

export function QuizAnswerOptions({
    question,
    questionIndex,
    updateQuestion,
    errorFor,
}: Props) {
    return (
        <fieldset className="space-y-2">
            <legend className="field-label">{t('Pilihan jawaban')}</legend>
            <p className="-mt-1 text-xs text-muted-foreground">
                {t('Pilih radio button untuk menandai jawaban yang benar')}
            </p>
            {question.options.map((option, optionIndex) => {
                const letter = String.fromCharCode(65 + optionIndex);
                const optionError = errorFor(
                    `questions.${questionIndex}.options.${optionIndex}`,
                );
                return (
                    <div key={letter} className="space-y-1">
                        <div className="flex items-center gap-3">
                            <input
                                type="radio"
                                name={`correct-${question.key}`}
                                checked={question.answerIndex === optionIndex}
                                onChange={() =>
                                    updateQuestion(question.key, {
                                        answerIndex: optionIndex,
                                    })
                                }
                                aria-label={`${t('Tandai pilihan')} ${letter} ${t('sebagai jawaban benar')}`}
                                className="size-4 accent-[#493ee5]"
                            />
                            <span className="w-5 text-xs font-bold text-muted-foreground">
                                {letter}.
                            </span>
                            <Input
                                aria-label={`${t('Pilihan')} ${letter}`}
                                required
                                maxLength={255}
                                value={option}
                                onChange={(event) => {
                                    const nextOptions = [...question.options];
                                    nextOptions[optionIndex] =
                                        event.target.value;
                                    updateQuestion(question.key, {
                                        options: nextOptions,
                                    });
                                }}
                                placeholder={t('Contoh: Permisi')}
                            />
                        </div>
                        {optionError && (
                            <p
                                role="alert"
                                className="ml-11 text-xs text-[#b42335]"
                            >
                                {optionError}
                            </p>
                        )}
                    </div>
                );
            })}
            {errorFor(`questions.${questionIndex}.options`) && (
                <p role="alert" className="text-xs text-[#b42335]">
                    {errorFor(`questions.${questionIndex}.options`)}
                </p>
            )}
        </fieldset>
    );
}
