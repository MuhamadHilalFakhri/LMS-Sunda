import { t } from '@/lib/ui-language';
import { CircleHelp, Pencil, Plus, Trash2 } from '@/components/meya-icons';
import { Button } from '@/components/ui/button';
import type { Exercise, Lesson, Question } from '@/types/learning';
import type { DeleteConfig } from '@/pages/admin/types';
import { Empty, IconAction } from '@/pages/admin/common-ui';

type Props = {
    lesson: Lesson;
    openExercise: (exercise?: Exercise, lesson?: Lesson) => void;
    openQuizBuilder: (lesson: Lesson) => void;
    openQuestion: (exercise: Exercise, question?: Question) => void;
    remove: (value: DeleteConfig) => void;
};

export function LessonExercisePanel({
    lesson,
    openExercise,
    openQuizBuilder,
    openQuestion,
    remove,
}: Props) {
    return (
        <>
            <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    {t('Soal dinilai menggunakan kunci jawaban admin.')}
                </p>
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="outline"
                        className="min-h-10"
                        onClick={() => openExercise(undefined, lesson)}
                    >
                        <Plus className="size-4" /> {t('Latihan')}
                    </Button>
                    <Button
                        className="min-h-10"
                        onClick={() => openQuizBuilder(lesson)}
                    >
                        <Plus className="size-4" /> {t('Buat kuis')}
                    </Button>
                </div>
            </div>
            {lesson.exercises?.length ? (
                <div className="space-y-4">
                    {lesson.exercises.map((exercise) => (
                        <article
                            key={exercise.id}
                            className="rounded-md border p-4"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <h4 className="font-semibold">
                                        {exercise.title}
                                    </h4>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {exercise.questions?.length ?? 0}{' '}
                                        {t('soal')}
                                    </p>
                                </div>
                                <div className="flex gap-1">
                                    <IconAction
                                        label="Ubah latihan"
                                        icon={Pencil}
                                        action={() =>
                                            openExercise(exercise, lesson)
                                        }
                                    />
                                    <IconAction
                                        label="Hapus latihan"
                                        icon={Trash2}
                                        danger
                                        action={() =>
                                            remove({
                                                type: 'exercises',
                                                id: exercise.id,
                                                label: exercise.title,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                            <div className="mt-4 divide-y border-t">
                                {exercise.questions?.map((question, index) => (
                                    <div
                                        key={question.id}
                                        className="flex items-center justify-between gap-3 py-2 text-sm"
                                    >
                                        <span>
                                            {index + 1}. {question.prompt}
                                        </span>
                                        <div className="flex gap-1">
                                            <IconAction
                                                label="Ubah soal"
                                                icon={Pencil}
                                                action={() =>
                                                    openQuestion(
                                                        exercise,
                                                        question,
                                                    )
                                                }
                                            />
                                            <IconAction
                                                label="Hapus soal"
                                                icon={Trash2}
                                                danger
                                                action={() =>
                                                    remove({
                                                        type: 'questions',
                                                        id: question.id,
                                                        label: 'soal',
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button
                                variant="ghost"
                                className="mt-2 min-h-10 text-link"
                                onClick={() => openQuestion(exercise)}
                            >
                                <Plus className="size-4" /> {t('Tambah soal')}
                            </Button>
                        </article>
                    ))}
                </div>
            ) : (
                <Empty
                    icon={CircleHelp}
                    title="Belum ada latihan atau kuis"
                    detail="Tambahkan latihan atau buat kuis evaluasi untuk pelajaran ini."
                    action={
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant="outline"
                                onClick={() => openExercise(undefined, lesson)}
                            >
                                {t('Tambah latihan')}
                            </Button>
                            <Button onClick={() => openQuizBuilder(lesson)}>
                                {t('Buat kuis')}
                            </Button>
                        </div>
                    }
                />
            )}
        </>
    );
}
