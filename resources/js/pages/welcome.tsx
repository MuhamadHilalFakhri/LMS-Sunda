import { t } from '@/lib/ui-language';
import { Head, usePage } from '@inertiajs/react';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import type { Auth } from '@/types';

import { WelcomeMain } from '@/pages/welcome-main';
import { WelcomeHeader } from '@/pages/welcome-header';
import { WelcomeFooter } from '@/pages/welcome-footer';
import { useSundaneseSpeech } from '@/pages/welcome-speech';

import { sectionLinks, type FeatureKind } from '@/pages/welcome-feature-data';

export default function Welcome() {
    const { auth } = usePage<{ auth: { user: Auth['user'] | null } }>().props;
    const rootRef = useRef<HTMLDivElement>(null);
    const featurePanelRef = useRef<HTMLDivElement>(null);
    const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
    const [activeFeature, setActiveFeature] = useState<FeatureKind>('language');
    const [activeSection, setActiveSection] = useState(() => {
        if (typeof window === 'undefined') return '';
        const currentHash = window.location.hash;
        return (
            sectionLinks
                .find(({ href }) => href === currentHash)
                ?.href.slice(1) ?? ''
        );
    });
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const {
        playPhrase,
        speakingPhrase,
        speechError,
        voices,
        selectedVoiceURI,
        setSelectedVoiceURI,
    } = useSundaneseSpeech();
    const destination = auth.user
        ? auth.user.role === 'admin'
            ? '/admin'
            : '/dashboard'
        : '/register';

    const handleSectionNavigation = (event: MouseEvent<HTMLAnchorElement>) => {
        const sectionId = event.currentTarget.hash.slice(1);
        const target = document.getElementById(sectionId);
        if (!target) return;

        event.preventDefault();
        setMobileMenuOpen(false);
        setActiveSection(sectionId);
        if (window.location.hash !== `#${sectionId}`) {
            window.history.replaceState(
                window.history.state,
                '',
                `#${sectionId}`,
            );
        }

        const behavior = window.matchMedia('(prefers-reduced-motion: reduce)')
            .matches
            ? 'auto'
            : 'smooth';
        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
                target.scrollIntoView({ behavior, block: 'start' });
                target.focus({ preventScroll: true });
            });
        });
    };

    useEffect(() => {
        const sections = sectionLinks
            .map(({ href }) => document.getElementById(href.slice(1)))
            .filter(
                (section): section is HTMLElement =>
                    section instanceof HTMLElement,
            );

        const observer = new IntersectionObserver(
            (entries) => {
                const activeEntry = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort(
                        (a, b) =>
                            Math.abs(
                                a.boundingClientRect.top -
                                    window.innerHeight * 0.35,
                            ) -
                            Math.abs(
                                b.boundingClientRect.top -
                                    window.innerHeight * 0.35,
                            ),
                    )[0];

                if (activeEntry) setActiveSection(activeEntry.target.id);
            },
            { rootMargin: '-20% 0px -65% 0px', threshold: 0 },
        );

        sections.forEach((section) => observer.observe(section));
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!mobileMenuOpen) return;

        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') return;
            setMobileMenuOpen(false);
            mobileMenuButtonRef.current?.focus();
        };

        window.addEventListener('keydown', closeOnEscape);
        return () => window.removeEventListener('keydown', closeOnEscape);
    }, [mobileMenuOpen]);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        gsap.registerPlugin(ScrollTrigger);
        const media = gsap.matchMedia();
        media.add('(prefers-reduced-motion: no-preference)', () => {
            const context = gsap.context(() => {
                gsap.timeline({ defaults: { ease: 'power2.out' } })
                    .from("[data-hero='eyebrow']", {
                        y: 14,
                        autoAlpha: 0,
                        duration: 0.45,
                    })
                    .from(
                        "[data-hero='title']",
                        { y: 22, autoAlpha: 0, duration: 0.6 },
                        '-=0.2',
                    )
                    .from(
                        "[data-hero='copy'], [data-hero='actions']",
                        { y: 14, autoAlpha: 0, duration: 0.45, stagger: 0.1 },
                        '-=0.25',
                    )
                    .from(
                        "[data-hero='cards']",
                        { y: 24, autoAlpha: 0, duration: 0.55 },
                        '-=0.1',
                    );

                gsap.utils
                    .toArray<HTMLElement>('[data-reveal]')
                    .forEach((element) => {
                        gsap.from(element, {
                            y: 24,
                            autoAlpha: 0,
                            duration: 0.65,
                            ease: 'power2.out',
                            scrollTrigger: {
                                trigger: element,
                                start: 'top 88%',
                                once: true,
                            },
                        });
                    });

                gsap.to('[data-float]', {
                    y: -9,
                    rotation: 2,
                    duration: 2.3,
                    repeat: -1,
                    yoyo: true,
                    ease: 'sine.inOut',
                    stagger: 0.35,
                });
            }, root);

            return () => context.revert();
        });

        return () => media.revert();
    }, []);

    useEffect(() => {
        if (
            !featurePanelRef.current ||
            window.matchMedia('(prefers-reduced-motion: reduce)').matches
        )
            return;
        gsap.fromTo(
            featurePanelRef.current,
            { y: 8, autoAlpha: 0.65 },
            { y: 0, autoAlpha: 1, duration: 0.28, ease: 'power2.out' },
        );
    }, [activeFeature]);

    return (
        <div
            ref={rootRef}
            className="landing-page min-h-screen bg-[#f6f7fb] text-[#282e3e]"
        >
            <Head title={t('Belajar Bahasa dan Aksara Sunda')}>
                <meta
                    name="description"
                    content={t(
                        'Pelajari Bahasa Sunda dan Aksara Sunda lewat materi terarah, latihan interaktif, dan Tutor AI dengan rujukan pelajaran.',
                    )}
                />
                <meta
                    property="og:title"
                    content={t('Belajar Bahasa dan Aksara Sunda')}
                />
                <meta
                    property="og:description"
                    content={t(
                        'Pelajari Bahasa Sunda dan Aksara Sunda lewat materi terarah, latihan interaktif, dan Tutor AI dengan rujukan pelajaran.',
                    )}
                />
                <meta property="og:type" content="website" />
            </Head>

            <p className="sr-only" aria-live="polite">
                {speechError
                    ? t(speechError)
                    : speakingPhrase
                      ? `${t('Sedang diputar')}: ${speakingPhrase}`
                      : ''}
            </p>

            <WelcomeHeader
                auth={auth}
                destination={destination}
                activeSection={activeSection}
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
                mobileMenuButtonRef={mobileMenuButtonRef}
                handleSectionNavigation={handleSectionNavigation}
            />

            <WelcomeMain
                auth={auth}
                destination={destination}
                featurePanelRef={featurePanelRef}
                activeFeature={activeFeature}
                setActiveFeature={setActiveFeature}
                playPhrase={playPhrase}
                speakingPhrase={speakingPhrase}
                speechError={speechError}
                voices={voices}
                selectedVoiceURI={selectedVoiceURI}
                setSelectedVoiceURI={setSelectedVoiceURI}
                handleSectionNavigation={handleSectionNavigation}
            />

            <WelcomeFooter handleSectionNavigation={handleSectionNavigation} />
        </div>
    );
}
