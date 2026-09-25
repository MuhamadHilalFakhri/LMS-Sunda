export type Block = {
    id: number;
    type: string;
    title: string | null;
    body: string | null;
    latin: string | null;
    sundanese: string | null;
    translation: string | null;
    region: string | null;
    register: string | null;
    context: string | null;
    audio_path: string | null;
    position: number;
};
export type Question = {
    id: number;
    type: string;
    prompt: string;
    options: string[] | null;
    audio_path?: string | null;
    answer?: { value: string };
    explanation?: string;
    position: number;
};
export type Exercise = {
    id: number;
    title: string;
    position: number;
    kind?: "practice" | "quiz";
    time_limit_minutes?: number | null;
    pass_percentage?: number;
    attempt_limit?: number | null;
    questions?: Question[];
    lesson?: Lesson;
};
export type Lesson = {
    id: number;
    title: string;
    summary: string | null;
    youtube_url?: string | null;
    status: string;
    position: number;
    blocks?: Block[];
    exercises?: Exercise[];
    unit?: Unit;
};
export type Unit = {
    id: number;
    title: string;
    description: string | null;
    status: string;
    position: number;
    lessons?: Lesson[];
    path?: LearningPath;
};
export type LearningPath = {
    id: number;
    slug: string;
    title: string;
    description: string | null;
    status: string;
    position: number;
    units?: Unit[];
};
export const pathUrl = (path: LearningPath | number) =>
    typeof path === 'number' ? `/kelas/${path}` : `/belajar/${path.slug}`;
export const lessonUrl = (lesson: Lesson | number) =>
    `/pelajaran/${typeof lesson === 'number' ? lesson : lesson.id}`;
export const moduleUrl = (unit: Unit | number, lessonId?: number) => {
    const id = typeof unit === 'number' ? unit : unit.id;
    return `/modul/${id}${lessonId ? `?lesson=${lessonId}` : ""}`;
};
