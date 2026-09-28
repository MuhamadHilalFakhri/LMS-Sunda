import { t } from '@/lib/ui-language';
import { Bookmark, BookmarkCheck, Volume2 } from '@/components/meya-icons';
import { Block } from '@/types/learning';
import {
    cleanBlockTitle,
    isAudioAttribution,
    registerExplanation,
} from '@/pages/learning/module-content-utils';

export function VocabularySection({
    blocks,
    savedBlockIds,
    onToggleSave,
}: {
    blocks: Block[];
    savedBlockIds: number[];
    onToggleSave: (block: Block) => void;
}) {
    if (!blocks.length) return null;

    return (
        <section
            id="vocabulary-section"
            className="stitch-card scroll-mt-24 overflow-hidden"
        >
            <header className="flex items-center justify-between gap-3 border-b px-4 py-3.5 md:px-5">
                <div>
                    <p className="text-[10px] font-extrabold tracking-[0.12em] text-[#493ee5] uppercase">
                        {t('KOSAKATA')}
                    </p>
                    <h2 className="mt-0.5 text-base font-extrabold">
                        {t('Kosakata dalam materi')}
                    </h2>
                </div>
                <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                    {blocks.length}
                </span>
            </header>
            <div className="divide-y">
                {blocks.map((block, index) => {
                    const title = cleanBlockTitle(block);
                    const term = block.latin || title || t('Bagian materi');
                    const context = block.context?.trim() || '';
                    const genericContext =
                        /^pasangan kata dan arti untuk latihan pengenalan kosakata\.?$/iu.test(
                            context,
                        );
                    const audioAttribution =
                        context && isAudioAttribution(context) ? context : '';
                    const learnerContext =
                        context && !genericContext && !audioAttribution
                            ? context
                            : '';
                    const saved = savedBlockIds.includes(block.id);

                    return (
                        <article
                            key={block.id}
                            id={`block-${block.id}`}
                            className="scroll-mt-24 px-4 py-4 md:px-5"
                        >
                            <div className="flex items-start gap-3">
                                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-[#efedff] text-[11px] font-extrabold text-[#493ee5]">
                                    {String(index + 1).padStart(2, '0')}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                                <h3
                                                    lang="su"
                                                    className="text-lg leading-snug font-extrabold"
                                                >
                                                    {term}
                                                </h3>
                                                {block.sundanese && (
                                                    <span
                                                        lang="su"
                                                        className="sunda-script text-2xl text-[#493ee5]"
                                                    >
                                                        {block.sundanese}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mt-1 text-sm leading-6">
                                                <span className="mr-2 text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
                                                    {t('Arti')}
                                                </span>
                                                {block.translation ||
                                                    t('Arti belum ditulis')}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            aria-pressed={saved}
                                            aria-label={t(
                                                saved
                                                    ? 'Hapus dari materi tersimpan'
                                                    : 'Simpan materi',
                                            )}
                                            title={t(
                                                saved
                                                    ? 'Hapus dari materi tersimpan'
                                                    : 'Simpan materi',
                                            )}
                                            onClick={() => onToggleSave(block)}
                                            className={`flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors ${saved ? 'bg-[#efedff] text-[#493ee5]' : 'text-muted-foreground hover:bg-secondary hover:text-[#493ee5]'}`}
                                        >
                                            {saved ? (
                                                <BookmarkCheck className="size-4" />
                                            ) : (
                                                <Bookmark className="size-4" />
                                            )}
                                        </button>
                                    </div>

                                    {block.body && (
                                        <div className="mt-3 border-l-2 border-[#b9b3ff] pl-3">
                                            <p className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
                                                {t('Contoh pemakaian')}
                                            </p>
                                            <p className="mt-1 text-sm leading-6 whitespace-pre-line">
                                                {block.body}
                                            </p>
                                        </div>
                                    )}

                                    {(block.register ||
                                        block.region ||
                                        learnerContext) && (
                                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                                            {block.register && (
                                                <span>
                                                    <span className="font-bold text-foreground">
                                                        {t('Ragam tutur')}:
                                                    </span>{' '}
                                                    <span className="capitalize">
                                                        {block.register}
                                                    </span>
                                                    <span className="ml-1">
                                                        ·{' '}
                                                        {registerExplanation(
                                                            block.register,
                                                        )}
                                                    </span>
                                                </span>
                                            )}
                                            {block.region && (
                                                <span>
                                                    <span className="font-bold text-foreground">
                                                        {t('Ragam daerah')}:
                                                    </span>{' '}
                                                    {block.region}
                                                </span>
                                            )}
                                            {learnerContext && (
                                                <span className="basis-full leading-5">
                                                    <span className="font-bold text-foreground">
                                                        {t('Kapan digunakan')}:
                                                    </span>{' '}
                                                    {learnerContext}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {!block.body &&
                                        !learnerContext &&
                                        !block.register &&
                                        !block.region && (
                                            <p className="mt-2 text-xs leading-5 text-muted-foreground">
                                                {t(
                                                    'Cocokkan kata dengan artinya, lalu perhatikan contoh saat kata ini digunakan dalam kalimat.',
                                                )}
                                            </p>
                                        )}

                                    {block.audio_path && (
                                        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#493ee5]">
                                                <Volume2 className="size-3.5" />{' '}
                                                {t('Dengarkan pelafalan')}
                                            </span>
                                            <audio
                                                controls
                                                preload="none"
                                                src={`/storage/${block.audio_path}`}
                                                className="h-9 w-full max-w-sm"
                                            >
                                                {t(
                                                    'Audio tidak dapat diputar di browser ini.',
                                                )}
                                            </audio>
                                        </div>
                                    )}
                                    {audioAttribution && !block.audio_path && (
                                        <p className="mt-2 text-xs leading-5 text-muted-foreground">
                                            {t('Sumber audio')}:{' '}
                                            {audioAttribution}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
