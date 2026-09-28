import { t } from '@/lib/ui-language';
import { Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightLong } from '@fortawesome/free-solid-svg-icons';
import { ScriptPractice } from '@/pages/welcome-script-practice';
import type { WelcomeMainProps } from '@/pages/welcome-types';

export function ScriptSection({ props }: { props: WelcomeMainProps }) {
    const { destination } = props;
    return (
<section id="aksara" tabIndex={-1} className="scroll-mt-20 py-16 md:py-20">
                    <div className="mx-auto grid w-[min(100%-32px,1200px)] items-center gap-10 md:grid-cols-2 md:gap-16">
                        <div>
                            <p className="mb-3 text-xs font-semibold uppercase tracking-[.12em] text-[#4255ff]">{t("Aksara Sunda")}</p>
                            <h2 className="max-w-lg text-3xl font-semibold leading-tight tracking-[-.035em] sm:text-4xl">{t("Kenali bentuknya. Baca bunyinya. Coba menulisnya.")}</h2>
                            <p className="mt-4 max-w-xl leading-7 text-[#586380]">{t("Aksara Sunda punya jalur materi dan latihan tersendiri. Pelajari karakter dan rarangkén secara bertahap, lalu susun jawaban dengan palet aksara di layar.")}</p>
                            <div className="mt-6 flex flex-wrap gap-2 text-xs font-medium text-[#586380]">
                                {["Mengenal karakter", "Latihan membaca", "Latihan menulis"].map((label) => (
                                    <span key={label} className="rounded-full border border-[#d9dde8] bg-white px-3 py-2">{t(label)}</span>
                                ))}
                            </div>
                            <Link href={destination} className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#4255ff] px-5 text-sm font-semibold text-white hover:bg-[#3548eb]">
                                {t("Jelajahi kelas Aksara Sunda")} <FontAwesomeIcon icon={faArrowRightLong} className="size-4" />
                            </Link>
                        </div>
                        <div className="rounded-[24px] bg-[#fbe4ef] p-5 sm:p-7">
                            <div className="rounded-lg bg-white p-5 shadow-[0_4px_16px_rgba(40,46,62,0.1)] sm:p-7">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-[#586380]">{t("Kenali aksara")}</p>
                                        <h3 className="mt-1 text-lg font-semibold">{t("Aksara swara")}</h3>
                                    </div>
                                    <span className="text-xs text-[#586380]">{t("Pratinjau materi")}</span>
                                </div>
                                <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
                                    {[["ᮃ", "a"], ["ᮄ", "i"], ["ᮅ", "u"], ["ᮆ", "é"], ["ᮇ", "o"], ["ᮈ", "e"], ["ᮉ", "eu"]].map(([glyph, latin]) => (
                                        <div key={glyph} className="flex min-h-20 flex-col items-center justify-center rounded-lg bg-[#f6f7fb]">
                                            <span lang="su" className="sunda-script text-3xl text-[#4255ff]">{glyph}</span>
                                            <span className="mt-1 text-xs font-medium text-[#586380]">{latin}</span>
                                        </div>
                                    ))}
                                    <div className="flex min-h-20 items-center justify-center rounded-lg border border-dashed border-[#d9dde8] text-xs text-[#586380]">{t("dan lainnya")}</div>
                                </div>
                                <div className="mt-5"><ScriptPractice /></div>
                            </div>
                        </div>
                    </div>
                </section>
    );
}
