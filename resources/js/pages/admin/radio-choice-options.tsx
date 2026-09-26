import { t } from '@/lib/ui-language';
import { Input } from '@/components/ui/input';
import type { Dispatch, SetStateAction } from 'react';
import type { Field } from '@/pages/admin/types';

type Props = {
    field: Field;
    errors: Record<string, string>;
    choiceOptions: string[];
    setChoiceOptions: Dispatch<SetStateAction<string[]>>;
    choiceAnswerIndex: number;
    setChoiceAnswerIndex: Dispatch<SetStateAction<number>>;
};

export function RadioChoiceOptions({
    field,
    errors,
    choiceOptions,
    setChoiceOptions,
    choiceAnswerIndex,
    setChoiceAnswerIndex,
}: Props) {
    return (
        <fieldset className="space-y-2">
            <legend className="field-label">{t(field.label)}</legend>
            <p className="-mt-1 text-xs text-muted-foreground">
                {t('Pilih radio button untuk menandai jawaban yang benar')}
            </p>
            {choiceOptions.map((option, optionIndex) => {
                const letter = String.fromCharCode(65 + optionIndex);
                const optionError = errors[`options.${optionIndex}`];
                return (
                    <div key={letter} className="space-y-1">
                        <div className="flex items-center gap-3">
                            <input
                                type="radio"
                                name="practice-correct-answer"
                                checked={choiceAnswerIndex === optionIndex}
                                onChange={() =>
                                    setChoiceAnswerIndex(optionIndex)
                                }
                                aria-label={`${t('Tandai pilihan')} ${letter} ${t('sebagai jawaban benar')}`}
                                className="size-4 accent-[#493ee5]"
                            />
                            <span className="w-5 text-xs font-bold text-muted-foreground">
                                {letter}.
                            </span>
                            <Input
                                aria-label={`${t('Pilihan')} ${letter}`}
                                className="h-11 bg-card"
                                required
                                maxLength={255}
                                value={option}
                                onChange={(event) =>
                                    setChoiceOptions((current) =>
                                        current.map((value, index) =>
                                            index === optionIndex
                                                ? event.target.value
                                                : value,
                                        ),
                                    )
                                }
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
            {errors.options && (
                <p role="alert" className="text-xs text-[#b42335]">
                    {errors.options}
                </p>
            )}
            {errors.answer && (
                <p role="alert" className="text-xs text-[#b42335]">
                    {errors.answer}
                </p>
            )}
        </fieldset>
    );
}
