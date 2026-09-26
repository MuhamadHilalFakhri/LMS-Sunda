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
import type { QuizQuestionModalConfig } from '@/pages/admin/types';

type Props = {
    target: QuizQuestionModalConfig;
    type: 'multiple_choice' | 'listening';
    setType: Dispatch<SetStateAction<'multiple_choice' | 'listening'>>;
    audio: File | null;
    setAudio: Dispatch<SetStateAction<File | null>>;
    prompt: string;
    setPrompt: Dispatch<SetStateAction<string>>;
    options: string[];
    setOptions: Dispatch<SetStateAction<string[]>>;
    answerIndex: number;
    setAnswerIndex: Dispatch<SetStateAction<number>>;
    explanation: string;
    setExplanation: Dispatch<SetStateAction<string>>;
    errors: Record<string, string>;
};

export function QuizQuestionFields({
    target,
    type,
    setType,
    audio,
    setAudio,
    prompt,
    setPrompt,
    options,
    setOptions,
    answerIndex,
    setAnswerIndex,
    explanation,
    setExplanation,
    errors,
}: Props) {
    return (
        <section className="space-y-4 rounded-2xl border bg-card p-4">
            <h2 className="text-sm font-bold">
                {t('Pertanyaan')}{' '}
                {target.question
                    ? ''
                    : (target.exercise.questions?.length ?? 0) + 1}
            </h2>
            <div>
                <label htmlFor="quiz-question-type" className="field-label">
                    {t('Jenis soal')}
                </label>
                <Select
                    value={type}
                    onValueChange={(value: 'multiple_choice' | 'listening') =>
                        setType(value)
                    }
                >
                    <SelectTrigger
                        id="quiz-question-type"
                        className="h-11 w-full bg-card"
                    >
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="multiple_choice">
                            {t('Pilihan ganda')}
                        </SelectItem>
                        <SelectItem value="listening">
                            {t('Menyimak audio')}
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {type === 'listening' && (
                <div className="space-y-2">
                    <label
                        htmlFor="quiz-question-audio"
                        className="field-label"
                    >
                        {t('Audio yang didengarkan')}
                    </label>
                    <Input
                        id="quiz-question-audio"
                        type="file"
                        accept=".mp3,.wav,.ogg,.m4a,.webm,audio/*"
                        required={!audio && !target.question?.audio_path}
                        className="h-auto min-h-11 py-2"
                        onChange={(event) =>
                            setAudio(event.target.files?.[0] ?? null)
                        }
                    />
                    <p className="text-xs text-muted-foreground">
                        {t(
                            'Unggah kalimat Bahasa Sunda yang ingin ditebak pelajar. Maksimum 10 MB.',
                        )}
                    </p>
                    {target.question?.audio_path && (
                        <audio
                            controls
                            preload="none"
                            src={`/storage/${target.question.audio_path}`}
                            className="h-10 w-full max-w-sm"
                        />
                    )}
                    {errors.audio && (
                        <p role="alert" className="text-xs text-[#b42335]">
                            {errors.audio}
                        </p>
                    )}
                </div>
            )}
            <div>
                <label htmlFor="quiz-question-prompt" className="field-label">
                    {t(
                        type === 'listening'
                            ? 'Pertanyaan setelah audio'
                            : 'Pertanyaan',
                    )}
                </label>
                <textarea
                    id="quiz-question-prompt"
                    required
                    maxLength={2000}
                    className="field min-h-20 resize-y"
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    placeholder={t(
                        type === 'listening'
                            ? 'Contoh: Kalimat Sunda apa yang Anda dengar?'
                            : 'Contoh: Apa arti kata ‘punten’?',
                    )}
                />
                {errors.prompt && (
                    <p role="alert" className="mt-1 text-xs text-[#b42335]">
                        {errors.prompt}
                    </p>
                )}
            </div>
            <fieldset className="space-y-2">
                <legend className="field-label">{t('Pilihan jawaban')}</legend>
                <p className="-mt-1 text-xs text-muted-foreground">
                    {t('Pilih radio button untuk menandai jawaban yang benar')}
                </p>
                {options.map((option, optionIndex) => {
                    const letter = String.fromCharCode(65 + optionIndex);
                    const optionError = errors[`options.${optionIndex}`];
                    return (
                        <div key={letter} className="space-y-1">
                            <div className="flex items-center gap-3">
                                <input
                                    type="radio"
                                    name="quiz-correct-answer"
                                    checked={answerIndex === optionIndex}
                                    onChange={() => setAnswerIndex(optionIndex)}
                                    aria-label={`${t('Tandai pilihan')} ${letter} ${t('sebagai jawaban benar')}`}
                                    className="size-4 accent-[#493ee5]"
                                />
                                <span className="w-5 text-xs font-bold text-muted-foreground">
                                    {letter}.
                                </span>
                                <Input
                                    aria-label={`${t('Pilihan')} ${letter}`}
                                    required
                                    maxLength={255}
                                    value={option}
                                    onChange={(event) =>
                                        setOptions((current) =>
                                            current.map((value, index) =>
                                                index === optionIndex
                                                    ? event.target.value
                                                    : value,
                                            ),
                                        )
                                    }
                                    placeholder={t('Contoh: Permisi')}
                                />
                            </div>
                            {optionError && (
                                <p
                                    role="alert"
                                    className="ml-11 text-xs text-[#b42335]"
                                >
                                    {optionError}
                                </p>
                            )}
                        </div>
                    );
                })}
                {errors.options && (
                    <p role="alert" className="text-xs text-[#b42335]">
                        {errors.options}
                    </p>
                )}
            </fieldset>
            <div>
                <label
                    htmlFor="quiz-question-explanation"
                    className="field-label"
                >
                    {t('Pembahasan untuk pelajar')}
                </label>
                <textarea
                    id="quiz-question-explanation"
                    required
                    maxLength={2000}
                    className="field min-h-16 resize-y"
                    value={explanation}
                    onChange={(event) => setExplanation(event.target.value)}
                    placeholder={t(
                        'Contoh: ‘Punten’ dipakai saat meminta izin dengan sopan.',
                    )}
                />
                {errors.explanation && (
                    <p role="alert" className="mt-1 text-xs text-[#b42335]">
                        {errors.explanation}
                    </p>
                )}
            </div>
        </section>
    );
}
