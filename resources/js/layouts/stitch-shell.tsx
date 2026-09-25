import { Link, usePage } from "@inertiajs/react";
import {
    AudioLines,
    Bookmark,
    Bot,
    BookOpen,
    ChartNoAxesCombined,
    CaseSensitive,
    ChevronDown,
    ChevronRight,
    CircleHelp,
    ClipboardList,
    ClipboardCheck,
    GraduationCap,
    LibraryBig,
    LayoutDashboard,
    LogOut,
    Menu,
    MessageSquareText,
    MessageSquarePlus,
    MessageSquareWarning,
    PenLine,
    RotateCcw,
    Search,
    Settings2,
    Tags,
    Users,
    Workflow,
    type LucideIcon,
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

type NavigationLink = { label: string; href: string; icon: LucideIcon };
type NavigationGroup = { label: string; icon: LucideIcon; children: NavigationLink[] };
type AdminNavigationItem = NavigationLink | NavigationGroup;

const learnerLinks: AdminNavigationItem[] = [
    { label: "Beranda", href: "/dashboard", icon: LayoutDashboard },
    {
        label: "Materi belajar",
        icon: LibraryBig,
        children: [
            { label: "Bahasa Sunda", href: "/belajar/bahasa-sunda", icon: BookOpen },
            { label: "Aksara Sunda", href: "/belajar/aksara-sunda", icon: PenLine },
            { label: "Kumpulan Aksara", href: "/aksara-sunda/kumpulan", icon: CaseSensitive },
        ],
    },
    {
        label: "Latihan & evaluasi",
        icon: ClipboardList,
        children: [
            { label: "Latihan Aksara", href: "/latihan-aksara", icon: PenLine },
            { label: "Kuis", href: "/kuis", icon: ClipboardCheck },
        ],
    },
    { label: "Tutor AI", href: "/tutor", icon: MessageSquareText },
    {
        label: "Perkembangan",
        icon: GraduationCap,
        children: [
            { label: "Progres Belajar", href: "/progres", icon: GraduationCap },
            { label: "Ulasan jawaban", href: "/ulasan", icon: CircleHelp },
            { label: "Ulangan terjadwal", href: "/ulangan", icon: RotateCcw },
            { label: "Materi tersimpan", href: "/materi-tersimpan", icon: Bookmark },
        ],
    },
];

const adminLinks: AdminNavigationItem[] = [
    { label: "Ringkasan", href: "/admin?section=overview", icon: LayoutDashboard },
    {
        label: "Materi belajar",
        icon: LibraryBig,
        children: [
            { label: "Kelas & Pelajaran", href: "/admin?section=paths", icon: BookOpen },
            { label: "Kosakata & Konteks", href: "/admin?section=vocabulary", icon: Tags },
            { label: "Kumpulan Aksara Sunda", href: "/admin?section=characters", icon: CaseSensitive },
        ],
    },
    { label: "Latihan & Soal", href: "/admin?section=exercises", icon: ClipboardList },
    { label: "Audio & Media", href: "/admin?section=media", icon: AudioLines },
    { label: "Pelajar & Progres", href: "/admin?section=learners", icon: Users },
    {
        label: "Operasional",
        icon: Workflow,
        children: [
            { label: "Laporan & Analitik", href: "/admin?section=analytics", icon: ChartNoAxesCombined },
            { label: "Pengaturan Tutor AI", href: "/admin?section=tutor", icon: Bot },
            { label: "Umpan Balik", href: "/admin?section=feedback", icon: MessageSquareWarning },
        ],
    },
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
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
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
                {links.map((item) => {
                    if ("children" in item) {
                        const groupActive = item.children.some(({ href }) => isCurrent(href, url));
                        const expanded = openGroups[item.label] ?? groupActive;
                        const GroupIcon = item.icon;

                        return (
                            <div key={item.label} className="space-y-1">
                                <button
                                    type="button"
                                    aria-expanded={expanded}
                                    onClick={() => setOpenGroups((current) => ({ ...current, [item.label]: !expanded }))}
                                    className={`flex min-h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-[13px] font-semibold transition-colors ${groupActive ? "bg-[#f5f2ff] text-[#493ee5]" : "text-[#464555] hover:bg-[#f5f2ff] hover:text-[#493ee5] dark:text-muted-foreground dark:hover:bg-secondary"}`}
                                >
                                    <GroupIcon className="size-[18px] shrink-0" strokeWidth={1.9} />
                                    <span className="min-w-0 flex-1 truncate">{t(item.label)}</span>
                                    {expanded ? <ChevronDown className="size-4 shrink-0" /> : <ChevronRight className="size-4 shrink-0" />}
                                </button>
                                {expanded && (
                                    <div className="ml-4 space-y-1 border-l border-[#e8e5f2] pl-2">
                                        {item.children.map(({ label, href, icon: Icon }) => {
                                            const active = isCurrent(href, url);
                                            return (
                                                <Link
                                                    key={href}
                                                    href={href}
                                                    onClick={close}
                                                    aria-current={active ? "page" : undefined}
                                                    className={`flex min-h-9 items-center gap-2.5 rounded-lg px-2.5 text-[12px] font-semibold transition-colors ${active ? "bg-[#493ee5] text-white shadow-[0_5px_15px_-7px_#493ee5]" : "text-[#5a5868] hover:bg-[#f5f2ff] hover:text-[#493ee5] dark:text-muted-foreground dark:hover:bg-secondary"}`}
                                                >
                                                    <Icon className="size-4 shrink-0" strokeWidth={1.9} />
                                                    <span className="truncate">{t(label)}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    const active =
                        isCurrent(item.href, url) ||
                        (admin && item.href.includes("section=overview") && url === "/admin");
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={close}
                            aria-current={active ? "page" : undefined}
                            className={`flex min-h-10 items-center gap-3 rounded-xl px-3 text-[13px] font-semibold transition-colors ${active ? "bg-[#493ee5] text-white shadow-[0_5px_15px_-7px_#493ee5]" : "text-[#464555] hover:bg-[#f5f2ff] hover:text-[#493ee5] dark:text-muted-foreground dark:hover:bg-secondary"}`}
                        >
                            <Icon className="size-[18px] shrink-0" strokeWidth={1.9} />
                            <span className="truncate">{t(item.label)}</span>
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
                        <Link
                            href="/umpan-balik"
                            onClick={close}
                            className="mt-1 flex min-h-8 items-center justify-center gap-2 rounded-lg px-3 text-[11px] font-bold text-[#006c4a] hover:bg-white/70"
                        >
                            <MessageSquarePlus className="size-3.5" /> {t("Kirim umpan balik")}
                        </Link>
                    </div>
                )}
                <Link
                    href="/settings/profile"
                    onClick={close}
                    aria-label={t("Profil")}
                    className="flex min-h-9 items-center gap-2 rounded-xl px-2 text-xs font-semibold text-[#464555] hover:bg-[#f5f2ff]"
                >
                    <span className="flex size-7 items-center justify-center rounded-full bg-[#efedff] font-bold text-[#493ee5]">
                        {name.charAt(0).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1 leading-tight">
                        <span className="block truncate">{name}</span>
                        <span className="block truncate text-[10px] text-muted-foreground">{t("Profil")}</span>
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
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-card focus:px-4 focus:py-3 focus:font-semibold focus:shadow-lg"
            >
                {t("Lewati ke konten utama")}
            </a>
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
                                className="min-h-10 min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-[#777587] focus-visible:ring-2 focus-visible:ring-[#493ee5] sm:text-sm"
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
                    tabIndex={-1}
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
