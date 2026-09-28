import { t } from '@/lib/ui-language';
import { Head } from '@inertiajs/react';
import { Plus } from '@/components/meya-icons';

import { Button } from '@/components/ui/button';

import { FormModal } from '@/pages/admin/form-modal';
import { QuizBuilderModal } from '@/pages/admin/quiz-builder-modal';
import { QuizQuestionModal } from '@/pages/admin/quiz-question-modal';
import { AudioManagerModal } from '@/pages/admin/audio-manager-modal';
import { DeleteModal } from '@/pages/admin/delete-modal';

import { AnalyticsPanel } from '@/pages/admin/analytics-panel';
import { TutorSettingsPanel } from '@/pages/admin/tutor-settings-panel';

import { OverviewPanel } from '@/pages/admin/sections/overview-panel';
import { PathsPanel } from '@/pages/admin/sections/paths-panel';
import { VocabularyPanel } from '@/pages/admin/sections/vocabulary-panel';
import { CharactersPanel } from '@/pages/admin/sections/characters-panel';
import { ExercisesPanel } from '@/pages/admin/sections/exercises-panel';
import { MediaPanel } from '@/pages/admin/sections/media-panel';
import { LearnersPanel } from '@/pages/admin/sections/learners-panel';
import { FeedbackPanel } from '@/pages/admin/sections/feedback-panel';
import type { AdminPageProps } from '@/pages/admin/types';
import { useAdminPageModel } from '@/pages/admin/use-admin-page-model';

export default function AdminPage(props: AdminPageProps) {
    const model = useAdminPageModel(props);
    const {
        audioBlockOptions,
        analytics,
        tutorSettings,
        section,
        modal,
        setModal,
        quizBuilderOpen,
        setQuizBuilderOpen,
        quizBuilderLessonId,
        quizQuestionModal,
        setQuizQuestionModal,
        audioModalTarget,
        setAudioModalTarget,
        deleting,
        setDeleting,
        allLessons,
        scriptLesson,
        openPath,
        openUser,
        openBlock,
        openVocabularyBlock,
        openBlockAudio,
        current,
    } = model;
    return (
        <>
            <Head title={t(current[0])} />
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="stitch-kicker">
                        {t('STUDIO ADMIN / PENGELOLAAN')}
                    </p>
                    <h1 className="mt-2 text-[28px] leading-tight font-extrabold tracking-tight md:text-[32px]">
                        {t(current[0])}
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                        {t(current[1])}
                    </p>
                </div>
                {section === 'paths' && (
                    <Button
                        onClick={() => openPath()}
                        className="min-h-11 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        <Plus className="size-4" /> {t('Buat kelas')}
                    </Button>
                )}
                {section === 'learners' && (
                    <Button
                        onClick={() => openUser()}
                        className="min-h-11 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        <Plus className="size-4" /> {t('Buat pengguna')}
                    </Button>
                )}
                {section === 'vocabulary' && (
                    <Button
                        onClick={openVocabularyBlock}
                        disabled={!allLessons.length}
                        className="min-h-11 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        <Plus className="size-4" /> {t('Tambah kosakata')}
                    </Button>
                )}
                {section === 'characters' && (
                    <Button
                        onClick={() =>
                            openBlock(undefined, scriptLesson, {
                                type: 'script',
                            })
                        }
                        disabled={!scriptLesson}
                        className="min-h-11 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        <Plus className="size-4" /> {t('Tambah aksara')}
                    </Button>
                )}
                {section === 'media' && (
                    <Button
                        onClick={() => openBlockAudio()}
                        className="min-h-11 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        <Plus className="size-4" /> {t('Tambah audio')}
                    </Button>
                )}
            </div>

            {section === 'overview' && <OverviewPanel model={model} />}

            {section === 'paths' && <PathsPanel model={model} />}

            {section === 'vocabulary' && <VocabularyPanel model={model} />}

            {section === 'characters' && <CharactersPanel model={model} />}

            {section === 'exercises' && <ExercisesPanel model={model} />}

            {section === 'media' && <MediaPanel model={model} />}

            {section === 'learners' && <LearnersPanel model={model} />}
            {section === 'analytics' && (
                <AnalyticsPanel analytics={analytics} />
            )}
            {section === 'tutor' && (
                <TutorSettingsPanel settings={tutorSettings} />
            )}
            {section === 'feedback' && <FeedbackPanel model={model} />}
            <FormModal config={modal} close={() => setModal(null)} />
            {quizBuilderOpen && (
                <QuizBuilderModal
                    key={quizBuilderLessonId ?? 'new'}
                    lessons={allLessons}
                    initialLessonId={quizBuilderLessonId}
                    close={() => setQuizBuilderOpen(false)}
                />
            )}
            {quizQuestionModal && (
                <QuizQuestionModal
                    target={quizQuestionModal}
                    close={() => setQuizQuestionModal(null)}
                />
            )}
            <AudioManagerModal
                open={audioModalTarget !== undefined}
                blocks={audioBlockOptions}
                lessons={allLessons}
                initialBlock={audioModalTarget}
                close={() => setAudioModalTarget(undefined)}
            />
            <DeleteModal config={deleting} close={() => setDeleting(null)} />
        </>
    );
}
