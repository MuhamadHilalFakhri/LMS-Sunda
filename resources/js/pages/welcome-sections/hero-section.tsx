import { t } from '@/lib/ui-language';
import { Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDownLong, faArrowRightLong, faBookOpen, faBullseye, faGraduationCap, faMessage, faPenNib } from '@fortawesome/free-solid-svg-icons';
import { HeroOrbitDecoration } from '@/pages/welcome-orbit-decoration';
import { FeatureCard } from '@/pages/welcome-feature-card';
import { featureDetails } from '@/pages/welcome-feature-data';
import type { WelcomeMainProps } from '@/pages/welcome-types';

export function HeroSection({ props }: { props: WelcomeMainProps }) {
    const { auth, destination, featurePanelRef, activeFeature, setActiveFeature, playPhrase, speakingPhrase, speechError, handleSectionNavigation } = props;
    return (
<section className="landing-hero relative isolate pb-16 pt-14 text-center md:pb-20 md:pt-20">
                    <HeroOrbitDecoration />
                    <div className="relative z-10">
                    <p data-hero="eyebrow" className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d9dde8] bg-white px-3 py-1.5 text-xs font-semibold text-[#586380]">
                        <FontAwesomeIcon icon={faGraduationCap} className="size-4 text-[#4255ff]" />
                        {t("Ruang belajar Bahasa dan Aksara Sunda")}
                    </p>
                    <h1 data-hero="title" className="mx-auto max-w-[820px] text-[clamp(2.5rem,6vw,4rem)] font-bold leading-[1.12] tracking-[-.045em]">
                        {t("Belajar Sunda, satu langkah kecil setiap hari.")}
                    </h1>
                    <p data-hero="copy" className="mx-auto mt-5 max-w-[660px] text-base leading-7 text-[#586380] sm:text-lg sm:leading-8">
                        {t("Pahami ungkapan sehari-hari, kenali Aksara Sunda, lalu latih kemampuanmu lewat materi yang tersusun dan progres yang tersimpan.")}
                    </p>
                    <div data-hero="actions" className="mt-7 flex flex-wrap items-center justify-center gap-4">
                        <Link href={destination} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#4255ff] px-6 text-sm font-semibold text-white shadow-[0_2px_4px_rgba(40,46,62,0.1)] hover:bg-[#3548eb]">
                            {t(auth.user ? "Lanjut belajar" : "Mulai belajar gratis")}
                            <FontAwesomeIcon icon={faArrowRightLong} className="size-4" />
                        </Link>
                        <a href="#cara-belajar" onClick={handleSectionNavigation} className="inline-flex min-h-11 items-center gap-2 px-2 text-sm font-medium text-[#4255ff] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4255ff]">
                            {t("Jelajahi cara belajar")}
                            <FontAwesomeIcon icon={faArrowDownLong} className="size-4" />
                        </a>
                    </div>
                    <div data-hero="cards" className="mt-12 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-4" role="group" aria-label={t("Pilih fitur untuk melihat pratinjau")}>
                        <FeatureCard kind="language" title="Bahasa Sunda" description="Kosakata, ungkapan, dan konteks." icon={faBookOpen} tint="bg-[#dff4f7]" active={activeFeature === "language"} onSelect={() => setActiveFeature("language")} playPhrase={playPhrase} speakingPhrase={speakingPhrase} speechError={speechError} />
                        <FeatureCard kind="script" title="Aksara Sunda" description="Baca dan susun karakter Sunda." icon={faPenNib} tint="bg-[#fbe4ef]" active={activeFeature === "script"} onSelect={() => setActiveFeature("script")} playPhrase={playPhrase} speakingPhrase={speakingPhrase} speechError={speechError} />
                        <FeatureCard kind="practice" title="Latihan bertahap" description="Cek pemahaman setelah belajar." icon={faBullseye} tint="bg-[#e7e9ff]" active={activeFeature === "practice"} onSelect={() => setActiveFeature("practice")} playPhrase={playPhrase} speakingPhrase={speakingPhrase} speechError={speechError} />
                        <FeatureCard kind="tutor" title="Tutor AI" description="Tanya materi dengan rujukan." icon={faMessage} tint="bg-[#ffeadb]" active={activeFeature === "tutor"} onSelect={() => setActiveFeature("tutor")} playPhrase={playPhrase} speakingPhrase={speakingPhrase} speechError={speechError} />
                    </div>
                    <div id="feature-detail" ref={featurePanelRef} role="region" aria-live="polite" className="mx-auto mt-5 flex max-w-3xl flex-col items-start gap-4 rounded-lg border border-[#d9dde8] bg-white p-4 text-left shadow-[0_2px_4px_rgba(40,46,62,0.06)] sm:flex-row sm:items-center sm:p-5">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#edefff] text-[#4255ff]"><FontAwesomeIcon icon={featureDetails[activeFeature].icon} /></span>
                        <div className="min-w-0 flex-1">
                            <h2 className="font-semibold">{t(featureDetails[activeFeature].title)}</h2>
                            <p className="mt-1 text-sm leading-6 text-[#586380]">{t(featureDetails[activeFeature].copy)}</p>
                        </div>
                        <div className="flex shrink-0 items-center">
                            <a href={featureDetails[activeFeature].href} onClick={handleSectionNavigation} className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold text-[#4255ff] hover:bg-[#f6f7fb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4255ff]">{t("Lihat detail")} <FontAwesomeIcon icon={faArrowRightLong} /></a>
                        </div>
                    </div>
                    </div>
                </section>
    );
}
