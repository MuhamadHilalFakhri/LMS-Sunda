import { t } from '@/lib/ui-language';
import { Link, router } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2 } from 'lucide-react';
import { moduleUrl } from '@/types/learning';
import type {
    ModuleLesson,
    ModuleUnit,
    WorkspaceLesson,
} from '@/pages/learning/module-navigation';

type Props = {
    classUrl: string;
    lesson: WorkspaceLesson;
    unit: ModuleUnit;
    previousLesson: ModuleLesson | null;
    nextLesson: ModuleLesson | null;
    progress: Record<number, string>;
    processing: boolean;
    setProcessing: (processing: boolean) => void;
};

export function ModuleLessonActions({
    classUrl,
    lesson,
    unit,
    previousLesson,
    nextLesson,
    progress,
    processing,
    setProcessing,
}: Props) {
    return (
        <>
            {lesson.exercises?.length ? (
                <section className="pt-2">
                    <div className="mb-4 flex items-center gap-2">
                        <BookOpen className="size-5 text-link" />
                        <h2 className="text-xl font-semibold">
                            {t('Latihan & kuis')}
                        </h2>
                    </div>
                    <p className="mb-5 text-sm leading-6 text-muted-foreground">
                        {t(
                            'Latihan membantu mengulang materi; kuis digunakan untuk evaluasi dan nilai kelulusan.',
                        )}
                    </p>
                    <div className="space-y-3">
                        {lesson.exercises.map((exercise) => (
                            <Link
                                key={exercise.id}
                                href={
                                    `/` +
                                    (exercise.kind === 'quiz'
                                        ? 'kuis'
                                        : 'latihan') +
                                    `/` +
                                    exercise.id
                                }
                                className="stitch-card flex min-h-16 items-center justify-between gap-3 px-5 font-semibold hover:border-[#aaa4ff]"
                            >
                                <span className="flex min-w-0 items-center gap-3">
                                    <span className="truncate">
                                        {exercise.title}
                                    </span>
                                    <span className="shrink-0 rounded-full bg-[#efedff] px-2.5 py-1 text-[10px] font-bold text-[#493ee5]">
                                        {t(
                                            exercise.kind === 'quiz'
                                                ? 'Kuis'
                                                : 'Latihan',
                                        )}
                                    </span>
                                </span>
                                <ArrowRight className="size-4 text-link" />
                            </Link>
                        ))}
                    </div>
                </section>
            ) : null}

            <nav
                className="grid gap-3 border-t pt-5 sm:grid-cols-2"
                aria-label={t('Navigasi antar pelajaran')}
            >
                {previousLesson ? (
                    <Link
                        href={moduleUrl(unit.id, previousLesson.id)}
                        className="stitch-card flex min-h-16 items-center gap-3 p-4 hover:border-[#aaa4ff]"
                    >
                        <ArrowLeft className="size-4 shrink-0 text-link" />
                        <span className="min-w-0">
                            <span className="block text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
                                {t('Sebelumnya')}
                            </span>
                            <span className="block truncate text-sm font-bold">
                                {previousLesson.title}
                            </span>
                        </span>
                    </Link>
                ) : (
                    <span />
                )}
                {nextLesson && (
                    <Link
                        href={moduleUrl(unit.id, nextLesson.id)}
                        className="stitch-card flex min-h-16 items-center justify-end gap-3 p-4 text-right hover:border-[#aaa4ff]"
                    >
                        <span className="min-w-0">
                            <span className="block text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
                                {t('Berikutnya')}
                            </span>
                            <span className="block truncate text-sm font-bold">
                                {nextLesson.title}
                            </span>
                        </span>
                        <ArrowRight className="size-4 shrink-0 text-link" />
                    </Link>
                )}
            </nav>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-5">
                <Link href={classUrl} className="btn-secondary">
                    {t('Kembali ke daftar modul')}
                </Link>
                <button
                    type="button"
                    disabled={processing || progress[lesson.id] === 'completed'}
                    className="btn-primary gap-2"
                    onClick={() => {
                        setProcessing(true);
                        router.post(
                            '/pelajaran/' + lesson.id + '/selesai',
                            {},
                            {
                                onFinish: () => setProcessing(false),
                            },
                        );
                    }}
                >
                    <CheckCircle2 className="size-4" />
                    {t(
                        processing
                            ? 'Menyimpan...'
                            : progress[lesson.id] === 'completed'
                              ? 'Materi selesai'
                              : 'Tandai selesai',
                    )}
                </button>
            </div>
        </>
    );
}
