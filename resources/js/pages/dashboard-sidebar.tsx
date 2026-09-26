import { t } from '@/lib/ui-language';
import { Link, router } from '@inertiajs/react';
import {
    ArrowRight,
    Bookmark,
    CaseSensitive,
    CheckCircle2,
    CircleHelp,
    Flame,
    MessageSquareText,
    PenLine,
    Target,
} from 'lucide-react';
import type { Lesson } from '@/types/learning';
import { lessonUrl } from '@/types/learning';

type LearningGoal = { target: number; completedToday: number; streak: number };

export default function DashboardSidebar({
    learningGoal,
    savingGoal,
    setSavingGoal,
    featured,
}: {
    learningGoal: LearningGoal;
    savingGoal: boolean;
    setSavingGoal: (saving: boolean) => void;
    featured?: Lesson;
}) {
    return (
        <aside className="space-y-4">
            <div className="stitch-card p-5">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="stitch-kicker">{t('TARGET HARIAN')}</p>
                        <h3 className="mt-2 text-base font-extrabold">
                            {t('Jaga kebiasaan belajar')}
                        </h3>
                    </div>
                    <span className="flex size-10 items-center justify-center rounded-xl bg-[#fff3d8] text-[#a34b05]">
                        <Target className="size-5" />
                    </span>
                </div>
                <div className="mt-4 flex items-end justify-between gap-3">
                    <p className="text-sm">
                        <strong>{learningGoal.completedToday}</strong> /{' '}
                        {learningGoal.target} {t('aktivitas hari ini')}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#a34b05]">
                        <Flame className="size-4" /> {learningGoal.streak}{' '}
                        {t('hari')}
                    </span>
                </div>
                <div className="stitch-progress mt-3">
                    <span
                        style={{
                            width: `${Math.min(100, (learningGoal.completedToday / learningGoal.target) * 100)}%`,
                        }}
                    />
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                    {t('Pilih target aktivitas per hari')}
                </p>
                <div className="mt-2 grid grid-cols-4 gap-2">
                    {[1, 2, 3, 5].map((goal) => (
                        <button
                            key={goal}
                            type="button"
                            disabled={savingGoal}
                            aria-pressed={learningGoal.target === goal}
                            onClick={() => {
                                setSavingGoal(true);
                                router.patch(
                                    '/target-belajar',
                                    { daily_goal: goal },
                                    {
                                        preserveScroll: true,
                                        onFinish: () => setSavingGoal(false),
                                    },
                                );
                            }}
                            className={`min-h-9 rounded-lg border text-xs font-bold ${learningGoal.target === goal ? 'border-[#493ee5] bg-[#efedff] text-[#493ee5]' : 'bg-card text-muted-foreground hover:border-[#aaa4ff]'}`}
                        >
                            {goal}
                        </button>
                    ))}
                </div>
            </div>
            <div className="stitch-card p-5">
                <p className="stitch-kicker">{t('PELAJARAN TERAKHIR')}</p>
                {featured ? (
                    <>
                        <h3 className="mt-2 text-base font-extrabold">
                            {featured.title}
                        </h3>
                        <p className="mt-2 text-xs leading-5 text-muted-foreground">
                            {featured.summary}
                        </p>
                        <Link
                            href={lessonUrl(featured)}
                            className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-link"
                        >
                            {t('Buka pelajaran')}{' '}
                            <ArrowRight className="size-4" />
                        </Link>
                    </>
                ) : (
                    <p className="mt-2 text-sm text-muted-foreground">
                        {t('Belum ada pelajaran yang dibuka.')}
                    </p>
                )}
            </div>
            <div className="rounded-[22px] bg-[#e8fbf2] p-5 text-[#064e3b]">
                <span className="flex size-10 items-center justify-center rounded-xl bg-white">
                    <MessageSquareText className="size-5" />
                </span>
                <h3 className="mt-4 text-base font-extrabold">
                    {t('Butuh teman belajar?')}
                </h3>
                <p className="mt-2 text-xs leading-5">
                    {t(
                        'Tanyakan materi atau latih percakapan bersama Tutor AI.',
                    )}
                </p>
                <Link
                    href="/tutor"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold"
                >
                    {t('Buka Tutor AI')} <ArrowRight className="size-4" />
                </Link>
            </div>
            <Link
                href="/latihan-aksara"
                className="stitch-card flex items-center justify-between gap-3 p-5"
            >
                <div>
                    <p className="stitch-kicker">{t('LATIHAN KHUSUS')}</p>
                    <h3 className="mt-1 text-sm font-extrabold">
                        {t('Ruang Aksara Sunda')}
                    </h3>
                </div>
                <PenLine className="size-5 text-[#493ee5]" />
            </Link>
            <div className="stitch-card p-5">
                <p className="stitch-kicker">{t('AKSES CEPAT')}</p>
                <div className="mt-3 divide-y">
                    <Link
                        href="/kuis"
                        className="flex min-h-12 items-center gap-3 text-sm font-semibold hover:text-link"
                    >
                        <CircleHelp className="size-4 text-link" />{' '}
                        {t('Kuis & evaluasi')}{' '}
                        <ArrowRight className="ml-auto size-4" />
                    </Link>
                    <Link
                        href="/ulasan"
                        className="flex min-h-12 items-center gap-3 text-sm font-semibold hover:text-link"
                    >
                        <CheckCircle2 className="size-4 text-link" />{' '}
                        {t('Ulasan jawaban')}{' '}
                        <ArrowRight className="ml-auto size-4" />
                    </Link>
                    <Link
                        href="/materi-tersimpan"
                        className="flex min-h-12 items-center gap-3 text-sm font-semibold hover:text-link"
                    >
                        <Bookmark className="size-4 text-link" />{' '}
                        {t('Materi tersimpan')}{' '}
                        <ArrowRight className="ml-auto size-4" />
                    </Link>
                    <Link
                        href="/aksara-sunda/kumpulan"
                        className="flex min-h-12 items-center gap-3 text-sm font-semibold hover:text-link"
                    >
                        <CaseSensitive className="size-4 text-link" />{' '}
                        {t('Kumpulan Aksara')}{' '}
                        <ArrowRight className="ml-auto size-4" />
                    </Link>
                </div>
            </div>
        </aside>
    );
}
