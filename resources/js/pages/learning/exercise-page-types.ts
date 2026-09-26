import type { Exercise, Question } from '@/types/learning';

export type ExercisePageData = Exercise & {
    questions: Question[];
    time_limit_minutes: number | null;
    pass_percentage: number;
    attempt_limit: number | null;
    attempts_used: number;
    attempts_remaining: number | null;
    started_at: number | null;
};
