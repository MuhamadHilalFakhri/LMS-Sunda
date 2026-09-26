import { t } from '@/lib/ui-language';
import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import type { MouseEvent } from 'react';

type Props = {
    handleSectionNavigation: (event: MouseEvent<HTMLAnchorElement>) => void;
};

export function WelcomeFooter({ handleSectionNavigation }: Props) {
    return (
        <footer className="border-t border-[#d9dde8] bg-white">
            <div className="mx-auto grid w-[min(100%-32px,1200px)] gap-9 py-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
                <div>
                    <Link href="/" className="flex items-center gap-2.5">
                        <AppLogoIcon
                            aria-hidden="true"
                            className="size-9 rounded-lg object-cover"
                        />
                        <span className="text-base font-bold">Sawala</span>
                    </Link>
                    <p className="mt-3 max-w-xs text-sm leading-6 text-[#586380]">
                        {t(
                            'Ruang belajar Bahasa Sunda dan Aksara Sunda yang tertata untuk pelajar.',
                        )}
                    </p>
                </div>
                <div>
                    <h3 className="text-sm font-semibold">{t('Jelajahi')}</h3>
                    <div className="mt-3 flex flex-col gap-2.5 text-sm text-[#586380]">
                        <a
                            className="hover:text-[#4255ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4255ff]"
                            href="#kelas"
                            onClick={handleSectionNavigation}
                        >
                            {t('Bahasa Sunda')}
                        </a>
                        <a
                            className="hover:text-[#4255ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4255ff]"
                            href="#aksara"
                            onClick={handleSectionNavigation}
                        >
                            {t('Aksara Sunda')}
                        </a>
                        <a
                            className="hover:text-[#4255ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4255ff]"
                            href="#cara-belajar"
                            onClick={handleSectionNavigation}
                        >
                            {t('Cara belajar')}
                        </a>
                    </div>
                </div>
                <div>
                    <h3 className="text-sm font-semibold">
                        {t('Fitur belajar')}
                    </h3>
                    <div className="mt-3 flex flex-col gap-2.5 text-sm text-[#586380]">
                        <a
                            className="hover:text-[#4255ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4255ff]"
                            href="#kelas"
                            onClick={handleSectionNavigation}
                        >
                            {t('Materi dan kosakata')}
                        </a>
                        <a
                            className="hover:text-[#4255ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4255ff]"
                            href="#aksara"
                            onClick={handleSectionNavigation}
                        >
                            {t('Latihan aksara')}
                        </a>
                        <a
                            className="hover:text-[#4255ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4255ff]"
                            href="#tutor"
                            onClick={handleSectionNavigation}
                        >
                            {t('Tutor AI')}
                        </a>
                    </div>
                </div>
                <div>
                    <h3 className="text-sm font-semibold">{t('Akun')}</h3>
                    <div className="mt-3 flex flex-col gap-2.5 text-sm text-[#586380]">
                        <Link className="hover:text-[#4255ff]" href="/login">
                            {t('Masuk')}
                        </Link>
                        <Link className="hover:text-[#4255ff]" href="/register">
                            {t('Daftar gratis')}
                        </Link>
                    </div>
                </div>
            </div>
            <div className="border-t border-[#d9dde8]">
                <div className="mx-auto flex w-[min(100%-32px,1200px)] flex-wrap justify-between gap-3 py-4 text-xs text-[#586380]">
                    <span>© {new Date().getFullYear()} Sawala</span>
                    <span>
                        {t('Bahasa dan aksara, dipelajari dengan cermat.')}
                    </span>
                </div>
            </div>
        </footer>
    );
}
