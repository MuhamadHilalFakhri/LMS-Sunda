import { t } from "@/lib/ui-language";
import { Head, Link, router, usePage } from "@inertiajs/react";
import {
    Activity,
    ArrowRight,
    AudioLines,
    Bot,
    BookOpen,
    CaseSensitive,
    ChartNoAxesCombined,
    CheckCircle2,
    ChevronRight,
    CircleHelp,
    FileQuestion,
    FileText,
    LibraryBig,
    ListFilter,
    MessageSquareWarning,
    Mic,
    Pencil,
    Plus,
    Save,
    Search,
    ShieldCheck,
    Square,
    Trash2,
    Users,
    Upload,
    Volume2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import AdminPathArtwork from "@/components/admin-path-artwork";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PaginationControls, { type PaginationMeta } from "@/components/pagination-controls";
import type { Block, Exercise, LearningPath, Lesson, Question, Unit } from "@/types/learning";

type Learner = {
    id: number;
    name: string;
    email: string;
    completed: number;
    attempts: number;
};
type Analytics = {
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
type TutorSettings = {
    apiUrl: string;
    model: string;
    enabled: boolean;
    responseLanguage: "user" | "id" | "su";
    responseStyle: "warm" | "concise" | "step_by_step";
    maxTokens: number;
    hasApiKey: boolean;
    keySource: "database" | "environment" | "none";
    messagesToday: number;
    tokensToday: number;
};
type FeedbackItem = {
    id: number;
    category: "content" | "bug" | "idea" | "other";
    message: string;
    page: string | null;
    status: "new" | "reviewing" | "resolved";
    created_at: string;
    learner_name: string;
    learner_email: string;
};
type AdminBlockItem = Block & { lesson_id: number; lessonTitle: string; pathTitle: string };
type AdminExerciseItem = Exercise & { lesson_id: number; lessonTitle: string; pathTitle: string };
type Field = {
    name: string;
    label: string;
    type?: "textarea" | "select" | "number" | "file";
    options?: { value: string; label: string }[];
    required?: boolean;
    hint?: string;
    placeholder?: string;
};
type FormValue = string | number | string[] | File | null;
type FormConfig = {
    title: string;
    description: string;
    url: string;
    method?: "post" | "put";
    fields: Field[];
    values?: Record<string, FormValue>;
    hidden?: Record<string, FormValue>;
    questionForm?: boolean;
    submitLabel?: string;
    successMessage?: string;
};
type DeleteConfig = { type: string; id: number; label: string };
type AudioBlock = Block & { lessonTitle: string; pathTitle: string };
type AudioLesson = Lesson & { unitTitle: string; pathTitle: string };
type Section = "overview" | "paths" | "vocabulary" | "characters" | "exercises" | "media" | "learners" | "analytics" | "tutor" | "feedback";

const statuses = [
    { value: "draft", label: "Draf" },
    { value: "review", label: "Ditinjau" },
    { value: "published", label: "Terbit" },
    { value: "archived", label: "Diarsipkan" },
];
const blockTypes = [
    { value: "text", label: "Penjelasan" },
    { value: "vocabulary", label: "Kosakata" },
    { value: "dialogue", label: "Dialog" },
    { value: "script", label: "Aksara Sunda" },
];
const questionTypes = [
    { value: "multiple_choice", label: "Pilihan ganda" },
    { value: "listening", label: "Menyimak audio" },
    { value: "matching", label: "Mencocokkan" },
    { value: "fill_blank", label: "Melengkapi teks" },
    { value: "ordering", label: "Susun urutan" },
    { value: "script", label: "Pilih aksara" },
];
const titleField: Field = { name: "title", label: "Judul", required: true };
const positionField: Field = {
    name: "position",
    label: "Urutan tampil",
    type: "number",
    hint: "Angka yang lebih kecil tampil lebih dulu.",
};
const statusField: Field = {
    name: "status",
    label: "Status konten",
    type: "select",
    options: statuses,
};
const blockFields: Field[] = [
    { name: "type", label: "Jenis blok", type: "select", options: blockTypes },
    { name: "title", label: "Judul blok" },
    { name: "body", label: "Isi materi", type: "textarea" },
    { name: "latin", label: "Tulisan Latin" },
    { name: "sundanese", label: "Aksara Sunda (Unicode)" },
    { name: "translation", label: "Arti Bahasa Indonesia", type: "textarea" },
    { name: "region", label: "Ragam wilayah" },
    { name: "register", label: "Tingkat tutur" },
    { name: "context", label: "Konteks pemakaian", type: "textarea" },
    {
        name: "audio",
        label: "Audio pelafalan",
        type: "file",
        hint: "MP3, WAV, OGG, M4A, atau WEBM. Maksimum 10 MB.",
    },
    positionField,
];
function questionFieldsForType(type: string): Field[] {
    const prompts: Record<string, { hint: string; placeholder: string }> = {
        multiple_choice: {
            hint: "Tuliskan pertanyaan yang memiliki satu jawaban paling tepat.",
            placeholder: "Contoh: Apa arti kata ‘punten’?",
        },
        listening: {
            hint: "Unggah rekaman Bahasa Sunda, lalu tulis apa yang perlu dikenali dari audio.",
            placeholder: "Contoh: Kalimat Sunda apa yang Anda dengar?",
        },
        matching: {
            hint: "Jelaskan pasangan yang harus dicari pelajar.",
            placeholder: "Contoh: Pasangkan bunyi ‘ka’ dengan aksara yang benar.",
        },
        fill_blank: {
            hint: "Tulis kalimat dengan bagian kosong, gunakan ___ sebagai penanda.",
            placeholder: "Contoh: Lengkapi: Abdi ___ ka sakola.",
        },
        ordering: {
            hint: "Jelaskan bagian apa yang perlu disusun dan hasil urutannya.",
            placeholder: "Contoh: Susun kata berikut menjadi salam yang benar.",
        },
        script: {
            hint: "Minta pelajar mengetik atau menyusun jawaban dalam Aksara Sunda.",
            placeholder: "Contoh: Tuliskan aksara Sunda untuk bunyi ‘ka’.",
        },
    };
    const answers: Record<string, { hint: string; placeholder: string }> = {
        multiple_choice: {
            hint: "Isi dengan teks salah satu pilihan secara persis. Contoh: Permisi.",
            placeholder: "Contoh: Permisi",
        },
        listening: {
            hint: "Isi dengan teks salah satu pilihan secara persis. Contoh: Wilujeng enjing.",
            placeholder: "Contoh: Wilujeng enjing",
        },
        matching: {
            hint: "Isi dengan satu pilihan pasangan secara persis, termasuk tanda pemisahnya.",
            placeholder: "Contoh: ᮊ — ka",
        },
        fill_blank: {
            hint: "Isi hanya bagian yang menggantikan tanda ___ pada soal.",
            placeholder: "Contoh: badé",
        },
        ordering: {
            hint: "Tuliskan bagian-bagian dalam urutan benar, pisahkan dengan spasi.",
            placeholder: "Contoh: Wilujeng enjing",
        },
        script: {
            hint: "Isi karakter Aksara Sunda yang benar. Contoh: ᮊ untuk bunyi ka.",
            placeholder: "Contoh: ᮊ",
        },
    };
    const explanations: Record<string, { hint: string; placeholder: string }> = {
        multiple_choice: {
            hint: "Jelaskan alasan jawaban benar dan arti pilihan yang ditanyakan.",
            placeholder: "Contoh: ‘Punten’ digunakan untuk meminta izin atau menyela dengan sopan.",
        },
        listening: {
            hint: "Tuliskan transkrip audio dan arti atau petunjuk pelafalannya.",
            placeholder: "Contoh: Ucapan ‘Wilujeng enjing’ berarti selamat pagi.",
        },
        matching: {
            hint: "Jelaskan hubungan antara pasangan yang benar.",
            placeholder: "Contoh: Bunyi ka ditulis menggunakan karakter ᮊ.",
        },
        fill_blank: {
            hint: "Terangkan mengapa kata tersebut melengkapi kalimat.",
            placeholder: "Contoh: ‘Badé’ berarti akan atau ingin melakukan sesuatu.",
        },
        ordering: {
            hint: "Jelaskan susunan yang benar dan makna hasilnya.",
            placeholder: "Contoh: ‘Wilujeng enjing’ berarti selamat pagi.",
        },
        script: {
            hint: "Sebutkan bunyi Latin atau petunjuk bentuk aksaranya.",
            placeholder: "Contoh: Aksara ᮊ dibaca ka.",
        },
    };
    const selectedPrompt = prompts[type] ?? prompts.multiple_choice;
    const selectedAnswer = answers[type] ?? answers.multiple_choice;
    const selectedExplanation = explanations[type] ?? explanations.multiple_choice;
    const fields: Field[] = [
        {
            name: "type",
            label: "Jenis soal",
            type: "select",
            options: questionTypes,
            hint: "Jenis soal menentukan kolom yang tampil dan format jawaban.",
        },
        {
            name: "prompt",
            label: "Instruksi soal",
            required: true,
            type: "textarea",
            hint: selectedPrompt.hint,
            placeholder: selectedPrompt.placeholder,
        },
    ];

    if (["multiple_choice", "matching", "ordering", "listening"].includes(type)) {
        if (type === "listening") {
            fields.push({
                name: "audio",
                label: "Rekaman soal",
                type: "file",
                required: true,
                hint: "Unggah suara kalimat Bahasa Sunda, maksimum 10 MB. Format: MP3, WAV, OGG, M4A, atau WEBM.",
            });
        }
        const options = type === "ordering"
            ? {
                  label: "Bagian yang disusun (satu per baris)",
                  hint: "Isi satu kata atau potongan per baris. Urutan baris boleh diacak.",
                  placeholder: "Wilujeng\nenjing",
              }
              : type === "matching"
              ? {
                    label: "Pilihan pasangan (satu per baris)",
                    hint: "Isi satu pasangan per baris. Jawaban benar harus sama persis dengan salah satu baris.",
                    placeholder: "ᮊ — ka\nᮌ — ga\nᮍ — nga",
                }
              : {
                    label: "Pilihan jawaban",
                    hint: "Isi pilihan pada kolom, lalu tandai radio pada jawaban yang benar.",
                    placeholder: "Contoh: Permisi",
                };
        fields.push({ name: "options", type: "textarea", required: true, ...options });
    }

    fields.push(
        { name: "answer", label: "Jawaban benar", required: true, ...selectedAnswer },
        {
            name: "explanation",
            label: "Penjelasan untuk pelajar",
            required: true,
            type: "textarea",
            ...selectedExplanation,
        },
        { ...positionField, hint: "Angka kecil tampil lebih dulu. Contoh: 0 untuk soal pertama." },
    );

    return fields;
}
const labelStatus = (value: string) => statuses.find((item) => item.value === value)?.label ?? value;
const textValue = (value: FormValue | undefined) => (typeof value === "string" || typeof value === "number" ? `${value}` : "");

function Status({ value }: { value: string }) {
    return (
        <span
            className={`inline-flex items-center rounded border px-2 py-1 text-xs font-semibold ${value === "published" ? "border-[#b3dcc3] bg-[#eff8f2] text-[#17633a] dark:border-[#3c7354] dark:bg-[#1e382b] dark:text-[#b2e7c4]" : value === "review" ? "border-[#e6d9ac] bg-[#faf6e9] text-[#77581a] dark:border-[#766740] dark:bg-[#393326] dark:text-[#f0d58d]" : "border-border bg-secondary text-muted-foreground"}`}
        >
            {t(labelStatus(value))}
        </span>
    );
}

function FormModal({ config, close }: { config: FormConfig | null; close: () => void }) {
    const [values, setValues] = useState<Record<string, FormValue>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);
    const [choiceOptions, setChoiceOptions] = useState<string[]>(["", "", "", ""]);
    const [choiceAnswerIndex, setChoiceAnswerIndex] = useState(0);
    useEffect(() => {
        setValues(config?.values ?? {});
        setErrors({});
        const existingOptions = textValue(config?.values?.options)
            .split("\n")
            .map((option) => option.trim());
        const options = existingOptions.some(Boolean)
            ? existingOptions
            : ["", "", "", ""];
        setChoiceOptions(options);
        const answer = textValue(config?.values?.answer);
        const answerIndex = options.findIndex((option) => option === answer && option !== "");
        setChoiceAnswerIndex(answerIndex >= 0 ? answerIndex : 0);
    }, [config]);
    if (!config) return null;
    const questionType = textValue(values.type) || "multiple_choice";
    const isRadioQuestion = config.questionForm && ["multiple_choice", "listening"].includes(questionType);
    const fields = config.questionForm
        ? questionFieldsForType(textValue(values.type) || "multiple_choice")
        : config.fields;
    const visibleFields = isRadioQuestion
        ? fields.filter((field) => field.name !== "answer")
        : fields;
    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        setProcessing(true);
        setErrors({});
        const data = { ...values, ...config.hidden };
        delete data.audio_path;
        if (isRadioQuestion) {
            data.options = choiceOptions.map((option) => option.trim()).filter(Boolean);
            data.answer = choiceOptions[choiceAnswerIndex]?.trim() ?? "";
        } else if (fields.some((field) => field.name === "options"))
            data.options = textValue(values.options)
                .split("\n")
                .map((option) => option.trim())
                .filter(Boolean);
        else if (config.questionForm) delete data.options;
        const callbacks = {
            preserveScroll: true,
            onError: (messages: Record<string, string>) => setErrors(messages),
            onSuccess: () => {
                close();
                toast.success(t(config.successMessage ?? "Perubahan berhasil disimpan."));
            },
            onFinish: () => setProcessing(false),
        };
        if (fields.some((field) => field.type === "file")) {
            const form = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                if (value instanceof File) form.append(key, value);
                else if (Array.isArray(value)) value.forEach((item, index) => form.append(`${key}[${index}]`, `${item}`));
                else if (value != null) form.append(key, `${value}`);
            });
            if (config.method === "put") form.append("_method", "PUT");
            router.post(config.url, form, {
                ...callbacks,
                forceFormData: true,
            });
        } else router[config.method ?? "post"](config.url, data, callbacks);
    };
    return (
        <Dialog
            open
            onOpenChange={(open) => {
                if (!open && !processing) close();
            }}
        >
            <DialogContent className="max-h-[min(90vh,780px)] overflow-y-auto border-border bg-card sm:max-w-[620px]">
                <DialogHeader className="pr-7 text-left">
                    <DialogTitle className="text-xl">{t(config.title)}</DialogTitle>
                <DialogDescription>{t(config.description)}</DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-5 pt-2">
                    <div className="grid gap-4 sm:grid-cols-2">
                        {visibleFields.map((field) => (
                            <div key={field.name} className={field.type === "textarea" || field.type === "file" || (isRadioQuestion && field.name === "options") ? "sm:col-span-2" : ""}>
                                {isRadioQuestion && field.name === "options" ? (
                                    <fieldset className="space-y-2">
                                        <legend className="field-label">{t(field.label)}</legend>
                                        <p className="-mt-1 text-xs text-muted-foreground">{t("Pilih radio button untuk menandai jawaban yang benar")}</p>
                                        {choiceOptions.map((option, optionIndex) => {
                                            const letter = String.fromCharCode(65 + optionIndex);
                                            const optionError = errors[`options.${optionIndex}`];
                                            return (
                                                <div key={letter} className="space-y-1">
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="radio"
                                                            name="practice-correct-answer"
                                                            checked={choiceAnswerIndex === optionIndex}
                                                            onChange={() => setChoiceAnswerIndex(optionIndex)}
                                                            aria-label={`${t("Tandai pilihan")} ${letter} ${t("sebagai jawaban benar")}`}
                                                            className="size-4 accent-[#493ee5]"
                                                        />
                                                        <span className="w-5 text-xs font-bold text-muted-foreground">{letter}.</span>
                                                        <Input
                                                            aria-label={`${t("Pilihan")} ${letter}`}
                                                            className="h-11 bg-card"
                                                            required
                                                            maxLength={255}
                                                            value={option}
                                                            onChange={(event) => setChoiceOptions((current) => current.map((value, index) => index === optionIndex ? event.target.value : value))}
                                                            placeholder={t("Contoh: Permisi")}
                                                        />
                                                    </div>
                                                    {optionError && <p role="alert" className="ml-11 text-xs text-[#b42335]">{optionError}</p>}
                                                </div>
                                            );
                                        })}
                                        {errors.options && <p role="alert" className="text-xs text-[#b42335]">{errors.options}</p>}
                                        {errors.answer && <p role="alert" className="text-xs text-[#b42335]">{errors.answer}</p>}
                                    </fieldset>
                                ) : (
                                <>
                                <label htmlFor={`edit-${field.name}`} className="field-label">
                                    {t(field.label)}
                                </label>
                                {field.type === "select" ? (
                                    <Select
                                        value={textValue(values[field.name] ?? field.options?.[0]?.value)}
                                        onValueChange={(value) => {
                                            const typeChanged = config.questionForm && field.name === "type" && textValue(values.type) !== value;
                                            if (typeChanged) {
                                                setChoiceOptions(["", "", "", ""]);
                                                setChoiceAnswerIndex(0);
                                            }
                                            setValues((current) => ({
                                                ...current,
                                                [field.name]: value,
                                            ...(typeChanged
                                                    ? { options: "", answer: "", audio: null }
                                                    : {}),
                                            }));
                                        }}
                                    >
                                        <SelectTrigger id={`edit-${field.name}`} className="h-11 w-full bg-card">
                                            <SelectValue placeholder={t("Pilih opsi")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {field.options?.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {t(option.label)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : field.type === "textarea" ? (
                                    <textarea
                                        id={`edit-${field.name}`}
                                        className="field min-h-24 resize-y"
                                        value={textValue(values[field.name])}
                                        placeholder={field.placeholder}
                                        onChange={(event) =>
                                            setValues((current) => ({
                                                ...current,
                                                [field.name]: event.target.value,
                                            }))
                                        }
                                        required={field.required}
                                    />
                                ) : (
                                    <Input
                                        id={`edit-${field.name}`}
                                        className={`h-11 bg-card ${config.questionForm && textValue(values.type) === "script" && field.name === "answer" ? "sunda-script text-xl" : ""}`}
                                        type={field.type === "file" ? "file" : field.type === "number" ? "number" : "text"}
                                        accept={field.type === "file" ? ".mp3,.wav,.ogg,.m4a,.webm" : undefined}
                                        min={field.type === "number" ? 0 : undefined}
                                        placeholder={field.placeholder}
                                        lang={config.questionForm && textValue(values.type) === "script" && field.name === "answer" ? "su" : undefined}
                                        inputMode={config.questionForm && textValue(values.type) === "script" && field.name === "answer" ? "text" : undefined}
                                        required={field.required && !(field.type === "file" && textValue(values.audio_path))}
                                        value={field.type === "file" ? undefined : textValue(values[field.name])}
                                        onChange={(event) =>
                                            setValues((current) => ({
                                                ...current,
                                                [field.name]: field.type === "file" ? (event.target.files?.[0] ?? null) : event.target.value,
                                            }))
                                        }
                                    />
                                )}
                                {field.hint && <p className="mt-1 text-xs text-muted-foreground">{t(field.hint)}</p>}
                                {field.type === "file" && textValue(values.audio_path) && (
                                    <audio controls preload="none" src={`/storage/${textValue(values.audio_path)}`} className="mt-2 h-10 w-full max-w-sm">
                                        {t("Peramban Anda tidak mendukung pemutar audio.")}
                                    </audio>
                                )}
                                {errors[field.name] && (
                                    <p role="alert" className="mt-1 text-sm text-[#b42335]">
                                        {errors[field.name]}
                                    </p>
                                )}
                                </>
                                )}
                            </div>
                        ))}
                    </div>
                    <DialogFooter className="border-t pt-5">
                        <Button type="button" variant="outline" className="min-h-11" onClick={close}>
                            {t("Batal")}
                        </Button>
                        <Button type="submit" className="min-h-11 bg-primary text-primary-foreground hover:bg-primary/90" disabled={processing}>
                            {processing ? t("Menyimpan...") : t(config.submitLabel ?? "Simpan perubahan")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

type QuizLessonChoice = {
    id: number;
    title: string;
    unitTitle: string;
    pathTitle: string;
    pathSlug: string;
};
type QuizQuestionDraft = {
    key: string;
    type: "multiple_choice" | "listening";
    prompt: string;
    options: string[];
    answerIndex: number;
    explanation: string;
    audio: File | null;
};
type QuizQuestionModalConfig = {
    exercise: Exercise;
    question?: Question;
    pathTitle: string;
    unitTitle: string;
    lessonTitle: string;
};

function QuizBuilderModal({ lessons, initialLessonId, close }: { lessons: QuizLessonChoice[]; initialLessonId: number | null; close: () => void }) {
    const subjects = Array.from(new Map(lessons.map((lesson) => [lesson.pathSlug, { slug: lesson.pathSlug, title: lesson.pathTitle }])).values());
    const initialLesson = lessons.find((lesson) => lesson.id === initialLessonId);
    const [pathSlug, setPathSlug] = useState(initialLesson?.pathSlug ?? subjects[0]?.slug ?? "");
    const lessonsInPath = lessons.filter((lesson) => lesson.pathSlug === pathSlug);
    const units = Array.from(new Set(lessonsInPath.map((lesson) => lesson.unitTitle)));
    const [unitTitle, setUnitTitle] = useState(initialLesson?.unitTitle ?? units[0] ?? "");
    const lessonsInUnit = lessonsInPath.filter((lesson) => lesson.unitTitle === unitTitle);
    const [lessonId, setLessonId] = useState(String(initialLesson?.id ?? lessonsInUnit[0]?.id ?? ""));
    const [title, setTitle] = useState("");
    const [duration, setDuration] = useState("30");
    const [passPercentage, setPassPercentage] = useState("70");
    const [attemptLimit, setAttemptLimit] = useState("");
    const [questions, setQuestions] = useState<QuizQuestionDraft[]>([
        { key: "question-1", type: "multiple_choice", prompt: "", options: ["", "", "", ""], answerIndex: 0, explanation: "", audio: null },
    ]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);
    const nextQuestionNumber = useRef(2);

    const errorFor = (key: string) => errors[key];
    const updateQuestion = (key: string, update: Partial<QuizQuestionDraft>) => {
        setQuestions((current) => current.map((question) => question.key === key ? { ...question, ...update } : question));
    };
    const clearError = (key: string) => {
        setErrors((current) => {
            if (!(key in current)) return current;
            const next = { ...current };
            delete next[key];
            return next;
        });
    };
    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        if (processing) return;
        setProcessing(true);
        setErrors({});
        const form = new FormData();
        form.append("title", title.trim());
        form.append("lesson_id", lessonId);
        form.append("time_limit_minutes", duration);
        form.append("pass_percentage", passPercentage);
        if (attemptLimit.trim()) form.append("attempt_limit", attemptLimit.trim());
        questions.forEach((question, questionIndex) => {
            const prefix = `questions[${questionIndex}]`;
            form.append(`${prefix}[type]`, question.type);
            form.append(`${prefix}[prompt]`, question.prompt.trim());
            question.options.forEach((option, optionIndex) => form.append(`${prefix}[options][${optionIndex}]`, option.trim()));
            form.append(`${prefix}[answer_index]`, String(question.answerIndex));
            form.append(`${prefix}[explanation]`, question.explanation.trim());
            if (question.type === "listening" && question.audio) form.append(`${prefix}[audio]`, question.audio);
        });
        router.post("/admin/quizzes", form, {
            preserveScroll: true,
            forceFormData: true,
            onError: (formErrors) => setErrors(formErrors),
            onSuccess: () => {
                close();
                toast.success(t("Kuis dan soal berhasil disimpan."));
            },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <Dialog open onOpenChange={(open) => { if (!open && !processing) close(); }}>
            <DialogContent className="max-h-[min(92dvh,820px)] overflow-y-auto border-border bg-card sm:max-w-[760px]">
                <DialogHeader className="pr-7 text-left">
                    <DialogTitle className="text-xl">{t("Buat kuis")}</DialogTitle>
                    <DialogDescription>{t("Isi informasi kuis, lalu tambahkan soal dan pilih jawaban benar dengan radio.")}</DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-5 pt-2">
                    <section className="space-y-4 rounded-2xl bg-secondary/55 p-4">
                        <div>
                            <h2 className="text-sm font-bold">{t("Informasi kuis")}</h2>
                            <p className="mt-1 text-xs text-muted-foreground">{t("Pilih kelas dan materi yang akan menjadi sumber evaluasi.")}</p>
                        </div>
                        <div>
                            <label htmlFor="quiz-title" className="field-label">{t("Judul kuis")}</label>
                            <Input id="quiz-title" required maxLength={160} value={title} onChange={(event) => { setTitle(event.target.value); clearError("title"); }} placeholder={t("Contoh: Kuis kosakata sapaan")}/>
                            {errorFor("title") && <p role="alert" className="mt-1 text-xs text-[#b42335]">{errorFor("title")}</p>}
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                            <div>
                                <label htmlFor="quiz-subject" className="field-label">{t("Mata pelajaran")}</label>
                                <Select value={pathSlug} onValueChange={(value) => {
                                    setPathSlug(value);
                                    const nextLessons = lessons.filter((lesson) => lesson.pathSlug === value);
                                    const nextUnit = Array.from(new Set(nextLessons.map((lesson) => lesson.unitTitle)))[0] ?? "";
                                    setUnitTitle(nextUnit);
                                    setLessonId(String(nextLessons.find((lesson) => lesson.unitTitle === nextUnit)?.id ?? ""));
                                }}>
                                    <SelectTrigger id="quiz-subject" className="h-11 w-full bg-card"><SelectValue placeholder={t("Pilih mata pelajaran")}/></SelectTrigger>
                                    <SelectContent>{subjects.map((subject) => <SelectItem key={subject.slug} value={subject.slug}>{subject.title}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label htmlFor="quiz-unit" className="field-label">{t("Kelas / unit")}</label>
                                <Select value={unitTitle} onValueChange={(value) => {
                                    setUnitTitle(value);
                                    setLessonId(String(lessonsInPath.find((lesson) => lesson.unitTitle === value)?.id ?? ""));
                                }}>
                                    <SelectTrigger id="quiz-unit" className="h-11 w-full bg-card"><SelectValue placeholder={t("Pilih kelas / unit")}/></SelectTrigger>
                                    <SelectContent>{units.map((unit) => <SelectItem key={unit} value={unit}>{unit}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label htmlFor="quiz-duration" className="field-label">{t("Durasi (menit)")}</label>
                                <Input id="quiz-duration" required type="number" min={1} max={180} value={duration} onChange={(event) => { setDuration(event.target.value); clearError("time_limit_minutes"); }} placeholder="30"/>
                                <p className="mt-1 text-[11px] text-muted-foreground">{t("Contoh: 30 menit untuk kuis singkat.")}</p>
                                {errorFor("time_limit_minutes") && <p role="alert" className="mt-1 text-xs text-[#b42335]">{errorFor("time_limit_minutes")}</p>}
                            </div>
                        </div>
                        <div>
                            <label htmlFor="quiz-lesson" className="field-label">{t("Pelajaran tujuan")}</label>
                            <Select value={lessonId} onValueChange={(value) => { setLessonId(value); clearError("lesson_id"); }}>
                                <SelectTrigger id="quiz-lesson" className="h-11 w-full bg-card"><SelectValue placeholder={t("Pilih pelajaran")}/></SelectTrigger>
                                <SelectContent>{lessonsInUnit.map((lesson) => <SelectItem key={lesson.id} value={String(lesson.id)}>{lesson.title}</SelectItem>)}</SelectContent>
                            </Select>
                            {errorFor("lesson_id") && <p role="alert" className="mt-1 text-xs text-[#b42335]">{errorFor("lesson_id")}</p>}
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <label htmlFor="quiz-pass" className="field-label">{t("Nilai minimum lulus (%)")}</label>
                                <Input id="quiz-pass" required type="number" min={1} max={100} value={passPercentage} onChange={(event) => { setPassPercentage(event.target.value); clearError("pass_percentage"); }} placeholder="70"/>
                                <p className="mt-1 text-[11px] text-muted-foreground">{t("Contoh: 70 berarti pelajar perlu menjawab benar minimal 70%.")}</p>
                                {errorFor("pass_percentage") && <p role="alert" className="mt-1 text-xs text-[#b42335]">{errorFor("pass_percentage")}</p>}
                            </div>
                            <div>
                                <label htmlFor="quiz-attempt-limit" className="field-label">{t("Batas percobaan (opsional)")}</label>
                                <Input id="quiz-attempt-limit" type="number" min={1} max={10} value={attemptLimit} onChange={(event) => { setAttemptLimit(event.target.value); clearError("attempt_limit"); }} placeholder={t("Kosongkan agar bebas mengulang")}/>
                                <p className="mt-1 text-[11px] text-muted-foreground">{t("Contoh: 3 kali. Kosongkan agar pelajar bebas mengulang.")}</p>
                                {errorFor("attempt_limit") && <p role="alert" className="mt-1 text-xs text-[#b42335]">{errorFor("attempt_limit")}</p>}
                            </div>
                        </div>
                    </section>

                    <section className="space-y-3">
                        <div className="flex flex-wrap items-end justify-between gap-2">
                            <div>
                            <h2 className="text-sm font-bold">{t("Tambah soal")}</h2>
                                <p className="mt-1 text-xs text-muted-foreground">{t("Buat soal pilihan ganda biasa atau soal menyimak dengan rekaman audio.")}</p>
                            </div>
                            <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-link">{questions.length} {t("soal")}</span>
                        </div>
                        {questions.map((question, questionIndex) => (
                            <article key={question.key} className="space-y-4 rounded-2xl border bg-card p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <h3 className="text-sm font-bold">{t("Soal")} {questionIndex + 1}</h3>
                                    {questions.length > 1 && <Button type="button" variant="ghost" size="sm" className="text-[#b42335]" onClick={() => setQuestions((current) => current.filter((item) => item.key !== question.key))}><Trash2 className="mr-1.5 size-4"/>{t("Hapus soal")}</Button>}
                                </div>
                                <div>
                                    <label htmlFor={`quiz-question-type-${question.key}`} className="field-label">{t("Jenis soal")}</label>
                                    <Select value={question.type} onValueChange={(value: "multiple_choice" | "listening") => updateQuestion(question.key, { type: value })}>
                                        <SelectTrigger id={`quiz-question-type-${question.key}`} className="h-11 w-full bg-card"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="multiple_choice">{t("Pilihan ganda")}</SelectItem>
                                            <SelectItem value="listening">{t("Menyimak audio")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {question.type === "listening" && (
                                    <div>
                                        <label htmlFor={`quiz-audio-${question.key}`} className="field-label">{t("Audio yang didengarkan")}</label>
                                        <Input id={`quiz-audio-${question.key}`} type="file" accept=".mp3,.wav,.ogg,.m4a,.webm,audio/*" required={!question.audio} className="h-auto min-h-11 py-2" onChange={(event) => updateQuestion(question.key, { audio: event.target.files?.[0] ?? null })} />
                                        <p className="mt-1 text-xs text-muted-foreground">{t("Unggah kalimat Bahasa Sunda yang ingin ditebak pelajar. Maksimum 10 MB.")}</p>
                                        {errorFor(`questions.${questionIndex}.audio`) && <p role="alert" className="mt-1 text-xs text-[#b42335]">{errorFor(`questions.${questionIndex}.audio`)}</p>}
                                    </div>
                                )}
                                <div>
                                    <label htmlFor={`quiz-question-${question.key}`} className="field-label">{t(question.type === "listening" ? "Pertanyaan setelah audio" : "Pertanyaan")}</label>
                                    <textarea id={`quiz-question-${question.key}`} required maxLength={2000} className="field min-h-20 resize-y" value={question.prompt} onChange={(event) => updateQuestion(question.key, { prompt: event.target.value })} placeholder={t(question.type === "listening" ? "Contoh: Kalimat Sunda apa yang Anda dengar?" : "Contoh: Apa arti kata ‘punten’?")}/>
                                    {errorFor(`questions.${questionIndex}.prompt`) && <p role="alert" className="mt-1 text-xs text-[#b42335]">{errorFor(`questions.${questionIndex}.prompt`)}</p>}
                                </div>
                                <fieldset className="space-y-2">
                                    <legend className="field-label">{t("Pilihan jawaban")}</legend>
                                    <p className="-mt-1 text-xs text-muted-foreground">{t("Pilih radio button untuk menandai jawaban yang benar")}</p>
                                    {question.options.map((option, optionIndex) => {
                                        const letter = String.fromCharCode(65 + optionIndex);
                                        const optionError = errorFor(`questions.${questionIndex}.options.${optionIndex}`);
                                        return (
                                            <div key={letter} className="space-y-1">
                                                <div className="flex items-center gap-3">
                                                    <input type="radio" name={`correct-${question.key}`} checked={question.answerIndex === optionIndex} onChange={() => updateQuestion(question.key, { answerIndex: optionIndex })} aria-label={`${t("Tandai pilihan")} ${letter} ${t("sebagai jawaban benar")}`} className="size-4 accent-[#493ee5]" />
                                                    <span className="w-5 text-xs font-bold text-muted-foreground">{letter}.</span>
                                                    <Input aria-label={`${t("Pilihan")} ${letter}`} required maxLength={255} value={option} onChange={(event) => {
                                                        const nextOptions = [...question.options];
                                                        nextOptions[optionIndex] = event.target.value;
                                                        updateQuestion(question.key, { options: nextOptions });
                                                    }} placeholder={t("Contoh: Permisi")}/>
                                                </div>
                                                {optionError && <p role="alert" className="ml-11 text-xs text-[#b42335]">{optionError}</p>}
                                            </div>
                                        );
                                    })}
                                    {errorFor(`questions.${questionIndex}.options`) && <p role="alert" className="text-xs text-[#b42335]">{errorFor(`questions.${questionIndex}.options`)}</p>}
                                </fieldset>
                                <div>
                                    <label htmlFor={`quiz-explanation-${question.key}`} className="field-label">{t("Pembahasan untuk pelajar")}</label>
                                    <textarea id={`quiz-explanation-${question.key}`} required maxLength={2000} className="field min-h-16 resize-y" value={question.explanation} onChange={(event) => updateQuestion(question.key, { explanation: event.target.value })} placeholder={t("Contoh: ‘Punten’ dipakai saat meminta izin dengan sopan.")}/>
                                    {errorFor(`questions.${questionIndex}.explanation`) && <p role="alert" className="mt-1 text-xs text-[#b42335]">{errorFor(`questions.${questionIndex}.explanation`)}</p>}
                                </div>
                            </article>
                        ))}
                        {errorFor("questions") && <p role="alert" className="text-sm text-[#b42335]">{errorFor("questions")}</p>}
                        <Button type="button" variant="outline" className="min-h-11 w-full" onClick={() => {
                            const number = nextQuestionNumber.current++;
                            setQuestions((current) => [...current, { key: `question-${number}`, type: "multiple_choice", prompt: "", options: ["", "", "", ""], answerIndex: 0, explanation: "", audio: null }]);
                        }}><Plus className="mr-2 size-4"/>{t("Tambah soal")}</Button>
                    </section>

                    <DialogFooter className="border-t pt-4">
                        <Button type="button" variant="outline" className="min-h-11" onClick={close} disabled={processing}>{t("Batal")}</Button>
                        <Button type="submit" className="min-h-11 bg-primary text-primary-foreground hover:bg-primary/90" disabled={processing || lessons.length === 0}>
                            {processing ? t("Menyimpan...") : t("Simpan kuis")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function QuizQuestionModal({ target, close }: { target: QuizQuestionModalConfig; close: () => void }) {
    const existingOptions = target.question?.options ?? [];
    const optionCount = existingOptions.length || 4;
    const initialOptions = Array.from({ length: optionCount }, (_, index) => existingOptions[index] ?? "");
    const [type, setType] = useState<"multiple_choice" | "listening">(target.question?.type === "listening" ? "listening" : "multiple_choice");
    const [prompt, setPrompt] = useState(target.question?.prompt ?? "");
    const [options, setOptions] = useState(initialOptions);
    const [answerIndex, setAnswerIndex] = useState(() => {
        const correctIndex = existingOptions.indexOf(target.question?.answer?.value ?? "");
        return correctIndex >= 0 ? correctIndex : 0;
    });
    const [explanation, setExplanation] = useState(target.question?.explanation ?? "");
    const [audio, setAudio] = useState<File | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        if (processing) return;
        setProcessing(true);
        setErrors({});
        const form = new FormData();
        if (!target.question) form.append("exercise_id", String(target.exercise.id));
        form.append("type", type);
        form.append("prompt", prompt.trim());
        options.forEach((option, index) => form.append(`options[${index}]`, option.trim()));
        form.append("answer", options[answerIndex]?.trim() ?? "");
        form.append("explanation", explanation.trim());
        form.append("position", String(target.question?.position ?? target.exercise.questions?.length ?? 0));
        if (audio) form.append("audio", audio);
        if (target.question) form.append("_method", "PUT");
        const callbacks = {
            preserveScroll: true,
            onError: (formErrors: Record<string, string>) => setErrors(formErrors),
            onSuccess: () => {
                close();
                toast.success(t(target.question ? "Soal kuis berhasil diperbarui." : "Soal kuis berhasil ditambahkan."));
            },
            onFinish: () => setProcessing(false),
        };
        router.post(target.question ? `/admin/questions/${target.question.id}` : "/admin/questions", form, {
            ...callbacks,
            forceFormData: true,
        });
    };

    return (
        <Dialog open onOpenChange={(open) => { if (!open && !processing) close(); }}>
            <DialogContent className="max-h-[min(92dvh,820px)] overflow-y-auto border-border bg-card sm:max-w-[700px]">
                <DialogHeader className="pr-7 text-left">
                    <DialogTitle className="text-xl">{t(target.question ? "Ubah soal kuis" : "Tambah soal kuis")}</DialogTitle>
                    <DialogDescription>{t("Pilih satu radio sebagai kunci jawaban. Pelajar akan menerima pembahasan setelah mengerjakan kuis.")}</DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-5 pt-2">
                    <section className="rounded-2xl bg-secondary/55 p-4">
                        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{t("Informasi kuis")}</p>
                        <h2 className="mt-1 font-bold">{target.exercise.title}</h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {[target.pathTitle, target.unitTitle, target.lessonTitle].filter(Boolean).join(" / ")}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                            <span className="rounded-full bg-card px-2.5 py-1">{t("Durasi")}: {target.exercise.time_limit_minutes ? `${target.exercise.time_limit_minutes} ${t("menit")}` : t("Tanpa batas waktu")}</span>
                            <span className="rounded-full bg-card px-2.5 py-1">{t("Nilai lulus")}: {target.exercise.pass_percentage ?? 70}%</span>
                        </div>
                    </section>

                    <section className="space-y-4 rounded-2xl border bg-card p-4">
                        <h2 className="text-sm font-bold">{t("Pertanyaan")} {target.question ? "" : (target.exercise.questions?.length ?? 0) + 1}</h2>
                        <div>
                            <label htmlFor="quiz-question-type" className="field-label">{t("Jenis soal")}</label>
                            <Select value={type} onValueChange={(value: "multiple_choice" | "listening") => setType(value)}>
                                <SelectTrigger id="quiz-question-type" className="h-11 w-full bg-card"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="multiple_choice">{t("Pilihan ganda")}</SelectItem>
                                    <SelectItem value="listening">{t("Menyimak audio")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {type === "listening" && (
                            <div className="space-y-2">
                                <label htmlFor="quiz-question-audio" className="field-label">{t("Audio yang didengarkan")}</label>
                                <Input id="quiz-question-audio" type="file" accept=".mp3,.wav,.ogg,.m4a,.webm,audio/*" required={!audio && !target.question?.audio_path} className="h-auto min-h-11 py-2" onChange={(event) => setAudio(event.target.files?.[0] ?? null)} />
                                <p className="text-xs text-muted-foreground">{t("Unggah kalimat Bahasa Sunda yang ingin ditebak pelajar. Maksimum 10 MB.")}</p>
                                {target.question?.audio_path && <audio controls preload="none" src={`/storage/${target.question.audio_path}`} className="h-10 w-full max-w-sm" />}
                                {errors.audio && <p role="alert" className="text-xs text-[#b42335]">{errors.audio}</p>}
                            </div>
                        )}
                        <div>
                            <label htmlFor="quiz-question-prompt" className="field-label">{t(type === "listening" ? "Pertanyaan setelah audio" : "Pertanyaan")}</label>
                            <textarea id="quiz-question-prompt" required maxLength={2000} className="field min-h-20 resize-y" value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder={t(type === "listening" ? "Contoh: Kalimat Sunda apa yang Anda dengar?" : "Contoh: Apa arti kata ‘punten’?")}/>
                            {errors.prompt && <p role="alert" className="mt-1 text-xs text-[#b42335]">{errors.prompt}</p>}
                        </div>
                        <fieldset className="space-y-2">
                            <legend className="field-label">{t("Pilihan jawaban")}</legend>
                            <p className="-mt-1 text-xs text-muted-foreground">{t("Pilih radio button untuk menandai jawaban yang benar")}</p>
                            {options.map((option, optionIndex) => {
                                const letter = String.fromCharCode(65 + optionIndex);
                                const optionError = errors[`options.${optionIndex}`];
                                return (
                                    <div key={letter} className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <input type="radio" name="quiz-correct-answer" checked={answerIndex === optionIndex} onChange={() => setAnswerIndex(optionIndex)} aria-label={`${t("Tandai pilihan")} ${letter} ${t("sebagai jawaban benar")}`} className="size-4 accent-[#493ee5]" />
                                            <span className="w-5 text-xs font-bold text-muted-foreground">{letter}.</span>
                                            <Input aria-label={`${t("Pilihan")} ${letter}`} required maxLength={255} value={option} onChange={(event) => setOptions((current) => current.map((value, index) => index === optionIndex ? event.target.value : value))} placeholder={t("Contoh: Permisi")}/>
                                        </div>
                                        {optionError && <p role="alert" className="ml-11 text-xs text-[#b42335]">{optionError}</p>}
                                    </div>
                                );
                            })}
                            {errors.options && <p role="alert" className="text-xs text-[#b42335]">{errors.options}</p>}
                        </fieldset>
                        <div>
                            <label htmlFor="quiz-question-explanation" className="field-label">{t("Pembahasan untuk pelajar")}</label>
                            <textarea id="quiz-question-explanation" required maxLength={2000} className="field min-h-16 resize-y" value={explanation} onChange={(event) => setExplanation(event.target.value)} placeholder={t("Contoh: ‘Punten’ dipakai saat meminta izin dengan sopan.")}/>
                            {errors.explanation && <p role="alert" className="mt-1 text-xs text-[#b42335]">{errors.explanation}</p>}
                        </div>
                    </section>
                    <DialogFooter className="border-t pt-4">
                        <Button type="button" variant="outline" className="min-h-11" onClick={close} disabled={processing}>{t("Batal")}</Button>
                        <Button type="submit" className="min-h-11 bg-primary text-primary-foreground hover:bg-primary/90" disabled={processing}>
                            {processing ? t("Menyimpan...") : t("Simpan soal")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function AudioManagerModal({
    open,
    blocks,
    lessons,
    initialBlock,
    close,
}: {
    open: boolean;
    blocks: AudioBlock[];
    lessons: AudioLesson[];
    initialBlock?: AudioBlock | null;
    close: () => void;
}) {
    const [blockId, setBlockId] = useState("");
    const [targetMode, setTargetMode] = useState<"existing" | "new">("existing");
    const [lessonId, setLessonId] = useState("");
    const [newPhrase, setNewPhrase] = useState("");
    const [newMeaning, setNewMeaning] = useState("");
    const [source, setSource] = useState<"upload" | "record" | null>(null);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [recording, setRecording] = useState(false);
    const [requestingMicrophone, setRequestingMicrophone] = useState(false);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [error, setError] = useState("");
    const [processing, setProcessing] = useState(false);
    const recorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const discardRecordingRef = useRef(false);
    const timerRef = useRef<number | null>(null);
    const isOpenRef = useRef(open);
    const maxAudioBytes = 10 * 1024 * 1024;
    const selectedBlock = blocks.find((block) => String(block.id) === blockId);
    const selectedLesson = lessons.find((lesson) => String(lesson.id) === lessonId);
    const targetReady = targetMode === "existing" ? Boolean(selectedBlock) : Boolean(selectedLesson && newPhrase.trim());
    isOpenRef.current = open;

    useEffect(() => {
        if (open) {
            setBlockId(initialBlock ? String(initialBlock.id) : "");
            setTargetMode("existing");
            setLessonId(lessons[0] ? String(lessons[0].id) : "");
            setNewPhrase("");
            setNewMeaning("");
            setSource(null);
            setAudioFile(null);
            setError("");
            setElapsedSeconds(0);
        }
    }, [open, initialBlock?.id, lessons[0]?.id]);

    useEffect(() => {
        if (!audioFile) {
            setPreviewUrl("");

            return;
        }

        const objectUrl = URL.createObjectURL(audioFile);
        setPreviewUrl(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [audioFile]);

    useEffect(
        () => () => {
            if (timerRef.current !== null) window.clearInterval(timerRef.current);
            if (recorderRef.current?.state === "recording") recorderRef.current.stop();
            streamRef.current?.getTracks().forEach((track) => track.stop());
        },
        [],
    );

    const releaseMicrophone = () => {
        if (timerRef.current !== null) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
        }
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
    };

    const stopRecording = () => {
        if (recorderRef.current?.state === "recording") recorderRef.current.stop();
        setRecording(false);
        if (timerRef.current !== null) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const discardRecording = () => {
        discardRecordingRef.current = true;
        if (recorderRef.current?.state === "recording") recorderRef.current.stop();
        releaseMicrophone();
        setRecording(false);
    };

    const handleClose = () => {
        discardRecording();
        close();
    };

    const startRecording = async () => {
        if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
            setError("Browser ini belum mendukung perekaman audio. Silakan unggah berkas dari folder.");

            return;
        }

        setRequestingMicrophone(true);
        setError("");
        setAudioFile(null);
        setElapsedSeconds(0);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (!isOpenRef.current) {
                stream.getTracks().forEach((track) => track.stop());

                return;
            }
            const supportedMimeType = ["audio/webm;codecs=opus", "audio/ogg;codecs=opus", "audio/mp4"].find((mimeType) =>
                MediaRecorder.isTypeSupported(mimeType),
            );
            const recorder = supportedMimeType ? new MediaRecorder(stream, { mimeType: supportedMimeType }) : new MediaRecorder(stream);

            streamRef.current = stream;
            recorderRef.current = recorder;
            chunksRef.current = [];
            discardRecordingRef.current = false;
            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) chunksRef.current.push(event.data);
            };
            recorder.onerror = () => {
                setError("Rekaman gagal. Periksa mikrofon lalu coba lagi.");
                discardRecordingRef.current = true;
                releaseMicrophone();
                setRecording(false);
            };
            recorder.onstop = () => {
                const mimeType = recorder.mimeType || supportedMimeType || "audio/webm";
                const blob = new Blob(chunksRef.current, { type: mimeType });
                const extension = mimeType.includes("ogg") ? "ogg" : mimeType.includes("mp4") ? "m4a" : "webm";

                if (!discardRecordingRef.current && blob.size > 0) {
                    if (blob.size > maxAudioBytes) {
                        setError("Ukuran rekaman melebihi batas 10 MB. Silakan rekam ulang dengan durasi lebih singkat.");
                    } else {
                        setAudioFile(new File([blob], `rekaman-sawala-${Date.now()}.${extension}`, { type: mimeType }));
                    }
                }

                releaseMicrophone();
                setRecording(false);
            };
            recorder.start(250);
            setRecording(true);
            timerRef.current = window.setInterval(() => setElapsedSeconds((seconds) => seconds + 1), 1000);
        } catch {
            setError("Mikrofon tidak dapat diakses. Izinkan akses mikrofon atau unggah berkas dari folder.");
        } finally {
            setRequestingMicrophone(false);
        }
    };

    const submit = () => {
        if (!targetReady || !audioFile) return;

        const data = new FormData();
        data.append("audio", audioFile);
        const url = targetMode === "existing" ? `/admin/blocks/${selectedBlock!.id}/audio` : "/admin/blocks";

        if (targetMode === "existing") {
            data.append("_method", "PUT");
        } else {
            const phrase = newPhrase.trim();
            data.append("lesson_id", lessonId);
            data.append("type", "vocabulary");
            data.append("title", phrase);
            data.append("latin", phrase);
            if (newMeaning.trim()) data.append("translation", newMeaning.trim());
        }

        setProcessing(true);
        setError("");

        router.post(url, data, {
            forceFormData: true,
            preserveScroll: true,
            onError: (errors) => setError(errors.audio ?? "Audio tidak dapat disimpan. Periksa format dan ukuran berkas."),
            onSuccess: () => {
                handleClose();
                toast.success(t("Audio berhasil disimpan."));
            },
            onFinish: () => setProcessing(false),
        });
    };

    const formatDuration = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (!nextOpen && !processing) handleClose();
            }}
        >
            <DialogContent className="max-h-[min(90vh,780px)] w-[calc(100vw-2rem)] min-w-0 overflow-x-hidden overflow-y-auto border-border bg-card sm:max-w-[620px]">
                <DialogHeader className="min-w-0 pr-7 text-left">
                    <DialogTitle className="text-xl">{t("Tambah audio pelafalan")}</DialogTitle>
                    <DialogDescription className="min-w-0 whitespace-normal break-words">{t("Pilih materi yang sudah ada atau buat materi baru, lalu rekam atau unggah audionya.")}</DialogDescription>
                </DialogHeader>
                <div className="min-w-0 space-y-5 pt-2">
                    <div className="grid min-w-0 gap-2 sm:grid-cols-2">
                        <Button
                            type="button"
                            variant={targetMode === "existing" ? "default" : "outline"}
                            className="min-h-10 min-w-0 justify-start whitespace-normal text-left"
                            disabled={recording || requestingMicrophone}
                            onClick={() => setTargetMode("existing")}
                        >
                            {t("Gunakan materi yang sudah ada")}
                        </Button>
                        <Button
                            type="button"
                            variant={targetMode === "new" ? "default" : "outline"}
                            className="min-h-10 min-w-0 justify-start whitespace-normal text-left"
                            disabled={recording || requestingMicrophone}
                            onClick={() => setTargetMode("new")}
                        >
                            <Plus className="size-4" /> {t("Buat materi baru")}
                        </Button>
                    </div>

                    {targetMode === "existing" ? (
                        <div className="min-w-0 space-y-2">
                            <label htmlFor="audio-block" className="field-label">
                                {t("Materi tujuan")}
                            </label>
                            <Select value={blockId} disabled={recording || requestingMicrophone} onValueChange={(value) => setBlockId(value)}>
                                <SelectTrigger id="audio-block" className="h-11 w-full min-w-0 max-w-full overflow-hidden bg-card">
                                    <SelectValue className="min-w-0 flex-1 truncate text-left" placeholder={t("Pilih materi yang akan diberi audio")} />
                                </SelectTrigger>
                                <SelectContent className="max-h-72">
                                    {blocks.map((block) => (
                                        <SelectItem key={block.id} value={String(block.id)}>
                                            {(block.latin || block.title || t("Blok materi")) + ` · ${block.lessonTitle} / ${block.pathTitle}`}
                                            {block.audio_path ? ` · ${t("audio akan diganti")}` : ""}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {selectedBlock && (
                                <p className="text-xs text-muted-foreground">
                                    {selectedBlock.audio_path ? t("Audio lama akan diganti setelah audio baru berhasil disimpan.") : t("Audio akan ditambahkan pada materi ini.")}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="min-w-0 space-y-4 overflow-hidden rounded-xl border p-4">
                            <div className="space-y-2">
                                <label htmlFor="audio-lesson" className="field-label">
                                    {t("Pelajaran tujuan")}
                                </label>
                                <Select value={lessonId} disabled={recording || requestingMicrophone} onValueChange={(value) => setLessonId(value)}>
                                <SelectTrigger id="audio-lesson" className="h-11 w-full min-w-0 max-w-full overflow-hidden bg-card">
                                    <SelectValue className="min-w-0 flex-1 truncate text-left" placeholder={t("Pilih pelajaran")} />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-72">
                                        {lessons.map((lesson) => (
                                            <SelectItem key={lesson.id} value={String(lesson.id)}>
                                                {`${lesson.pathTitle} / ${lesson.unitTitle} / ${lesson.title}`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="audio-new-phrase" className="field-label">
                                    {t("Tulisan Latin / frasa")}
                                </label>
                                <Input
                                    id="audio-new-phrase"
                                    value={newPhrase}
                                    maxLength={160}
                                    disabled={recording || requestingMicrophone}
                                    placeholder={t("Contoh: Wilujeng enjing")}
                                    onChange={(event) => setNewPhrase(event.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="audio-new-meaning" className="field-label">
                                    {t("Arti Bahasa Indonesia (opsional)")}
                                </label>
                                <textarea
                                    id="audio-new-meaning"
                                    className="field min-h-20 resize-y"
                                    value={newMeaning}
                                    maxLength={2000}
                                    disabled={recording || requestingMicrophone}
                                    placeholder={t("Tulis arti atau konteks materi.")}
                                    onChange={(event) => setNewMeaning(event.target.value)}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">{t("Materi baru akan disimpan sebagai entri kosakata pada pelajaran pilihan.")}</p>
                        </div>
                    )}

                    <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                        <button
                            type="button"
                            aria-pressed={source === "upload"}
                            disabled={recording || requestingMicrophone}
                            onClick={() => {
                                setSource("upload");
                                setAudioFile(null);
                                setError("");
                            }}
                            className={`w-full min-w-0 rounded-xl border p-4 text-left transition-colors ${source === "upload" ? "border-primary bg-accent" : "border-border hover:bg-secondary"}`}
                        >
                            <span className="flex size-10 items-center justify-center rounded-lg bg-card text-link">
                                <Upload className="size-5" />
                            </span>
                            <span className="mt-3 block font-semibold">{t("Unggah dari folder")}</span>
                            <span className="mt-1 block text-xs leading-5 text-muted-foreground">{t("Pilih rekaman audio dari perangkat Anda.")}</span>
                        </button>
                        <button
                            type="button"
                            aria-pressed={source === "record"}
                            disabled={recording || requestingMicrophone}
                            onClick={() => {
                                setSource("record");
                                setAudioFile(null);
                                setElapsedSeconds(0);
                                setError("");
                            }}
                            className={`w-full min-w-0 rounded-xl border p-4 text-left transition-colors ${source === "record" ? "border-primary bg-accent" : "border-border hover:bg-secondary"}`}
                        >
                            <span className="flex size-10 items-center justify-center rounded-lg bg-card text-link">
                                <Mic className="size-5" />
                            </span>
                            <span className="mt-3 block font-semibold">{t("Rekam langsung")}</span>
                            <span className="mt-1 block text-xs leading-5 text-muted-foreground">{t("Gunakan mikrofon perangkat untuk merekam pelafalan.")}</span>
                        </button>
                    </div>

                    {source === "upload" && (
                        <div className="space-y-2 rounded-xl border border-dashed p-4">
                            <label htmlFor="audio-file" className="field-label">
                                {t("Pilih berkas audio")}
                            </label>
                            <Input
                                id="audio-file"
                                type="file"
                                accept=".mp3,.wav,.ogg,.m4a,.webm"
                                className="h-11 bg-card"
                                onChange={(event) => {
                                    const file = event.target.files?.[0] ?? null;
                                    setError("");
                                    if (file && file.size > maxAudioBytes) {
                                        setAudioFile(null);
                                        setError("Ukuran audio melebihi batas 10 MB.");
                                    } else {
                                        setAudioFile(file);
                                    }
                                }}
                            />
                            <p className="text-xs text-muted-foreground">{t("MP3, WAV, OGG, M4A, atau WEBM. Maksimum 10 MB.")}</p>
                        </div>
                    )}

                    {source === "record" && (
                        <div className="space-y-4 rounded-xl border bg-secondary/40 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="font-semibold">{recording ? t("Sedang merekam") : audioFile ? t("Rekaman siap") : t("Rekam pelafalan")}</p>
                                    <p className="mt-1 text-sm text-muted-foreground">{t("Tekan tombol rekam, ucapkan materi dengan jelas, lalu hentikan rekaman.")}</p>
                                </div>
                                <Button
                                    type="button"
                                    variant={recording ? "destructive" : "outline"}
                                    className="min-h-10 shrink-0"
                                    disabled={requestingMicrophone}
                                    onClick={() => (recording ? stopRecording() : void startRecording())}
                                >
                                    {recording ? <Square className="size-4 fill-current" /> : <Mic className="size-4" />}
                                    {requestingMicrophone ? t("Menghubungkan mikrofon...") : recording ? t("Hentikan rekaman") : audioFile ? t("Rekam ulang") : t("Mulai rekam")}
                                </Button>
                            </div>
                            <p className="text-xs font-medium tabular-nums text-muted-foreground">{formatDuration(elapsedSeconds)}</p>
                            {previewUrl && <audio controls preload="metadata" src={previewUrl} className="h-10 w-full" />}
                        </div>
                    )}

                    {previewUrl && source === "upload" && <audio controls preload="metadata" src={previewUrl} className="h-10 w-full" />}
                    {audioFile && <p className="text-xs text-muted-foreground">{audioFile.name} · {(audioFile.size / 1024 / 1024).toFixed(2)} MB</p>}
                    {error && <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{t(error)}</p>}
                </div>
                <DialogFooter className="border-t pt-5">
                    <Button type="button" variant="outline" className="min-h-11" disabled={processing} onClick={handleClose}>
                        {t("Batal")}
                    </Button>
                    <Button type="button" className="min-h-11 bg-primary text-primary-foreground hover:bg-primary/90" disabled={!targetReady || !audioFile || recording || requestingMicrophone || processing} onClick={submit}>
                        {processing ? t("Menyimpan...") : t("Simpan audio")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function DeleteModal({ config, close }: { config: DeleteConfig | null; close: () => void }) {
    const [processing, setProcessing] = useState(false);
    if (!config) return null;
    return (
        <Dialog
            open
            onOpenChange={(open) => {
                if (!open && !processing) close();
            }}
        >
            <DialogContent className="bg-card sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {t("Hapus")} {config.label}?
                    </DialogTitle>
                    <DialogDescription>{t("Konten ini beserta semua bagian di dalamnya akan dihapus secara permanen.")}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" className="min-h-11" onClick={close}>
                        {t("Batal")}
                    </Button>
                    <Button
                        variant="destructive"
                        className="min-h-11"
                        disabled={processing}
                        onClick={() => {
                            setProcessing(true);
                            router.delete(`/admin/${config.type}/${config.id}`, {
                                preserveScroll: true,
                                onSuccess: () => {
                                    close();
                                    toast.success(t("Konten berhasil dihapus."));
                                },
                                onFinish: () => setProcessing(false),
                            });
                        }}
                    >
                        {t(processing ? "Menghapus..." : "Ya, hapus")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function IconAction({ label, icon: Icon, action, danger = false }: { label: string; icon: typeof Pencil; action: () => void; danger?: boolean }) {
    return (
        <Button variant="ghost" size="icon" className={`size-10 ${danger ? "text-[#b42335]" : "text-muted-foreground"}`} aria-label={t(label)} title={t(label)} onClick={action}>
            <Icon className="size-4" />
        </Button>
    );
}

function Empty({ icon: Icon, title, detail, action }: { icon: typeof Pencil; title: string; detail: string; action?: React.ReactNode }) {
    return (
        <div className="flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed bg-card px-6 py-9 text-center">
            <Icon className="size-7 text-muted-foreground" strokeWidth={1.6} />
            <h3 className="mt-4 font-semibold">{t(title)}</h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{t(detail)}</p>
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}

function CollectionPagination({ total, page, pageSize, onPageChange }: { total: number; page: number; pageSize: number; onPageChange: (page: number) => void }) {
    if (total === 0) return null;
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const first = (page - 1) * pageSize + 1;
    const last = Math.min(page * pageSize, total);

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
            <p className="text-xs text-muted-foreground">
                {t("Menampilkan")} {first}–{last} {t("dari")} {total}
            </p>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-9" disabled={page <= 1} onClick={() => onPageChange(Math.max(1, page - 1))}>
                    <ChevronRight className="size-4 rotate-180" /> {t("Sebelumnya")}
                </Button>
                <span className="min-w-14 text-center text-xs font-medium text-muted-foreground">
                    {page} / {pageCount}
                </span>
                <Button variant="outline" size="sm" className="h-9" disabled={page >= pageCount} onClick={() => onPageChange(Math.min(pageCount, page + 1))}>
                    {t("Berikutnya")} <ChevronRight className="size-4" />
                </Button>
            </div>
        </div>
    );
}

export default function AdminPage({
    paths,
    collectionItems,
    collectionPagination,
    mediaCounts,
    audioBlockOptions,
    learners,
    learnersPagination,
    analytics,
    tutorSettings,
    feedback,
    feedbackPagination,
    feedbackStats,
    learnerCount,
}: {
    paths: LearningPath[];
    collectionItems: Array<AdminBlockItem | AdminExerciseItem>;
    collectionPagination: PaginationMeta;
    mediaCounts: { uploaded: number; missing: number };
    audioBlockOptions: AudioBlock[];
    learners: Learner[];
    learnersPagination: PaginationMeta;
    analytics: Analytics;
    tutorSettings: TutorSettings;
    feedback: FeedbackItem[];
    feedbackPagination: PaginationMeta;
    feedbackStats: { new: number; reviewing: number; resolved: number };
    learnerCount: number;
}) {
    const { url } = usePage();
    const currentParams = new URLSearchParams(url.split("?")[1] ?? "");
    const section = (currentParams.get("section") ?? "overview") as Section;
    const pathSlug = currentParams.get("path");
    const currentQuery = currentParams.get("q") ?? "";
    const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
    const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
    const [query, setQuery] = useState(currentQuery);
    const [lessonQuery, setLessonQuery] = useState("");
    const [lessonPage, setLessonPage] = useState(1);
    const mediaView = currentParams.get("media_view") === "missing" ? "missing" : "uploaded";
    const [statusFilter, setStatusFilter] = useState("all");
    const [modal, setModal] = useState<FormConfig | null>(null);
    const [quizBuilderOpen, setQuizBuilderOpen] = useState(false);
    const [quizBuilderLessonId, setQuizBuilderLessonId] = useState<number | null>(null);
    const [quizQuestionModal, setQuizQuestionModal] = useState<QuizQuestionModalConfig | null>(null);
    const [audioModalTarget, setAudioModalTarget] = useState<AudioBlock | null | undefined>(undefined);
    const [deleting, setDeleting] = useState<DeleteConfig | null>(null);
    const filteredPaths = paths.filter(
        (path) => path.title.toLocaleLowerCase("id").includes(query.toLocaleLowerCase("id")) && (statusFilter === "all" || path.status === statusFilter),
    );
    const selectedPath = filteredPaths.find((path) => path.slug === pathSlug) ?? filteredPaths[0];
    const selectedUnit = selectedPath?.units?.find((unit) => unit.id === selectedUnitId) ?? selectedPath?.units?.[0];
    const lessonPageSize = 8;
    const matchingUnitLessons = (selectedUnit?.lessons ?? []).filter((lesson) =>
        `${lesson.title} ${lesson.summary ?? ""}`.toLocaleLowerCase("id").includes(lessonQuery.toLocaleLowerCase("id")),
    );
    const visibleUnitLessons = matchingUnitLessons.slice((lessonPage - 1) * lessonPageSize, lessonPage * lessonPageSize);
    const selectedLesson = lessonQuery
        ? (matchingUnitLessons.find((lesson) => lesson.id === selectedLessonId) ?? visibleUnitLessons[0])
        : (visibleUnitLessons.find((lesson) => lesson.id === selectedLessonId) ?? visibleUnitLessons[0] ?? selectedUnit?.lessons?.[0]);
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
    const pagedBlocks = collectionItems.filter((item): item is AdminBlockItem => "type" in item);
    const pagedExercises = collectionItems.filter((item): item is AdminExerciseItem => !("type" in item));
    const characterBlocks = pagedBlocks;
    const vocabularyBlocks = pagedBlocks;
    const filteredExercises = pagedExercises;
    const mediaBlocks = mediaView === "uploaded" ? pagedBlocks : [];
    const missingAudioBlocks = mediaView === "missing" ? pagedBlocks : [];
    const visibleVocabularyBlocks = pagedBlocks;
    const visibleCharacterBlocks = pagedBlocks;
    const visibleExercises = pagedExercises;
    const visibleMediaBlocks = mediaBlocks;
    const visibleMissingAudioBlocks = missingAudioBlocks;
    useEffect(() => setQuery(currentQuery), [url]);
    useEffect(() => {
        setLessonPage(1);
    }, [selectedUnit?.id, lessonQuery]);
    const scriptLesson = allLessons.find((lesson) => lesson.pathSlug === "aksara-sunda");
    const openPath = (path?: LearningPath) =>
        setModal({
            title: path ? "Ubah kelas belajar" : "Buat kelas belajar",
            description: path
                ? "Perbarui informasi dan status kelas belajar."
                : "Kelas baru disimpan sebagai draf. Setelah itu, tambahkan unit dan pelajaran sebelum menerbitkannya.",
            url: path ? `/admin/paths/${path.id}` : "/admin/paths",
            method: path ? "put" : "post",
            submitLabel: path ? "Simpan perubahan" : "Buat kelas",
            successMessage: path ? "Kelas berhasil diperbarui." : "Kelas baru berhasil dibuat.",
            fields: [
                { ...titleField, label: "Nama kelas" },
                {
                    name: "description",
                    label: "Deskripsi singkat",
                    type: "textarea",
                },
                ...(path ? [positionField, statusField] : []),
            ],
            values: path
                ? {
                      title: path.title,
                      description: path.description ?? "",
                      position: path.position,
                      status: path.status,
                  }
                : {},
            hidden: path ? {} : { position: paths.length },
        });
    const openUnit = (unit?: Unit, path = selectedPath) => {
        if (!path) return;
        setModal({
            title: unit ? "Ubah unit" : "Tambah unit",
            description: `${t("Unit pada kelas")} ${path.title}. ${t("Susun tujuan dan urutan belajar.")}`,
            url: unit ? `/admin/units/${unit.id}` : "/admin/units",
            method: unit ? "put" : "post",
            fields: [titleField, { name: "description", label: "Tujuan unit", type: "textarea" }, positionField, ...(unit ? [statusField] : [])],
            values: unit
                ? {
                      title: unit.title,
                      description: unit.description ?? "",
                      position: unit.position,
                      status: unit.status,
                  }
                : { position: path.units?.length ?? 0 },
            hidden: unit ? {} : { learning_path_id: path.id },
        });
    };
    const openLesson = (lesson?: Lesson, unit = selectedUnit) => {
        if (!unit) return;
        setModal({
            title: lesson ? "Ubah pelajaran" : "Tambah pelajaran",
            description: `${t("Pelajaran pada unit")} ${unit.title}.`,
            url: lesson ? `/admin/lessons/${lesson.id}` : "/admin/lessons",
            method: lesson ? "put" : "post",
            fields: [titleField, { name: "summary", label: "Ringkasan", type: "textarea" }, positionField, ...(lesson ? [statusField] : [])],
            values: lesson
                ? {
                      title: lesson.title,
                      summary: lesson.summary ?? "",
                      position: lesson.position,
                      status: lesson.status,
                  }
                : { position: unit.lessons?.length ?? 0 },
            hidden: lesson ? {} : { unit_id: unit.id },
        });
    };
    const openBlock = (block?: Block, lesson = selectedLesson, defaults: Record<string, FormValue> = {}) => {
        if (!block && !lesson) return;
        setModal({
            title: block ? "Ubah blok materi" : "Tambah blok materi",
            description: "Teks, kosakata, aksara, konteks pemakaian, dan audio dalam satu blok.",
            url: block ? `/admin/blocks/${block.id}` : "/admin/blocks",
            method: block ? "put" : "post",
            fields: blockFields,
            values: block
                ? {
                      type: block.type,
                      title: block.title ?? "",
                      body: block.body ?? "",
                      latin: block.latin ?? "",
                      sundanese: block.sundanese ?? "",
                      translation: block.translation ?? "",
                      region: block.region ?? "",
                      register: block.register ?? "",
                      context: block.context ?? "",
                      position: block.position,
                  }
                : {
                      type: "text",
                      position: lesson?.blocks?.length ?? 0,
                      ...defaults,
                  },
            hidden: block ? {} : { lesson_id: lesson!.id },
        });
    };
    const openBlockAudio = (block?: AudioBlock | null) => setAudioModalTarget(block ?? null);
    const openExercise = (exercise?: Exercise, lesson?: Lesson | null) => {
        const targetLesson = exercise ? undefined : lesson === null ? undefined : (lesson ?? selectedLesson);
        const chooseLesson = !exercise && !targetLesson;
        if (chooseLesson && allLessons.length === 0) {
            toast.info(t("Buat pelajaran terlebih dahulu sebelum menambahkan latihan."));
            return;
        }
        setModal({
            title: exercise ? "Ubah latihan" : "Tambah latihan",
            description: chooseLesson
                ? "Pilih pelajaran untuk latihan ini, lalu tambahkan soal dan kunci jawaban."
                : "Beri judul latihan sebelum menambahkan soal dan kunci jawaban.",
            url: exercise ? `/admin/exercises/${exercise.id}` : "/admin/exercises",
            method: exercise ? "put" : "post",
            fields: [
                titleField,
                ...(exercise ? [{
                    name: "kind",
                    label: "Jenis aktivitas",
                    type: "select" as const,
                    required: true,
                    options: [
                        { value: "practice", label: "Latihan dengan pembahasan" },
                        { value: "quiz", label: "Kuis evaluasi" },
                    ],
                    hint: "Kuis dapat diberi batas waktu, nilai lulus, dan batas percobaan.",
                }] : []),
                { name: "time_limit_minutes", label: "Batas waktu (menit, opsional)", type: "number", hint: "Kosongkan jika kuis tidak dibatasi waktu." },
                { name: "pass_percentage", label: "Nilai minimum lulus (%)", type: "number", required: true },
                { name: "attempt_limit", label: "Batas percobaan (opsional)", type: "number", hint: "Kosongkan agar pelajar bebas mengulang." },
                ...(chooseLesson
                    ? [
                          {
                              name: "lesson_id",
                              label: "Pelajaran tujuan",
                              type: "select" as const,
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
                      kind: exercise.kind ?? "practice",
                      time_limit_minutes: exercise.time_limit_minutes ?? "",
                      pass_percentage: exercise.pass_percentage ?? 70,
                      attempt_limit: exercise.attempt_limit ?? "",
                      position: exercise.position,
                  }
                : {
                      kind: "practice",
                      pass_percentage: 70,
                      position: targetLesson?.exercises?.length ?? 0,
                      ...(chooseLesson && allLessons[0] ? { lesson_id: String(allLessons[0].id) } : {}),
                  },
            hidden: exercise ? {} : { kind: "practice", ...(targetLesson ? { lesson_id: targetLesson.id } : {}) },
        });
    };
    const openQuestion = (exercise: Exercise, question?: Question) => {
        if (exercise.kind === "quiz" && (!question || question.type === "multiple_choice")) {
            const lesson = allLessons.find((item) => item.exercises?.some((activity) => activity.id === exercise.id)) ?? exercise.lesson;
            const lessonDetails = lesson as (Lesson & { pathTitle?: string; unitTitle?: string }) | undefined;
            setQuizQuestionModal({
                exercise,
                question,
                pathTitle: lessonDetails?.pathTitle ?? (exercise as AdminExerciseItem).pathTitle ?? "",
                unitTitle: lessonDetails?.unitTitle ?? lessonDetails?.unit?.title ?? "",
                lessonTitle: lessonDetails?.title ?? "",
            });
            return;
        }

        const activityType = exercise.kind === "quiz" ? "kuis" : "latihan";
        setModal({
            title: question ? `Ubah soal ${activityType}` : `Tambah soal ${activityType}`,
            description: exercise.kind === "quiz"
                ? `${t("Soal untuk")} ${exercise.title}. ${t("Pilih format soal dan lengkapi pilihan serta kunci jawabannya.")}`
                : `${t("Soal latihan untuk")} ${exercise.title}. ${t("Pilih format soal; kolom akan menyesuaikan dengan jenis yang dipilih.")}`,
            url: question ? `/admin/questions/${question.id}` : "/admin/questions",
            method: question ? "put" : "post",
            fields: questionFieldsForType(question?.type ?? "multiple_choice"),
            questionForm: true,
            values: question
                ? {
                      type: question.type,
                      prompt: question.prompt,
                      options: (question.options ?? []).join("\n"),
                      answer: question.answer?.value ?? "",
                      explanation: question.explanation ?? "",
                      audio_path: question.audio_path ?? "",
                      position: question.position,
                  }
                : {
                      type: "multiple_choice",
                      position: exercise.questions?.length ?? 0,
                  },
            hidden: question ? {} : { exercise_id: exercise.id },
        });
    };
    const openQuizBuilder = (lesson?: Lesson) => {
        if (allLessons.length === 0) {
            toast.info(t("Tambahkan pelajaran terlebih dahulu sebelum membuat kuis."));
            return;
        }
        setQuizBuilderLessonId(lesson?.id ?? null);
        setQuizBuilderOpen(true);
    };
    const goToPath = (path: LearningPath) => {
        router.get(`/admin?section=paths&path=${encodeURIComponent(path.slug)}`);
    };
    const sectionTitles: Record<Section, [string, string]> = {
        overview: ["Ringkasan pengelolaan", "Lihat apa yang perlu disiapkan sebelum pelajar mulai belajar."],
        paths: ["Kelas & pelajaran", "Susun unit, tulis materi, dan terbitkan pelajaran."],
        vocabulary: ["Kosakata & konteks", "Tinjau kosakata, aksara, dan ragam pemakaian dalam materi."],
        characters: ["Kumpulan Aksara Sunda", "Kelola karakter Aksara Sunda yang digunakan di materi pelajaran."],
        exercises: ["Latihan & soal", "Kelola latihan dan kunci jawaban untuk setiap pelajaran."],
        media: ["Audio & media", "Kelola audio pelafalan yang terhubung dengan materi."],
        learners: ["Pelajar & progres", "Lihat aktivitas belajar untuk mengevaluasi materi."],
        analytics: ["Laporan & analitik", "Pantau aktivitas belajar, penyelesaian kelas, dan hasil latihan."],
        tutor: ["Pengaturan Tutor AI", "Atur cara tutor menjawab dan koneksi penyedia AI."],
        feedback: ["Umpan balik", "Tinjau laporan, saran, dan masukan yang dikirim pelajar."],
    };
    const current = sectionTitles[section] ?? sectionTitles.overview;
    const draftCount = allLessons.filter((lesson) => lesson.status !== "published").length;
    const publishedCount = allLessons.filter((lesson) => lesson.status === "published").length;
    const submitCollectionSearch = (event: React.FormEvent<HTMLFormElement>, targetSection: Section) => {
        event.preventDefault();
        router.get(
            "/admin",
            { section: targetSection, q: query.trim() || undefined, collection_page: 1 },
            { preserveState: true, preserveScroll: true, replace: true, only: ["paths", "collectionItems", "collectionPagination", "mediaCounts", "audioBlockOptions"] },
        );
    };
    const changeMediaView = (view: "uploaded" | "missing") => {
        router.get(
            "/admin",
            { section: "media", q: query.trim() || undefined, media_view: view, collection_page: 1 },
            { preserveState: true, preserveScroll: true, replace: true, only: ["paths", "collectionItems", "collectionPagination", "mediaCounts", "audioBlockOptions"] },
        );
    };

    return (
        <>
            <Head title={t(current[0])} />
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="stitch-kicker">{t("STUDIO ADMIN / PENGELOLAAN")}</p>
                    <h1 className="mt-2 text-[28px] leading-tight font-extrabold tracking-tight md:text-[32px]">{t(current[0])}</h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{t(current[1])}</p>
                </div>
                {section === "paths" && (
                    <Button onClick={() => openPath()} className="min-h-11 gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                        <Plus className="size-4" /> {t("Buat kelas")}
                    </Button>
                )}
                {section === "characters" && (
                    <Button
                        onClick={() =>
                            openBlock(undefined, scriptLesson, {
                                type: "script",
                            })
                        }
                        disabled={!scriptLesson}
                        className="min-h-11 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        <Plus className="size-4" /> {t("Tambah aksara")}
                    </Button>
                )}
                {section === "media" && (
                    <Button onClick={() => openBlockAudio()} className="min-h-11 gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                        <Plus className="size-4" /> {t("Tambah audio")}
                    </Button>
                )}
            </div>

            {section === "overview" && (
                <div className="mt-7 space-y-7">
                    <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#493ee5] to-[#8573ee] p-7 text-white md:p-8">
                        <div aria-hidden="true" className="absolute top-1/2 right-8 hidden -translate-y-1/2 items-center gap-3 lg:flex">
                            {["ᮘ", "ᮞ", "ᮔ"].map((glyph, index) => (
                                <span
                                    key={index}
                                    lang="su"
                                    className={`sunda-script flex size-20 items-center justify-center rounded-2xl border border-white/30 bg-white/15 text-5xl text-white shadow-lg ${index === 1 ? "-translate-y-5" : ""}`}
                                >
                                    {glyph}
                                </span>
                            ))}
                        </div>
                        <div className="relative z-10">
                            <p className="text-[11px] font-extrabold tracking-widest text-white/75">{t("SAWALA · STUDIO KONTEN")}</p>
                            <h2 className="mt-3 max-w-xl text-2xl leading-tight font-extrabold md:text-3xl">{t("Kelola pengalaman belajar yang bermakna.")}</h2>
                            <p className="mt-2 max-w-lg text-sm leading-6 text-white/85">{t("Susun kelas, lengkapi materi, dan tinjau progres pelajar dari satu ruang kerja.")}</p>
                            <Link
                                href="/admin?section=paths"
                                className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-white px-4 text-xs font-extrabold text-[#493ee5]"
                            >
                                {t("Kelola kelas belajar")} <ArrowRight className="size-4" />
                            </Link>
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="stitch-card p-6">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">{t("Kelas belajar")}</span>
                                <span className="flex size-10 items-center justify-center rounded-xl bg-[#efedff] text-[#493ee5]">
                                    <LibraryBig className="size-5" />
                                </span>
                            </div>
                            <p className="mt-5 text-3xl font-extrabold">{paths.length}</p>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {paths.filter((path) => path.status === "published").length} {t("terbuka untuk pelajar")}
                            </p>
                        </div>
                        <div className="stitch-card p-6">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">{t("Pelajaran siap tayang")}</span>
                                <span className="flex size-10 items-center justify-center rounded-xl bg-[#ecfdf5] text-[#006c4a]">
                                    <BookOpen className="size-5" />
                                </span>
                            </div>
                            <p className="mt-5 text-3xl font-extrabold">{publishedCount}</p>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {draftCount} {t("masih draf atau ditinjau")}
                            </p>
                        </div>
                        <div className="stitch-card p-6">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">{t("Pelajar terdaftar")}</span>
                                <span className="flex size-10 items-center justify-center rounded-xl bg-[#fff3d8] text-[#a34b05]">
                                    <Users className="size-5" />
                                </span>
                            </div>
                            <p className="mt-5 text-3xl font-extrabold">{learnerCount}</p>
                            <p className="mt-2 text-sm text-muted-foreground">{t("Aktivitas tersedia di laporan pelajar")}</p>
                        </div>
                    </div>
                    <div className="grid gap-7 xl:grid-cols-[1.6fr_1fr]">
                        <section className="stitch-card overflow-hidden">
                            <div className="flex items-center justify-between border-b px-6 py-5">
                                <div>
                                    <h2 className="text-lg font-semibold">{t("Kelas yang dikelola")}</h2>
                                    <p className="mt-1 text-sm text-muted-foreground">{t("Pilih kelas untuk melanjutkan penyusunan materi.")}</p>
                                </div>
                                <Link href="/admin?section=paths" className="text-sm font-semibold text-link hover:underline">
                                    {t("Lihat semua")}
                                </Link>
                            </div>
                            {paths.length ? (
                                <div className="divide-y">
                                    {paths.map((path) => (
                                        <button
                                            key={path.id}
                                            type="button"
                                            onClick={() => goToPath(path)}
                                            className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left hover:bg-secondary"
                                        >
                                            <span>
                                                <span className="block font-semibold">{path.title}</span>
                                                <span className="mt-1 block text-sm text-muted-foreground">
                                                    {path.units?.length ?? 0} {t("unit ·")} {(path.units ?? []).flatMap((unit) => unit.lessons ?? []).length} {t("pelajaran")}
                                                </span>
                                            </span>
                                            <span className="flex items-center gap-3">
                                                <Status value={path.status} />
                                                <ChevronRight className="size-4 text-muted-foreground" />
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-6">
                                    <Empty
                                        icon={LibraryBig}
                                        title="Belum ada kelas belajar"
                                        detail="Buat kelas untuk mulai mengatur unit dan pelajaran."
                                        action={<Button onClick={() => openPath()}>{t("Buat kelas")}</Button>}
                                    />
                                </div>
                            )}
                        </section>
                        <aside className="stitch-card p-6">
                            <h2 className="text-lg font-semibold">{t("Alur penerbitan")}</h2>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">{t("Materi harus lengkap dan ditinjau sebelum dibuka untuk pelajar.")}</p>
                            <ol className="mt-6 space-y-5">
                                {[
                                    ["01", "Susun pelajaran", "Tambahkan isi materi, contoh, dan latihan."],
                                    ["02", "Tinjau konten", "Periksa ragam bahasa, aksara, dan jawaban."],
                                    ["03", "Terbitkan berurutan", "Pelajaran, unit, lalu kelas belajar."],
                                ].map(([number, title, description]) => (
                                    <li key={number} className="flex gap-4">
                                        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent text-xs font-semibold text-link">{number}</span>
                                        <span>
                                            <strong className="block text-sm">{title}</strong>
                                            <span className="mt-1 block text-sm leading-6 text-muted-foreground">{description}</span>
                                        </span>
                                    </li>
                                ))}
                            </ol>
                            <Link href="/admin?section=paths" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-link hover:underline">
                                {t("Kelola kelas")} <ArrowRight className="size-4" />
                            </Link>
                        </aside>
                    </div>
                </div>
            )}

            {section === "paths" && (
                <div className="mt-7 space-y-6">
                    <section className="stitch-card p-4 md:p-5" aria-label={t("Pilih kelas belajar")}>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="text-sm font-extrabold">{t("Pilih kelas yang dikelola")}</h2>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {paths.length} {t("kelas tersedia")}
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_minmax(240px,1.15fr)]">
                            <label className="relative flex min-w-0 flex-col gap-1.5">
                                <span className="text-xs font-semibold text-muted-foreground">{t("Cari kelas")}</span>
                                <Search className="absolute top-[2.625rem] left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("Nama kelas...")} className="h-11 bg-card pl-9" />
                            </label>
                            <div className="flex min-w-0 flex-col gap-1.5">
                                <span className="text-xs font-semibold text-muted-foreground">{t("Status kelas")}</span>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="h-11 w-full bg-card" aria-label={t("Filter status kelas")}>
                                        <SelectValue placeholder={t("Semua status")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t("Semua status")}</SelectItem>
                                        {statuses.map((item) => (
                                            <SelectItem key={item.value} value={item.value}>
                                                {t(item.label)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex min-w-0 flex-col gap-1.5">
                                <span className="text-xs font-semibold text-muted-foreground">{t("Kelas terpilih")}</span>
                                {filteredPaths.length ? (
                                    <Select
                                        value={selectedPath?.slug ?? ""}
                                        onValueChange={(slug) => {
                                            const path = paths.find((item) => item.slug === slug);
                                            if (path) goToPath(path);
                                        }}
                                    >
                                        <SelectTrigger className="h-11 w-full bg-card" aria-label={t("Kelas terpilih")}>
                                            <SelectValue placeholder={t("Pilih kelas belajar")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredPaths.map((path) => {
                                                const lessonCount = (path.units ?? []).reduce((count, unit) => count + (unit.lessons?.length ?? 0), 0);
                                                return (
                                                    <SelectItem key={path.id} value={path.slug}>
                                                        {path.title} · {path.units?.length ?? 0} {t("unit ·")} {lessonCount} {t("pelajaran")}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <div className="flex h-11 items-center rounded-xl border border-dashed px-3 text-sm text-muted-foreground">
                                        {t("Tidak ada kelas yang cocok. Ubah kata kunci atau status.")}
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                    <div className="min-w-0 space-y-6">
                        {selectedPath ? (
                            <>
                                <section className="stitch-card overflow-hidden">
                                    <AdminPathArtwork path={selectedPath} />
                                    <div className="p-6">
                                        <div className="flex flex-wrap items-start justify-between gap-4">
                                            <div>
                                                <Status value={selectedPath.status} />
                                                <h2 className="mt-3 text-2xl font-extrabold">{selectedPath.title}</h2>
                                                <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{selectedPath.description || "Belum ada deskripsi kelas."}</p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <Button variant="outline" size="sm" onClick={() => openPath(selectedPath)}>
                                                    <Pencil className="size-4" /> {t("Ubah kelas")}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-[#b42335] hover:bg-[#fff1f2]"
                                                    onClick={() =>
                                                        setDeleting({
                                                            type: "paths",
                                                            id: selectedPath.id,
                                                            label: selectedPath.title,
                                                        })
                                                    }
                                                >
                                                    <Trash2 className="size-4" /> {t("Hapus")}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                                <section className="stitch-card overflow-hidden">
                                    <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
                                        <div>
                                            <h3 className="font-semibold">{t("Unit pembelajaran")}</h3>
                                            <p className="mt-1 text-sm text-muted-foreground">{t("Pilih unit untuk mengatur pelajaran di dalamnya.")}</p>
                                        </div>
                                        <Button variant="outline" className="min-h-10" onClick={() => openUnit()}>
                                            <Plus className="size-4" /> {t("Tambah unit")}
                                        </Button>
                                    </div>
                                    {selectedPath.units?.length && selectedUnit ? (
                                        <div className="grid gap-3 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(220px,1.4fr)] lg:items-end">
                                            <div>
                                                <p className="mb-1 text-xs font-semibold text-muted-foreground">
                                                    {t("Unit terpilih")} · {selectedPath.units.length} {t("unit")}
                                                </p>
                                                <Select
                                                    value={String(selectedUnit.id)}
                                                    onValueChange={(value) => {
                                                        setSelectedUnitId(Number(value));
                                                        setSelectedLessonId(null);
                                                    }}
                                                >
                                                    <SelectTrigger className="h-11 w-full bg-card">
                                                        <SelectValue placeholder={t("Pilih unit pembelajaran")} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {selectedPath.units.map((unit) => (
                                                            <SelectItem key={unit.id} value={String(unit.id)}>
                                                                {unit.title} · {unit.lessons?.length ?? 0} {t("pelajaran")}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="flex min-h-11 items-center rounded-lg bg-secondary/70 px-3 text-sm text-muted-foreground">
                                                <span className="truncate">{selectedUnit.description || t("Belum ada tujuan unit.")}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-5">
                                            <Empty
                                                icon={BookOpen}
                                                title="Belum ada unit"
                                                detail="Tambahkan unit untuk mulai menyusun urutan belajar."
                                                action={
                                                    <Button variant="outline" onClick={() => openUnit()}>
                                                        {t("Tambah unit")}
                                                    </Button>
                                                }
                                            />
                                        </div>
                                    )}
                                </section>
                                {selectedUnit && (
                                    <section className="surface overflow-hidden">
                                        <div className="flex flex-wrap items-start justify-between gap-3 border-b px-5 py-5">
                                            <div>
                                                <p className="text-xs font-semibold text-muted-foreground">{t("UNIT TERPILIH")}</p>
                                                <h3 className="mt-1 text-lg font-semibold">{selectedUnit.title}</h3>
                                                <p className="mt-1 text-sm text-muted-foreground">{selectedUnit.description || "Belum ada tujuan unit."}</p>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Status value={selectedUnit.status} />
                                                <Button variant="outline" size="sm" onClick={() => openUnit(selectedUnit)}>
                                                    <Pencil className="size-4" /> {t("Ubah unit")}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-[#b42335] hover:bg-[#fff1f2]"
                                                    onClick={() =>
                                                        setDeleting({
                                                            type: "units",
                                                            id: selectedUnit.id,
                                                            label: selectedUnit.title,
                                                        })
                                                    }
                                                >
                                                    <Trash2 className="size-4" /> {t("Hapus")}
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="p-5">
                                            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                                                <div>
                                                    <h4 className="text-sm font-semibold">{t("Urutan pelajaran")}</h4>
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {selectedUnit.lessons?.length ?? 0} {t("pelajaran")}
                                                    </p>
                                                </div>
                                                <Button variant="ghost" onClick={() => openLesson()} className="min-h-10 text-link">
                                                    <Plus className="size-4" /> {t("Tambah pelajaran")}
                                                </Button>
                                            </div>
                                            {(selectedUnit.lessons?.length ?? 0) > 0 && (
                                                <label className="relative mb-3 block">
                                                    <span className="sr-only">{t("Cari pelajaran")}</span>
                                                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                                    <Input
                                                        value={lessonQuery}
                                                        onChange={(event) => setLessonQuery(event.target.value)}
                                                        placeholder={t("Cari pelajaran dalam unit...")}
                                                        className="h-10 bg-card pl-9"
                                                    />
                                                </label>
                                            )}
                                            {matchingUnitLessons.length ? (
                                                <div className="space-y-2">
                                                    {visibleUnitLessons.map((lesson, index) => (
                                                        <button
                                                            key={lesson.id}
                                                            type="button"
                                                            onClick={() => setSelectedLessonId(lesson.id)}
                                                            className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left ${selectedLesson?.id === lesson.id ? "border-[#493ee5] bg-[#f4f1ff]" : "hover:bg-secondary"}`}
                                                        >
                                                            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-card text-xs font-semibold">
                                                                {(lessonPage - 1) * lessonPageSize + index + 1}
                                                            </span>
                                                            <span className="min-w-0 flex-1">
                                                                <strong className="block truncate text-sm">{lesson.title}</strong>
                                                                <span className="block text-xs text-muted-foreground">
                                                                    {t(labelStatus(lesson.status))} · {lesson.blocks?.length ?? 0} {t("blok ·")} {lesson.exercises?.length ?? 0}{" "}
                                                                    {t("latihan")}
                                                                </span>
                                                            </span>
                                                            <ChevronRight className="size-4 shrink-0" />
                                                        </button>
                                                    ))}
                                                    <CollectionPagination
                                                        total={matchingUnitLessons.length}
                                                        page={lessonPage}
                                                        pageSize={lessonPageSize}
                                                        onPageChange={setLessonPage}
                                                    />
                                                </div>
                                            ) : (
                                                <Empty
                                                    icon={FileText}
                                                    title={selectedUnit.lessons?.length ? "Pelajaran tidak ditemukan" : "Belum ada pelajaran"}
                                                    detail={selectedUnit.lessons?.length ? "Coba kata pencarian lain." : "Buat pelajaran pertama untuk unit ini."}
                                                    action={
                                                        selectedUnit.lessons?.length ? undefined : (
                                                            <Button variant="outline" onClick={() => openLesson()}>
                                                                {t("Tambah pelajaran")}
                                                            </Button>
                                                        )
                                                    }
                                                />
                                            )}
                                        </div>
                                    </section>
                                )}
                                {selectedLesson && (
                                    <LessonWorkspace
                                        lesson={selectedLesson}
                                        openLesson={() => openLesson(selectedLesson)}
                                        openBlock={openBlock}
                                        openExercise={openExercise}
                                        openQuizBuilder={(lesson) => openQuizBuilder(lesson)}
                                        openQuestion={openQuestion}
                                        remove={setDeleting}
                                    />
                                )}
                            </>
                        ) : (
                            <Empty
                                icon={LibraryBig}
                                title={paths.length ? "Kelas tidak ditemukan" : "Belum ada kelas belajar"}
                                detail={paths.length ? "Ubah pencarian atau filter status untuk melihat kelas lain." : "Buat kelas pertama Anda untuk memulai."}
                                action={
                                    paths.length ? (
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setQuery("");
                                                setStatusFilter("all");
                                            }}
                                        >
                                            {t("Hapus filter")}
                                        </Button>
                                    ) : (
                                        <Button onClick={() => openPath()}>{t("Buat kelas")}</Button>
                                    )
                                }
                            />
                        )}
                    </div>
                </div>
            )}

            {section === "vocabulary" && (
                <section className="mt-8 space-y-5">
                    <SearchBar query={query} setQuery={setQuery} placeholder={t("Cari kata, arti, aksara, atau ragam...")} onSubmit={(event) => submitCollectionSearch(event, "vocabulary")} />
                    <div className="surface overflow-hidden">
                        <div className="border-b px-5 py-4">
                            <h2 className="font-semibold">{t("Entri kosakata & aksara")}</h2>
                            <p className="mt-1 text-sm text-muted-foreground">{t("Entri berasal dari blok materi pada pelajaran.")}</p>
                        </div>
                        {vocabularyBlocks.length ? (
                            <>
                                <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
                                    {visibleVocabularyBlocks.map((block) => (
                                        <article key={block.id} className="flex min-h-44 flex-col rounded-xl border bg-card p-4 transition-colors hover:border-[#c8c3f8]">
                                            <div className="flex flex-wrap items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <span className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">{t(block.type)}</span>
                                                    <h3 className="mt-1 truncate font-semibold">{block.latin || block.title || t("Entri tanpa judul")}</h3>
                                                </div>
                                                <IconAction label="Ubah entri" icon={Pencil} action={() => openBlock(block)} />
                                            </div>
                                            {block.sundanese && (
                                                <p lang="su" className="sunda-script mt-2 text-2xl text-[#493ee5]">
                                                    {block.sundanese}
                                                </p>
                                            )}
                                            <p className="mt-2 line-clamp-2 text-sm leading-5 text-muted-foreground">{block.translation || t("Arti belum ditulis")}</p>
                                            <div className="mt-auto flex flex-wrap items-center justify-between gap-x-2 gap-y-1 border-t pt-3 text-xs text-muted-foreground">
                                                <span className="min-w-0 truncate">
                                                    {block.lessonTitle} · {block.pathTitle}
                                                </span>
                                                {(block.region || block.register) && <span className="shrink-0">{[block.region, block.register].filter(Boolean).join(" · ")}</span>}
                                            </div>
                                        </article>
                                    ))}
                                </div>
                                <PaginationControls pagination={collectionPagination} preserveScroll />
                            </>
                        ) : (
                            <div className="p-5">
                                <Empty
                                    icon={BookOpen}
                                    title={query ? "Tidak ada entri yang cocok" : "Belum ada kosakata atau aksara"}
                                    detail={query ? "Coba istilah pencarian lain." : "Tambahkan blok kosakata atau aksara pada pelajaran untuk melihatnya di sini."}
                                    action={
                                        !query && (
                                            <Link href="/admin?section=paths" className="btn-secondary">
                                                {t("Buka kelas belajar")}
                                            </Link>
                                        )
                                    }
                                />
                            </div>
                        )}
                    </div>
                </section>
            )}

            {section === "characters" && (
                <section className="mt-8 space-y-5">
                    <SearchBar query={query} setQuery={setQuery} placeholder={t("Cari aksara, latin, atau pelajaran...")} onSubmit={(event) => submitCollectionSearch(event, "characters")} />
                    <div className="surface overflow-hidden">
                        <div className="border-b px-5 py-4">
                            <h2 className="font-semibold">{t("Daftar aksara")}</h2>
                            <p className="mt-1 text-sm text-muted-foreground">{t("Kelola aksara melalui blok materi yang tersimpan pada pelajaran.")}</p>
                        </div>
                        {characterBlocks.length ? (
                            <>
                                <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
                                    {visibleCharacterBlocks.map((block) => (
                                        <article key={block.id} className="flex min-h-48 flex-col rounded-xl border bg-card p-4 transition-colors hover:border-[#c8c3f8]">
                                            <div className="flex flex-wrap items-start justify-between gap-2">
                                                <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-[#efedff] text-[#493ee5]">
                                                    {block.sundanese ? (
                                                        <span lang="su" className="sunda-script text-3xl">
                                                            {block.sundanese}
                                                        </span>
                                                    ) : (
                                                        <CaseSensitive className="size-6" />
                                                    )}
                                                </div>
                                                <div className="flex shrink-0 items-center gap-0.5">
                                                    <IconAction label="Ubah aksara" icon={Pencil} action={() => openBlock(block)} />
                                                    <IconAction
                                                        label="Hapus aksara"
                                                        icon={Trash2}
                                                        danger
                                                        action={() =>
                                                            setDeleting({
                                                                type: "blocks",
                                                                id: block.id,
                                                                label: block.title || block.latin || "aksara",
                                                            })
                                                        }
                                                    />
                                                </div>
                                            </div>
                                            <h3 className="mt-3 truncate font-semibold">{block.title || block.latin || t("Tanpa nama")}</h3>
                                            {block.title && block.latin && <p className="text-xs text-muted-foreground">{block.latin}</p>}
                                            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{block.translation || t("Arti belum ditulis")}</p>
                                            <p className="mt-auto truncate border-t pt-3 text-xs text-muted-foreground">
                                                {block.pathTitle} · {block.lessonTitle}
                                            </p>
                                        </article>
                                    ))}
                                </div>
                                <PaginationControls pagination={collectionPagination} preserveScroll />
                            </>
                        ) : (
                            <div className="p-5">
                                <Empty
                                    icon={CaseSensitive}
                                    title={query ? "Tidak ada aksara yang cocok" : "Belum ada aksara Sunda"}
                                    detail={query ? "Coba kata pencarian lain." : "Tambahkan blok aksara pada pelajaran di kelas Aksara Sunda untuk mengisi kumpulan ini."}
                                    action={
                                        !query && (
                                            <Link href="/admin?section=paths&path=aksara-sunda" className="btn-secondary">
                                                {t("Buka kelas Aksara Sunda")}
                                            </Link>
                                        )
                                    }
                                />
                            </div>
                        )}
                    </div>
                </section>
            )}

            {section === "exercises" && (
                <section className="mt-8 space-y-5">
                    <SearchBar query={query} setQuery={setQuery} placeholder={t("Cari judul latihan atau pelajaran...")} onSubmit={(event) => submitCollectionSearch(event, "exercises")} />
                    <div className="surface overflow-hidden">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
                            <div>
                                <h2 className="font-semibold">{t("Latihan & kuis yang tersusun")}</h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {t("Kelola latihan dan kuis evaluasi untuk setiap pelajaran.")} · {collectionPagination.total} {t("aktivitas")}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Button variant="outline" className="min-h-10" onClick={() => openExercise(undefined, null)}>
                                    <Plus className="size-4" /> {t("Tambah latihan")}
                                </Button>
                                <Button className="min-h-10 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => openQuizBuilder()}>
                                    <Plus className="size-4" /> {t("Buat kuis")}
                                </Button>
                            </div>
                        </div>
                        {filteredExercises.length ? (
                            <>
                                <div className="space-y-3 p-4">
                                    {visibleExercises.map((exercise, index) => (
                                        <article key={exercise.id} className="rounded-xl border bg-card p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex min-w-0 items-start gap-3">
                                                    <span className="inline-flex h-8 shrink-0 items-center rounded-md bg-accent px-2 text-xs font-bold text-link">
                                                        No. {collectionPagination.from + index}
                                                    </span>
                                                    <div className="min-w-0">
                                                        <h3 className="truncate font-semibold">{exercise.title}</h3>
                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            {exercise.pathTitle} / {exercise.lessonTitle} · {exercise.questions?.length ?? 0} {t("soal")}
                                                            <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                                                                {t(exercise.kind === "quiz" ? "Kuis" : "Latihan")}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex shrink-0 gap-1">
                                                    <IconAction label="Ubah latihan" icon={Pencil} action={() => openExercise(exercise)} />
                                                    <IconAction
                                                        label="Hapus latihan"
                                                        icon={Trash2}
                                                        danger
                                                        action={() =>
                                                            setDeleting({
                                                                type: "exercises",
                                                                id: exercise.id,
                                                                label: exercise.title,
                                                            })
                                                        }
                                                    />
                                                </div>
                                            </div>
                                            <details className="group mt-3 rounded-lg bg-secondary/60 px-3 py-2">
                                                <summary className="cursor-pointer list-none text-sm font-medium marker:hidden">
                                                    <span className="flex items-center justify-between gap-3">
                                                        <span>
                                                            {t("Lihat soal")} · {exercise.questions?.length ?? 0}
                                                        </span>
                                                        <ChevronRight className="size-4 rotate-90 transition-transform group-open:-rotate-90" />
                                                    </span>
                                                </summary>
                                                <div className="mt-3 max-h-72 space-y-2 overflow-y-auto border-t pt-3 pr-1">
                                                    {exercise.questions?.length ? (
                                                        exercise.questions.map((question, index) => (
                                                            <div key={question.id} className="flex items-center justify-between gap-3 rounded-md bg-card px-3 py-2 text-sm">
                                                                <span className="min-w-0 truncate">
                                                                    {index + 1}. {question.prompt}
                                                                </span>
                                                                <IconAction label="Ubah soal" icon={Pencil} action={() => openQuestion(exercise, question)} />
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-sm text-muted-foreground">{t("Belum ada soal")}</p>
                                                    )}
                                                </div>
                                                <Button variant="outline" className="mt-3 min-h-10" onClick={() => openQuestion(exercise)}>
                                                    <Plus className="size-4" /> {t("Tambah soal")}
                                                </Button>
                                            </details>
                                        </article>
                                    ))}
                                </div>
                                <PaginationControls pagination={collectionPagination} preserveScroll />
                            </>
                        ) : (
                            <div className="p-5">
                                <Empty
                                    icon={FileQuestion}
                                    title={query ? "Aktivitas tidak ditemukan" : "Belum ada latihan atau kuis"}
                                    detail={query ? "Coba kata pencarian lain." : allLessons.length === 0 ? "Tambahkan pelajaran terlebih dahulu untuk membuat latihan atau kuis." : "Gunakan Tambah latihan untuk membuat latihan, atau Buat kuis untuk menyusun evaluasi beserta soalnya."}
                                    action={
                                        !query && allLessons.length === 0 && (
                                            <Link href="/admin?section=paths" className="btn-secondary">
                                                {t("Kelola pelajaran")}
                                            </Link>
                                        )
                                    }
                                />
                            </div>
                        )}
                    </div>
                </section>
            )}

            {section === "media" && (
                <section className="mt-8 space-y-5">
                    <SearchBar query={query} setQuery={setQuery} placeholder={t("Cari audio berdasarkan kata atau pelajaran...")} onSubmit={(event) => submitCollectionSearch(event, "media")} />
                    <div className="surface overflow-hidden">
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b px-5 py-4">
                            <div>
                                <h2 className="font-semibold">{mediaView === "uploaded" ? t("Audio pelafalan") : t("Blok materi tanpa audio")}</h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {mediaView === "uploaded" ? t("Audio tersimpan pada blok materi terkait.") : t("Pilih materi, lalu unggah file rekaman suara.")} ·{" "}
                                    {mediaCounts[mediaView]} {mediaView === "uploaded" ? t("audio") : t("materi")}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Button variant={mediaView === "uploaded" ? "default" : "outline"} className="min-h-10" onClick={() => changeMediaView("uploaded")}>
                                    <Volume2 className="size-4" /> {t("Audio tersimpan")} · {mediaCounts.uploaded}
                                </Button>
                                <Button variant={mediaView === "missing" ? "default" : "outline"} className="min-h-10" onClick={() => changeMediaView("missing")}>
                                    <AudioLines className="size-4" /> {t("Materi tanpa audio")} · {mediaCounts.missing}
                                </Button>
                            </div>
                        </div>
                        {mediaView === "uploaded" ? (
                            mediaBlocks.length ? (
                                <>
                                    <div className="grid gap-3 p-4 xl:grid-cols-2">
                                        {visibleMediaBlocks.map((block) => (
                                            <article key={block.id} className="flex min-w-0 flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-4">
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-link">
                                                        <Volume2 className="size-5" />
                                                    </span>
                                                    <div className="min-w-0">
                                                        <h3 className="truncate font-semibold">{block.latin || block.title || t("Audio materi")}</h3>
                                                        <p className="mt-1 truncate text-xs text-muted-foreground">
                                                            {block.lessonTitle} · {block.pathTitle}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:flex-none">
                                                    <audio controls preload="none" src={`/storage/${block.audio_path}`} className="h-10 max-w-[260px] min-w-0">
                                                        {t("Audio tidak tersedia.")}
                                                    </audio>
                                                    <IconAction label="Ganti audio" icon={Pencil} action={() => openBlockAudio(block)} />
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                    <PaginationControls pagination={collectionPagination} preserveScroll />
                                </>
                            ) : (
                                <div className="p-5">
                                    <Empty
                                        icon={AudioLines}
                                        title={query ? "Audio tidak ditemukan" : "Belum ada audio"}
                                        detail={query ? "Coba pencarian lain." : "Gunakan tab Tambah audio untuk memilih materi yang akan diberi audio."}
                                        action={
                                            !query && (
                                                <Button variant="outline" onClick={() => openBlockAudio()}>
                                                    <Plus className="size-4" /> {t("Tambah audio")}
                                                </Button>
                                            )
                                        }
                                    />
                                </div>
                            )
                        ) : missingAudioBlocks.length ? (
                            <>
                                <div className="grid gap-3 p-4 md:grid-cols-2">
                                    {visibleMissingAudioBlocks.map((block) => (
                                        <article key={block.id} className="flex min-w-0 items-center justify-between gap-3 rounded-xl border bg-card p-4">
                                            <div className="flex min-w-0 items-center gap-3">
                                                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-link">
                                                    <AudioLines className="size-5" />
                                                </span>
                                                <div className="min-w-0">
                                                    <h3 className="truncate font-semibold">{block.latin || block.title || t("Blok materi")}</h3>
                                                    <p className="mt-1 truncate text-xs text-muted-foreground">
                                                        {block.lessonTitle} · {block.pathTitle}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button variant="outline" className="min-h-10 shrink-0" onClick={() => openBlockAudio(block)}>
                                                <Plus className="size-4" /> {t("Tambah audio")}
                                            </Button>
                                        </article>
                                    ))}
                                </div>
                                <PaginationControls pagination={collectionPagination} preserveScroll />
                            </>
                        ) : (
                            <div className="p-5">
                                <Empty
                                    icon={AudioLines}
                                    title={query ? "Materi tanpa audio tidak ditemukan" : "Semua materi sudah memiliki audio"}
                                    detail={query ? "Coba kata pencarian lain." : "Belum ada blok materi lain yang perlu ditambahkan audio."}
                                    action={
                                        !query && (
                                            <Link href="/admin?section=paths" className="btn-secondary">
                                                {t("Kelola materi")}
                                            </Link>
                                        )
                                    }
                                />
                            </div>
                        )}
                    </div>
                </section>
            )}

            {section === "learners" && (
                <section className="mt-8 space-y-5">
                    <SearchBar
                        query={query}
                        setQuery={setQuery}
                        placeholder={t("Cari nama atau email pelajar...")}
                        onSubmit={(event) => {
                            event.preventDefault();
                            router.get(
                                "/admin",
                                { section: "learners", q: query.trim() || undefined, learners_page: 1 },
                                { preserveState: true, preserveScroll: true, replace: true, only: ["learners", "learnersPagination"] },
                            );
                        }}
                    />
                    <div className="surface overflow-hidden">
                        <div className="border-b px-5 py-4">
                            <h2 className="font-semibold">{t("Aktivitas pelajar")}</h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {t("Jumlah pelajaran yang dituntaskan dan percobaan latihan dari data akun.")} · {learnersPagination.total} {t("pelajar")}
                            </p>
                        </div>
                        {learners.length ? (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[550px] text-left text-sm">
                                        <thead className="bg-secondary text-muted-foreground">
                                            <tr>
                                                <th scope="col" className="px-5 py-4 font-semibold">
                                                    {t("Pelajar")}
                                                </th>
                                                <th scope="col" className="px-5 py-4 font-semibold">
                                                    {t("Pelajaran selesai")}
                                                </th>
                                                <th scope="col" className="px-5 py-4 font-semibold">
                                                    {t("Percobaan latihan")}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {learners.map((learner) => (
                                                <tr key={learner.id}>
                                                    <td className="px-5 py-4">
                                                        <strong className="block">{learner.name}</strong>
                                                        <span className="text-muted-foreground">{learner.email}</span>
                                                    </td>
                                                    <td className="px-5 py-4">{learner.completed}</td>
                                                    <td className="px-5 py-4">{learner.attempts}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <PaginationControls pagination={learnersPagination} preserveScroll />
                            </>
                        ) : (
                            <div className="p-5">
                                <Empty
                                    icon={Users}
                                    title={query ? "Pelajar tidak ditemukan" : "Belum ada pelajar"}
                                    detail={query ? "Coba nama atau email lain." : "Aktivitas akan terlihat setelah akun pelajar terdaftar dan mulai belajar."}
                                />
                            </div>
                        )}
                    </div>
                </section>
            )}
            {section === "analytics" && <AnalyticsPanel analytics={analytics} />}
            {section === "tutor" && <TutorSettingsPanel settings={tutorSettings} />}
            {section === "feedback" && (
                <section className="mt-8 space-y-5">
                    <SearchBar
                        query={query}
                        setQuery={setQuery}
                        placeholder="Cari nama pelajar atau isi umpan balik..."
                        onSubmit={(event) => {
                            event.preventDefault();
                            router.get(
                                "/admin",
                                { section: "feedback", q: query.trim() || undefined, feedback_page: 1 },
                                { preserveState: true, preserveScroll: true, replace: true, only: ["feedback", "feedbackPagination", "feedbackStats"] },
                            );
                        }}
                    />
                    <div className="grid gap-3 sm:grid-cols-3">
                        {(
                            [
                                ["Baru", feedbackStats.new],
                                ["Ditinjau", feedbackStats.reviewing],
                                ["Selesai", feedbackStats.resolved],
                            ] as const
                        ).map(([label, count]) => (
                            <div key={label} className="stitch-card p-4">
                                <p className="text-xs font-semibold text-muted-foreground">{t(label)}</p>
                                <p className="mt-2 text-2xl font-extrabold">{count}</p>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-3">
                        {feedback.length ? (
                            <>
                                {feedback.map((item) => <FeedbackCard key={item.id} item={item} />)}
                                <div className="stitch-card overflow-hidden">
                                    <PaginationControls pagination={feedbackPagination} preserveScroll />
                                </div>
                            </>
                        ) : (
                            <div className="stitch-card p-5">
                                <Empty
                                    icon={MessageSquareWarning}
                                    title={query ? "Masukan tidak ditemukan" : "Belum ada umpan balik"}
                                    detail={query ? "Coba kata kunci lain." : "Masukan dari pelajar akan muncul di sini setelah dikirim."}
                                />
                            </div>
                        )}
                    </div>
                </section>
            )}
            <FormModal config={modal} close={() => setModal(null)} />
            {quizBuilderOpen && <QuizBuilderModal key={quizBuilderLessonId ?? "new"} lessons={allLessons} initialLessonId={quizBuilderLessonId} close={() => setQuizBuilderOpen(false)} />}
            {quizQuestionModal && <QuizQuestionModal target={quizQuestionModal} close={() => setQuizQuestionModal(null)} />}
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

function AnalyticsPanel({ analytics }: { analytics: Analytics }) {
    const metrics = [
        {
            label: "Pelajar terdaftar",
            value: analytics.learners,
            icon: Users,
            note: "Semua akun pelajar",
        },
        {
            label: "Aktif 7 hari",
            value: analytics.activeLearners,
            icon: Activity,
            note: "Membuka materi atau latihan",
        },
        {
            label: "Pelajaran selesai · 30 hari",
            value: analytics.completedLessons,
            icon: CheckCircle2,
            note: "Penyelesaian dalam 30 hari terakhir",
        },
        {
            label: "Akurasi latihan · 30 hari",
            value: `${analytics.averageAccuracy}%`,
            icon: ChartNoAxesCombined,
            note: `${analytics.attempts} percobaan terkumpul`,
        },
    ];
    const maxCompletions = Math.max(1, ...analytics.pathCompletions.map((path) => Number(path.completions)));

    return (
        <section className="mt-8 space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {metrics.map(({ label, value, icon: Icon, note }) => (
                    <article key={label} className="stitch-card p-5">
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-xs font-semibold text-muted-foreground">{t(label)}</span>
                            <span className="flex size-9 items-center justify-center rounded-xl bg-[#efedff] text-[#493ee5]">
                                <Icon className="size-4" />
                            </span>
                        </div>
                        <p className="mt-3 text-3xl font-extrabold tracking-tight">{value}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{t(note)}</p>
                    </article>
                ))}
            </div>
            <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
                <section className="stitch-card overflow-hidden">
                    <div className="border-b px-5 py-4">
                        <h2 className="font-bold">{t("Penyelesaian per kelas")}</h2>
                        <p className="mt-1 text-xs text-muted-foreground">{t("Jumlah pelajaran yang dituntaskan di setiap kelas dalam 30 hari terakhir.")}</p>
                    </div>
                    {analytics.pathCompletions.length ? (
                        <div className="space-y-5 p-5">
                            {analytics.pathCompletions.map((path) => {
                                const count = Number(path.completions);
                                return (
                                    <div key={path.id}>
                                        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                                            <span className="truncate font-semibold">{path.title}</span>
                                            <span className="shrink-0 text-xs text-muted-foreground">
                                                {count} {t("selesai")}
                                            </span>
                                        </div>
                                        <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
                                            <div
                                                className="h-full rounded-full bg-[#493ee5] transition-[width]"
                                                style={{
                                                    width: `${Math.max(count ? 5 : 0, (count / maxCompletions) * 100)}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-5">
                            <Empty icon={BookOpen} title="Belum ada kelas" detail="Kelas dan progres penyelesaian akan tampil setelah tersedia." />
                        </div>
                    )}
                </section>
                <section className="stitch-card overflow-hidden">
                    <div className="border-b px-5 py-4">
                        <h2 className="font-bold">{t("Latihan yang perlu ditinjau")}</h2>
                        <p className="mt-1 text-xs text-muted-foreground">{t("Urutan berdasarkan akurasi terendah selama 30 hari terakhir. Aktivitas tampil setelah terkumpul minimal 5 percobaan.")}</p>
                    </div>
                    {analytics.hardestExercises.length ? (
                        <div className="divide-y">
                            {analytics.hardestExercises.map((exercise) => (
                                <div key={exercise.id} className="flex items-center gap-3 px-5 py-4">
                                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#fff4e5] text-[#a34b05]">
                                        <ChartNoAxesCombined className="size-4" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold">{exercise.title}</p>
                                        <p className="truncate text-xs text-muted-foreground">
                                            {exercise.lesson_title} · {exercise.attempts} {t("percobaan")}
                                        </p>
                                    </div>
                                    <span className="shrink-0 text-sm font-extrabold">{exercise.accuracy}%</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-5">
                            <Empty icon={ChartNoAxesCombined} title="Belum ada data yang cukup" detail="Aktivitas latihan tampil setelah masing-masing menerima minimal 5 percobaan agar ringkasan lebih mewakili." />
                        </div>
                    )}
                </section>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border bg-card px-5 py-4 text-sm">
                <Bot className="size-4 text-[#493ee5]" />
                <span className="font-semibold">
                    {t("Aktivitas Tutor AI 30 hari")}: {analytics.tutorMessages} {t("percakapan")}
                </span>
                <span className="text-muted-foreground">{t("Jumlah pesan dalam 30 hari terakhir.")}</span>
            </div>
        </section>
    );
}

function TutorSettingsPanel({ settings }: { settings: TutorSettings }) {
    const [form, setForm] = useState({
        api_url: settings.apiUrl,
        model: settings.model,
        api_key: "",
        enabled: settings.enabled,
        response_language: settings.responseLanguage,
        response_style: settings.responseStyle,
        max_tokens: settings.maxTokens,
        clear_api_key: false,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);
    const [testing, setTesting] = useState(false);
    const save = (event: React.FormEvent) => {
        event.preventDefault();
        setProcessing(true);
        setErrors({});
        router.put("/admin/tutor-settings", form, {
            preserveScroll: true,
            onError: setErrors,
            onSuccess: () => toast.success(t("Pengaturan Tutor AI berhasil disimpan.")),
            onFinish: () => setProcessing(false),
        });
    };
    const testConnection = () => {
        setTesting(true);
        router.post("/admin/tutor-settings/test", {
            api_url: form.api_url,
            model: form.model,
            api_key: form.api_key,
            clear_api_key: form.clear_api_key,
        }, {
            preserveScroll: true,
            onError: () => toast.error(t("Periksa URL API dan nama model.")),
            onFinish: () => setTesting(false),
        });
    };
    const fieldClass =
        "mt-1.5 min-h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-[#493ee5] focus:ring-2 focus:ring-[#493ee5]/15";
    const fieldLabel = "text-xs font-bold text-foreground";
    const keyStatus =
        settings.keySource === "database"
            ? "Kunci tersimpan terenkripsi"
            : settings.keySource === "environment"
              ? "Kunci berasal dari konfigurasi server"
              : "Kunci belum dikonfigurasi";

    return (
        <section className="mt-8 space-y-5">
            <div className="grid gap-3 sm:grid-cols-3">
                <div className="stitch-card flex items-center gap-3 p-4">
                    <span
                        className={`flex size-10 items-center justify-center rounded-xl ${settings.enabled ? "bg-[#eaf8ef] text-[#17633a]" : "bg-secondary text-muted-foreground"}`}
                    >
                        <Bot className="size-5" />
                    </span>
                    <div>
                        <p className="text-xs text-muted-foreground">{t("Status tutor")}</p>
                        <p className="text-sm font-bold">{settings.enabled ? t("Aktif") : t("Dinonaktifkan")}</p>
                    </div>
                </div>
                <div className="stitch-card flex items-center gap-3 p-4">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-[#efedff] text-[#493ee5]">
                        <MessageSquareWarning className="size-5" />
                    </span>
                    <div>
                        <p className="text-xs text-muted-foreground">{t("Pesan hari ini")}</p>
                        <p className="text-sm font-bold">{settings.messagesToday}</p>
                    </div>
                </div>
                <div className="stitch-card flex items-center gap-3 p-4">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-[#fff4e5] text-[#a34b05]">
                        <Activity className="size-5" />
                    </span>
                    <div>
                        <p className="text-xs text-muted-foreground">{t("Token hari ini")}</p>
                        <p className="text-sm font-bold">{settings.tokensToday.toLocaleString("id-ID")}</p>
                    </div>
                </div>
            </div>
            <form onSubmit={save} className="stitch-card overflow-hidden">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b px-5 py-5">
                    <div className="flex items-start gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#efedff] text-[#493ee5]">
                            <Bot className="size-5" />
                        </span>
                        <div>
                            <h2 className="font-bold">{t("Konfigurasi tutor")}</h2>
                            <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">
                                {t("Tutor hanya menggunakan materi pelajaran yang sudah diterbitkan sebagai rujukan jawaban.")}
                            </p>
                        </div>
                    </div>
                    <span className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${settings.hasApiKey ? "bg-[#eaf8ef] text-[#17633a]" : "bg-[#fff4e5] text-[#925000]"}`}>
                        {settings.hasApiKey ? t(keyStatus) : t("API key belum diatur")}
                    </span>
                </div>
                <div className="grid gap-x-5 gap-y-4 p-5 md:grid-cols-2">
                    <label className={fieldLabel}>
                        {t("URL API")}
                        <input
                            className={fieldClass}
                            type="url"
                            value={form.api_url}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    api_url: event.target.value,
                                })
                            }
                            placeholder="https://api.openai.com/v1"
                        />
                        {errors.api_url && <span className="mt-1 block text-xs text-destructive">{errors.api_url}</span>}
                    </label>
                    <label className={fieldLabel}>
                        {t("Nama model")}
                        <input className={fieldClass} value={form.model} onChange={(event) => setForm({ ...form, model: event.target.value })} placeholder="gpt-4o-mini" />
                        {errors.model && <span className="mt-1 block text-xs text-destructive">{errors.model}</span>}
                    </label>
                    <label className={`${fieldLabel} md:col-span-2`}>
                        {t("API key baru (opsional)")}
                        <input
                            className={fieldClass}
                            type="password"
                            autoComplete="new-password"
                            value={form.api_key}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    api_key: event.target.value,
                                    clear_api_key: false,
                                })
                            }
                            placeholder={settings.hasApiKey ? t("Kosongkan untuk mempertahankan kunci saat ini") : "sk-..."}
                        />
                        <span className="mt-1 block font-normal text-muted-foreground">{t("Kunci disimpan terenkripsi dan tidak pernah ditampilkan kembali.")}</span>
                        {errors.api_key && <span className="mt-1 block text-xs text-destructive">{errors.api_key}</span>}
                        {settings.keySource === "database" && (
                            <button
                                type="button"
                                onClick={() =>
                                    setForm({
                                        ...form,
                                        api_key: "",
                                        clear_api_key: !form.clear_api_key,
                                    })
                                }
                                className={`mt-2 text-xs font-bold ${form.clear_api_key ? "text-destructive" : "text-muted-foreground hover:text-destructive"}`}
                            >
                                {form.clear_api_key ? t("Kunci tersimpan akan dihapus") : t("Hapus kunci tersimpan")}
                            </button>
                        )}
                    </label>
                    <label className={fieldLabel}>
                        {t("Bahasa jawaban")}
                        <select
                            className={fieldClass}
                            value={form.response_language}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    response_language: event.target.value as TutorSettings["responseLanguage"],
                                })
                            }
                        >
                            <option value="user">{t("Ikuti bahasa akun pelajar")}</option>
                            <option value="id">{t("Bahasa Indonesia")}</option>
                            <option value="su">{t("Bahasa Sunda")}</option>
                        </select>
                    </label>
                    <label className={fieldLabel}>
                        {t("Gaya jawaban")}
                        <select
                            className={fieldClass}
                            value={form.response_style}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    response_style: event.target.value as TutorSettings["responseStyle"],
                                })
                            }
                        >
                            <option value="warm">{t("Hangat dan ringkas")}</option>
                            <option value="concise">{t("Sangat ringkas")}</option>
                            <option value="step_by_step">{t("Bertahap dengan contoh")}</option>
                        </select>
                    </label>
                    <label className={fieldLabel}>
                        {t("Batas token jawaban")}
                        <input
                            className={fieldClass}
                            type="number"
                            min={100}
                            max={1500}
                            step={50}
                            value={form.max_tokens}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    max_tokens: Number(event.target.value),
                                })
                            }
                        />
                        {errors.max_tokens && <span className="mt-1 block text-xs text-destructive">{errors.max_tokens}</span>}
                    </label>
                    <label className="flex min-h-11 items-center gap-3 self-end rounded-xl border px-3 py-2.5 text-sm font-semibold">
                        <input
                            type="checkbox"
                            checked={form.enabled}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    enabled: event.target.checked,
                                })
                            }
                            className="size-4 accent-[#493ee5]"
                        />
                        {t("Aktifkan Tutor AI untuk pelajar")}
                    </label>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-secondary/40 px-5 py-4">
                    <div className="max-w-2xl space-y-1">
                        <p className="flex items-center gap-2 text-xs leading-5 text-muted-foreground">
                            <ShieldCheck className="size-4 shrink-0 text-[#17633a]" />
                            {t("Kunci API dikirim ke server Sawala dan tidak pernah diberikan ke browser pelajar.")}
                        </p>
                        <p className="pl-6 text-xs leading-5 text-muted-foreground">
                            {t("Uji koneksi mengirim satu permintaan singkat dengan pengaturan saat ini tanpa menyimpan perubahan.")}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="outline" disabled={processing || testing} onClick={testConnection} className="min-h-10 gap-2">
                            <CheckCircle2 className="size-4" />
                            {testing ? t("Menguji koneksi...") : t("Uji koneksi")}
                        </Button>
                        <Button type="submit" disabled={processing || testing} className="min-h-10 gap-2">
                            <Save className="size-4" />
                            {processing ? t("Menyimpan...") : t("Simpan pengaturan")}
                        </Button>
                    </div>
                </div>
            </form>
        </section>
    );
}

function FeedbackCard({ item }: { item: FeedbackItem }) {
    const statusLabel = item.status === "new" ? "Baru" : item.status === "reviewing" ? "Ditinjau" : "Selesai";
    const categoryLabel = item.category === "content" ? "Materi" : item.category === "bug" ? "Masalah teknis" : item.category === "idea" ? "Saran fitur" : "Lainnya";
    const dateLabel = new Intl.DateTimeFormat("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(item.created_at));

    return (
        <article className="stitch-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#efedff] px-2.5 py-1 text-[11px] font-bold text-[#493ee5]">{t(categoryLabel)}</span>
                        <span className="text-xs text-muted-foreground">{dateLabel}</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 whitespace-pre-wrap">{item.message}</p>
                    <p className="mt-3 text-xs text-muted-foreground">
                        {item.learner_name} · {item.learner_email}
                        {item.page ? ` · ${item.page}` : ""}
                    </p>
                </div>
                <label className="shrink-0 text-xs font-semibold text-muted-foreground">
                    <span className="sr-only">{t("Status tindak lanjut")}</span>
                    <select
                        value={item.status}
                        onChange={(event) =>
                            router.put(
                                `/admin/feedback/${item.id}`,
                                { status: event.target.value },
                                {
                                    preserveScroll: true,
                                    onSuccess: () => toast.success(t("Status masukan diperbarui.")),
                                },
                            )
                        }
                        className="min-h-10 rounded-xl border bg-background px-3 text-sm font-bold text-foreground outline-none focus-visible:border-[#493ee5] focus-visible:ring-2 focus-visible:ring-[#493ee5]/20"
                    >
                        <option value="new">{t("Baru")}</option>
                        <option value="reviewing">{t("Ditinjau")}</option>
                        <option value="resolved">{t("Selesai")}</option>
                    </select>
                    <span className="mt-1 block text-right">{t(statusLabel)}</span>
                </label>
            </div>
        </article>
    );
}

function SearchBar({
    query,
    setQuery,
    placeholder,
    onSubmit,
}: {
    query: string;
    setQuery: (value: string) => void;
    placeholder: string;
    onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
    const content = (
        <>
            <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <label className="sr-only" htmlFor="content-search">
                    {t("Cari konten")}
                </label>
                <Input id="content-search" className="h-11 bg-card pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t(placeholder)} />
            </div>
            {onSubmit ? (
                <Button type="submit" variant="outline" className="min-h-11 shrink-0">
                    <Search className="size-4" /> {t("Cari")}
                </Button>
            ) : (
                <ListFilter className="size-5 text-muted-foreground" aria-hidden="true" />
            )}
        </>
    );

    return (
        onSubmit ? <form onSubmit={onSubmit} className="flex max-w-xl items-center gap-3">{content}</form> : <div className="flex max-w-xl items-center gap-3">{content}</div>
    );
}

function LessonWorkspace({
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
    const [tab, setTab] = useState<"material" | "exercise">("material");
    return (
        <section className="surface overflow-hidden">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b px-5 py-5">
                <div>
                    <p className="text-xs font-semibold text-muted-foreground">{t("EDITOR PELAJARAN")}</p>
                    <h3 className="mt-1 text-xl font-semibold">{lesson.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{lesson.summary || t("Belum ada ringkasan pelajaran.")}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Status value={lesson.status} />
                    <Button variant="outline" size="sm" onClick={openLesson}>
                        <Pencil className="size-4" /> {t("Ubah pelajaran")}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-[#b42335] hover:bg-[#fff1f2]"
                        onClick={() =>
                            remove({
                                type: "lessons",
                                id: lesson.id,
                                label: lesson.title,
                            })
                        }
                    >
                        <Trash2 className="size-4" /> {t("Hapus")}
                    </Button>
                </div>
            </div>
            <div className="flex border-b px-5" role="tablist" aria-label={t("Isi pelajaran")}>
                <button
                    role="tab"
                    type="button"
                    aria-selected={tab === "material"}
                    onClick={() => setTab("material")}
                    className={`min-h-12 border-b-2 px-4 text-sm font-semibold ${tab === "material" ? "border-[#493ee5] text-link" : "border-transparent text-muted-foreground"}`}
                >
                    {t("Materi (")}
                    {lesson.blocks?.length ?? 0})
                </button>
                <button
                    role="tab"
                    type="button"
                    aria-selected={tab === "exercise"}
                    onClick={() => setTab("exercise")}
                    className={`min-h-12 border-b-2 px-4 text-sm font-semibold ${tab === "exercise" ? "border-[#493ee5] text-link" : "border-transparent text-muted-foreground"}`}
                >
                    {t("Latihan (")}
                    {lesson.exercises?.length ?? 0})
                </button>
            </div>
            <div className="p-5">
                {tab === "material" ? (
                    <>
                        <div className="mb-4 flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">{t("Susun teks dan contoh sesuai urutan belajar.")}</p>
                            <Button variant="outline" className="min-h-10" onClick={() => openBlock(undefined, lesson)}>
                                <Plus className="size-4" /> {t("Blok materi")}
                            </Button>
                        </div>
                        {lesson.blocks?.length ? (
                            <div className="space-y-3">
                                {lesson.blocks.map((block) => (
                                    <article key={block.id} className="rounded-md border p-4">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <span className="text-xs font-semibold text-muted-foreground">
                                                    {blockTypes.find((item) => item.value === block.type)?.label ?? "Materi"}
                                                </span>
                                                <h4 className="mt-1 font-semibold">{block.title || block.latin || "Blok materi"}</h4>
                                            </div>
                                            <div className="flex shrink-0 gap-1">
                                                <IconAction label="Ubah blok" icon={Pencil} action={() => openBlock(block, lesson)} />
                                                <IconAction
                                                    label="Hapus blok"
                                                    icon={Trash2}
                                                    danger
                                                    action={() =>
                                                        remove({
                                                            type: "blocks",
                                                            id: block.id,
                                                            label: block.title || "blok materi",
                                                        })
                                                    }
                                                />
                                            </div>
                                        </div>
                                        {block.body && <p className="mt-3 line-clamp-3 text-sm leading-6 whitespace-pre-line text-muted-foreground">{block.body}</p>}
                                        {block.sundanese && (
                                            <p lang="su" className="sunda-script mt-2 text-xl">
                                                {block.sundanese}
                                            </p>
                                        )}
                                        {block.translation && <p className="mt-1 text-sm text-muted-foreground">{block.translation}</p>}
                                        {block.context && (
                                            <p className="mt-2 text-xs text-muted-foreground">
                                                {t("Konteks:")} {block.context}
                                            </p>
                                        )}
                                        {block.audio_path && (
                                            <span className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                <Volume2 className="size-3.5" /> {t("Audio tersedia")}
                                            </span>
                                        )}
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <Empty
                                icon={FileText}
                                title="Materi belum diisi"
                                detail="Pelajaran memerlukan paling sedikit satu blok materi sebelum bisa diterbitkan."
                                action={
                                    <Button variant="outline" onClick={() => openBlock(undefined, lesson)}>
                                        {t("Tambah materi")}
                                    </Button>
                                }
                            />
                        )}
                    </>
                ) : (
                    <>
                        <div className="mb-4 flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">{t("Soal dinilai menggunakan kunci jawaban admin.")}</p>
                            <div className="flex flex-wrap gap-2">
                                <Button variant="outline" className="min-h-10" onClick={() => openExercise(undefined, lesson)}>
                                    <Plus className="size-4" /> {t("Latihan")}
                                </Button>
                                <Button className="min-h-10" onClick={() => openQuizBuilder(lesson)}>
                                    <Plus className="size-4" /> {t("Buat kuis")}
                                </Button>
                            </div>
                        </div>
                        {lesson.exercises?.length ? (
                            <div className="space-y-4">
                                {lesson.exercises.map((exercise) => (
                                    <article key={exercise.id} className="rounded-md border p-4">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h4 className="font-semibold">{exercise.title}</h4>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {exercise.questions?.length ?? 0} {t("soal")}
                                                </p>
                                            </div>
                                            <div className="flex gap-1">
                                                <IconAction label="Ubah latihan" icon={Pencil} action={() => openExercise(exercise, lesson)} />
                                                <IconAction
                                                    label="Hapus latihan"
                                                    icon={Trash2}
                                                    danger
                                                    action={() =>
                                                        remove({
                                                            type: "exercises",
                                                            id: exercise.id,
                                                            label: exercise.title,
                                                        })
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <div className="mt-4 divide-y border-t">
                                            {exercise.questions?.map((question, index) => (
                                                <div key={question.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                                                    <span>
                                                        {index + 1}. {question.prompt}
                                                    </span>
                                                    <div className="flex gap-1">
                                                        <IconAction label="Ubah soal" icon={Pencil} action={() => openQuestion(exercise, question)} />
                                                        <IconAction
                                                            label="Hapus soal"
                                                            icon={Trash2}
                                                            danger
                                                            action={() =>
                                                                remove({
                                                                    type: "questions",
                                                                    id: question.id,
                                                                    label: "soal",
                                                                })
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <Button variant="ghost" className="mt-2 min-h-10 text-link" onClick={() => openQuestion(exercise)}>
                                            <Plus className="size-4" /> {t("Tambah soal")}
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
                                        <Button variant="outline" onClick={() => openExercise(undefined, lesson)}>{t("Tambah latihan")}</Button>
                                        <Button onClick={() => openQuizBuilder(lesson)}>{t("Buat kuis")}</Button>
                                    </div>
                                }
                            />
                        )}
                    </>
                )}
            </div>
        </section>
    );
}
