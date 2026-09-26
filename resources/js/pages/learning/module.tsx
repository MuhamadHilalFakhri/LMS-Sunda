import ModuleTutor from '@/pages/learning/module-tutor';
import {
    cleanBlockTitle,
    getModuleContentSections,
} from '@/pages/learning/module-content-utils';
import { ContentBlock } from '@/pages/learning/module-content-block';
import { VocabularySection } from '@/pages/learning/module-content-vocabulary';
import {
    youtubeEmbedUrl,
    type ModuleLesson,
    type ModulePath,
    type ModuleUnit,
    type WorkspaceLesson,
} from '@/pages/learning/module-navigation';
import { ModuleSidebar } from '@/pages/learning/module-sidebar';
import { ModuleLessonActions } from '@/pages/learning/module-lesson-actions';
import { t } from '@/lib/ui-language';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    BookOpen,
    ChevronRight,
    CirclePlay,
    List,
} from 'lucide-react';
import { useState } from 'react';

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
    const contentSections = getModuleContentSections(lesson?.blocks ?? []);
    const vocabularyBlocks = (lesson?.blocks ?? []).filter(
        (block) => block.type === 'vocabulary',
    );

    return (
        <div className="grid h-full min-h-0 lg:grid-cols-[300px_minmax(0,1fr)]">
            <Head title={lesson?.title ?? unit.title} />
            <ModuleSidebar
                unit={unit}
                lessons={lessons}
                currentLessonId={lesson?.id ?? null}
                progress={progress}
                classUrl={classUrl}
                completedLessons={completedLessons}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
                currentLessonTitle={lesson?.title}
            />

            <main className="min-h-0 overflow-y-auto overscroll-contain">
                <div className="mx-auto max-w-4xl space-y-5 px-4 py-4 pb-24 sm:px-6 md:py-7">
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
                                        <List className="size-3.5" />{' '}
                                        {t('Isi materi ini')}:
                                    </span>
                                    {contentSections.map((block, index) => (
                                        <a
                                            key={block.id}
                                            href={
                                                block.type === 'vocabulary'
                                                    ? '#vocabulary-section'
                                                    : `#block-${block.id}`
                                            }
                                            className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-secondary/70 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-[#efedff] hover:text-[#3428cf]"
                                        >
                                            <span className="font-bold text-link">
                                                {String(index + 1).padStart(
                                                    2,
                                                    '0',
                                                )}
                                            </span>
                                            <span>
                                                {block.type === 'vocabulary'
                                                    ? t('Kosakata')
                                                    : cleanBlockTitle(block) ||
                                                      block.latin ||
                                                      t('Bagian materi')}
                                            </span>
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
                                {contentSections.map((block) =>
                                    block.type === 'vocabulary' ? (
                                        <VocabularySection
                                            key="vocabulary-section"
                                            blocks={vocabularyBlocks}
                                            savedBlockIds={savedBlockIds}
                                            onToggleSave={(vocabularyBlock) =>
                                                savedBlockIds.includes(
                                                    vocabularyBlock.id,
                                                )
                                                    ? router.delete(
                                                          '/materi-tersimpan/' +
                                                              vocabularyBlock.id,
                                                          {
                                                              preserveScroll: true,
                                                          },
                                                      )
                                                    : router.post(
                                                          '/materi-tersimpan/' +
                                                              vocabularyBlock.id,
                                                          {},
                                                          {
                                                              preserveScroll: true,
                                                          },
                                                      )
                                            }
                                        />
                                    ) : (
                                        <ContentBlock
                                            key={block.id}
                                            block={block}
                                            saved={savedBlockIds.includes(
                                                block.id,
                                            )}
                                            onToggleSave={() =>
                                                savedBlockIds.includes(block.id)
                                                    ? router.delete(
                                                          '/materi-tersimpan/' +
                                                              block.id,
                                                          {
                                                              preserveScroll: true,
                                                          },
                                                      )
                                                    : router.post(
                                                          '/materi-tersimpan/' +
                                                              block.id,
                                                          {},
                                                          {
                                                              preserveScroll: true,
                                                          },
                                                      )
                                            }
                                        />
                                    ),
                                )}
                                {!lesson.blocks?.length && (
                                    <div className="stitch-card p-6 text-sm text-muted-foreground">
                                        {t('Isi pelajaran belum tersedia.')}
                                    </div>
                                )}
                            </div>

                            <ModuleLessonActions
                                classUrl={classUrl}
                                lesson={lesson}
                                unit={unit}
                                previousLesson={previousLesson}
                                nextLesson={nextLesson}
                                progress={progress}
                                processing={processing}
                                setProcessing={setProcessing}
                            />
                        </>
                    )}
                </div>
            </main>
            {lesson && <ModuleTutor lesson={lesson} />}
        </div>
    );
}
