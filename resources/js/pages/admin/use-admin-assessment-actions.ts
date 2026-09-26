import { toast } from 'sonner';
import { t } from '@/lib/ui-language';
import {
    positionField,
    questionFieldsForType,
    titleField,
} from '@/pages/admin/form-fields';
import type { AdminExerciseItem } from '@/pages/admin/types';
import type { Exercise, Lesson, Question } from '@/types/learning';
import type { AdminPageState } from '@/pages/admin/use-admin-page-state';

export function createAdminAssessmentActions(state: AdminPageState) {
    const {
        allLessons,
        selectedLesson,
        setModal,
        setQuizQuestionModal,
        setQuizBuilderLessonId,
        setQuizBuilderOpen,
    } = state;
    const openExercise = (exercise?: Exercise, lesson?: Lesson | null) => {
        const targetLesson = exercise
            ? undefined
            : lesson === null
              ? undefined
              : (lesson ?? selectedLesson);
        const chooseLesson = !exercise && !targetLesson;
        if (chooseLesson && allLessons.length === 0) {
            toast.info(
                t(
                    'Buat pelajaran terlebih dahulu sebelum menambahkan latihan.',
                ),
            );
            return;
        }
        setModal({
            title: exercise ? 'Ubah latihan' : 'Tambah latihan',
            description: chooseLesson
                ? 'Pilih pelajaran untuk latihan ini, lalu tambahkan soal dan kunci jawaban.'
                : 'Beri judul latihan sebelum menambahkan soal dan kunci jawaban.',
            url: exercise
                ? `/admin/exercises/${exercise.id}`
                : '/admin/exercises',
            method: exercise ? 'put' : 'post',
            fields: [
                titleField,
                ...(exercise
                    ? [
                          {
                              name: 'kind',
                              label: 'Jenis aktivitas',
                              type: 'select' as const,
                              required: true,
                              options: [
                                  {
                                      value: 'practice',
                                      label: 'Latihan dengan pembahasan',
                                  },
                                  { value: 'quiz', label: 'Kuis evaluasi' },
                              ],
                              hint: 'Kuis dapat diberi batas waktu, nilai lulus, dan batas percobaan.',
                          },
                      ]
                    : []),
                {
                    name: 'time_limit_minutes',
                    label: 'Batas waktu (menit, opsional)',
                    type: 'number',
                    hint: 'Kosongkan jika kuis tidak dibatasi waktu.',
                },
                {
                    name: 'pass_percentage',
                    label: 'Nilai minimum lulus (%)',
                    type: 'number',
                    required: true,
                },
                {
                    name: 'attempt_limit',
                    label: 'Batas percobaan (opsional)',
                    type: 'number',
                    hint: 'Kosongkan agar pelajar bebas mengulang.',
                },
                ...(chooseLesson
                    ? [
                          {
                              name: 'lesson_id',
                              label: 'Pelajaran tujuan',
                              type: 'select' as const,
                              required: true,
                              options: allLessons.map((item) => ({
                                  value: String(item.id),
                                  label: `${item.pathTitle} / ${item.unitTitle} / ${item.title}`,
                              })),
                          },
                      ]
                    : []),
                positionField,
            ],
            values: exercise
                ? {
                      title: exercise.title,
                      kind: exercise.kind ?? 'practice',
                      time_limit_minutes: exercise.time_limit_minutes ?? '',
                      pass_percentage: exercise.pass_percentage ?? 70,
                      attempt_limit: exercise.attempt_limit ?? '',
                      position: exercise.position,
                  }
                : {
                      kind: 'practice',
                      pass_percentage: 70,
                      position: targetLesson?.exercises?.length ?? 0,
                      ...(chooseLesson && allLessons[0]
                          ? { lesson_id: String(allLessons[0].id) }
                          : {}),
                  },
            hidden: exercise
                ? {}
                : {
                      kind: 'practice',
                      ...(targetLesson ? { lesson_id: targetLesson.id } : {}),
                  },
        });
    };

    const openQuestion = (exercise: Exercise, question?: Question) => {
        if (
            exercise.kind === 'quiz' &&
            (!question || question.type === 'multiple_choice')
        ) {
            const lesson =
                allLessons.find((item) =>
                    item.exercises?.some(
                        (activity) => activity.id === exercise.id,
                    ),
                ) ?? exercise.lesson;
            const lessonDetails = lesson as
                | (Lesson & { pathTitle?: string; unitTitle?: string })
                | undefined;
            setQuizQuestionModal({
                exercise,
                question,
                pathTitle:
                    lessonDetails?.pathTitle ??
                    (exercise as AdminExerciseItem).pathTitle ??
                    '',
                unitTitle:
                    lessonDetails?.unitTitle ??
                    lessonDetails?.unit?.title ??
                    '',
                lessonTitle: lessonDetails?.title ?? '',
            });
            return;
        }

        const activityType = exercise.kind === 'quiz' ? 'kuis' : 'latihan';
        setModal({
            title: question
                ? `Ubah soal ${activityType}`
                : `Tambah soal ${activityType}`,
            description:
                exercise.kind === 'quiz'
                    ? `${t('Soal untuk')} ${exercise.title}. ${t('Pilih format soal dan lengkapi pilihan serta kunci jawabannya.')}`
                    : `${t('Soal latihan untuk')} ${exercise.title}. ${t('Pilih format soal; kolom akan menyesuaikan dengan jenis yang dipilih.')}`,
            url: question
                ? `/admin/questions/${question.id}`
                : '/admin/questions',
            method: question ? 'put' : 'post',
            fields: questionFieldsForType(question?.type ?? 'multiple_choice'),
            questionForm: true,
            values: question
                ? {
                      type: question.type,
                      prompt: question.prompt,
                      options: (question.options ?? []).join('\n'),
                      answer: question.answer?.value ?? '',
                      explanation: question.explanation ?? '',
                      audio_path: question.audio_path ?? '',
                      position: question.position,
                  }
                : {
                      type: 'multiple_choice',
                      position: exercise.questions?.length ?? 0,
                  },
            hidden: question ? {} : { exercise_id: exercise.id },
        });
    };

    const openQuizBuilder = (lesson?: Lesson) => {
        if (allLessons.length === 0) {
            toast.info(
                t('Tambahkan pelajaran terlebih dahulu sebelum membuat kuis.'),
            );
            return;
        }
        setQuizBuilderLessonId(lesson?.id ?? null);
        setQuizBuilderOpen(true);
    };

    return { openExercise, openQuestion, openQuizBuilder };
}
