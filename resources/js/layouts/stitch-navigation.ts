import {
    AudioLines,
    Bookmark,
    Bot,
    BookOpen,
    ChartNoAxesCombined,
    CaseSensitive,
    CircleHelp,
    ClipboardList,
    ClipboardCheck,
    GraduationCap,
    LibraryBig,
    LayoutDashboard,
    MessageSquareText,
    MessageSquareWarning,
    PenLine,
    RotateCcw,
    Tags,
    Users,
    Workflow,
    type LucideIcon,
} from 'lucide-react';

export type NavigationLink = { label: string; href: string; icon: LucideIcon };
export type NavigationGroup = {
    label: string;
    icon: LucideIcon;
    children: NavigationLink[];
};
export type AdminNavigationItem = NavigationLink | NavigationGroup;

export const learnerLinks: AdminNavigationItem[] = [
    { label: 'Beranda', href: '/dashboard', icon: LayoutDashboard },
    {
        label: 'Materi belajar',
        icon: LibraryBig,
        children: [
            {
                label: 'Bahasa Sunda',
                href: '/belajar/bahasa-sunda',
                icon: BookOpen,
            },
            {
                label: 'Aksara Sunda',
                href: '/belajar/aksara-sunda',
                icon: PenLine,
            },
            {
                label: 'Kumpulan Aksara',
                href: '/aksara-sunda/kumpulan',
                icon: CaseSensitive,
            },
        ],
    },
    {
        label: 'Latihan & evaluasi',
        icon: ClipboardList,
        children: [
            { label: 'Latihan Aksara', href: '/latihan-aksara', icon: PenLine },
            { label: 'Kuis', href: '/kuis', icon: ClipboardCheck },
        ],
    },
    { label: 'Tutor AI', href: '/tutor', icon: MessageSquareText },
    {
        label: 'Perkembangan',
        icon: GraduationCap,
        children: [
            { label: 'Progres Belajar', href: '/progres', icon: GraduationCap },
            { label: 'Ulasan jawaban', href: '/ulasan', icon: CircleHelp },
            { label: 'Ulangan terjadwal', href: '/ulangan', icon: RotateCcw },
            {
                label: 'Materi tersimpan',
                href: '/materi-tersimpan',
                icon: Bookmark,
            },
        ],
    },
];

export const adminLinks: AdminNavigationItem[] = [
    {
        label: 'Ringkasan',
        href: '/admin?section=overview',
        icon: LayoutDashboard,
    },
    {
        label: 'Materi belajar',
        icon: LibraryBig,
        children: [
            {
                label: 'Kelas & Pelajaran',
                href: '/admin?section=paths',
                icon: BookOpen,
            },
            {
                label: 'Kosakata & Konteks',
                href: '/admin?section=vocabulary',
                icon: Tags,
            },
            {
                label: 'Kumpulan Aksara Sunda',
                href: '/admin?section=characters',
                icon: CaseSensitive,
            },
        ],
    },
    {
        label: 'Latihan & Soal',
        href: '/admin?section=exercises',
        icon: ClipboardList,
    },
    { label: 'Audio & Media', href: '/admin?section=media', icon: AudioLines },
    {
        label: 'Pengguna & Akun',
        href: '/admin?section=learners',
        icon: Users,
    },
    {
        label: 'Operasional',
        icon: Workflow,
        children: [
            {
                label: 'Laporan & Analitik',
                href: '/admin?section=analytics',
                icon: ChartNoAxesCombined,
            },
            {
                label: 'Pengaturan Tutor AI',
                href: '/admin?section=tutor',
                icon: Bot,
            },
            {
                label: 'Umpan Balik',
                href: '/admin?section=feedback',
                icon: MessageSquareWarning,
            },
        ],
    },
];

export function isCurrent(href: string, url: string): boolean {
    const currentPath = url.split('?')[0];
    const target = href.split('?')[0];
    if (target !== currentPath) return false;
    if (!href.includes('?')) return true;
    const current = new URLSearchParams(url.split('?')[1] ?? '');
    const wanted = new URLSearchParams(href.split('?')[1]);
    return [...wanted].every(([key, value]) => current.get(key) === value);
}
