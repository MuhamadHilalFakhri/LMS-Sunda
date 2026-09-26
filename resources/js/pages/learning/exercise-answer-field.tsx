import { t } from '@/lib/ui-language';
import type { Question } from '@/types/learning';

const sundaneseCharacters = [
    'ᮃ',
    'ᮄ',
    'ᮅ',
    'ᮊ',
    'ᮌ',
    'ᮍ',
    'ᮎ',
    'ᮏ',
    'ᮑ',
    'ᮒ',
    'ᮓ',
    'ᮔ',
    'ᮕ',
    'ᮘ',
    'ᮙ',
    'ᮚ',
    'ᮛ',
    'ᮜ',
    'ᮝ',
    'ᮞ',
    'ᮠ',
    'ᮥ',
    'ᮤ',
    '᮪',
];

export function AnswerField({
    question,
    value,
    onChange,
}: {
    question: Question;
    value: string;
    onChange: (value: string) => void;
}) {
    if (['multiple_choice', 'matching', 'listening'].includes(question.type))
        return (
            <div className="grid gap-3 sm:grid-cols-2">
                {question.options?.map((option) => (
                    <label
                        key={option}
                        className={`flex min-h-16 cursor-pointer items-center gap-3 rounded-2xl border px-4 text-sm font-semibold transition-colors ${value === option ? 'border-[#493ee5] bg-[#efedff] text-[#493ee5]' : 'bg-[#faf9ff] hover:border-[#aaa4ff] dark:bg-secondary'}`}
                    >
                        <input
                            type="radio"
                            name={`q-${question.id}`}
                            checked={value === option}
                            onChange={() => onChange(option)}
                        />
                        <span
                            lang={
                                question.type === 'matching' ? 'su' : undefined
                            }
                        >
                            {option}
                        </span>
                    </label>
                ))}
            </div>
        );
    if (question.type === 'ordering')
        return (
            <>
                <p className="mb-3 text-sm text-muted-foreground">
                    {t(
                        'Ketuk bagian sesuai urutan. Gunakan Hapus urutan untuk memulai kembali.',
                    )}
                </p>
                <div className="mb-4 min-h-14 rounded-2xl border bg-card p-3">
                    {value || t('Urutan jawaban Anda akan muncul di sini.')}
                </div>
                <div className="flex flex-wrap gap-2">
                    {question.options?.map((part, i) => (
                        <button
                            key={`${part}-${i}`}
                            type="button"
                            className="btn-secondary"
                            onClick={() =>
                                onChange(value ? `${value} ${part}` : part)
                            }
                        >
                            {part}
                        </button>
                    ))}
                </div>
                <button
                    type="button"
                    onClick={() => onChange('')}
                    className="mt-3 text-sm font-semibold text-link"
                >
                    {t('Hapus urutan')}
                </button>
            </>
        );
    return (
        <>
            <label className="field-label" htmlFor={`answer-${question.id}`}>
                {t('Jawaban Anda')}
            </label>
            <input
                id={`answer-${question.id}`}
                lang={question.type === 'script' ? 'su' : undefined}
                className={`field ${question.type === 'script' ? 'sunda-script text-xl' : ''}`}
                value={value}
                onChange={(event) => onChange(event.target.value)}
            />
            {question.type === 'script' && (
                <div className="mt-4">
                    <p className="mb-2 text-sm text-muted-foreground">
                        {t(
                            'Palet aksara · pilih karakter atau gunakan papan ketik',
                        )}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {sundaneseCharacters.map((character) => (
                            <button
                                key={character}
                                type="button"
                                aria-label={`Tambahkan aksara ${character}`}
                                onClick={() => onChange(value + character)}
                                className="sunda-script flex min-h-11 min-w-11 items-center justify-center rounded-xl border bg-card text-xl hover:border-[#493ee5]"
                            >
                                {character}
                            </button>
                        ))}
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() =>
                                onChange(
                                    Array.from(value).slice(0, -1).join(''),
                                )
                            }
                        >
                            {t('Hapus')}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
