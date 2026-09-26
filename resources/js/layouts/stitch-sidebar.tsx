import { Link } from '@inertiajs/react';
import {
    ChevronDown,
    ChevronRight,
    CircleHelp,
    LogOut,
    MessageSquarePlus,
    Settings2,
} from 'lucide-react';
import { useState } from 'react';
import {
    adminLinks,
    isCurrent,
    learnerLinks,
} from '@/layouts/stitch-navigation';
import AppLogoIcon from '@/components/app-logo-icon';

import { useUiLanguage } from '@/lib/ui-language';

export default function Sidebar({
    admin,
    url,
    name,
    close,
    helpExpanded,
    toggleHelp,
}: {
    admin: boolean;
    url: string;
    name: string;
    close: () => void;
    helpExpanded: boolean;
    toggleHelp: () => void;
}) {
    const links = admin ? adminLinks : learnerLinks;
    const { t } = useUiLanguage();
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
    return (
        <div className="flex h-full min-h-0 flex-col bg-card">
            <Link
                href={admin ? '/admin' : '/dashboard'}
                onClick={close}
                className="flex h-[72px] shrink-0 items-center gap-2.5 px-5"
            >
                <AppLogoIcon className="size-9 shrink-0 rounded-lg object-cover" />
                <span className="min-w-0 leading-tight">
                    <strong className="block text-[15px] font-extrabold tracking-tight text-[#493ee5]">
                        Sawala
                    </strong>
                    <span className="text-[10px] font-semibold text-muted-foreground">
                        {t('Bahasa & Aksara Sunda')}
                    </span>
                </span>
            </Link>

            <nav
                aria-label={t(admin ? 'Navigasi admin' : 'Navigasi belajar')}
                className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-2"
            >
                {links.map((item) => {
                    if ('children' in item) {
                        const groupActive = item.children.some(({ href }) =>
                            isCurrent(href, url),
                        );
                        const expanded = openGroups[item.label] ?? groupActive;
                        const GroupIcon = item.icon;

                        return (
                            <div key={item.label} className="space-y-1">
                                <button
                                    type="button"
                                    aria-expanded={expanded}
                                    onClick={() =>
                                        setOpenGroups((current) => ({
                                            ...current,
                                            [item.label]: !expanded,
                                        }))
                                    }
                                    className={`flex min-h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-[13px] font-semibold transition-colors ${groupActive ? 'bg-[#f5f2ff] text-[#493ee5]' : 'text-[#464555] hover:bg-[#f5f2ff] hover:text-[#493ee5] dark:text-muted-foreground dark:hover:bg-secondary'}`}
                                >
                                    <GroupIcon
                                        className="size-[18px] shrink-0"
                                        strokeWidth={1.9}
                                    />
                                    <span className="min-w-0 flex-1 truncate">
                                        {t(item.label)}
                                    </span>
                                    {expanded ? (
                                        <ChevronDown className="size-4 shrink-0" />
                                    ) : (
                                        <ChevronRight className="size-4 shrink-0" />
                                    )}
                                </button>
                                {expanded && (
                                    <div className="ml-4 space-y-1 border-l border-[#e8e5f2] pl-2">
                                        {item.children.map(
                                            ({ label, href, icon: Icon }) => {
                                                const active = isCurrent(
                                                    href,
                                                    url,
                                                );
                                                return (
                                                    <Link
                                                        key={href}
                                                        href={href}
                                                        onClick={close}
                                                        aria-current={
                                                            active
                                                                ? 'page'
                                                                : undefined
                                                        }
                                                        className={`flex min-h-9 items-center gap-2.5 rounded-lg px-2.5 text-[12px] font-semibold transition-colors ${active ? 'bg-[#493ee5] text-white shadow-[0_5px_15px_-7px_#493ee5]' : 'text-[#5a5868] hover:bg-[#f5f2ff] hover:text-[#493ee5] dark:text-muted-foreground dark:hover:bg-secondary'}`}
                                                    >
                                                        <Icon
                                                            className="size-4 shrink-0"
                                                            strokeWidth={1.9}
                                                        />
                                                        <span className="truncate">
                                                            {t(label)}
                                                        </span>
                                                    </Link>
                                                );
                                            },
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    const active =
                        isCurrent(item.href, url) ||
                        (admin &&
                            item.href.includes('section=overview') &&
                            url === '/admin');
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={close}
                            aria-current={active ? 'page' : undefined}
                            className={`flex min-h-10 items-center gap-3 rounded-xl px-3 text-[13px] font-semibold transition-colors ${active ? 'bg-[#493ee5] text-white shadow-[0_5px_15px_-7px_#493ee5]' : 'text-[#464555] hover:bg-[#f5f2ff] hover:text-[#493ee5] dark:text-muted-foreground dark:hover:bg-secondary'}`}
                        >
                            <Icon
                                className="size-[18px] shrink-0"
                                strokeWidth={1.9}
                            />
                            <span className="truncate">{t(item.label)}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="shrink-0 space-y-2 p-3">
                {!admin && (
                    <div className="rounded-2xl bg-[#ecfdf5] p-3 text-[#064e3b]">
                        <button
                            type="button"
                            aria-expanded={helpExpanded}
                            aria-label={t(
                                helpExpanded
                                    ? 'Sembunyikan bantuan belajar'
                                    : 'Tampilkan bantuan belajar',
                            )}
                            onClick={toggleHelp}
                            className="flex min-h-6 w-full items-center justify-between gap-2 rounded-md text-left text-[11px] font-extrabold tracking-wide uppercase focus-visible:ring-2 focus-visible:ring-[#006c4a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#ecfdf5] focus-visible:outline-none"
                        >
                            <span className="flex items-center gap-2">
                                <span>{t('Bantuan belajar')}</span>
                                <CircleHelp className="size-4" />
                            </span>
                            <ChevronDown
                                className={`size-4 shrink-0 transition-transform ${helpExpanded ? 'rotate-180' : ''}`}
                            />
                        </button>
                        {helpExpanded && (
                            <div className="mt-1.5">
                                <p className="text-[11px] leading-5">
                                    {t(
                                        'Bingung tentang tata bahasa atau aksara? Tanyakan kepada tutor.',
                                    )}
                                </p>
                                <Link
                                    href="/tutor"
                                    onClick={close}
                                    className="mt-2 flex min-h-8 items-center justify-center rounded-lg bg-[#006c4a] px-3 text-[11px] font-bold text-white hover:bg-[#064e3b]"
                                >
                                    {t('Buka tutor')}
                                </Link>
                                <Link
                                    href="/umpan-balik"
                                    onClick={close}
                                    className="mt-1 flex min-h-8 items-center justify-center gap-2 rounded-lg px-3 text-[11px] font-bold text-[#006c4a] hover:bg-white/70"
                                >
                                    <MessageSquarePlus className="size-3.5" />{' '}
                                    {t('Kirim umpan balik')}
                                </Link>
                            </div>
                        )}
                    </div>
                )}
                <Link
                    href="/settings/profile"
                    onClick={close}
                    aria-label={t('Profil')}
                    className="flex min-h-9 items-center gap-2 rounded-xl px-2 text-xs font-semibold text-[#464555] hover:bg-[#f5f2ff]"
                >
                    <span className="flex size-7 items-center justify-center rounded-full bg-[#efedff] font-bold text-[#493ee5]">
                        {name.charAt(0).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1 leading-tight">
                        <span className="block truncate">{name}</span>
                        <span className="block truncate text-[10px] text-muted-foreground">
                            {t('Profil')}
                        </span>
                    </span>
                    <Settings2 className="size-4" />
                </Link>
                <Link
                    href="/logout"
                    method="post"
                    as="button"
                    onClick={close}
                    className="flex min-h-8 w-full items-center gap-2 rounded-xl px-2 text-left text-xs text-muted-foreground hover:bg-[#f5f2ff]"
                >
                    <LogOut className="size-4" /> {t('Keluar')}
                </Link>
            </div>
        </div>
    );
}

