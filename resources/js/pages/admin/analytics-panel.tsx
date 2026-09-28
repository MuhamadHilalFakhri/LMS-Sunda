import { t } from '@/lib/ui-language';
import {
    Activity,
    Bot,
    BookOpen,
    ChartNoAxesCombined,
    CheckCircle2,
    Users,
} from '@/components/meya-icons';
import type { Analytics } from '@/pages/admin/types';
import { Empty } from '@/pages/admin/common-ui';

export function AnalyticsPanel({ analytics }: { analytics: Analytics }) {
    const metrics = [
        {
            label: 'Pelajar terdaftar',
            value: analytics.learners,
            icon: Users,
            note: 'Semua akun pelajar',
        },
        {
            label: 'Aktif 7 hari',
            value: analytics.activeLearners,
            icon: Activity,
            note: 'Membuka materi atau latihan',
        },
        {
            label: 'Pelajaran selesai · 30 hari',
            value: analytics.completedLessons,
            icon: CheckCircle2,
            note: 'Penyelesaian dalam 30 hari terakhir',
        },
        {
            label: 'Akurasi latihan · 30 hari',
            value: `${analytics.averageAccuracy}%`,
            icon: ChartNoAxesCombined,
            note: `${analytics.attempts} percobaan terkumpul`,
        },
    ];
    const maxCompletions = Math.max(
        1,
        ...analytics.pathCompletions.map((path) => Number(path.completions)),
    );

    return (
        <section className="mt-8 space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {metrics.map(({ label, value, icon: Icon, note }) => (
                    <article key={label} className="stitch-card p-5">
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-xs font-semibold text-muted-foreground">
                                {t(label)}
                            </span>
                            <span className="flex size-9 items-center justify-center rounded-xl bg-[#efedff] text-[#493ee5]">
                                <Icon className="size-4" />
                            </span>
                        </div>
                        <p className="mt-3 text-3xl font-extrabold tracking-tight">
                            {value}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {t(note)}
                        </p>
                    </article>
                ))}
            </div>
            <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
                <section className="stitch-card overflow-hidden">
                    <div className="border-b px-5 py-4">
                        <h2 className="font-bold">
                            {t('Penyelesaian per kelas')}
                        </h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {t(
                                'Jumlah pelajaran yang dituntaskan di setiap kelas dalam 30 hari terakhir.',
                            )}
                        </p>
                    </div>
                    {analytics.pathCompletions.length ? (
                        <div className="space-y-5 p-5">
                            {analytics.pathCompletions.map((path) => {
                                const count = Number(path.completions);
                                return (
                                    <div key={path.id}>
                                        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                                            <span className="truncate font-semibold">
                                                {path.title}
                                            </span>
                                            <span className="shrink-0 text-xs text-muted-foreground">
                                                {count} {t('selesai')}
                                            </span>
                                        </div>
                                        <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
                                            <div
                                                className="h-full rounded-full bg-[#493ee5] transition-[width]"
                                                style={{
                                                    width: `${Math.max(count ? 5 : 0, (count / maxCompletions) * 100)}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-5">
                            <Empty
                                icon={BookOpen}
                                title="Belum ada kelas"
                                detail="Kelas dan progres penyelesaian akan tampil setelah tersedia."
                            />
                        </div>
                    )}
                </section>
                <section className="stitch-card overflow-hidden">
                    <div className="border-b px-5 py-4">
                        <h2 className="font-bold">
                            {t('Latihan yang perlu ditinjau')}
                        </h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {t(
                                'Urutan berdasarkan akurasi terendah selama 30 hari terakhir. Aktivitas tampil setelah terkumpul minimal 5 percobaan.',
                            )}
                        </p>
                    </div>
                    {analytics.hardestExercises.length ? (
                        <div className="divide-y">
                            {analytics.hardestExercises.map((exercise) => (
                                <div
                                    key={exercise.id}
                                    className="flex items-center gap-3 px-5 py-4"
                                >
                                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#fff4e5] text-[#a34b05]">
                                        <ChartNoAxesCombined className="size-4" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold">
                                            {exercise.title}
                                        </p>
                                        <p className="truncate text-xs text-muted-foreground">
                                            {exercise.lesson_title} ·{' '}
                                            {exercise.attempts} {t('percobaan')}
                                        </p>
                                    </div>
                                    <span className="shrink-0 text-sm font-extrabold">
                                        {exercise.accuracy}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-5">
                            <Empty
                                icon={ChartNoAxesCombined}
                                title="Belum ada data yang cukup"
                                detail="Aktivitas latihan tampil setelah masing-masing menerima minimal 5 percobaan agar ringkasan lebih mewakili."
                            />
                        </div>
                    )}
                </section>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border bg-card px-5 py-4 text-sm">
                <Bot className="size-4 text-[#493ee5]" />
                <span className="font-semibold">
                    {t('Aktivitas Tutor AI 30 hari')}: {analytics.tutorMessages}{' '}
                    {t('percakapan')}
                </span>
                <span className="text-muted-foreground">
                    {t('Jumlah pesan dalam 30 hari terakhir.')}
                </span>
            </div>
        </section>
    );
}
