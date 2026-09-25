import ModuleTutor from '@/pages/learning/module-tutor';
import { t } from '@/lib/ui-language';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    BookOpen,
    Bookmark,
    BookmarkCheck,
    Check,
    CheckCircle2,
    ChevronRight,
    Circle,
    CirclePlay,
    Lightbulb,
    List,
    Menu,
    MessageSquareText,
    Volume2,
} from 'lucide-react';
import { useState } from 'react';
import { moduleUrl, type Lesson, type Block } from '@/types/learning';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';

function registerExplanation(register: string) {
    const value = register.toLocaleLowerCase('id');
    if (value.includes('loma'))
        return t(
            'Ragam loma digunakan dalam percakapan akrab. Sesuaikan dengan hubungan dan situasi.',
        );
    if (value.includes('lemes') || value.includes('halus'))
        return t(
            'Ragam lemes digunakan untuk berbicara dengan sopan dan menghormati lawan bicara.',
        );
    return t('Tingkat tutur dapat berubah sesuai lawan bicara dan situasi.');
}

function cleanBlockTitle(block: Block) {
    return (block.title ?? '')
        .replace(/^(?:Kosakata|Aksara|Fokus pelajaran|Fokus aksara):\s*/i, '')
        .trim();
}

function isAudioAttribution(value: string) {
    return /(?:CC\s?BY|CC0|Wikimedia|OpenSLR|Lingua Libre|audio .* oleh)/iu.test(
        value,
    );
}

