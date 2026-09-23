import { Link, usePage } from "@inertiajs/react";
import {
    AudioLines,
    BookOpen,
    CircleHelp,
    ClipboardList,
    GraduationCap,
    LayoutDashboard,
    LogOut,
    Menu,
    MessageSquareText,
    PenLine,
    Search,
    Settings2,
    Users,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import AppLogoIcon from "@/components/app-logo-icon";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import type { Auth } from "@/types";
import { useUiLanguage } from "@/lib/ui-language";

const learnerLinks = [
    { label: "Beranda / Dasbor", href: "/dashboard", icon: LayoutDashboard },
    { label: "Bahasa Sunda", href: "/belajar/bahasa-sunda", icon: BookOpen },
    { label: "Aksara Sunda", href: "/belajar/aksara-sunda", icon: PenLine },
    { label: "Latihan & Aksara", href: "/latihan-aksara", icon: ClipboardList },
    { label: "Tutor AI", href: "/tutor", icon: MessageSquareText },
    { label: "Progres Belajar", href: "/progres", icon: GraduationCap },
];

const adminLinks = [
    { label: "Ringkasan", href: "/admin?section=overview", icon: LayoutDashboard },
    { label: "Kelas & Pelajaran", href: "/admin?section=paths", icon: BookOpen },
    { label: "Kosakata & Konteks", href: "/admin?section=vocabulary", icon: BookOpen },
    { label: "Latihan & Soal", href: "/admin?section=exercises", icon: ClipboardList },
    { label: "Audio & Media", href: "/admin?section=media", icon: AudioLines },
    { label: "Pelajar & Progres", href: "/admin?section=learners", icon: Users },
];

function isCurrent(href: string, url: string): boolean {
    const currentPath = url.split("?")[0];
    const target = href.split("?")[0];
    if (target !== currentPath) return false;
    if (!href.includes("?")) return true;
    const current = new URLSearchParams(url.split("?")[1] ?? "");
    const wanted = new URLSearchParams(href.split("?")[1]);
    return [...wanted].every(([key, value]) => current.get(key) === value);
}

function Sidebar({
    admin,
    url,
    name,
    close,
}: {
    admin: boolean;
    url: string;
    name: string;
    close: () => void;
}) {
    const links = admin ? adminLinks : learnerLinks;
    const { t } = useUiLanguage();
    return (
        <div className="flex h-full min-h-0 flex-col bg-card">
            <Link
                href={admin ? "/admin" : "/dashboard"}
                onClick={close}
                className="flex h-[72px] shrink-0 items-center gap-2.5 px-5"
            >
                <AppLogoIcon className="size-9 shrink-0 rounded-lg object-cover" />
                <span className="min-w-0 leading-tight">
                    <strong className="block text-[15px] font-extrabold tracking-tight text-[#493ee5]">
                        Sawala
                    </strong>
                    <span className="text-[10px] font-semibold text-muted-foreground">
                        {t("Bahasa & Aksara Sunda")}
                    </span>
                </span>
            </Link>

            <nav
                aria-label={t(admin ? "Navigasi admin" : "Navigasi belajar")}
                className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-2"
            >
                {links.map(({ label, href, icon: Icon }) => {
                    const active =
                        isCurrent(href, url) ||
                        (admin && href.includes("section=overview") && url === "/admin");
                    return (
                        <Link
                            key={href}
                            href={href}
                            onClick={close}
                            aria-current={active ? "page" : undefined}
                            className={`flex min-h-10 items-center gap-3 rounded-xl px-3 text-[13px] font-semibold transition-colors ${active ? "bg-[#493ee5] text-white shadow-[0_5px_15px_-7px_#493ee5]" : "text-[#464555] hover:bg-[#f5f2ff] hover:text-[#493ee5] dark:text-muted-foreground dark:hover:bg-secondary"}`}
                        >
                            <Icon className="size-[18px] shrink-0" strokeWidth={1.9} />
                            <span className="truncate">{t(label)}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="shrink-0 space-y-2 p-3">
                {!admin && (
                    <div className="rounded-2xl bg-[#ecfdf5] p-3 text-[#064e3b]">
                        <div className="flex items-center justify-between gap-2 text-[11px] font-extrabold uppercase tracking-wide">
                            <span>{t("Bantuan belajar")}</span>
                            <CircleHelp className="size-4" />
                        </div>
                        <p className="mt-1.5 text-[11px] leading-5">
                            {t("Bingung tentang tata bahasa atau aksara? Tanyakan kepada tutor.")}
                        </p>
                        <Link
                            href="/tutor"
                            onClick={close}
                            className="mt-2 flex min-h-8 items-center justify-center rounded-lg bg-[#006c4a] px-3 text-[11px] font-bold text-white hover:bg-[#064e3b]"
                        >
                            {t("Buka tutor")}
                        </Link>
                    </div>
                )}
                <Link
                    href="/settings/profile"
                    onClick={close}
                    aria-label={t("Pengaturan akun")}
                    className="flex min-h-9 items-center gap-2 rounded-xl px-2 text-xs font-semibold text-[#464555] hover:bg-[#f5f2ff]"
                >
                    <span className="flex size-7 items-center justify-center rounded-full bg-[#efedff] font-bold text-[#493ee5]">
                        {name.charAt(0).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1 leading-tight">
                        <span className="block truncate">{name}</span>
                        <span className="block truncate text-[10px] text-muted-foreground">{t("Pengaturan & Bahasa")}</span>
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
                    <LogOut className="size-4" /> {t("Keluar")}
                </Link>
            </div>
        </div>
    );
}

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
    const close = () => setMenuOpen(false);
    const { t } = useUiLanguage();

    return (
        <div className="min-h-screen bg-background lg:flex">
            <aside className="sticky top-0 hidden h-screen w-[238px] shrink-0 border-r border-[#eeeaf8] lg:block">
                <Sidebar admin={admin} url={url} name={auth.user.name} close={() => {}} />
            </aside>
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                <SheetContent side="left" className="w-[min(86vw,280px)] gap-0 border-0 p-0">
                    <SheetHeader className="sr-only">
                        <SheetTitle>Menu Sawala</SheetTitle>
                        <SheetDescription>{t("Pilih halaman")}</SheetDescription>
                    </SheetHeader>
                    <Sidebar admin={admin} url={url} name={auth.user.name} close={close} />
                </SheetContent>
            </Sheet>
            <div className="min-w-0 flex-1">
                {!admin && (
                    <header className="sticky top-0 z-30 flex min-h-[72px] items-center gap-3 border-b border-[#eeeaf8] bg-card/95 px-4 backdrop-blur md:px-6">
                        <button
                            type="button"
                            aria-label={t("Buka menu")}
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
                                aria-label={t("Cari materi")}
                                placeholder={t("Cari kosakata, aksara, atau pelajaran")}
                                className="min-h-10 min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-[#777587] sm:text-sm"
                            />
                        </form>
                        <div className="hidden shrink-0 items-center gap-2 md:flex">
                            <span className="rounded-full bg-[#fef3c7] px-3 py-2 text-xs font-bold text-[#a34b05]">
                                {learningStats?.completedLessons ?? 0} {t("pelajaran selesai")}
                            </span>
                            <span className="rounded-full bg-[#efedff] px-3 py-2 text-xs font-bold text-[#493ee5]">
                                {learningStats?.attempts ?? 0} {t("latihan")}
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
                    className={
                        admin
                            ? "mx-auto w-full max-w-[1800px] px-4 py-5 md:px-6 lg:px-8 lg:py-7"
                            : "min-w-0"
                    }
                >
                    {admin && (
                        <button
                            type="button"
                            aria-label={t("Buka menu admin")}
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
