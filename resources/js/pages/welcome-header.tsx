import { t } from '@/lib/ui-language';
import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowRightLong,
    faBars,
    faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { sectionLinks } from '@/pages/welcome-feature-data';
import type { Auth } from '@/types';
import type { Dispatch, MouseEvent, RefObject, SetStateAction } from 'react';

type Props = {
    auth: { user: Auth['user'] | null };
    destination: string;
    activeSection: string;
    mobileMenuOpen: boolean;
    setMobileMenuOpen: Dispatch<SetStateAction<boolean>>;
    mobileMenuButtonRef: RefObject<HTMLButtonElement | null>;
    handleSectionNavigation: (event: MouseEvent<HTMLAnchorElement>) => void;
};

export function WelcomeHeader({
    auth,
    destination,
    activeSection,
    mobileMenuOpen,
    setMobileMenuOpen,
    mobileMenuButtonRef,
    handleSectionNavigation,
}: Props) {
    return (
        <header className="sticky top-0 z-40 border-b border-[#d9dde8] bg-white/95 shadow-[0_2px_8px_rgba(40,46,62,0.06)] backdrop-blur">
            <div className="mx-auto grid min-h-16 w-[min(100%-32px,1200px)] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-5">
                <Link
                    href="/"
                    className="flex shrink-0 items-center gap-2.5 justify-self-start"
                >
                    <AppLogoIcon
                        aria-hidden="true"
                        className="size-9 rounded-lg object-cover"
                    />
                    <span className="text-[17px] font-bold tracking-tight text-[#282e3e]">
                        Sawala
                    </span>
                </Link>

                <nav
                    className="hidden items-center gap-7 text-sm font-medium text-[#586380] lg:flex lg:justify-self-center"
                    aria-label={t('Navigasi utama')}
                >
                    {sectionLinks.map(({ href, label }) => (
                        <a
                            key={href}
                            aria-current={
                                activeSection === href.slice(1)
                                    ? 'location'
                                    : undefined
                            }
                            className={`rounded-sm border-b-2 pb-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4255ff] ${activeSection === href.slice(1) ? 'border-[#4255ff] text-[#4255ff]' : 'border-transparent hover:border-[#aeb4ff] hover:text-[#4255ff]'}`}
                            href={href}
                            onClick={handleSectionNavigation}
                        >
                            {t(label)}
                        </a>
                    ))}
                </nav>

                <div className="col-start-2 hidden shrink-0 items-center gap-2 justify-self-end sm:gap-3 lg:col-start-3 lg:flex">
                    <Link
                        href={auth.user ? destination : '/login'}
                        className="rounded-full px-3 py-2 text-sm font-semibold text-[#4255ff] hover:bg-[#f6f7fb]"
                    >
                        {t(auth.user ? 'Ruang saya' : 'Masuk')}
                    </Link>
                    <Link
                        href={destination}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#4255ff] px-4 text-sm font-semibold text-white shadow-[0_2px_4px_rgba(40,46,62,0.1)] hover:bg-[#3548eb] sm:px-5"
                    >
                        {t(
                            auth.user?.role === 'admin'
                                ? 'Buka ruang kelola'
                                : auth.user
                                  ? 'Lanjut belajar'
                                  : 'Daftar gratis',
                        )}
                        <FontAwesomeIcon
                            icon={faArrowRightLong}
                            className="size-4"
                        />
                    </Link>
                </div>

                <div className="col-start-2 flex items-center gap-2 justify-self-end lg:hidden">
                    <Link
                        href={destination}
                        className="inline-flex min-h-10 items-center rounded-full bg-[#4255ff] px-3 text-xs font-semibold text-white hover:bg-[#3548eb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4255ff]"
                    >
                        {t(auth.user ? 'Ruang saya' : 'Daftar gratis')}
                    </Link>
                    <button
                        ref={mobileMenuButtonRef}
                        type="button"
                        aria-label={t(
                            mobileMenuOpen
                                ? 'Tutup menu navigasi'
                                : 'Buka menu navigasi',
                        )}
                        aria-expanded={mobileMenuOpen}
                        aria-controls="mobile-navigation"
                        onClick={() => setMobileMenuOpen((open) => !open)}
                        className="flex size-10 items-center justify-center rounded-lg border border-[#d9dde8] bg-white text-[#282e3e] hover:border-[#4255ff] hover:text-[#4255ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4255ff]"
                    >
                        <FontAwesomeIcon
                            icon={mobileMenuOpen ? faXmark : faBars}
                            className="size-4"
                        />
                    </button>
                </div>
            </div>

            <nav
                id="mobile-navigation"
                className={`${mobileMenuOpen ? 'block' : 'hidden'} border-t border-[#d9dde8] bg-white px-4 py-3 lg:hidden`}
                aria-label={t('Navigasi utama')}
            >
                <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-1">
                    {sectionLinks.map(({ href, label }) => (
                        <a
                            key={href}
                            aria-current={
                                activeSection === href.slice(1)
                                    ? 'location'
                                    : undefined
                            }
                            className={`rounded-md px-3 py-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4255ff] ${activeSection === href.slice(1) ? 'bg-[#edefff] font-semibold text-[#4255ff]' : 'font-medium text-[#586380] hover:bg-[#f6f7fb] hover:text-[#4255ff]'}`}
                            href={href}
                            onClick={handleSectionNavigation}
                        >
                            {t(label)}
                        </a>
                    ))}
                    {!auth.user && (
                        <div className="mt-2 border-t border-[#e7e9f0] pt-3">
                            <Link
                                href="/login"
                                className="inline-flex min-h-10 w-full items-center justify-center rounded-full border border-[#d9dde8] px-4 text-sm font-semibold text-[#4255ff] hover:bg-[#f6f7fb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4255ff]"
                            >
                                {t('Masuk')}
                            </Link>
                        </div>
                    )}
                </div>
            </nav>
        </header>
    );
}
