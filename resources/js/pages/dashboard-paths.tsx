import { t } from '@/lib/ui-language';
import { Link } from '@inertiajs/react';
import { BookOpen, ChevronRight, PenLine } from '@/components/meya-icons';
import type { Dispatch, SetStateAction } from 'react';
import { pathUrl, type LearningPath } from '@/types/learning';

type Props = {
    paths: LearningPath[];
    progress: Record<number, string>;
    visiblePaths: LearningPath[];
    pathPage: number;
    pathsPerPage: number;
    pageCount: number;
    setPathPage: Dispatch<SetStateAction<number>>;
};

export function DashboardPaths({
    paths,
    progress,
    visiblePaths,
    pathPage,
    pathsPerPage,
    pageCount,
    setPathPage,
}: Props) {
    return (
        <section id="kelas-belajar" className="mt-8">
            <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                    <p className="stitch-kicker">{t('KURIKULUM BELAJAR')}</p>
                    <h2 className="mt-1 text-xl font-extrabold tracking-tight">
                        {t('Pilih kelas belajarmu')}
                    </h2>
                </div>
                <span className="text-xs text-muted-foreground">
                    {t('Bahasa & aksara terpisah')}
                </span>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
                {visiblePaths.map((path) => {
                    const lessons =
                        path.units?.flatMap((unit) => unit.lessons ?? []) ?? [];
                    const done = lessons.filter(
                        (lesson) => progress[lesson.id] === 'completed',
                    ).length;
                    const aksara = path.slug.includes('aksara');
                    return (
                        <article
                            key={path.id}
                            className="stitch-card overflow-hidden"
                        >
                            <div className="relative h-32 overflow-hidden bg-[#e8e2ff]">
                                <img
                                    src={
                                        aksara
                                            ? '/stitch/aksara-scroll.jpg'
                                            : '/stitch/classroom.jpg'
                                    }
                                    alt=""
                                    className="h-full w-full object-cover"
                                />
                                <span className="absolute top-4 left-4 rounded-full bg-white/95 px-3 py-1 text-[11px] font-extrabold text-[#493ee5]">
                                    {t(
                                        aksara
                                            ? 'AKSARA SUNDA'
                                            : 'BAHASA SUNDA',
                                    )}
                                </span>
                            </div>
                            <div className="p-5">
                                <div className="flex items-start gap-3">
                                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#efedff] text-[#493ee5]">
                                        {aksara ? (
                                            <PenLine className="size-5" />
                                        ) : (
                                            <BookOpen className="size-5" />
                                        )}
                                    </span>
                                    <div>
                                        <h3 className="text-base font-extrabold">
                                            {t(path.title)}
                                        </h3>
                                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                            {path.description}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-5 flex justify-between text-xs">
                                    <span className="text-muted-foreground">
                                        {done} {t('dari')} {lessons.length}{' '}
                                        {t('pelajaran')}
                                    </span>
                                    <strong>
                                        {Math.round(
                                            lessons.length
                                                ? (done / lessons.length) * 100
                                                : 0,
                                        )}
                                        %
                                    </strong>
                                </div>
                                <div className="stitch-progress mt-2">
                                    <span
                                        style={{
                                            width: `${lessons.length ? (done / lessons.length) * 100 : 0}%`,
                                        }}
                                    />
                                </div>
                                <Link
                                    href={pathUrl(path)}
                                    className="mt-5 flex items-center justify-between border-t pt-4 text-sm font-bold text-link"
                                >
                                    {t('Buka kelas')}{' '}
                                    <ChevronRight className="size-4" />
                                </Link>
                            </div>
                        </article>
                    );
                })}
                {paths.length === 0 && (
                    <div className="stitch-card p-6 text-sm text-muted-foreground">
                        {t('Kelas belajar belum tersedia.')}
                    </div>
                )}
            </div>
            {pageCount > 1 && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card px-4 py-3">
                    <span className="text-xs text-muted-foreground">
                        {t('Menampilkan')} {(pathPage - 1) * pathsPerPage + 1}–
                        {Math.min(pathPage * pathsPerPage, paths.length)}{' '}
                        {t('dari')} {paths.length} {t('kelas')}
                    </span>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            disabled={pathPage <= 1}
                            onClick={() =>
                                setPathPage((page) => Math.max(1, page - 1))
                            }
                            className="btn-secondary min-h-9 px-3 text-xs disabled:opacity-40"
                        >
                            {t('Sebelumnya')}
                        </button>
                        <button
                            type="button"
                            disabled={pathPage >= pageCount}
                            onClick={() =>
                                setPathPage((page) =>
                                    Math.min(pageCount, page + 1),
                                )
                            }
                            className="btn-secondary min-h-9 px-3 text-xs disabled:opacity-40"
                        >
                            {t('Berikutnya')}
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}
