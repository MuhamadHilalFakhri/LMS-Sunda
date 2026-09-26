import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import type {
    AdminBlockItem,
    AdminExerciseItem,
    AdminPageProps,
    AudioBlock,
    DeleteConfig,
    FormConfig,
    QuizQuestionModalConfig,
    Section,
} from '@/pages/admin/types';

export function useAdminPageState({
    paths,
    collectionItems,
    collectionPagination,
    mediaCounts,
    audioBlockOptions,
    users,
    usersPagination,
    viewerId,
    analytics,
    tutorSettings,
    feedback,
    feedbackPagination,
    feedbackStats,
    learnerCount,
}: AdminPageProps) {
    const { url } = usePage();
    const currentParams = new URLSearchParams(url.split('?')[1] ?? '');
    const section = (currentParams.get('section') ?? 'overview') as Section;
    const pathSlug = currentParams.get('path');
    const currentQuery = currentParams.get('q') ?? '';
    const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
    const [selectedLessonId, setSelectedLessonId] = useState<number | null>(
        null,
    );
    const [query, setQuery] = useState(currentQuery);
    const [lessonQuery, setLessonQuery] = useState('');
    const [lessonPage, setLessonPage] = useState(1);
    const mediaView: 'missing' | 'uploaded' =
        currentParams.get('media_view') === 'missing' ? 'missing' : 'uploaded';
    const [statusFilter, setStatusFilter] = useState('all');
    const [modal, setModal] = useState<FormConfig | null>(null);
    const [quizBuilderOpen, setQuizBuilderOpen] = useState(false);
    const [quizBuilderLessonId, setQuizBuilderLessonId] = useState<
        number | null
    >(null);
    const [quizQuestionModal, setQuizQuestionModal] =
        useState<QuizQuestionModalConfig | null>(null);
    const [audioModalTarget, setAudioModalTarget] = useState<
        AudioBlock | null | undefined
    >(undefined);
    const [deleting, setDeleting] = useState<DeleteConfig | null>(null);
    const filteredPaths = paths.filter(
        (path) =>
            path.title
                .toLocaleLowerCase('id')
                .includes(query.toLocaleLowerCase('id')) &&
            (statusFilter === 'all' || path.status === statusFilter),
    );
    const selectedPath =
        filteredPaths.find((path) => path.slug === pathSlug) ??
        filteredPaths[0];
    const selectedUnit =
        selectedPath?.units?.find((unit) => unit.id === selectedUnitId) ??
        selectedPath?.units?.[0];
    const lessonPageSize = 8;
    const matchingUnitLessons = (selectedUnit?.lessons ?? []).filter((lesson) =>
        `${lesson.title} ${lesson.summary ?? ''}`
            .toLocaleLowerCase('id')
            .includes(lessonQuery.toLocaleLowerCase('id')),
    );
    const visibleUnitLessons = matchingUnitLessons.slice(
        (lessonPage - 1) * lessonPageSize,
        lessonPage * lessonPageSize,
    );
    const selectedLesson = lessonQuery
        ? (matchingUnitLessons.find(
              (lesson) => lesson.id === selectedLessonId,
          ) ?? visibleUnitLessons[0])
        : (visibleUnitLessons.find(
              (lesson) => lesson.id === selectedLessonId,
          ) ??
          visibleUnitLessons[0] ??
          selectedUnit?.lessons?.[0]);
    const allLessons = paths.flatMap((path) =>
        (path.units ?? []).flatMap((unit) =>
            (unit.lessons ?? []).map((lesson) => ({
                ...lesson,
                unitTitle: unit.title,
                pathTitle: path.title,
                pathSlug: path.slug,
            })),
        ),
    );
    const pagedBlocks = collectionItems.filter(
        (item): item is AdminBlockItem => 'type' in item,
    );
    const pagedExercises = collectionItems.filter(
        (item): item is AdminExerciseItem => !('type' in item),
    );
    const characterBlocks = pagedBlocks;
    const vocabularyBlocks = pagedBlocks;
    const filteredExercises = pagedExercises;
    const mediaBlocks = mediaView === 'uploaded' ? pagedBlocks : [];
    const missingAudioBlocks = mediaView === 'missing' ? pagedBlocks : [];
    const visibleVocabularyBlocks = pagedBlocks;
    const visibleCharacterBlocks = pagedBlocks;
    const visibleExercises = pagedExercises;
    const visibleMediaBlocks = mediaBlocks;
    const visibleMissingAudioBlocks = missingAudioBlocks;
    useEffect(() => setQuery(currentQuery), [url]);
    useEffect(() => {
        setLessonPage(1);
    }, [selectedUnit?.id, lessonQuery]);
    const scriptLesson = allLessons.find(
        (lesson) => lesson.pathSlug === 'aksara-sunda',
    );
    return {
        paths,
        collectionItems,
        collectionPagination,
        mediaCounts,
        audioBlockOptions,
        users,
        usersPagination,
        viewerId,
        analytics,
        tutorSettings,
        feedback,
        feedbackPagination,
        feedbackStats,
        learnerCount,
        url,
        currentParams,
        section,
        pathSlug,
        currentQuery,
        selectedUnitId,
        setSelectedUnitId,
        selectedLessonId,
        setSelectedLessonId,
        query,
        setQuery,
        lessonQuery,
        setLessonQuery,
        lessonPage,
        setLessonPage,
        mediaView,
        statusFilter,
        setStatusFilter,
        modal,
        setModal,
        quizBuilderOpen,
        setQuizBuilderOpen,
        quizBuilderLessonId,
        setQuizBuilderLessonId,
        quizQuestionModal,
        setQuizQuestionModal,
        audioModalTarget,
        setAudioModalTarget,
        deleting,
        setDeleting,
        filteredPaths,
        selectedPath,
        selectedUnit,
        lessonPageSize,
        matchingUnitLessons,
        visibleUnitLessons,
        selectedLesson,
        allLessons,
        pagedBlocks,
        pagedExercises,
        characterBlocks,
        vocabularyBlocks,
        filteredExercises,
        mediaBlocks,
        missingAudioBlocks,
        visibleVocabularyBlocks,
        visibleCharacterBlocks,
        visibleExercises,
        visibleMediaBlocks,
        visibleMissingAudioBlocks,
        scriptLesson,
    };
}

export type AdminPageState = ReturnType<typeof useAdminPageState>;
