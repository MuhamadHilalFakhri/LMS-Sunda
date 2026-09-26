import { t } from '@/lib/ui-language';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { practiceAnswer } from '@/pages/welcome-feature-data';

export function ScriptPractice() {
    const [answer, setAnswer] = useState<string[]>([]);
    const [checked, setChecked] = useState(false);
    const characters = [
        { glyph: 'ᮘ', name: 'ba' },
        { glyph: 'ᮞ', name: 'sa' },
        { glyph: 'ᮃ', name: 'a' },
        { glyph: 'ᮔ', name: 'na' },
        { glyph: 'ᮊ', name: 'ka' },
    ];
    const isCorrect = answer.join('') === practiceAnswer.join('');

    const addCharacter = (glyph: string) => {
        if (answer.length >= practiceAnswer.length) return;
        setAnswer((current) => [...current, glyph]);
        setChecked(false);
    };

    const reset = () => {
        setAnswer([]);
        setChecked(false);
    };

    return (
        <div className="rounded-lg border border-[#d9dde8] bg-[#f6f7fb] p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold tracking-wide text-[#586380] uppercase">
                        {t('Coba susun aksara')}
                    </p>
                    <h4 className="mt-1 text-sm font-semibold">
                        {t('Susun “Basa” dari dua karakter berikut.')}
                    </h4>
                </div>
                <button
                    type="button"
                    onClick={reset}
                    aria-label={t('Ulangi latihan')}
                    className="flex size-9 items-center justify-center rounded-full border border-[#d9dde8] bg-white text-[#586380] hover:border-[#4255ff] hover:text-[#4255ff]"
                >
                    <FontAwesomeIcon icon={faRotateLeft} className="size-4" />
                </button>
            </div>
            <div className="mt-4 flex items-center gap-2">
                {Array.from({ length: 2 }, (_, index) => (
                    <span
                        key={index}
                        lang="su"
                        className="sunda-script flex size-12 items-center justify-center rounded-lg border border-[#d9dde8] bg-white text-2xl text-[#4255ff]"
                    >
                        {answer[index] ?? '·'}
                    </span>
                ))}
                <span className="ml-2 text-xs text-[#586380]">
                    {t('Jawabanmu')}
                </span>
            </div>
            <div
                className="mt-4 flex flex-wrap gap-2"
                role="group"
                aria-label={t('Palet aksara Sunda')}
            >
                {characters.map(({ glyph, name }) => (
                    <button
                        key={glyph}
                        type="button"
                        lang="su"
                        aria-label={`${t('Pilih aksara')} ${name}`}
                        onClick={() => addCharacter(glyph)}
                        disabled={answer.length >= 2}
                        className="sunda-script flex size-11 items-center justify-center rounded-lg border border-[#d9dde8] bg-white text-xl text-[#282e3e] transition-all hover:-translate-y-0.5 hover:border-[#4255ff] hover:bg-[#edefff] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {glyph}
                    </button>
                ))}
                <button
                    type="button"
                    onClick={() => {
                        setAnswer((current) => current.slice(0, -1));
                        setChecked(false);
                    }}
                    disabled={answer.length === 0}
                    className="flex min-h-11 items-center gap-2 rounded-lg border border-[#d9dde8] bg-white px-3 text-xs font-semibold text-[#586380] hover:border-[#4255ff] hover:text-[#4255ff] disabled:opacity-50"
                >
                    {t('Hapus karakter')}
                </button>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p
                    aria-live="polite"
                    className={`text-xs ${checked ? (isCorrect ? 'font-semibold text-[#236a52]' : 'font-semibold text-[#a52d3a]') : 'text-[#586380]'}`}
                >
                    {checked
                        ? t(
                              isCorrect
                                  ? 'Benar! Kamu berhasil menyusun Basa Sunda.'
                                  : 'Belum tepat. Coba susun aksaranya lagi.',
                          )
                        : t('Pilih karakter untuk mengisi jawaban.')}
                </p>
                <button
                    type="button"
                    onClick={() => setChecked(true)}
                    disabled={answer.length !== 2}
                    className="min-h-10 rounded-full bg-[#4255ff] px-4 text-xs font-semibold text-white hover:bg-[#3548eb] disabled:cursor-not-allowed disabled:opacity-45"
                >
                    {t('Periksa jawaban')}
                </button>
            </div>
        </div>
    );
}
