import { t } from '@/lib/ui-language';
import { Input } from '@/components/ui/input';
import type { Dispatch, SetStateAction } from 'react';

type Props = {
    passPercentage: string;
    setPassPercentage: Dispatch<SetStateAction<string>>;
    attemptLimit: string;
    setAttemptLimit: Dispatch<SetStateAction<string>>;
    errorFor: (key: string) => string | undefined;
    clearError: (key: string) => void;
};

export function QuizSettingsFields({
    passPercentage,
    setPassPercentage,
    attemptLimit,
    setAttemptLimit,
    errorFor,
    clearError,
}: Props) {
    return (
        <div className="grid gap-3 sm:grid-cols-2">
            <div>
                <label htmlFor="quiz-pass" className="field-label">
                    {t('Nilai minimum lulus (%)')}
                </label>
                <Input
                    id="quiz-pass"
                    required
                    type="number"
                    min={1}
                    max={100}
                    value={passPercentage}
                    onChange={(event) => {
                        setPassPercentage(event.target.value);
                        clearError('pass_percentage');
                    }}
                    placeholder="70"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                    {t(
                        'Contoh: 70 berarti pelajar perlu menjawab benar minimal 70%.',
                    )}
                </p>
                {errorFor('pass_percentage') && (
                    <p role="alert" className="mt-1 text-xs text-[#b42335]">
                        {errorFor('pass_percentage')}
                    </p>
                )}
            </div>
            <div>
                <label htmlFor="quiz-attempt-limit" className="field-label">
                    {t('Batas percobaan (opsional)')}
                </label>
                <Input
                    id="quiz-attempt-limit"
                    type="number"
                    min={1}
                    max={10}
                    value={attemptLimit}
                    onChange={(event) => {
                        setAttemptLimit(event.target.value);
                        clearError('attempt_limit');
                    }}
                    placeholder={t('Kosongkan agar bebas mengulang')}
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                    {t(
                        'Contoh: 3 kali. Kosongkan agar pelajar bebas mengulang.',
                    )}
                </p>
                {errorFor('attempt_limit') && (
                    <p role="alert" className="mt-1 text-xs text-[#b42335]">
                        {errorFor('attempt_limit')}
                    </p>
                )}
            </div>
        </div>
    );
}
