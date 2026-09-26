import { t } from '@/lib/ui-language';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { Dispatch, SetStateAction } from 'react';
import type { QuizLessonChoice } from '@/pages/admin/types';

type Props = {
    title: string;
    setTitle: Dispatch<SetStateAction<string>>;
    clearError: (key: string) => void;
    errorFor: (key: string) => string | undefined;
    subjects: { slug: string; title: string }[];
    pathSlug: string;
    setPathSlug: Dispatch<SetStateAction<string>>;
    lessons: QuizLessonChoice[];
    lessonsInPath: QuizLessonChoice[];
    unitTitle: string;
    setUnitTitle: Dispatch<SetStateAction<string>>;
    setLessonId: Dispatch<SetStateAction<string>>;
    lessonId: string;
    lessonsInUnit: QuizLessonChoice[];
    duration: string;
    setDuration: Dispatch<SetStateAction<string>>;
};

export function QuizBasicFields({
    title,
    setTitle,
    clearError,
    errorFor,
    subjects,
    pathSlug,
    setPathSlug,
    lessons,
    lessonsInPath,
    unitTitle,
    setUnitTitle,
    setLessonId,
    lessonId,
    lessonsInUnit,
    duration,
    setDuration,
}: Props) {
    const units = Array.from(
        new Set(lessonsInPath.map((lesson) => lesson.unitTitle)),
    );
    return (
        <>
            <div>
                <h2 className="text-sm font-bold">{t('Informasi kuis')}</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                    {t(
                        'Pilih kelas dan materi yang akan menjadi sumber evaluasi.',
                    )}
                </p>
            </div>
            <div>
                <label htmlFor="quiz-title" className="field-label">
                    {t('Judul kuis')}
                </label>
                <Input
                    id="quiz-title"
                    required
                    maxLength={160}
                    value={title}
                    onChange={(event) => {
                        setTitle(event.target.value);
                        clearError('title');
                    }}
                    placeholder={t('Contoh: Kuis kosakata sapaan')}
                />
                {errorFor('title') && (
                    <p role="alert" className="mt-1 text-xs text-[#b42335]">
                        {errorFor('title')}
                    </p>
                )}
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
                <div>
                    <label htmlFor="quiz-subject" className="field-label">
                        {t('Mata pelajaran')}
                    </label>
                    <Select
                        value={pathSlug}
                        onValueChange={(value) => {
                            setPathSlug(value);
                            const nextLessons = lessons.filter(
                                (lesson) => lesson.pathSlug === value,
                            );
                            const nextUnit =
                                Array.from(
                                    new Set(
                                        nextLessons.map(
                                            (lesson) => lesson.unitTitle,
                                        ),
                                    ),
                                )[0] ?? '';
                            setUnitTitle(nextUnit);
                            setLessonId(
                                String(
                                    nextLessons.find(
                                        (lesson) =>
                                            lesson.unitTitle === nextUnit,
                                    )?.id ?? '',
                                ),
                            );
                        }}
                    >
                        <SelectTrigger
                            id="quiz-subject"
                            className="h-11 w-full bg-card"
                        >
                            <SelectValue
                                placeholder={t('Pilih mata pelajaran')}
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {subjects.map((subject) => (
                                <SelectItem
                                    key={subject.slug}
                                    value={subject.slug}
                                >
                                    {subject.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <label htmlFor="quiz-unit" className="field-label">
                        {t('Kelas / unit')}
                    </label>
                    <Select
                        value={unitTitle}
                        onValueChange={(value) => {
                            setUnitTitle(value);
                            setLessonId(
                                String(
                                    lessonsInPath.find(
                                        (lesson) => lesson.unitTitle === value,
                                    )?.id ?? '',
                                ),
                            );
                        }}
                    >
                        <SelectTrigger
                            id="quiz-unit"
                            className="h-11 w-full bg-card"
                        >
                            <SelectValue
                                placeholder={t('Pilih kelas / unit')}
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {units.map((unit) => (
                                <SelectItem key={unit} value={unit}>
                                    {unit}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <label htmlFor="quiz-duration" className="field-label">
                        {t('Durasi (menit)')}
                    </label>
                    <Input
                        id="quiz-duration"
                        required
                        type="number"
                        min={1}
                        max={180}
                        value={duration}
                        onChange={(event) => {
                            setDuration(event.target.value);
                            clearError('time_limit_minutes');
                        }}
                        placeholder="30"
                    />
                    <p className="mt-1 text-[11px] text-muted-foreground">
                        {t('Contoh: 30 menit untuk kuis singkat.')}
                    </p>
                    {errorFor('time_limit_minutes') && (
                        <p role="alert" className="mt-1 text-xs text-[#b42335]">
                            {errorFor('time_limit_minutes')}
                        </p>
                    )}
                </div>
            </div>
            <div>
                <label htmlFor="quiz-lesson" className="field-label">
                    {t('Pelajaran tujuan')}
                </label>
                <Select
                    value={lessonId}
                    onValueChange={(value) => {
                        setLessonId(value);
                        clearError('lesson_id');
                    }}
                >
                    <SelectTrigger
                        id="quiz-lesson"
                        className="h-11 w-full bg-card"
                    >
                        <SelectValue placeholder={t('Pilih pelajaran')} />
                    </SelectTrigger>
                    <SelectContent>
                        {lessonsInUnit.map((lesson) => (
                            <SelectItem
                                key={lesson.id}
                                value={String(lesson.id)}
                            >
                                {lesson.title}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errorFor('lesson_id') && (
                    <p role="alert" className="mt-1 text-xs text-[#b42335]">
                        {errorFor('lesson_id')}
                    </p>
                )}
            </div>
        </>
    );
}
