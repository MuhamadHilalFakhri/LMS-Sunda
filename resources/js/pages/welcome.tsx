import { t } from "@/lib/ui-language";
import { Head, Link, usePage } from "@inertiajs/react";
import AppLogoIcon from "@/components/app-logo-icon";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
    faArrowDownLong,
    faArrowRightLong,
    faBars,
    faBookOpen,
    faBullseye,
    faCheck,
    faCircleQuestion,
    faGraduationCap,
    faMessage,
    faPenNib,
    faRotateLeft,
    faTrophy,
    faVolumeHigh,
    faWandMagicSparkles,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import type { Auth } from "@/types";

type FeatureKind = "language" | "script" | "practice" | "tutor";
const practiceAnswer = ["ᮘ", "ᮞ"];

function useSundaneseSpeech() {
    const [speakingPhrase, setSpeakingPhrase] = useState<string | null>(null);
    const [speechError, setSpeechError] = useState<string | null>(null);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoiceURI, setSelectedVoiceURI] = useState("");
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    useEffect(() => {
        if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

        const synthesis = window.speechSynthesis;
        const refreshVoices = () => {
            const availableVoices = synthesis.getVoices().filter((voice) => /^su(?:[-_]|$)|^id(?:[-_]|$)/i.test(voice.lang));
            setVoices(availableVoices);
            setSelectedVoiceURI((current) => {
                if (current && availableVoices.some((voice) => voice.voiceURI === current)) return current;
                const preferredVoice = availableVoices.find((voice) => /^su(?:[-_]|$)/i.test(voice.lang))
                    ?? availableVoices.find((voice) => /^id(?:[-_]|$)/i.test(voice.lang));
                return preferredVoice?.voiceURI ?? "";
            });
        };

        refreshVoices();
        synthesis.addEventListener("voiceschanged", refreshVoices);
        return () => synthesis.removeEventListener("voiceschanged", refreshVoices);
    }, []);

    const playPhrase = (phrase: string) => {
        if (typeof window === "undefined" || !("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
            setSpeechError("Browser ini belum mendukung suara.");
            return;
        }

        const synthesis = window.speechSynthesis;
        utteranceRef.current = null;
        synthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(phrase);
        const availableVoices = synthesis.getVoices().filter((voice) => /^su(?:[-_]|$)|^id(?:[-_]|$)/i.test(voice.lang));
        const sundaneseVoice = availableVoices.find((voice) => /^su(?:[-_]|$)/i.test(voice.lang));
        const indonesianVoice = availableVoices.find((voice) => /^id(?:[-_]|$)/i.test(voice.lang));
        const voice = availableVoices.find((item) => item.voiceURI === selectedVoiceURI) ?? sundaneseVoice ?? indonesianVoice;

        utterance.lang = voice?.lang ?? "su-ID";
        if (voice) utterance.voice = voice;
        utterance.rate = 0.85;
        utteranceRef.current = utterance;
        setSpeakingPhrase(phrase);
        setSpeechError(null);

        utterance.onend = () => {
            if (utteranceRef.current !== utterance) return;
            utteranceRef.current = null;
            setSpeakingPhrase(null);
        };
        utterance.onerror = (event) => {
            if (utteranceRef.current !== utterance) return;
            utteranceRef.current = null;
            setSpeakingPhrase(null);
            if (event.error !== "canceled" && event.error !== "interrupted") {
                setSpeechError("Suara tidak dapat diputar di perangkat ini.");
            }
        };

        synthesis.speak(utterance);
    };

    useEffect(() => () => {
        utteranceRef.current = null;
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }
    }, []);

    return { playPhrase, speakingPhrase, speechError, voices, selectedVoiceURI, setSelectedVoiceURI };
}

