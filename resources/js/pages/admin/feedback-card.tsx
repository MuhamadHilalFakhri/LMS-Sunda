import { t } from '@/lib/ui-language';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import type { FeedbackItem } from '@/pages/admin/types';

export function FeedbackCard({ item }: { item: FeedbackItem }) {
    const statusLabel =
        item.status === 'new'
            ? 'Baru'
            : item.status === 'reviewing'
              ? 'Ditinjau'
              : 'Selesai';
    const categoryLabel =
        item.category === 'content'
            ? 'Materi'
            : item.category === 'bug'
              ? 'Masalah teknis'
              : item.category === 'idea'
                ? 'Saran fitur'
                : 'Lainnya';
    const dateLabel = new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(item.created_at));

    return (
        <article className="stitch-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#efedff] px-2.5 py-1 text-[11px] font-bold text-[#493ee5]">
                            {t(categoryLabel)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {dateLabel}
                        </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 whitespace-pre-wrap">
                        {item.message}
                    </p>
                    <p className="mt-3 text-xs text-muted-foreground">
                        {item.learner_name} · {item.learner_email}
                        {item.page ? ` · ${item.page}` : ''}
                    </p>
                </div>
                <label className="shrink-0 text-xs font-semibold text-muted-foreground">
                    <span className="sr-only">{t('Status tindak lanjut')}</span>
                    <select
                        value={item.status}
                        onChange={(event) =>
                            router.put(
                                `/admin/feedback/${item.id}`,
                                { status: event.target.value },
                                {
                                    preserveScroll: true,
                                    onSuccess: () =>
                                        toast.success(
                                            t('Status masukan diperbarui.'),
                                        ),
                                },
                            )
                        }
                        className="min-h-10 rounded-xl border bg-background px-3 text-sm font-bold text-foreground outline-none focus-visible:border-[#493ee5] focus-visible:ring-2 focus-visible:ring-[#493ee5]/20"
                    >
                        <option value="new">{t('Baru')}</option>
                        <option value="reviewing">{t('Ditinjau')}</option>
                        <option value="resolved">{t('Selesai')}</option>
                    </select>
                    <span className="mt-1 block text-right">
                        {t(statusLabel)}
                    </span>
                </label>
            </div>
        </article>
    );
}
