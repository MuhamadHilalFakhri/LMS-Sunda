import { t } from '@/lib/ui-language';
import { Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightLong, faCheck, faVolumeHigh } from '@fortawesome/free-solid-svg-icons';
import type { WelcomeMainProps } from '@/pages/welcome-types';

export function LanguageSection({ props }: { props: WelcomeMainProps }) {
    const { destination, playPhrase, speakingPhrase, speechError, voices, selectedVoiceURI, setSelectedVoiceURI } = props;
    return (
<section id="kelas" tabIndex={-1} data-reveal className="scroll-mt-20 border-y border-[#e7e9f0] bg-white py-16 md:py-20">
                    <div className="mx-auto grid w-[min(100%-32px,1200px)] items-center gap-10 md:grid-cols-2 md:gap-16">
                        <div className="order-2 rounded-[24px] bg-[#edefff] p-5 sm:p-7 md:order-1">
                            <div className="rounded-lg bg-white p-5 shadow-[0_4px_16px_rgba(40,46,62,0.1)] sm:p-6">
                                <div className="mb-5 flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-[#586380]">{t("Contoh materi")}</p>
                                        <h3 className="mt-1 text-lg font-semibold">{t("Sapaan dan ungkapan")}</h3>
                                    </div>
                                    <span className="rounded-full bg-[#f6f7fb] px-3 py-1 text-xs font-medium text-[#586380]">{t("3 kosakata")}</span>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        ["Wilujeng enjing", "Selamat pagi"],
                                        ["Punten", "Permisi"],
                                        ["Hatur nuhun", "Terima kasih"],
                                    ].map(([word, meaning], index) => (
                                        <button
                                            key={word}
                                            type="button"
                                            lang="su"
                                            aria-label={`${t(speakingPhrase === word ? "Sedang diputar" : "Putar pelafalan")} ${word}`}
                                            onClick={() => playPhrase(word)}
                                            className={`flex w-full items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4255ff] ${speakingPhrase === word ? "border-[#4255ff] bg-[#edefff]" : "border-[#d9dde8] hover:border-[#aab2ff] hover:bg-[#f8f8ff]"}`}
                                        >
                                            <span className="flex items-center gap-3">
                                                <span className="flex size-7 items-center justify-center rounded-full bg-[#edefff] text-xs font-semibold text-[#4255ff]">{index + 1}</span>
                                                <span className="flex items-center gap-2 text-sm font-semibold">
                                                    {word}
                                                    <FontAwesomeIcon icon={faVolumeHigh} className={`size-3.5 text-[#4255ff] ${speakingPhrase === word ? "animate-pulse" : ""}`} />
                                                </span>
                                            </span>
                                            <span className="text-right text-xs text-[#586380]">{t(meaning)}</span>
                                        </button>
                                    ))}
                                </div>
                                {voices.length > 0 && (
                                    <label className="mt-4 grid gap-2 text-xs sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center sm:gap-3">
                                        <span className="font-medium text-[#586380]">{t("Suara pelafalan")}</span>
                                        <select
                                            value={selectedVoiceURI}
                                            onChange={(event) => setSelectedVoiceURI(event.currentTarget.value)}
                                            className="min-h-10 min-w-0 rounded-md border border-[#d9dde8] bg-white px-3 text-[#282e3e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4255ff]"
                                        >
                                            {voices.map((voice) => (
                                                <option key={voice.voiceURI} value={voice.voiceURI}>
                                                    {voice.name} ({voice.lang})
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                )}
                                <div className="mt-5 flex items-center gap-2 text-xs font-medium text-[#586380]">
                                    <FontAwesomeIcon icon={faVolumeHigh} className="size-4 text-[#4255ff]" />
                                    {speechError ? t(speechError) : speakingPhrase ? `${t("Sedang diputar")}: ${speakingPhrase}` : t("Klik ungkapan untuk mendengarkan pelafalan")}
                                </div>
                                <p className="mt-2 text-[11px] leading-5 text-[#717990]">
                                    {t("Pilihan suara bergantung pada dukungan Bahasa Sunda atau Indonesia di perangkat.")}
                                </p>
                            </div>
                        </div>
                        <div className="order-1 md:order-2">
                            <p className="mb-3 text-xs font-semibold uppercase tracking-[.12em] text-[#4255ff]">{t("Bahasa Sunda")}</p>
                            <h2 className="max-w-lg text-3xl font-semibold leading-tight tracking-[-.035em] sm:text-4xl">{t("Gunakan kata yang tepat, di situasi yang tepat.")}</h2>
                            <p className="mt-4 max-w-xl leading-7 text-[#586380]">{t("Pelajari arti, pelafalan, ragam tutur, dan konteks pemakaian melalui unit yang teratur. Setiap pelajaran menggabungkan penjelasan dan contoh yang bisa langsung dicoba.")}</p>
                            <ul className="mt-6 space-y-3 text-sm text-[#2e3856]">
                                {["Ungkapan yang dekat dengan percakapan sehari-hari", "Contoh pemakaian beserta artinya", "Audio saat tersedia pada materi"].map((item) => (
                                    <li key={item} className="flex items-start gap-2.5"><FontAwesomeIcon icon={faCheck} className="mt-0.5 size-4 shrink-0 text-[#4255ff]" />{t(item)}</li>
                                ))}
                            </ul>
                            <Link href={destination} className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full border border-[#4255ff] px-5 text-sm font-semibold text-[#4255ff] hover:bg-[#edefff]">
                                {t("Lihat kelas Bahasa Sunda")} <FontAwesomeIcon icon={faArrowRightLong} className="size-4" />
                            </Link>
                        </div>
                    </div>
                </section>
    );
}
