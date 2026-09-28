import { t } from '@/lib/ui-language';
import { Pencil, Trash2 } from '@/components/meya-icons';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Block, Exercise, Lesson, Question } from '@/types/learning';
import { LessonMaterialPanel } from '@/pages/admin/lesson-material-panel';
import { LessonExercisePanel } from '@/pages/admin/lesson-exercise-panel';
import type { DeleteConfig } from '@/pages/admin/types';
import { Status } from '@/pages/admin/status';

export function LessonWorkspace({
    lesson,
    openLesson,
    openBlock,
    openExercise,
    openQuizBuilder,
    openQuestion,
    remove,
}: {
    lesson: Lesson;
    openLesson: () => void;
    openBlock: (block?: Block, lesson?: Lesson) => void;
    openExercise: (exercise?: Exercise, lesson?: Lesson) => void;
    openQuizBuilder: (lesson: Lesson) => void;
    openQuestion: (exercise: Exercise, question?: Question) => void;
    remove: (value: DeleteConfig) => void;
}) {
    const [tab, setTab] = useState<'material' | 'exercise'>('material');
    return (
        <section className="surface overflow-hidden">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b px-5 py-5">
                <div>
                    <p className="text-xs font-semibold text-muted-foreground">
                        {t('EDITOR PELAJARAN')}
                    </p>
                    <h3 className="mt-1 text-xl font-semibold">
                        {lesson.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {lesson.summary || t('Belum ada ringkasan pelajaran.')}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Status value={lesson.status} />
                    <Button variant="outline" size="sm" onClick={openLesson}>
                        <Pencil className="size-4" /> {t('Ubah pelajaran')}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-[#b42335] hover:bg-[#fff1f2]"
                        onClick={() =>
                            remove({
                                type: 'lessons',
                                id: lesson.id,
                                label: lesson.title,
                            })
                        }
                    >
                        <Trash2 className="size-4" /> {t('Hapus')}
                    </Button>
                </div>
            </div>
            <div
                className="flex border-b px-5"
                role="tablist"
                aria-label={t('Isi pelajaran')}
            >
                <button
                    role="tab"
                    type="button"
                    aria-selected={tab === 'material'}
                    onClick={() => setTab('material')}
                    className={`min-h-12 border-b-2 px-4 text-sm font-semibold ${tab === 'material' ? 'border-[#493ee5] text-link' : 'border-transparent text-muted-foreground'}`}
                >
                    {t('Materi (')}
                    {lesson.blocks?.length ?? 0})
                </button>
                <button
                    role="tab"
                    type="button"
                    aria-selected={tab === 'exercise'}
                    onClick={() => setTab('exercise')}
                    className={`min-h-12 border-b-2 px-4 text-sm font-semibold ${tab === 'exercise' ? 'border-[#493ee5] text-link' : 'border-transparent text-muted-foreground'}`}
                >
                    {t('Latihan (')}
                    {lesson.exercises?.length ?? 0})
                </button>
            </div>
            <div className="p-5">
                {tab === 'material' ? (
                    <LessonMaterialPanel
                        lesson={lesson}
                        openBlock={openBlock}
                        remove={remove}
                    />
                ) : (
                    <LessonExercisePanel
                        lesson={lesson}
                        openExercise={openExercise}
                        openQuizBuilder={openQuizBuilder}
                        openQuestion={openQuestion}
                        remove={remove}
                    />
                )}
            </div>
        </section>
    );
}
