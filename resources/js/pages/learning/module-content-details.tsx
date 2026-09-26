import { t } from '@/lib/ui-language';
import { BookOpen, Lightbulb, MessageSquareText } from 'lucide-react';
import { Block } from '@/types/learning';
import { registerExplanation } from '@/pages/learning/module-content-utils';

export function ContentBlockDetails({
    block,
    vocabulary,
    script,
    dialogue,
    introduction,
    learnerContext,
    audioAttribution,
    title,
    term,
}: {
    block: Block;
    vocabulary: boolean;
    script: boolean;
    dialogue: boolean;
    introduction: boolean;
    learnerContext: string;
    audioAttribution: string;
    title: string;
    term: string;
}) {
    return (
        <div className="space-y-4 p-4 md:p-5">
            {vocabulary && (
                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-[#f5f2ff] p-4 dark:bg-secondary">
                        <p className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
                            {t('Kata dalam Bahasa Sunda')}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                            <p lang="su" className="text-2xl font-extrabold">
                                {term}
                            </p>
                            {block.sundanese && (
                                <p
                                    lang="su"
                                    className="sunda-script text-3xl text-[#493ee5]"
                                >
                                    {block.sundanese}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="rounded-xl border bg-card p-4">
                        <p className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
                            {t('Arti dalam Bahasa Indonesia')}
                        </p>
                        <p className="mt-2 text-lg font-bold">
                            {block.translation || t('Arti belum ditulis')}
                        </p>
                    </div>
                </div>
            )}

            {script && (
                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border bg-card p-4">
                        <p className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
                            {t('Bunyi yang dibaca')}
                        </p>
                        <p lang="su" className="mt-2 text-2xl font-extrabold">
                            {block.latin || title || '—'}
                        </p>
                    </div>
                    <div className="rounded-xl bg-[#f5f2ff] p-4 dark:bg-secondary">
                        <p className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
                            {t('Bentuk Aksara Sunda')}
                        </p>
                        <p
                            lang="su"
                            className="sunda-script mt-1 text-4xl text-[#493ee5]"
                        >
                            {block.sundanese || '—'}
                        </p>
                    </div>
                    {block.translation && (
                        <p className="text-sm leading-6 text-muted-foreground sm:col-span-2">
                            {block.translation}
                        </p>
                    )}
                </div>
            )}

            {block.body && (
                <div
                    className={`rounded-xl p-4 ${vocabulary ? 'bg-[#ecfdf5] text-[#064e3b]' : 'bg-secondary/60'}`}
                >
                    <div className="flex items-center gap-2 text-xs font-bold">
                        {vocabulary ? (
                            <MessageSquareText className="size-4" />
                        ) : (
                            <BookOpen className="size-4 text-[#493ee5]" />
                        )}
                        {t(
                            vocabulary
                                ? 'Contoh pemakaian'
                                : dialogue
                                  ? 'Isi dialog'
                                  : introduction
                                    ? 'Cara mempelajari bagian ini'
                                    : 'Penjelasan materi',
                        )}
                    </div>
                    <p className="mt-2 text-sm leading-6 whitespace-pre-line">
                        {block.body}
                    </p>
                    {dialogue && block.translation && (
                        <p className="mt-3 border-t border-current/10 pt-3 text-sm leading-6">
                            <span className="font-bold">
                                {t('Maksud dialog')}:{' '}
                            </span>
                            {block.translation}
                        </p>
                    )}
                </div>
            )}

            {!vocabulary && !script && !dialogue && block.translation && (
                <div className="rounded-xl border bg-card p-4">
                    <p className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
                        {t('Arti dalam Bahasa Indonesia')}
                    </p>
                    <p className="mt-2 text-sm leading-6">
                        {block.translation}
                    </p>
                </div>
            )}

            {(block.register || block.region || learnerContext) && (
                <div className="grid gap-3 sm:grid-cols-2">
                    {block.register && (
                        <div className="rounded-xl bg-[#ecfdf5] p-4 text-[#064e3b]">
                            <p className="text-[10px] font-bold tracking-wide text-[#087653] uppercase">
                                {t('Ragam tutur')}
                            </p>
                            <p className="mt-1 text-sm font-extrabold capitalize">
                                {block.register}
                            </p>
                            <p className="mt-1 text-xs leading-5">
                                {registerExplanation(block.register)}
                            </p>
                        </div>
                    )}
                    {block.region && (
                        <div className="rounded-xl bg-secondary/60 p-4">
                            <p className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
                                {t('Ragam daerah')}
                            </p>
                            <p className="mt-1 text-sm font-semibold">
                                {block.region}
                            </p>
                        </div>
                    )}
                    {learnerContext && (
                        <div className="rounded-xl border bg-card p-4 sm:col-span-2">
                            <p className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
                                {t('Kapan digunakan')}
                            </p>
                            <p className="mt-2 text-sm leading-6">
                                {learnerContext}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {vocabulary &&
                !block.body &&
                !learnerContext &&
                !block.register &&
                !block.region && (
                    <div className="flex gap-2 rounded-xl border border-[#dedbff] bg-[#f8f7ff] p-3 text-xs leading-5 text-muted-foreground">
                        <Lightbulb className="mt-0.5 size-4 shrink-0 text-[#493ee5]" />
                        {t(
                            'Cocokkan kata dengan artinya, lalu perhatikan contoh saat kata ini digunakan dalam kalimat.',
                        )}
                    </div>
                )}
            {audioAttribution && !block.audio_path && (
                <p className="text-xs leading-5 text-muted-foreground">
                    {t('Sumber audio')}: {audioAttribution}
                </p>
            )}
        </div>
    );
}
