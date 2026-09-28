import { t } from '@/lib/ui-language';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpen,
    CheckCircle2,
    Play,
    RotateCcw,
    Gauge,
} from '@/components/meya-icons';
import { useState } from 'react';
import type { Auth } from '@/types';
import { lessonUrl, type LearningPath } from '@/types/learning';
import DashboardSidebar from '@/pages/dashboard-sidebar';
import { DashboardPaths } from '@/pages/dashboard-paths';

export default function Dashboard({
    paths,
    progress,
    recentLesson,
    learningGoal,
    reviewDueCount,
}: {
    paths: LearningPath[];
    progress: Record<number, string>;
    recentLesson: number | null;
    learningGoal: { target: number; completedToday: number; streak: number };
    reviewDueCount: number;
}) {
    const [savingGoal, setSavingGoal] = useState(false);
    const [pathPage, setPathPage] = useState(1);
    const { auth } = usePage<{ auth: Auth }>().props;
    const allLessons = paths.flatMap(
        (path) => path.units?.flatMap((unit) => unit.lessons ?? []) ?? [],
    );
    const completed = allLessons.filter(
        (lesson) => progress[lesson.id] === 'completed',
    ).length;
    const featured =
        allLessons.find((lesson) => lesson.id === recentLesson) ??
        allLessons.find((lesson) => progress[lesson.id] !== 'completed') ??
        allLessons[0];
    const firstName = auth.user.name.split(' ')[0];
    const pathsPerPage = 4;
    const pageCount = Math.max(1, Math.ceil(paths.length / pathsPerPage));
    const visiblePaths = paths.slice(
        (pathPage - 1) * pathsPerPage,
        pathPage * pathsPerPage,
    );
    const featuredInProgressId =
        featured && progress[featured.id] === 'in_progress'
            ? featured.id
            : null;
    const nextLessonsByPath = paths.map((path) =>
        (path.units ?? []).flatMap((unit) =>
            (unit.lessons ?? [])
                .filter(
                    (lesson) =>
                        progress[lesson.id] !== 'completed' &&
                        lesson.id !== featuredInProgressId,
                )
                .map((lesson) => ({ lesson, path, unit })),
        ),
    );
    const nextLessons = nextLessonsByPath
        .flatMap((lessons) => lessons.slice(0, 2))
        .slice(0, 4);
    return (
        <div className="page-wrap py-7 md:py-9">
            <Head title={t('Dasbor belajar')} />
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <div>
                    <p className="stitch-kicker">{t('RUANG BELAJAR')}</p>
                    <h1 className="mt-1 text-2xl font-extrabold tracking-tight md:text-[30px]">
                        {t('Wilujeng sumping,')} {firstName}!
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {t(
                            'Lanjutkan langkah belajar Bahasa dan Aksara Sunda hari ini.',
                        )}
                    </p>
                </div>
                <Link
                    href="/progres"
                    className="text-sm font-bold text-link hover:underline"
                >
                    {t('Lihat progres saya')}{' '}
                    <ArrowRight className="ml-1 inline size-4" />
                </Link>
            </div>
            <section className="relative min-h-[265px] overflow-hidden rounded-[28px] bg-gradient-to-r from-[#493ee5] via-[#6556ec] to-[#9b86f3] text-white">
                <div
                    className="absolute inset-y-0 right-0 w-[45%] [mask-image:linear-gradient(to_right,transparent,black)] bg-cover bg-center opacity-80"
                    style={{
                        backgroundImage: "url('/stitch/hero-student.jpg')",
                    }}
                />
                <div className="relative z-10 max-w-[660px] p-7 md:p-9">
                    <span className="rounded-full bg-white/20 px-3 py-1.5 text-[11px] font-extrabold tracking-wide">
                        {t('BELAJAR SESUAI LANGKAHMU')}
                    </span>
                    <h2 className="mt-5 text-2xl leading-tight font-extrabold md:text-[33px]">
                        {t(
                            featured
                                ? 'Sedikit demi sedikit, makin mahir berbahasa Sunda.'
                                : 'Mulai perjalanan belajarmu hari ini.',
                        )}
                    </h2>
                    <p className="mt-3 max-w-lg text-sm leading-6 text-white/90">
                        {featured
                            ? `${t('Lanjutkan')} “${featured.title}” ${t('dan temukan hal baru di setiap pelajaran.')}`
                            : t(
                                  'Pilih kelas Bahasa Sunda atau Aksara Sunda untuk membuka pelajaran pertama.',
                              )}
                    </p>
                    <Link
                        href={featured ? lessonUrl(featured) : '#kelas-belajar'}
                        className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-extrabold text-[#493ee5] hover:bg-[#f5f2ff]"
                    >
                        <Play className="size-4 fill-current" />
                        {t(
                            featured
                                ? 'Lanjutkan belajar'
                                : 'Lihat kelas belajar',
                        )}
                    </Link>
                </div>
            </section>
            <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_290px]">
                <div className="min-w-0">
                    <section className="grid gap-3 sm:grid-cols-3">
                        <div className="stitch-card p-5">
                            <span className="flex size-10 items-center justify-center rounded-xl bg-[#efedff] text-[#493ee5]">
                                <BookOpen className="size-5" />
                            </span>
                            <p className="mt-4 text-2xl font-extrabold">
                                {paths.length}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {t('Kelas belajar')}
                            </p>
                        </div>
                        <div className="stitch-card p-5">
                            <span className="flex size-10 items-center justify-center rounded-xl bg-[#ecfdf5] text-[#006c4a]">
                                <CheckCircle2 className="size-5" />
                            </span>
                            <p className="mt-4 text-2xl font-extrabold">
                                {completed}
                                <span className="text-base font-medium text-muted-foreground">
                                    {' '}
                                    / {allLessons.length}
                                </span>
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {t('Pelajaran selesai')}
                            </p>
                        </div>
                        <div className="stitch-card p-5">
                            <span className="flex size-10 items-center justify-center rounded-xl bg-[#fff3d8] text-[#a34b05]">
                                <Gauge className="size-5" />
                            </span>
                            <p className="mt-4 text-2xl font-extrabold">
                                {Math.round(
                                    allLessons.length
                                        ? (completed / allLessons.length) * 100
                                        : 0,
                                )}
                                %
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {t('Progres keseluruhan')}
                            </p>
                        </div>
                    </section>
                    <Link
                        href="/ulangan"
                        className="stitch-card mt-4 flex flex-wrap items-center justify-between gap-4 p-4 transition-colors hover:border-[#aaa4ff] hover:bg-[#fcfbff]"
                    >
                        <span className="flex items-center gap-3">
                            <span className="flex size-10 items-center justify-center rounded-xl bg-[#efedff] text-[#493ee5]">
                                <RotateCcw className="size-5" />
                            </span>
                            <span>
                                <strong className="block text-sm">
                                    {t('Ulangan terjadwal')}
                                </strong>
                                <small className="mt-1 block text-xs text-muted-foreground">
                                    {t(
                                        'Ulangi kosakata dan aksara agar lebih mudah diingat.',
                                    )}
                                </small>
                            </span>
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#efedff] px-3 py-2 text-xs font-bold text-[#493ee5]">
                            {reviewDueCount} {t('perlu diulang')}{' '}
                            <ArrowRight className="size-3.5" />
                        </span>
                    </Link>
                    <DashboardPaths
                        paths={paths}
                        progress={progress}
                        visiblePaths={visiblePaths}
                        pathPage={pathPage}
                        pathsPerPage={pathsPerPage}
                        pageCount={pageCount}
                        setPathPage={setPathPage}
                    />
                    <section className="mt-8">
                        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                            <div>
                                <p className="stitch-kicker">
                                    {t('LANGKAH BERIKUTNYA')}
                                </p>
                                <h2 className="mt-1 text-xl font-extrabold tracking-tight">
                                    {t('Pelajaran berikutnya')}
                                </h2>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {t(
                                    'Buka pelajaran yang belum selesai dari kelasmu.',
                                )}
                            </p>
                        </div>
                        {nextLessons.length > 0 ? (
                            <div className="grid gap-3 md:grid-cols-2">
                                {nextLessons.map(
                                    ({ lesson, path, unit }, index) => (
                                        <Link
                                            key={lesson.id}
                                            href={lessonUrl(lesson)}
                                            className="stitch-card group flex min-h-[132px] flex-col justify-between p-4 transition-colors hover:border-[#aaa4ff] hover:bg-[#fcfbff]"
                                        >
                                            <div className="flex items-start gap-3">
                                                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#efedff] text-xs font-extrabold text-[#493ee5]">
                                                    {String(index + 1).padStart(
                                                        2,
                                                        '0',
                                                    )}
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="truncate text-[10px] font-extrabold tracking-wide text-[#493ee5]">
                                                        {t(path.title)}
                                                    </p>
                                                    <h3 className="mt-1 line-clamp-2 text-sm leading-5 font-extrabold">
                                                        {lesson.title}
                                                    </h3>
                                                    <p className="mt-1 truncate text-xs text-muted-foreground">
                                                        {unit.title}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="mt-3 flex items-center justify-between border-t pt-2.5 text-xs font-bold text-link">
                                                {t(
                                                    progress[lesson.id] ===
                                                        'in_progress'
                                                        ? 'Lanjutkan'
                                                        : 'Mulai belajar',
                                                )}
                                                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                                            </span>
                                        </Link>
                                    ),
                                )}
                            </div>
                        ) : (
                            <div className="stitch-card flex flex-wrap items-center justify-between gap-3 p-4">
                                <p className="text-sm text-muted-foreground">
                                    {t(
                                        'Semua pelajaran di kelas yang tersedia sudah selesai.',
                                    )}
                                </p>
                                <Link
                                    href="/progres"
                                    className="inline-flex items-center gap-2 text-sm font-bold text-link"
                                >
                                    {t('Lihat progres saya')}{' '}
                                    <ArrowRight className="size-4" />
                                </Link>
                            </div>
                        )}
                    </section>
                </div>
                <DashboardSidebar
                    learningGoal={learningGoal}
                    savingGoal={savingGoal}
                    setSavingGoal={setSavingGoal}
                    featured={featured}
                />
            </div>
        </div>
    );
}