function ContentBlock({
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
                <p className="text-[10px] font-extrabold tracking-[0.12em] text-[#493ee5] uppercase">{t('PENGANTAR')}</p>
                {block.body && <p className="mt-2 max-w-[72ch] text-base leading-7 text-foreground/90">{block.body}</p>}
                {block.translation && <p className="mt-2 max-w-[72ch] text-sm leading-6 text-muted-foreground">{block.translation}</p>}
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
            <div className="space-y-4 p-4 md:p-5">
                {vocabulary && (
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl bg-[#f5f2ff] p-4 dark:bg-secondary">
                            <p className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
                                {t('Kata dalam Bahasa Sunda')}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                                <p
                                    lang="su"
                                    className="text-2xl font-extrabold"
                                >
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
                            <p
                                lang="su"
                                className="mt-2 text-2xl font-extrabold"
                            >
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

function VocabularySection({
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
                    const genericContext = /^pasangan kata dan arti untuk latihan pengenalan kosakata\.?$/iu.test(context);
                    const audioAttribution = context && isAudioAttribution(context) ? context : '';
                    const learnerContext = context && !genericContext && !audioAttribution ? context : '';
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
                                                <h3 lang="su" className="text-lg leading-snug font-extrabold">
                                                    {term}
                                                </h3>
                                                {block.sundanese && (
                                                    <span lang="su" className="sunda-script text-2xl text-[#493ee5]">
                                                        {block.sundanese}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mt-1 text-sm leading-6">
                                                <span className="mr-2 text-[10px] font-bold tracking-wide text-muted-foreground uppercase">{t('Arti')}</span>
                                                {block.translation || t('Arti belum ditulis')}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            aria-pressed={saved}
                                            aria-label={t(saved ? 'Hapus dari materi tersimpan' : 'Simpan materi')}
                                            title={t(saved ? 'Hapus dari materi tersimpan' : 'Simpan materi')}
                                            onClick={() => onToggleSave(block)}
                                            className={`flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors ${saved ? 'bg-[#efedff] text-[#493ee5]' : 'text-muted-foreground hover:bg-secondary hover:text-[#493ee5]'}`}
                                        >
                                            {saved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
                                        </button>
                                    </div>

                                    {block.body && (
                                        <div className="mt-3 border-l-2 border-[#b9b3ff] pl-3">
                                            <p className="text-[10px] font-bold tracking-wide text-muted-foreground uppercase">{t('Contoh pemakaian')}</p>
                                            <p className="mt-1 text-sm leading-6 whitespace-pre-line">{block.body}</p>
                                        </div>
                                    )}

                                    {(block.register || block.region || learnerContext) && (
                                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                                            {block.register && (
                                                <span>
                                                    <span className="font-bold text-foreground">{t('Ragam tutur')}:</span>{' '}
                                                    <span className="capitalize">{block.register}</span>
                                                    <span className="ml-1">· {registerExplanation(block.register)}</span>
                                                </span>
                                            )}
                                            {block.region && <span><span className="font-bold text-foreground">{t('Ragam daerah')}:</span> {block.region}</span>}
                                            {learnerContext && <span className="basis-full leading-5"><span className="font-bold text-foreground">{t('Kapan digunakan')}:</span> {learnerContext}</span>}
                                        </div>
                                    )}

                                    {!block.body && !learnerContext && !block.register && !block.region && (
                                        <p className="mt-2 text-xs leading-5 text-muted-foreground">
                                            {t('Cocokkan kata dengan artinya, lalu perhatikan contoh saat kata ini digunakan dalam kalimat.')}
                                        </p>
                                    )}

                                    {block.audio_path && (
                                        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#493ee5]">
                                                <Volume2 className="size-3.5" /> {t('Dengarkan pelafalan')}
                                            </span>
                                            <audio controls preload="none" src={`/storage/${block.audio_path}`} className="h-9 w-full max-w-sm">
                                                {t('Audio tidak dapat diputar di browser ini.')}
                                            </audio>
                                        </div>
                                    )}
                                    {audioAttribution && !block.audio_path && (
                                        <p className="mt-2 text-xs leading-5 text-muted-foreground">{t('Sumber audio')}: {audioAttribution}</p>
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

type ModuleLesson = Pick<Lesson, 'id' | 'title' | 'summary' | 'position'>;
type ModuleUnit = Pick<
    NonNullable<Lesson['unit']>,
    'id' | 'title' | 'description'
>;
type ModulePath = { id: number; slug: string; title: string };
type WorkspaceLesson = Omit<Lesson, 'unit'> & {
    unit: { id: number; title: string; path: ModulePath };
};

function youtubeEmbedUrl(value: string | null | undefined) {
    if (!value) return null;
    try {
        const url = new URL(value);
        const host = url.hostname.toLowerCase().replace(/^www\./, '');
        let id = '';
        if (host === 'youtu.be')
            id = url.pathname.split('/').filter(Boolean)[0] ?? '';
        else if (host === 'youtube.com' || host === 'm.youtube.com') {
            id =
                url.searchParams.get('v') ??
                url.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/)?.[1] ??
                '';
        }
        return /^[\w-]{11}$/.test(id)
            ? 'https://www.youtube-nocookie.com/embed/' + id
            : null;
    } catch {
        return null;
    }
}

function ModuleMaterialList({
    unit,
    lessons,
    currentLessonId,
    progress,
    onNavigate,
}: {
    unit: ModuleUnit;
    lessons: ModuleLesson[];
    currentLessonId: number | null;
    progress: Record<number, string>;
    onNavigate?: () => void;
}) {
    if (!lessons.length) {
        return (
            <p className="rounded-xl bg-secondary/60 p-4 text-sm leading-6 text-muted-foreground">
                {t('Belum ada materi terbit dalam modul ini.')}
            </p>
        );
    }

    return (
        <nav
            aria-label={t('Materi dalam modul') + ' ' + unit.title}
            className="space-y-1"
        >
            {lessons.map((item, index) => {
                const active = item.id === currentLessonId;
                const completed = progress[item.id] === 'completed';
                return (
                    <Link
                        key={item.id}
                        href={moduleUrl(unit.id, item.id)}
                        onClick={onNavigate}
                        aria-current={active ? 'page' : undefined}
                        className={`flex min-h-[58px] items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${active ? 'bg-[#efedff] text-[#3428cf] ring-1 ring-[#d9d4ff] ring-inset' : 'text-foreground hover:bg-secondary'}`}
                    >
                        <span
                            className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${completed ? 'bg-[#e7f7ee] text-[#147548]' : active ? 'bg-white text-[#493ee5]' : 'bg-secondary text-muted-foreground'}`}
                        >
                            {completed ? (
                                <Check className="size-4" />
                            ) : (
                                index + 1
                            )}
                        </span>
                        <span className="min-w-0 flex-1">
                            <span
                                className={`line-clamp-2 block text-sm leading-5 ${active ? 'font-bold' : 'font-medium'}`}
                            >
                                {item.title}
                            </span>
                            {active && (
                                <span className="mt-0.5 block text-[10px] font-bold tracking-wide text-[#493ee5] uppercase">
                                    {t('Sedang dipelajari')}
                                </span>
                            )}
                            {!active && completed && (
                                <span className="mt-0.5 block text-[10px] font-medium text-[#147548]">
                                    {t('Selesai')}
                                </span>
                            )}
                        </span>
                        {!completed && progress[item.id] === 'in_progress' && (
                            <Circle
                                className="size-2.5 shrink-0 fill-[#493ee5] text-[#493ee5]"
                                aria-label={t('Berjalan')}
                            />
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}

export default function ModulePage({
    path,
    unit,
    lessons,
    lesson,
    progress = {},
    savedBlockIds,
}: {
    path: ModulePath;
    unit: ModuleUnit;
    lessons: ModuleLesson[];
    lesson: WorkspaceLesson | null;
    progress?: Record<number, string>;
    savedBlockIds: number[];
}) {
    const [processing, setProcessing] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const classUrl = '/belajar/' + path.slug;
    const completedLessons = lessons.filter(
        (item) => progress[item.id] === 'completed',
    ).length;
    const currentIndex = lesson
        ? lessons.findIndex((item) => item.id === lesson.id)
        : -1;
    const previousLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
    const nextLesson =
        currentIndex >= 0 ? (lessons[currentIndex + 1] ?? null) : null;
    const videoEmbed = youtubeEmbedUrl(lesson?.youtube_url);
    const contentSections = (lesson?.blocks ?? []).reduce<Block[]>(
        (sections, block) => {
            if (block.type !== 'vocabulary' || !sections.some((item) => item.type === 'vocabulary')) {
                sections.push(block);
            }
            return sections;
        },
        [],
    );
    const vocabularyBlocks = (lesson?.blocks ?? []).filter((block) => block.type === 'vocabulary');

    return (
        <div className="grid h-full min-h-0 lg:grid-cols-[300px_minmax(0,1fr)]">
            <Head title={lesson?.title ?? unit.title} />
            <aside className="hidden min-h-0 flex-col border-r bg-card lg:flex">
                <div className="shrink-0 border-b p-5">
                    <p className="stitch-kicker">{t('MODUL AKTIF')}</p>
                    <h2 className="mt-1 line-clamp-2 text-base font-extrabold">
                        {unit.title}
                    </h2>
                    <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span>
                            {completedLessons} {t('dari')} {lessons.length}{' '}
                            {t('materi selesai')}
                        </span>
                        <span className="font-bold text-foreground">
                            {Math.round(
                                lessons.length
                                    ? (completedLessons / lessons.length) * 100
                                    : 0,
                            )}
                            %
                        </span>
                    </div>
                    <div
                        className="stitch-progress mt-2"
                        role="progressbar"
                        aria-label={`${t('Progres modul')} ${unit.title}`}
                        aria-valuenow={completedLessons}
                        aria-valuemin={0}
                        aria-valuemax={lessons.length || 1}
                    >
                        <span
                            style={{
                                width: `${lessons.length ? (completedLessons / lessons.length) * 100 : 0}%`,
                            }}
                        />
                    </div>
                    <Link
                        href={classUrl}
                        className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-link hover:underline"
                    >
                        <ArrowLeft className="size-3.5" />
                        {t('Kembali ke daftar modul')}
                    </Link>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
                    <p className="mb-2 px-2 text-[10px] font-extrabold tracking-wide text-muted-foreground uppercase">
                        {t('MATERI DALAM MODUL')}
                    </p>
                    <ModuleMaterialList
                        unit={unit}
                        lessons={lessons}
                        currentLessonId={lesson?.id ?? null}
                        progress={progress}
                    />
                </div>
            </aside>

            <main className="min-h-0 overflow-y-auto overscroll-contain">
                <div className="mx-auto max-w-4xl space-y-5 px-4 py-4 pb-24 sm:px-6 md:py-7">
                    <div className="flex items-center gap-3 lg:hidden">
                        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                            <SheetTrigger asChild>
                                <button
                                    type="button"
                                    className="btn-secondary h-11 shrink-0 gap-2 px-3"
                                    aria-label={t('Buka daftar materi')}
                                >
                                    <Menu className="size-4" />
                                    <span>
                                        {t('Materi')} ({lessons.length})
                                    </span>
                                </button>
                            </SheetTrigger>
                            <SheetContent
                                side="left"
                                className="w-[min(88vw,360px)] gap-0 p-0 sm:max-w-[360px]"
                            >
                                <SheetHeader className="border-b pr-12 text-left">
                                    <SheetTitle>{unit.title}</SheetTitle>
                                    <SheetDescription>
                                        {completedLessons} {t('dari')}{' '}
                                        {lessons.length} {t('materi selesai')}
                                    </SheetDescription>
                                </SheetHeader>
                                <div className="min-h-0 flex-1 overflow-y-auto p-3">
                                    <ModuleMaterialList
                                        unit={unit}
                                        lessons={lessons}
                                        currentLessonId={lesson?.id ?? null}
                                        progress={progress}
                                        onNavigate={() => setMobileOpen(false)}
                                    />
                                </div>
                            </SheetContent>
                        </Sheet>
                        <div className="min-w-0">
                            <p className="truncate text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
                                {unit.title}
                            </p>
                            <p className="truncate text-xs font-semibold">
                                {lesson?.title ?? t('Belum ada materi terbit')}
                            </p>
                        </div>
                    </div>

                    {!lesson ? (
                        <section className="stitch-card mx-auto flex min-h-[50vh] max-w-2xl flex-col items-center justify-center p-8 text-center">
                            <span className="flex size-14 items-center justify-center rounded-2xl bg-[#efedff] text-[#493ee5]">
                                <BookOpen className="size-7" />
                            </span>
                            <h1 className="mt-5 text-xl font-extrabold">
                                {t('Belum ada materi terbit dalam modul ini.')}
                            </h1>
                            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                                {t(
                                    'Materi akan muncul di sini setelah diterbitkan oleh pengelola.',
                                )}
                            </p>
                            <Link
                                href={classUrl}
                                className="btn-primary mt-6 gap-2"
                            >
                                <ArrowLeft className="size-4" />
                                {t('Kembali ke kelas')}
                            </Link>
                        </section>
                    ) : (
                        <>
                            <div className="text-xs font-semibold text-muted-foreground">
                                <Link
                                    href={classUrl}
                                    className="hover:text-link"
                                >
                                    {path.title}
                                </Link>
                                <ChevronRight className="mx-1 inline size-3" />
                                <span>{unit.title}</span>
                                <ChevronRight className="mx-1 inline size-3" />
                                <span className="text-foreground">
                                    {lesson.title}
                                </span>
                            </div>
                            <header className="border-b pb-5">
                                <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold tracking-wide text-[#493ee5] uppercase">
                                    <span>{unit.title}</span>
                                    <span aria-hidden="true">·</span>
                                    <span>{t('MATERI BELAJAR')}</span>
                                </div>
                                <h1 className="mt-2 text-2xl leading-tight font-extrabold tracking-tight md:text-3xl">
                                    {lesson.title}
                                </h1>
                                {lesson.summary && (
                                    <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
                                        {lesson.summary}
                                    </p>
                                )}
                                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
                                    <span className="font-semibold text-[#493ee5]">
                                        {t('Materi')} {currentIndex + 1}{' '}
                                        {t('dari')} {lessons.length}
                                    </span>
                                    <span className="text-muted-foreground">
                                        · {lesson.blocks?.length ?? 0}{' '}
                                        {t('bagian materi')}
                                    </span>
                                    {progress[lesson.id] === 'completed' && (
                                        <span className="rounded-full bg-[#e7f7ee] px-2.5 py-1 font-semibold text-[#147548]">
                                            {t('Selesai')}
                                        </span>
                                    )}
                                </div>
                            </header>

                            {!!lesson.blocks?.length && (
                                <nav
                                    aria-label={t('Daftar bagian materi')}
                                    className="flex flex-wrap items-center gap-2 border-b pb-4"
                                >
                                    <span className="mr-1 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                                        <List className="size-3.5" /> {t('Isi materi ini')}:
                                    </span>
                                    {contentSections.map((block, index) => (
                                        <a
                                            key={block.id}
                                            href={block.type === 'vocabulary' ? '#vocabulary-section' : `#block-${block.id}`}
                                            className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-secondary/70 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-[#efedff] hover:text-[#3428cf]"
                                        >
                                            <span className="font-bold text-link">{String(index + 1).padStart(2, '0')}</span>
                                            <span>{block.type === 'vocabulary' ? t('Kosakata') : cleanBlockTitle(block) || block.latin || t('Bagian materi')}</span>
                                        </a>
                                    ))}
                                </nav>
                            )}

                            {videoEmbed && (
                                <section
                                    className="overflow-hidden rounded-2xl border bg-card shadow-sm"
                                    aria-label={t('Video materi')}
                                >
                                    <div className="flex items-center gap-2 border-b px-5 py-3.5">
                                        <CirclePlay className="size-5 text-[#493ee5]" />
                                        <div>
                                            <h2 className="text-sm font-extrabold">
                                                {t('Tonton penjelasan materi')}
                                            </h2>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                {t(
                                                    'Video bersifat pelengkap. Materi tertulis tetap tersedia di bawah.',
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="aspect-video bg-black">
                                        <iframe
                                            className="size-full"
                                            src={videoEmbed}
                                            title={
                                                t('Video materi') +
                                                ': ' +
                                                lesson.title
                                            }
                                            loading="lazy"
                                            referrerPolicy="strict-origin-when-cross-origin"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            allowFullScreen
                                        />
                                    </div>
                                </section>
                            )}

                            <div className="min-w-0 space-y-4">
                                {contentSections.map((block) => block.type === 'vocabulary' ? (
                                    <VocabularySection
                                        key="vocabulary-section"
                                        blocks={vocabularyBlocks}
                                        savedBlockIds={savedBlockIds}
                                        onToggleSave={(vocabularyBlock) => savedBlockIds.includes(vocabularyBlock.id)
                                            ? router.delete('/materi-tersimpan/' + vocabularyBlock.id, { preserveScroll: true })
                                            : router.post('/materi-tersimpan/' + vocabularyBlock.id, {}, { preserveScroll: true })}
                                    />
                                ) : (
                                    <ContentBlock
                                        key={block.id}
                                        block={block}
                                        saved={savedBlockIds.includes(block.id)}
                                        onToggleSave={() => savedBlockIds.includes(block.id)
                                            ? router.delete('/materi-tersimpan/' + block.id, { preserveScroll: true })
                                            : router.post('/materi-tersimpan/' + block.id, {}, { preserveScroll: true })}
                                    />
                                ))}
                                {!lesson.blocks?.length && (
                                    <div className="stitch-card p-6 text-sm text-muted-foreground">
                                        {t('Isi pelajaran belum tersedia.')}
                                    </div>
                                )}
                            </div>

                            {!!lesson.exercises?.length && (
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
                                                            exercise.kind ===
                                                                'quiz'
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
                            )}

                            {(previousLesson || nextLesson) && (
                                <nav
                                    className="grid gap-3 border-t pt-5 sm:grid-cols-2"
                                    aria-label={t('Navigasi antar pelajaran')}
                                >
                                    {previousLesson ? (
                                        <Link
                                            href={moduleUrl(
                                                unit.id,
                                                previousLesson.id,
                                            )}
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
                                            href={moduleUrl(
                                                unit.id,
                                                nextLesson.id,
                                            )}
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
                            )}

                            <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-5">
                                <Link href={classUrl} className="btn-secondary">
                                    {t('Kembali ke daftar modul')}
                                </Link>
                                <button
                                    type="button"
                                    disabled={
                                        processing ||
                                        progress[lesson.id] === 'completed'
                                    }
                                    className="btn-primary gap-2"
                                    onClick={() => {
                                        setProcessing(true);
                                        router.post(
                                            '/pelajaran/' +
                                                lesson.id +
                                                '/selesai',
                                            {},
                                            {
                                                onFinish: () =>
                                                    setProcessing(false),
                                            },
                                        );
                                    }}
                                >
                                    <CheckCircle2 className="size-4" />
                                    {t(
                                        processing
                                            ? 'Menyimpan...'
                                            : progress[lesson.id] ===
                                                'completed'
                                              ? 'Materi selesai'
                                              : 'Tandai selesai',
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </main>
            {lesson && <ModuleTutor lesson={lesson} />}
        </div>
    );
}
