import { t } from '@/lib/ui-language';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpen,
    Check,
    ChevronRight,
    CirclePlay,
    Layers3,
    PenLine,
} from 'lucide-react';
import { moduleUrl, type LearningPath } from '@/types/learning';

export default function Path({
    path,
    progress,
}: {
    path: LearningPath;
    progress: Record<number, string>;
}) {
    const units = path.units ?? [];
    const lessons = units.flatMap((unit) => unit.lessons ?? []);
    const completed = lessons.filter(
        (lesson) => progress[lesson.id] === 'completed',
    ).length;
    const aksara = path.slug.includes('aksara');
    const nextUnit = units.find((unit) =>
        unit.lessons?.some((lesson) => progress[lesson.id] !== 'completed'),
    );
    const nextLesson = nextUnit?.lessons?.find(
        (lesson) => progress[lesson.id] !== 'completed',
    );

    return (
        <div className="page-wrap py-7 md:py-9">
            <Head title={t(path.title)} />
            <div className="mb-5 text-xs font-semibold text-muted-foreground">
                <Link href="/dashboard" className="hover:text-link">
                    {t('Beranda')}
                </Link>{' '}
                <ChevronRight className="mx-1 inline size-3" />{' '}
                {t('Kelas Belajar')}{' '}
                <ChevronRight className="mx-1 inline size-3" />{' '}
                <span className="text-foreground">{path.title}</span>
            </div>

            <section className="relative overflow-hidden rounded-[28px] bg-[#eeeaff] text-[#1b1b24]">
                <div
                    className="absolute inset-y-0 right-0 hidden w-[46%] [mask-image:linear-gradient(to_right,transparent,black)] bg-cover bg-center opacity-90 md:block"
                    style={{
                        backgroundImage: `url('${aksara ? '/stitch/aksara-scroll.jpg' : '/stitch/classroom.jpg'}')`,
                    }}
                />
                <div className="relative z-10 max-w-[690px] p-7 md:p-10">
                    <p className="stitch-kicker">
                        {t('KELAS BELAJAR ·')} {t(aksara ? 'AKSARA' : 'BAHASA')}
                    </p>
                    <h1 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
                        {path.title}
                    </h1>
                    <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
                        {path.description}
                    </p>
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-white px-3 py-2 text-xs font-bold text-[#493ee5]">
                            {units.length} {t('modul')}
                        </span>
                        <span className="rounded-full bg-white px-3 py-2 text-xs font-bold text-[#493ee5]">
                            {lessons.length} {t('materi')}
                        </span>
                        {nextUnit && nextLesson && (
                            <Link
                                href={moduleUrl(nextUnit, nextLesson.id)}
                                className="btn-primary gap-2"
                            >
                                {t(
                                    progress[nextLesson.id]
                                        ? 'Lanjutkan'
                                        : 'Mulai belajar',
                                )}{' '}
                                <ArrowRight className="size-4" />
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            <aside
                className="mt-5 grid gap-4 md:grid-cols-2"
                aria-label={t('Ringkasan kelas')}
            >
                <div className="stitch-card p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="stitch-kicker">
                                {t('PROGRES KELAS')}
                            </p>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {completed} {t('dari')} {lessons.length}{' '}
                                {t('materi selesai')}
                            </p>
                        </div>
                        <p className="text-3xl font-extrabold">
                            {Math.round(
                                lessons.length
                                    ? (completed / lessons.length) * 100
                                    : 0,
                            )}
                            %
                        </p>
                    </div>
                    <div
                        className="stitch-progress mt-4"
                        role="progressbar"
                        aria-label={`${t('Progres kelas')} ${path.title}`}
                        aria-valuenow={completed}
                        aria-valuemin={0}
                        aria-valuemax={lessons.length || 1}
                    >
                        <span
                            style={{
                                width: `${lessons.length ? (completed / lessons.length) * 100 : 0}%`,
                            }}
                        />
                    </div>
                    <Link
                        href="/progres"
                        className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-link"
                    >
                        {t('Lihat semua progres')}{' '}
                        <ArrowRight className="size-4" />
                    </Link>
                </div>
                <div className="stitch-card p-5">
                    <div className="flex items-start gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#ecfdf5] text-[#006c4a]">
                            <CirclePlay className="size-5" />
                        </span>
                        <div>
                            <h3 className="text-sm font-extrabold">
                                {t('Belajar lewat latihan')}
                            </h3>
                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                {t(
                                    'Setiap pelajaran dapat memuat latihan untuk mencoba materi yang baru dibaca.',
                                )}
                            </p>
                        </div>
                    </div>
                    {aksara && (
                        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t pt-3">
                            <Link
                                href="/latihan-aksara"
                                className="inline-flex items-center gap-2 text-xs font-bold text-link"
                            >
                                {t('Ruang latihan aksara')}{' '}
                                <ArrowRight className="size-4" />
                            </Link>
                            <Link
                                href="/aksara-sunda/kumpulan"
                                className="inline-flex items-center gap-2 text-xs font-bold text-link"
                            >
                                {t('Lihat semua Aksara Sunda')}{' '}
                                <ArrowRight className="size-4" />
                            </Link>
                        </div>
                    )}
                </div>
            </aside>

            <section className="mt-8" aria-labelledby="modules-title">
                <div className="mb-5">
                    <p className="stitch-kicker">{t('KURIKULUM')}</p>
                    <h2
                        id="modules-title"
                        className="mt-1 text-xl font-extrabold"
                    >
                        {t('Pilih modul belajar')}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {t(
                            'Buka satu modul untuk melihat semua materi di dalamnya tanpa tercampur dengan modul lain.',
                        )}
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {units.map((unit, index) => {
                        const unitLessons = unit.lessons ?? [];
                        const unitCompleted = unitLessons.filter(
                            (lesson) => progress[lesson.id] === 'completed',
                        ).length;
                        const percentage = unitLessons.length
                            ? Math.round(
                                  (unitCompleted / unitLessons.length) * 100,
                              )
                            : 0;

                        return (
                            <article
                                key={unit.id}
                                className="stitch-card flex min-h-[230px] flex-col overflow-hidden p-5 transition-shadow hover:shadow-md"
                            >
                                <div className="flex items-start gap-3">
                                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#efedff] text-[#493ee5]">
                                        {aksara ? (
                                            <PenLine className="size-5" />
                                        ) : (
                                            <BookOpen className="size-5" />
                                        )}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] font-extrabold tracking-wide text-[#493ee5] uppercase">
                                            {t('MODUL')}{' '}
                                            {String(index + 1).padStart(2, '0')}
                                        </p>
                                        <h3 className="mt-1 line-clamp-2 text-base font-extrabold">
                                            {unit.title}
                                        </h3>
                                    </div>
                                    <Layers3
                                        className="size-4 shrink-0 text-muted-foreground"
                                        aria-hidden="true"
                                    />
                                </div>
                                {unit.description && (
                                    <p className="mt-4 line-clamp-2 min-h-10 text-xs leading-5 text-muted-foreground">
                                        {unit.description}
                                    </p>
                                )}
                                <div className="mt-4 flex items-center justify-between gap-3 text-xs">
                                    <span className="text-muted-foreground">
                                        {unitLessons.length} {t('materi')} ·{' '}
                                        {unitCompleted} {t('selesai')}
                                    </span>
                                    <span className="font-bold">
                                        {percentage}%
                                    </span>
                                </div>
                                <div
                                    className="stitch-progress mt-2"
                                    role="progressbar"
                                    aria-label={`${t('Progres modul')} ${unit.title}`}
                                    aria-valuenow={unitCompleted}
                                    aria-valuemin={0}
                                    aria-valuemax={unitLessons.length || 1}
                                >
                                    <span style={{ width: `${percentage}%` }} />
                                </div>
                                <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                        {unitCompleted === unitLessons.length &&
                                            unitLessons.length > 0 && (
                                                <Check className="size-3.5 text-[#167348]" />
                                            )}
                                        {unitLessons.length
                                            ? `${unitCompleted} ${t('dari')} ${unitLessons.length} ${t('materi selesai')}`
                                            : t('Materi sedang disiapkan')}
                                    </span>
                                    {unitLessons.length ? (
                                        <Link
                                            href={moduleUrl(unit)}
                                            className="btn-primary h-10 shrink-0 gap-2 px-4 text-xs"
                                        >
                                            {t('Buka modul')}{' '}
                                            <ArrowRight className="size-4" />
                                        </Link>
                                    ) : (
                                        <span className="rounded-lg border px-3 py-2 text-xs text-muted-foreground">
                                            {t('Segera hadir')}
                                        </span>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                    {!units.length && (
                        <div className="stitch-card p-7 md:col-span-2 xl:col-span-3">
                            <h3 className="font-bold">
                                {t('Materi sedang disiapkan')}
                            </h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {t(
                                    'Unit akan muncul setelah diterbitkan oleh admin.',
                                )}
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