const featureDetails: Record<FeatureKind, { title: string; copy: string; href: string; icon: IconDefinition }> = {
    language: { title: "Kelas Bahasa Sunda", copy: "Mulai dari sapaan, kosakata, sampai ragam tutur dalam konteksnya.", href: "#kelas", icon: faBookOpen },
    script: { title: "Ruang Aksara Sunda", copy: "Pelajari karakter, rarangkén, membaca, dan menulis secara bertahap.", href: "#aksara", icon: faPenNib },
    practice: { title: "Latihan setelah belajar", copy: "Coba soal singkat dan lihat penjelasan untuk menguatkan pemahaman.", href: "#cara-belajar", icon: faBullseye },
    tutor: { title: "Tanya Tutor AI", copy: "Diskusikan materi dan lihat rujukan pelajaran yang digunakan.", href: "#tutor", icon: faMessage },
};

function FeaturePreview({
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

    if (kind === "language") {
        return (
            <div className="space-y-2.5">
                {[
                    ["Punten", "Permisi"],
                    ["Hatur nuhun", "Terima kasih"],
                ].map(([word, meaning]) => {
                    const isSpeaking = speakingPhrase === word;

                    return (
                        <button
                            key={word}
                            type="button"
                            lang="su"
                            aria-label={`${t(isSpeaking ? "Sedang diputar" : "Putar pelafalan")} ${word}`}
                            onClick={() => playPhrase(word)}
                            className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4255ff] ${isSpeaking ? "bg-[#edefff] text-[#3548eb]" : "bg-[#f6f7fb] hover:bg-[#edefff]"}`}
                        >
                            <span className="text-sm font-semibold">{word}</span>
                            <span className="flex items-center gap-2 text-xs text-[#586380]">
                                {t(meaning)}
                                <FontAwesomeIcon icon={faVolumeHigh} className={`size-3.5 text-[#4255ff] ${isSpeaking ? "animate-pulse" : ""}`} />
                            </span>
                        </button>
                    );
                })}
                <div className="flex items-center gap-2 pt-1 text-xs font-medium text-[#586380]">
                    <FontAwesomeIcon icon={faVolumeHigh} className="size-4 text-[#4255ff]" />
                    {speechError ? t(speechError) : speakingPhrase ? `${t("Sedang diputar")}: ${speakingPhrase}` : t("Klik ungkapan untuk mendengarkan pelafalan")}
                </div>
            </div>
        );
    }

    if (kind === "script") {
        return (
            <div className="flex items-center justify-center gap-3 py-2">
                {["ᮃ", "ᮊ", "ᮞ", "ᮔ"].map((glyph, index) => (
                    <span
                        key={glyph}
                        lang="su"
                        className={`sunda-script flex size-12 items-center justify-center rounded-lg text-2xl ${index % 2 ? "bg-[#f6f7fb] text-[#586380]" : "bg-[#edefff] text-[#4255ff]"}`}
                    >
                        {glyph}
                    </span>
                ))}
            </div>
        );
    }

    if (kind === "practice") {
        return (
            <div>
                <div className="mb-3 flex items-center justify-between text-xs text-[#586380]">
                    <span>{t("Latihan kosakata")}</span>
                    <span>2 / 5</span>
                </div>
                <p className="mb-3 text-sm font-semibold">{t("Apa arti “wilujeng enjing”?")}</p>
                <div className="space-y-2 text-xs">
                    {["Selamat pagi", "Selamat malam"].map((answer) => {
                        const selected = selectedAnswer === answer;
                        const correct = answer === "Selamat pagi";
                        return (
                            <button
                                key={answer}
                                type="button"
                                aria-pressed={selected}
                                onClick={() => setSelectedAnswer(answer)}
                                className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left transition-all ${selected ? correct ? "border-[#4255ff] bg-[#edefff] font-semibold text-[#4255ff]" : "border-[#dc6673] bg-[#fff1f2] font-semibold text-[#a52d3a]" : "border-[#d9dde8] hover:border-[#4255ff] hover:bg-[#f8f8ff]"}`}
                            >
                                {answer}
                                {selected && <FontAwesomeIcon icon={correct ? faCheck : faCircleQuestion} className="size-3.5" />}
                            </button>
                        );
                    })}
                    {selectedAnswer && (
                        <p aria-live="polite" className={`pt-1 text-[11px] ${selectedAnswer === "Selamat pagi" ? "text-[#236a52]" : "text-[#a52d3a]"}`}>
                            {t(selectedAnswer === "Selamat pagi" ? "Tepat! Wilujeng enjing berarti selamat pagi." : "Coba lagi, wilujeng enjing adalah sapaan pagi.")}
                        </p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-2.5 text-xs">
            <div className="max-w-[90%] rounded-lg bg-[#f6f7fb] px-3 py-2.5 text-[#586380]">
                {t("Apa bedanya kata “abdi” dan “urang”?")}
            </div>
            <div className="ml-auto max-w-[94%] rounded-lg bg-[#edefff] px-3 py-2.5 leading-5 text-[#2e3856]">
                {t("Keduanya berarti “saya”, tetapi penggunaannya bergantung pada konteks.")}
            </div>
            <div className="flex items-center gap-1.5 pt-1 text-[#586380]">
                <FontAwesomeIcon icon={faWandMagicSparkles} className="size-3.5 text-[#4255ff]" /> {t("Rujukan dari materi belajar")}
            </div>
        </div>
    );
}

function FeatureCard({
    kind,
    title,
    description,
    icon: Icon,
    tint,
    active,
    onSelect,
    playPhrase,
    speakingPhrase,
    speechError,
}: {
    kind: FeatureKind;
    title: string;
    description: string;
    icon: IconDefinition;
    tint: string;
    active: boolean;
    onSelect: () => void;
    playPhrase: (phrase: string) => void;
    speakingPhrase: string | null;
    speechError: string | null;
}) {
    return (
        <article className={`rounded-[24px] p-4 transition-all duration-200 sm:p-5 ${tint} ${active ? "ring-2 ring-inset ring-[#4255ff] shadow-[0_8px_20px_rgba(66,85,255,0.12)]" : "hover:-translate-y-1 hover:shadow-[0_6px_16px_rgba(40,46,62,0.1)]"}`}>
            <button type="button" aria-pressed={active} aria-controls="feature-detail" onClick={onSelect} className="flex min-h-[72px] w-full items-start gap-3 rounded-md text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4255ff]">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#282e3e]">
                    <FontAwesomeIcon icon={Icon} className="size-5" />
                </span>
                <div>
                    <h3 className="text-[17px] font-bold leading-6">{t(title)}</h3>
                    <p className="mt-1 text-xs leading-5 text-[#586380]">{t(description)}</p>
                </div>
            </button>
            <div className="mt-4 min-h-[154px] rounded-lg bg-white p-3.5 text-[#282e3e] shadow-[0_2px_4px_rgba(40,46,62,0.1)]">
                <FeaturePreview kind={kind} playPhrase={playPhrase} speakingPhrase={speakingPhrase} speechError={speechError} />
            </div>
        </article>
    );
}

function ScriptPractice() {
    const [answer, setAnswer] = useState<string[]>([]);
    const [checked, setChecked] = useState(false);
    const characters = [
        { glyph: "ᮘ", name: "ba" },
        { glyph: "ᮞ", name: "sa" },
        { glyph: "ᮃ", name: "a" },
        { glyph: "ᮔ", name: "na" },
        { glyph: "ᮊ", name: "ka" },
    ];
    const isCorrect = answer.join("") === practiceAnswer.join("");

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
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#586380]">{t("Coba susun aksara")}</p>
                    <h4 className="mt-1 text-sm font-semibold">{t("Susun “Basa” dari dua karakter berikut.")}</h4>
                </div>
                <button type="button" onClick={reset} aria-label={t("Ulangi latihan")} className="flex size-9 items-center justify-center rounded-full border border-[#d9dde8] bg-white text-[#586380] hover:border-[#4255ff] hover:text-[#4255ff]">
                    <FontAwesomeIcon icon={faRotateLeft} className="size-4" />
                </button>
            </div>
            <div className="mt-4 flex items-center gap-2">
                {Array.from({ length: 2 }, (_, index) => (
                    <span key={index} lang="su" className="sunda-script flex size-12 items-center justify-center rounded-lg border border-[#d9dde8] bg-white text-2xl text-[#4255ff]">
                        {answer[index] ?? "·"}
                    </span>
                ))}
                <span className="ml-2 text-xs text-[#586380]">{t("Jawabanmu")}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label={t("Palet aksara Sunda")}>
                {characters.map(({ glyph, name }) => (
                    <button key={glyph} type="button" lang="su" aria-label={`${t("Pilih aksara")} ${name}`} onClick={() => addCharacter(glyph)} disabled={answer.length >= 2} className="sunda-script flex size-11 items-center justify-center rounded-lg border border-[#d9dde8] bg-white text-xl text-[#282e3e] transition-all hover:-translate-y-0.5 hover:border-[#4255ff] hover:bg-[#edefff] disabled:cursor-not-allowed disabled:opacity-50">
                        {glyph}
                    </button>
                ))}
                <button type="button" onClick={() => { setAnswer((current) => current.slice(0, -1)); setChecked(false); }} disabled={answer.length === 0} className="flex min-h-11 items-center gap-2 rounded-lg border border-[#d9dde8] bg-white px-3 text-xs font-semibold text-[#586380] hover:border-[#4255ff] hover:text-[#4255ff] disabled:opacity-50">
                    {t("Hapus karakter")}
                </button>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p aria-live="polite" className={`text-xs ${checked ? isCorrect ? "font-semibold text-[#236a52]" : "font-semibold text-[#a52d3a]" : "text-[#586380]"}`}>
                    {checked ? t(isCorrect ? "Benar! Kamu berhasil menyusun Basa Sunda." : "Belum tepat. Coba susun aksaranya lagi.") : t("Pilih karakter untuk mengisi jawaban.")}
                </p>
                <button type="button" onClick={() => setChecked(true)} disabled={answer.length !== 2} className="min-h-10 rounded-full bg-[#4255ff] px-4 text-xs font-semibold text-white hover:bg-[#3548eb] disabled:cursor-not-allowed disabled:opacity-45">
                    {t("Periksa jawaban")}
                </button>
            </div>
        </div>
    );
}

export default function Welcome() {
    const { auth } = usePage<{ auth: { user: Auth["user"] | null } }>().props;
    const rootRef = useRef<HTMLDivElement>(null);
    const featurePanelRef = useRef<HTMLDivElement>(null);
    const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
    const [activeFeature, setActiveFeature] = useState<FeatureKind>("language");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { playPhrase, speakingPhrase, speechError, voices, selectedVoiceURI, setSelectedVoiceURI } = useSundaneseSpeech();
    const sectionLinks = [
        { href: "#kelas", label: "Kelas belajar" },
        { href: "#aksara", label: "Aksara Sunda" },
        { href: "#tutor", label: "Tutor AI" },
        { href: "#cara-belajar", label: "Cara belajar" },
    ];
    const destination = auth.user
        ? auth.user.role === "admin"
            ? "/admin"
            : "/dashboard"
        : "/register";

    const handleSectionNavigation = (event: MouseEvent<HTMLAnchorElement>) => {
        const sectionId = event.currentTarget.hash.slice(1);
        const target = document.getElementById(sectionId);
        if (!target) return;

        event.preventDefault();
        setMobileMenuOpen(false);
        if (window.location.hash !== `#${sectionId}`) {
            window.history.replaceState(window.history.state, "", `#${sectionId}`);
        }

        const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
                target.scrollIntoView({ behavior, block: "start" });
                target.focus({ preventScroll: true });
            });
        });
    };

    useEffect(() => {
        if (!mobileMenuOpen) return;

        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key !== "Escape") return;
            setMobileMenuOpen(false);
            mobileMenuButtonRef.current?.focus();
        };

        window.addEventListener("keydown", closeOnEscape);
        return () => window.removeEventListener("keydown", closeOnEscape);
    }, [mobileMenuOpen]);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        gsap.registerPlugin(ScrollTrigger);
        const media = gsap.matchMedia();
        media.add("(prefers-reduced-motion: no-preference)", () => {
            const context = gsap.context(() => {
                gsap.timeline({ defaults: { ease: "power2.out" } })
                    .from("[data-hero='eyebrow']", { y: 14, autoAlpha: 0, duration: 0.45 })
                    .from("[data-hero='title']", { y: 22, autoAlpha: 0, duration: 0.6 }, "-=0.2")
                    .from("[data-hero='copy'], [data-hero='actions']", { y: 14, autoAlpha: 0, duration: 0.45, stagger: 0.1 }, "-=0.25")
                    .from("[data-hero='cards']", { y: 24, autoAlpha: 0, duration: 0.55 }, "-=0.1");

                gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
                    gsap.from(element, {
                        y: 24,
                        autoAlpha: 0,
                        duration: 0.65,
                        ease: "power2.out",
                        scrollTrigger: { trigger: element, start: "top 88%", once: true },
                    });
                });

                gsap.to("[data-float]", { y: -9, rotation: 2, duration: 2.3, repeat: -1, yoyo: true, ease: "sine.inOut", stagger: 0.35 });
            }, root);

            return () => context.revert();
        });

        return () => media.revert();
    }, []);

    useEffect(() => {
        if (!featurePanelRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        gsap.fromTo(featurePanelRef.current, { y: 8, autoAlpha: 0.65 }, { y: 0, autoAlpha: 1, duration: 0.28, ease: "power2.out" });
    }, [activeFeature]);

    return (
        <div ref={rootRef} className="landing-page min-h-screen bg-[#f6f7fb] text-[#282e3e]">
            <Head title={t("Belajar Bahasa dan Aksara Sunda")}>
                <meta name="description" content={t("Pelajari Bahasa Sunda dan Aksara Sunda lewat materi terarah, latihan interaktif, dan Tutor AI dengan rujukan pelajaran.")} />
                <meta property="og:title" content={t("Belajar Bahasa dan Aksara Sunda")} />
                <meta property="og:description" content={t("Pelajari Bahasa Sunda dan Aksara Sunda lewat materi terarah, latihan interaktif, dan Tutor AI dengan rujukan pelajaran.")} />
                <meta property="og:type" content="website" />
            </Head>

            <p className="sr-only" aria-live="polite">
                {speechError ? t(speechError) : speakingPhrase ? `${t("Sedang diputar")}: ${speakingPhrase}` : ""}
            </p>

            <header className="sticky top-0 z-40 border-b border-[#d9dde8] bg-white/95 shadow-[0_2px_8px_rgba(40,46,62,0.06)] backdrop-blur">
                <div className="mx-auto grid min-h-16 w-[min(100%-32px,1200px)] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-5">
                    <Link href="/" className="flex shrink-0 items-center gap-2.5 justify-self-start">
                        <AppLogoIcon aria-hidden="true" className="size-9 rounded-lg object-cover" />
                        <span className="text-[17px] font-bold tracking-tight text-[#282e3e]">Sawala</span>
                    </Link>

                    <nav className="hidden items-center gap-7 text-sm font-medium text-[#586380] lg:flex lg:justify-self-center" aria-label={t("Navigasi utama")}>
                        {sectionLinks.map(({ href, label }) => (
                            <a key={href} className="rounded-sm hover:text-[#4255ff] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4255ff]" href={href} onClick={handleSectionNavigation}>
                                {t(label)}
                            </a>
                        ))}
                    </nav>

                    <div className="col-start-2 hidden shrink-0 items-center gap-2 justify-self-end sm:gap-3 lg:col-start-3 lg:flex">
                        <Link href={auth.user ? destination : "/login"} className="rounded-full px-3 py-2 text-sm font-semibold text-[#4255ff] hover:bg-[#f6f7fb]">
                            {t(auth.user ? "Ruang saya" : "Masuk")}
                        </Link>
                        <Link href={destination} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#4255ff] px-4 text-sm font-semibold text-white shadow-[0_2px_4px_rgba(40,46,62,0.1)] hover:bg-[#3548eb] sm:px-5">
                            {t(auth.user?.role === "admin" ? "Buka ruang kelola" : auth.user ? "Lanjut belajar" : "Daftar gratis")}
                            <FontAwesomeIcon icon={faArrowRightLong} className="size-4" />
                        </Link>
                    </div>

                    <div className="col-start-2 flex items-center gap-2 justify-self-end lg:hidden">
                        <Link href={destination} className="inline-flex min-h-10 items-center rounded-full bg-[#4255ff] px-3 text-xs font-semibold text-white hover:bg-[#3548eb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4255ff]">
                            {t(auth.user ? "Ruang saya" : "Daftar gratis")}
                        </Link>
                        <button
                            ref={mobileMenuButtonRef}
                            type="button"
                            aria-label={t(mobileMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi")}
                            aria-expanded={mobileMenuOpen}
                            aria-controls="mobile-navigation"
                            onClick={() => setMobileMenuOpen((open) => !open)}
                            className="flex size-10 items-center justify-center rounded-lg border border-[#d9dde8] bg-white text-[#282e3e] hover:border-[#4255ff] hover:text-[#4255ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4255ff]"
                        >
                            <FontAwesomeIcon icon={mobileMenuOpen ? faXmark : faBars} className="size-4" />
                        </button>
                    </div>
                </div>

                <nav id="mobile-navigation" className={`${mobileMenuOpen ? "block" : "hidden"} border-t border-[#d9dde8] bg-white px-4 py-3 lg:hidden`} aria-label={t("Navigasi utama")}>
                    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-1">
                        {sectionLinks.map(({ href, label }) => (
                            <a key={href} className="rounded-md px-3 py-3 text-sm font-medium text-[#586380] hover:bg-[#f6f7fb] hover:text-[#4255ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4255ff]" href={href} onClick={handleSectionNavigation}>
                                {t(label)}
                            </a>
                        ))}
                        {!auth.user && (
                            <div className="mt-2 border-t border-[#e7e9f0] pt-3">
                                <Link href="/login" className="inline-flex min-h-10 w-full items-center justify-center rounded-full border border-[#d9dde8] px-4 text-sm font-semibold text-[#4255ff] hover:bg-[#f6f7fb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4255ff]">
                                    {t("Masuk")}
                                </Link>
                            </div>
                        )}
                    </div>
                </nav>
            </header>

            <main>
                <section className="mx-auto w-[min(100%-32px,1200px)] pb-16 pt-14 text-center md:pb-20 md:pt-20">
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
                </section>

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

                <section id="aksara" tabIndex={-1} data-reveal className="scroll-mt-20 py-16 md:py-20">
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
                                        <div key={glyph} data-float={glyph === "ᮄ" ? "" : undefined} className="flex min-h-20 flex-col items-center justify-center rounded-lg bg-[#f6f7fb]">
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

                <section id="tutor" tabIndex={-1} data-reveal className="scroll-mt-20 border-y border-[#e7e9f0] bg-white py-16 md:py-20">
                    <div className="mx-auto grid w-[min(100%-32px,1200px)] items-center gap-10 md:grid-cols-[.9fr_1.1fr] md:gap-16">
                        <div className="rounded-[24px] bg-[#ffeadb] p-5 sm:p-7">
                            <div className="overflow-hidden rounded-lg bg-white shadow-[0_4px_16px_rgba(40,46,62,0.1)]">
                                <div className="flex items-center gap-3 border-b border-[#d9dde8] px-5 py-4">
                                    <span className="flex size-9 items-center justify-center rounded-full bg-[#edefff] text-[#4255ff]"><FontAwesomeIcon icon={faWandMagicSparkles} className="size-4" /></span>
                                    <div><p className="text-sm font-semibold">{t("Tutor AI Bahasa Sunda")}</p><p className="text-xs text-[#586380]">{t("Belajar dari materi yang diterbitkan")}</p></div>
                                </div>
                                <div className="space-y-4 p-5 sm:p-6">
                                    <div className="max-w-[86%] rounded-lg bg-[#f6f7fb] p-3 text-sm leading-6">{t("Kapan saya memakai kata punten?")}</div>
                                    <div className="ml-auto max-w-[92%] rounded-lg bg-[#edefff] p-3 text-sm leading-6 text-[#2e3856]">{t("Punten dapat digunakan saat meminta izin atau memulai percakapan dengan sopan.")}</div>
                                    <div className="ml-auto flex max-w-[92%] items-start gap-2 rounded-md border border-[#d9dde8] p-3 text-xs leading-5 text-[#586380]">
                                        <FontAwesomeIcon icon={faBookOpen} className="mt-0.5 size-4 shrink-0 text-[#4255ff]" />
                                        <span><strong className="block text-[#282e3e]">{t("Rujukan pelajaran")}</strong>{t("Sapaan dan ungkapan · Bahasa Sunda")}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <p className="mb-3 text-xs font-semibold uppercase tracking-[.12em] text-[#4255ff]">{t("Belajar dengan bantuan AI")}</p>
                            <h2 className="max-w-lg text-3xl font-semibold leading-tight tracking-[-.035em] sm:text-4xl">{t("Punya pertanyaan? Mulai dari materi yang sedang kamu pelajari.")}</h2>
                            <p className="mt-4 max-w-xl leading-7 text-[#586380]">{t("Tutor AI membantu menjelaskan materi, melatih percakapan teks, dan memberi saran tulisan. Jawaban menyertakan rujukan materi agar kamu bisa memeriksa kembali konteksnya.")}</p>
                            <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-[#586380]"><FontAwesomeIcon icon={faCircleQuestion} className="mt-0.5 size-4 shrink-0 text-[#4255ff]" />{t("Jawaban AI dapat keliru. Gunakan materi dan rujukan sebagai panduan belajar.")}</p>
                        </div>
                    </div>
                </section>

                <section id="cara-belajar" tabIndex={-1} data-reveal className="scroll-mt-20 py-16 md:py-20">
                    <div className="mx-auto w-[min(100%-32px,1200px)]">
                        <div className="mx-auto max-w-2xl text-center">
                            <p className="mb-3 text-xs font-semibold uppercase tracking-[.12em] text-[#4255ff]">{t("Cara belajar")}</p>
                            <h2 className="text-3xl font-semibold tracking-[-.035em] sm:text-4xl">{t("Belajar terarah, progres tetap tercatat.")}</h2>
                            <p className="mt-4 leading-7 text-[#586380]">{t("Mulai dari topik dasar lalu lanjutkan sesuai ritmemu. Sawala menyimpan pelajaran dan hasil latihan di akunmu.")}</p>
                        </div>
                        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {[
                                { icon: faBookOpen, title: "Pilih kelas", description: "Bahasa Sunda atau Aksara Sunda." },
                                { icon: faGraduationCap, title: "Ikuti pelajaran", description: "Materi ditata dalam unit yang runtut." },
                                { icon: faBullseye, title: "Coba latihan", description: "Periksa pemahaman dan baca penjelasan." },
                                { icon: faTrophy, title: "Lihat progres", description: "Kembali ke pelajaran yang terakhir dibuka." },
                            ].map(({ icon: Icon, title, description }, index) => (
                                <article key={title} className="rounded-lg border border-[#d9dde8] bg-white p-5 shadow-[0_2px_4px_rgba(40,46,62,0.06)]">
                                    <div className="flex items-center justify-between">
                                        <span className="flex size-10 items-center justify-center rounded-lg bg-[#edefff] text-[#4255ff]"><FontAwesomeIcon icon={Icon} className="size-5" /></span>
                                        <span className="text-xs font-semibold text-[#939bb4]">0{index + 1}</span>
                                    </div>
                                    <h3 className="mt-5 font-semibold">{t(title)}</h3>
                                    <p className="mt-2 text-sm leading-6 text-[#586380]">{t(description)}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="px-4 pb-16 md:pb-20">
                    <div className="mx-auto flex w-full max-w-[1200px] flex-col items-start justify-between gap-6 rounded-[24px] bg-[#edefff] px-6 py-8 sm:px-10 md:flex-row md:items-center md:px-14 md:py-11">
                        <div className="max-w-2xl">
                            <p className="text-xs font-semibold uppercase tracking-[.12em] text-[#4255ff]">{t("Mulai dari satu pelajaran")}</p>
                            <h2 className="mt-3 text-2xl font-semibold tracking-[-.03em] sm:text-3xl">{t("Sedikit demi sedikit, kamu akan semakin akrab dengan Sunda.")}</h2>
                            <p className="mt-3 leading-7 text-[#586380]">{t("Buat akun untuk menyimpan progres dan melanjutkan kapan saja.")}</p>
                        </div>
                        <Link href={destination} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#4255ff] px-6 text-sm font-semibold text-white hover:bg-[#3548eb]">
                            {t(auth.user ? "Lanjut belajar" : "Buat akun gratis")} <FontAwesomeIcon icon={faArrowRightLong} className="size-4" />
                        </Link>
                    </div>
                </section>
            </main>

            <footer className="border-t border-[#d9dde8] bg-white">
                <div className="mx-auto grid w-[min(100%-32px,1200px)] gap-9 py-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
                    <div>
                        <Link href="/" className="flex items-center gap-2.5">
                            <AppLogoIcon aria-hidden="true" className="size-9 rounded-lg object-cover" />
                            <span className="text-base font-bold">Sawala</span>
                        </Link>
                        <p className="mt-3 max-w-xs text-sm leading-6 text-[#586380]">{t("Ruang belajar Bahasa Sunda dan Aksara Sunda yang tertata untuk pelajar.")}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold">{t("Jelajahi")}</h3>
                        <div className="mt-3 flex flex-col gap-2.5 text-sm text-[#586380]">
                            <a className="hover:text-[#4255ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4255ff]" href="#kelas" onClick={handleSectionNavigation}>{t("Bahasa Sunda")}</a>
                            <a className="hover:text-[#4255ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4255ff]" href="#aksara" onClick={handleSectionNavigation}>{t("Aksara Sunda")}</a>
                            <a className="hover:text-[#4255ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4255ff]" href="#cara-belajar" onClick={handleSectionNavigation}>{t("Cara belajar")}</a>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold">{t("Fitur belajar")}</h3>
                        <div className="mt-3 flex flex-col gap-2.5 text-sm text-[#586380]">
                            <a className="hover:text-[#4255ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4255ff]" href="#kelas" onClick={handleSectionNavigation}>{t("Materi dan kosakata")}</a>
                            <a className="hover:text-[#4255ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4255ff]" href="#aksara" onClick={handleSectionNavigation}>{t("Latihan aksara")}</a>
                            <a className="hover:text-[#4255ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4255ff]" href="#tutor" onClick={handleSectionNavigation}>{t("Tutor AI")}</a>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold">{t("Akun")}</h3>
                        <div className="mt-3 flex flex-col gap-2.5 text-sm text-[#586380]">
                            <Link className="hover:text-[#4255ff]" href="/login">{t("Masuk")}</Link>
                            <Link className="hover:text-[#4255ff]" href="/register">{t("Daftar gratis")}</Link>
                        </div>
                    </div>
                </div>
                <div className="border-t border-[#d9dde8]">
                    <div className="mx-auto flex w-[min(100%-32px,1200px)] flex-wrap justify-between gap-3 py-4 text-xs text-[#586380]">
                        <span>© {new Date().getFullYear()} Sawala</span>
                        <span>{t("Bahasa dan aksara, dipelajari dengan cermat.")}</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
