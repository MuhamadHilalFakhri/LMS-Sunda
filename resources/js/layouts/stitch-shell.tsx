import { Link, usePage } from '@inertiajs/react';
import { Menu, Search } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import type { Auth } from '@/types';
import { useUiLanguage } from '@/lib/ui-language';
import Sidebar from '@/layouts/stitch-sidebar';

export default function StitchShell({
    children,
    admin = false,
}: {
    children: ReactNode;
    admin?: boolean;
}) {
    const { auth, learningStats } = usePage<{
        auth: Auth;
        learningStats?: { completedLessons: number; attempts: number };
    }>().props;
    const { url } = usePage();
    const [menuOpen, setMenuOpen] = useState(false);
    const [helpExpanded, setHelpExpanded] = useState(() => {
        try {
            return (
                typeof window === 'undefined' ||
                window.localStorage.getItem('sawala-sidebar-help-expanded') !==
                    'false'
            );
        } catch {
            return true;
        }
    });
    const close = () => setMenuOpen(false);
    const { t } = useUiLanguage();

    useEffect(() => {
        try {
            window.localStorage.setItem(
                'sawala-sidebar-help-expanded',
                String(helpExpanded),
            );
        } catch {
            // Sidebar preference is optional when browser storage is unavailable.
        }
    }, [helpExpanded]);

    return (
        <div className="min-h-screen bg-background lg:flex">
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-card focus:px-4 focus:py-3 focus:font-semibold focus:shadow-lg"
            >
                {t('Lewati ke konten utama')}
            </a>
            <aside className="sticky top-0 hidden h-screen w-[238px] shrink-0 border-r border-[#eeeaf8] lg:block">
                <Sidebar
                    admin={admin}
                    url={url}
                    name={auth.user.name}
                    close={() => {}}
                    helpExpanded={helpExpanded}
                    toggleHelp={() => setHelpExpanded((expanded) => !expanded)}
                />
            </aside>
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                <SheetContent
                    side="left"
                    className="w-[min(86vw,280px)] gap-0 border-0 p-0"
                >
                    <SheetHeader className="sr-only">
                        <SheetTitle>Menu Sawala</SheetTitle>
                        <SheetDescription>
                            {t('Pilih halaman')}
                        </SheetDescription>
                    </SheetHeader>
                    <Sidebar
                        admin={admin}
                        url={url}
                        name={auth.user.name}
                        close={close}
                        helpExpanded={helpExpanded}
                        toggleHelp={() =>
                            setHelpExpanded((expanded) => !expanded)
                        }
                    />
                </SheetContent>
            </Sheet>
            <div className="min-w-0 flex-1">
                {!admin && (
                    <header className="sticky top-0 z-30 flex min-h-[72px] items-center gap-3 border-b border-[#eeeaf8] bg-card/95 px-4 backdrop-blur md:px-6">
                        <button
                            type="button"
                            aria-label={t('Buka menu')}
                            onClick={() => setMenuOpen(true)}
                            className="flex size-10 shrink-0 items-center justify-center rounded-xl border lg:hidden"
                        >
                            <Menu className="size-5" />
                        </button>
                        <form
                            action="/cari"
                            method="get"
                            role="search"
                            className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-[#f8f6ff] px-3"
                        >
                            <Search className="size-4 shrink-0 text-[#777587]" />
                            <input
                                name="q"
                                aria-label={t('Cari materi')}
                                placeholder={t(
                                    'Cari kosakata, aksara, atau pelajaran',
                                )}
                                className="min-h-10 min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-[#777587] focus-visible:ring-2 focus-visible:ring-[#493ee5] sm:text-sm"
                            />
                        </form>
                        <div className="hidden shrink-0 items-center gap-2 md:flex">
                            <span className="rounded-full bg-[#fef3c7] px-3 py-2 text-xs font-bold text-[#a34b05]">
                                {learningStats?.completedLessons ?? 0}{' '}
                                {t('pelajaran selesai')}
                            </span>
                            <span className="rounded-full bg-[#efedff] px-3 py-2 text-xs font-bold text-[#493ee5]">
                                {learningStats?.attempts ?? 0} {t('latihan')}
                            </span>
                        </div>
                        <Link
                            href="/settings/profile"
                            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#efedff] text-xs font-extrabold text-[#493ee5]"
                            aria-label={`Profil ${auth.user.name}`}
                        >
                            {auth.user.name.charAt(0).toUpperCase()}
                        </Link>
                    </header>
                )}
                <main
                    id="main-content"
                    tabIndex={-1}
                    className={
                        admin
                            ? 'mx-auto w-full max-w-[1800px] px-4 py-5 md:px-6 lg:px-8 lg:py-7'
                            : 'min-w-0'
                    }
                >
                    {admin && (
                        <button
                            type="button"
                            aria-label={t('Buka menu admin')}
                            onClick={() => setMenuOpen(true)}
                            className="mb-4 flex size-10 items-center justify-center rounded-xl border bg-card lg:hidden"
                        >
                            <Menu className="size-5" />
                        </button>
                    )}
                    {children}
                </main>
            </div>
        </div>
    );
}
