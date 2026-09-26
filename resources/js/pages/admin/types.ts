import type {
    Block,
    Exercise,
    LearningPath,
    Lesson,
    Question,
} from '@/types/learning';
import type { PaginationMeta } from '@/components/pagination-controls';

export type AdminUser = {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'pelajar';
    is_active: boolean;
    email_verified_at: string | null;
    completed: number;
    attempts: number;
    created_at: string;
    is_self: boolean;
};

export type Analytics = {
    learners: number;
    activeLearners: number;
    completedLessons: number;
    attempts: number;
    averageAccuracy: number;
    tutorMessages: number;
    pathCompletions: {
        id: number;
        title: string;
        completions: number | string;
    }[];
    hardestExercises: {
        id: number;
        title: string;
        lesson_title: string;
        attempts: number | string;
        accuracy: number;
    }[];
};

export type TutorSettings = {
    apiUrl: string;
    model: string;
    enabled: boolean;
    responseLanguage: 'user' | 'id' | 'su';
    responseStyle: 'warm' | 'concise' | 'step_by_step';
    maxTokens: number;
    hasApiKey: boolean;
    keySource: 'database' | 'environment' | 'none';
    messagesToday: number;
    tokensToday: number;
};

export type FeedbackItem = {
    id: number;
    category: 'content' | 'bug' | 'idea' | 'other';
    message: string;
    page: string | null;
    status: 'new' | 'reviewing' | 'resolved';
    created_at: string;
    learner_name: string;
    learner_email: string;
};

export type AdminBlockItem = Block & {
    lesson_id: number;
    lessonTitle: string;
    pathTitle: string;
};

export type AdminExerciseItem = Exercise & {
    lesson_id: number;
    lessonTitle: string;
    pathTitle: string;
};

export type Field = {
    name: string;
    label: string;
    type?:
        | 'textarea'
        | 'select'
        | 'number'
        | 'file'
        | 'url'
        | 'email'
        | 'password';
    options?: { value: string; label: string }[];
    required?: boolean;
    hint?: string;
    placeholder?: string;
};

export type FormValue = string | number | string[] | File | null;

export type FormConfig = {
    title: string;
    description: string;
    url: string;
    method?: 'post' | 'put';
    fields: Field[];
    values?: Record<string, FormValue>;
    hidden?: Record<string, FormValue>;
    questionForm?: boolean;
    silentSuccess?: boolean;
    submitLabel?: string;
    successMessage?: string;
};

export type DeleteConfig = {
    type: string;
    id: number;
    label: string;
    description?: string;
    successMessage?: string;
};

export type AudioBlock = Block & { lessonTitle: string; pathTitle: string };

export type AudioLesson = Lesson & { unitTitle: string; pathTitle: string };

export type Section =
    | 'overview'
    | 'paths'
    | 'vocabulary'
    | 'characters'
    | 'exercises'
    | 'media'
    | 'learners'
    | 'analytics'
    | 'tutor'
    | 'feedback';

export type QuizLessonChoice = {
    id: number;
    title: string;
    unitTitle: string;
    pathTitle: string;
    pathSlug: string;
};

export type QuizQuestionDraft = {
    key: string;
    type: 'multiple_choice' | 'listening';
    prompt: string;
    options: string[];
    answerIndex: number;
    explanation: string;
    audio: File | null;
};

export type QuizQuestionModalConfig = {
    exercise: Exercise;
    question?: Question;
    pathTitle: string;
    unitTitle: string;
    lessonTitle: string;
};
export type AdminPageProps = {
    paths: LearningPath[];
    collectionItems: Array<AdminBlockItem | AdminExerciseItem>;
    collectionPagination: PaginationMeta;
    mediaCounts: { uploaded: number; missing: number };
    audioBlockOptions: AudioBlock[];
    users: AdminUser[];
    usersPagination: PaginationMeta;
    viewerId: number;
    analytics: Analytics;
    tutorSettings: TutorSettings;
    feedback: FeedbackItem[];
    feedbackPagination: PaginationMeta;
    feedbackStats: { new: number; reviewing: number; resolved: number };
    learnerCount: number;
};
