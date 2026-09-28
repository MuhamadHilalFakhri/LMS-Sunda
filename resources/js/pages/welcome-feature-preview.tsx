import { t } from '@/lib/ui-language';
import { Check, HelpCircle, Star, Volume } from '@/components/meya-icons';
import { useState } from 'react';
import type { FeatureKind } from '@/pages/welcome-feature-data';

export function FeaturePreview({
    kind,
    playPhrase,
    speakingPhrase,
    speechError,
}: {
    kind: FeatureKind;
    playPhrase: (phrase: string) => void;
    speakingPhrase: string | null;
    speechError: string | null;
}) {
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

    if (kind === 'language') {
        return (
            <div className="space-y-2.5">
                {[
                    ['Punten', 'Permisi'],
                    ['Hatur nuhun', 'Terima kasih'],
                ].map(([word, meaning]) => {
                    const isSpeaking = speakingPhrase === word;

                    return (
                        <button
                            key={word}
                            type="button"
                            lang="su"
                            aria-label={`${t(isSpeaking ? 'Sedang diputar' : 'Putar pelafalan')} ${word}`}
                            onClick={() => playPhrase(word)}
                            className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4255ff] ${isSpeaking ? 'bg-[#edefff] text-[#3548eb]' : 'bg-[#f6f7fb] hover:bg-[#edefff]'}`}
                        >
                            <span className="text-sm font-semibold">
                                {word}
                            </span>
                            <span className="flex items-center gap-2 text-xs text-[#586380]">
                                {t(meaning)}
                                <Volume
                                    className={`size-3.5 text-[#4255ff] ${isSpeaking ? 'animate-pulse' : ''}`}
                                />
                            </span>
                        </button>
                    );
                })}
                <div className="flex items-center gap-2 pt-1 text-xs font-medium text-[#586380]">
                    <Volume className="size-4 text-[#4255ff]" />
                    {speechError
                        ? t(speechError)
                        : speakingPhrase
                          ? `${t('Sedang diputar')}: ${speakingPhrase}`
                          : t('Klik ungkapan untuk mendengarkan pelafalan')}
                </div>
            </div>
        );
    }

    if (kind === 'script') {
        return (
            <div className="grid grid-cols-4 justify-items-center gap-x-3 gap-y-2 py-1">
                {['ᮃ', 'ᮄ', 'ᮅ', 'ᮆ', 'ᮊ', 'ᮞ', 'ᮔ', 'ᮘ'].map((glyph, index) => (
                    <span
                        key={glyph}
                        lang="su"
                        className={`sunda-script flex size-11 items-center justify-center rounded-lg text-2xl ${index % 2 ? 'bg-[#f6f7fb] text-[#586380]' : 'bg-[#edefff] text-[#4255ff]'}`}
                    >
                        {glyph}
                    </span>
                ))}
            </div>
        );
    }

    if (kind === 'practice') {
        return (
            <div>
                <div className="mb-3 flex items-center justify-between text-xs text-[#586380]">
                    <span>{t('Latihan kosakata')}</span>
                    <span>2 / 5</span>
                </div>
                <p className="mb-3 text-sm font-semibold">
                    {t('Apa arti “wilujeng enjing”?')}
                </p>
                <div className="space-y-2 text-xs">
                    {['Selamat pagi', 'Selamat malam'].map((answer) => {
                        const selected = selectedAnswer === answer;
                        const correct = answer === 'Selamat pagi';
                        return (
                            <button
                                key={answer}
                                type="button"
                                aria-pressed={selected}
                                onClick={() => setSelectedAnswer(answer)}
                                className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left transition-all ${selected ? (correct ? 'border-[#4255ff] bg-[#edefff] font-semibold text-[#4255ff]' : 'border-[#dc6673] bg-[#fff1f2] font-semibold text-[#a52d3a]') : 'border-[#d9dde8] hover:border-[#4255ff] hover:bg-[#f8f8ff]'}`}
                            >
                                {answer}
                                {selected &&
                                    (correct ? (
                                        <Check className="size-3.5" />
                                    ) : (
                                        <HelpCircle className="size-3.5" />
                                    ))}
                            </button>
                        );
                    })}
                    {selectedAnswer && (
                        <p
                            aria-live="polite"
                            className={`pt-1 text-[11px] ${selectedAnswer === 'Selamat pagi' ? 'text-[#236a52]' : 'text-[#a52d3a]'}`}
                        >
                            {t(
                                selectedAnswer === 'Selamat pagi'
                                    ? 'Tepat! Wilujeng enjing berarti selamat pagi.'
                                    : 'Coba lagi, wilujeng enjing adalah sapaan pagi.',
                            )}
                        </p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-2.5 text-xs">
            <div className="max-w-[90%] rounded-lg bg-[#f6f7fb] px-3 py-2.5 text-[#586380]">
                {t('Apa bedanya kata “abdi” dan “urang”?')}
            </div>
            <div className="ml-auto max-w-[94%] rounded-lg bg-[#edefff] px-3 py-2.5 leading-5 text-[#2e3856]">
                {t(
                    'Keduanya berarti “saya”, tetapi penggunaannya bergantung pada konteks.',
                )}
            </div>
            <div className="flex items-center gap-1.5 pt-1 text-[#586380]">
                <Star className="size-3.5 text-[#4255ff]" />{' '}
                {t('Rujukan dari materi belajar')}
            </div>
        </div>
    );
}
