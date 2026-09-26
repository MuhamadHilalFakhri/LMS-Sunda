import { t } from '@/lib/ui-language';
import { Bookmark, BookmarkCheck, Volume2 } from 'lucide-react';
import { Block } from '@/types/learning';
import {
    cleanBlockTitle,
    isAudioAttribution,
} from '@/pages/learning/module-content-utils';
import { ContentBlockDetails } from '@/pages/learning/module-content-details';

export function ContentBlock({
    block,
    saved,
    onToggleSave,
    ordinal,
}: {
    block: Block;
    saved: boolean;
    onToggleSave: () => void;
    ordinal?: number;
}) {
    const vocabulary = block.type === 'vocabulary';
    const script = block.type === 'script';
    const dialogue = block.type === 'dialogue';
    const title = cleanBlockTitle(block);
    const term = block.latin || title || t('Bagian materi');
    const titleIsTerm =
        vocabulary &&
        title.toLocaleLowerCase('id') === term.toLocaleLowerCase('id');
    const introduction =
        block.type === 'text' && /^Fokus pelajaran:/iu.test(block.title ?? '');
    const context = block.context?.trim() || '';
    const genericContext =
        /^pasangan kata dan arti untuk latihan pengenalan kosakata\.?$/iu.test(
            context,
        );
    const audioAttribution =
        context && isAudioAttribution(context) ? context : '';
    const learnerContext =
        context && !genericContext && !audioAttribution ? context : '';
    const kindLabel = vocabulary
        ? 'KOSAKATA'
        : script
          ? 'AKSARA SUNDA'
          : dialogue
            ? 'DIALOG'
            : introduction
              ? 'PENGANTAR MATERI'
              : 'PENJELASAN';

    if (introduction) {
        return (
            <section id={`block-${block.id}`} className="scroll-mt-24 py-1">
                <p className="text-[10px] font-extrabold tracking-[0.12em] text-[#493ee5] uppercase">
                    {t('PENGANTAR')}
                </p>
                {block.body && (
                    <p className="mt-2 max-w-[72ch] text-base leading-7 text-foreground/90">
                        {block.body}
                    </p>
                )}
                {block.translation && (
                    <p className="mt-2 max-w-[72ch] text-sm leading-6 text-muted-foreground">
                        {block.translation}
                    </p>
                )}
            </section>
        );
    }

    return (
        <section
            id={`block-${block.id}`}
            className="stitch-card scroll-mt-24 overflow-hidden"
        >
            <header className="flex items-start justify-between gap-4 border-b bg-card px-5 py-4 md:px-6">
                <div className="min-w-0">
                    <p className="text-[10px] font-extrabold tracking-[0.12em] text-[#493ee5] uppercase">
                        {t(kindLabel)}
                        {vocabulary && ordinal
                            ? ` · ${String(ordinal).padStart(2, '0')}`
                            : ''}
                    </p>
                    {(!vocabulary || (title && !titleIsTerm)) && (
                        <h2 className="mt-1 text-lg leading-snug font-extrabold md:text-xl">
                            {title || t('Bagian materi')}
                        </h2>
                    )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    {(block.type === 'vocabulary' ||
                        block.type === 'script' ||
                        block.type === 'dialogue') && (
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
                            onClick={onToggleSave}
                            className={`flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors ${saved ? 'bg-[#efedff] text-[#493ee5]' : 'text-muted-foreground hover:bg-secondary hover:text-[#493ee5]'}`}
                        >
                            {saved ? (
                                <BookmarkCheck className="size-4" />
                            ) : (
                                <Bookmark className="size-4" />
                            )}
                        </button>
                    )}
                </div>
            </header>
            <ContentBlockDetails
                block={block}
                vocabulary={vocabulary}
                script={script}
                dialogue={dialogue}
                introduction={introduction}
                learnerContext={learnerContext}
                audioAttribution={audioAttribution}
                title={title}
                term={term}
            />
            {block.audio_path && (
                <div className="border-t bg-secondary/30 px-4 py-4 md:px-5">
                    <div className="flex items-start gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#efedff] text-[#493ee5]">
                            <Volume2 className="size-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold">
                                {t('Dengarkan pelafalan')}
                            </p>
                            <p
                                lang="su"
                                className="mt-0.5 text-xs text-muted-foreground"
                            >
                                {block.latin || title || t('Contoh pelafalan')}
                            </p>
                        </div>
                    </div>
                    <audio
                        controls
                        preload="none"
                        src={`/storage/${block.audio_path}`}
                        className="mt-3 h-10 w-full max-w-xl"
                    >
                        {t('Audio tidak dapat diputar di browser ini.')}
                    </audio>
                    {audioAttribution && (
                        <p className="mt-2 max-w-2xl text-[11px] leading-4 text-muted-foreground">
                            {t('Sumber audio')}: {audioAttribution}
                        </p>
                    )}
                </div>
            )}
        </section>
    );
}
