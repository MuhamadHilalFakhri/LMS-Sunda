import { t } from "@/lib/ui-language";
import { Head, Link, router, usePage } from "@inertiajs/react";
import {
    ArrowRight,
    AudioLines,
    BookOpen,
    ChevronRight,
    CircleHelp,
    FileQuestion,
    FileText,
    LibraryBig,
    ListFilter,
    Pencil,
    Plus,
    Search,
    Trash2,
    Users,
    Volume2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import AdminPathArtwork from "@/components/admin-path-artwork";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { Block, Exercise, LearningPath, Lesson, Question, Unit } from "@/types/learning";

type Learner = {
    id: number;
    name: string;
    email: string;
    completed: number;
    attempts: number;
};
type Field = {
    name: string;
    label: string;
    type?: "textarea" | "select" | "number" | "file";
    options?: { value: string; label: string }[];
    required?: boolean;
    hint?: string;
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
    submitLabel?: string;
    successMessage?: string;
};
type DeleteConfig = { type: string; id: number; label: string };
type Section = "overview" | "paths" | "vocabulary" | "exercises" | "media" | "learners";

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
        hint: "MP3, WAV, OGG, atau M4A. Maksimum 10 MB.",
    },
    positionField,
];
const questionFields: Field[] = [
    {
        name: "type",
        label: "Jenis soal",
        type: "select",
        options: questionTypes,
    },
    {
        name: "prompt",
        label: "Instruksi soal",
        required: true,
        type: "textarea",
    },
    {
        name: "options",
        label: "Pilihan / bagian (satu per baris)",
        type: "textarea",
    },
    { name: "answer", label: "Jawaban benar", required: true },
    {
        name: "explanation",
        label: "Penjelasan untuk pelajar",
        required: true,
        type: "textarea",
    },
    positionField,
];
const labelStatus = (value: string) =>
    statuses.find((item) => item.value === value)?.label ?? value;
const textValue = (value: FormValue | undefined) =>
    typeof value === "string" || typeof value === "number" ? `${value}` : "";

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
    useEffect(() => {
        setValues(config?.values ?? {});
        setErrors({});
    }, [config]);
    if (!config) return null;
    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        setProcessing(true);
        setErrors({});
        const data = { ...values, ...config.hidden };
        if (config.fields.some((field) => field.name === "options"))
            data.options = textValue(values.options)
                .split("\n")
                .map((option) => option.trim())
                .filter(Boolean);
        const callbacks = {
            preserveScroll: true,
            onError: (messages: Record<string, string>) => setErrors(messages),
            onSuccess: () => {
                close();
                toast.success(t(config.successMessage ?? "Perubahan berhasil disimpan."));
            },
            onFinish: () => setProcessing(false),
        };
        if (config.fields.some((field) => field.type === "file")) {
            const form = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                if (value instanceof File) form.append(key, value);
                else if (value != null && !Array.isArray(value)) form.append(key, `${value}`);
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
                        {config.fields.map((field) => (
                            <div
                                key={field.name}
                                className={
                                    field.type === "textarea" || field.type === "file"
                                        ? "sm:col-span-2"
                                        : ""
                                }
                            >
                                <label htmlFor={`edit-${field.name}`} className="field-label">
                                    {t(field.label)}
                                </label>
                                {field.type === "select" ? (
                                    <Select
                                        value={textValue(
                                            values[field.name] ?? field.options?.[0]?.value,
                                        )}
                                        onValueChange={(value) =>
                                            setValues((current) => ({
                                                ...current,
                                                [field.name]: value,
                                            }))
                                        }
                                    >
                                        <SelectTrigger
                                            id={`edit-${field.name}`}
                                            className="h-11 w-full bg-card"
                                        >
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
                                        className="h-11 bg-card"
                                        type={
                                            field.type === "file"
                                                ? "file"
                                                : field.type === "number"
                                                  ? "number"
                                                  : "text"
                                        }
                                        min={field.type === "number" ? 0 : undefined}
                                        required={field.required}
                                        value={
                                            field.type === "file"
                                                ? undefined
                                                : textValue(values[field.name])
                                        }
                                        onChange={(event) =>
                                            setValues((current) => ({
                                                ...current,
                                                [field.name]:
                                                    field.type === "file"
                                                        ? (event.target.files?.[0] ?? null)
                                                        : event.target.value,
                                            }))
                                        }
                                    />
                                )}
                                {field.hint && (
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {t(field.hint)}
                                    </p>
                                )}
                                {errors[field.name] && (
                                    <p role="alert" className="mt-1 text-sm text-[#b42335]">
                                        {errors[field.name]}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                    <DialogFooter className="border-t pt-5">
                        <Button
                            type="button"
                            variant="outline"
                            className="min-h-11"
                            onClick={close}
                        >
                            {t("Batal")}
                        </Button>
                        <Button
                            type="submit"
                            className="min-h-11 bg-primary text-primary-foreground hover:bg-primary/90"
                            disabled={processing}
                        >
                            {processing
                                ? t("Menyimpan...")
                                : t(config.submitLabel ?? "Simpan perubahan")}
                        </Button>
                    </DialogFooter>
                </form>
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
                    <DialogTitle>{t("Hapus")} {config.label}?</DialogTitle>
                    <DialogDescription>
                        {t("Konten ini beserta semua bagian di dalamnya akan dihapus secara permanen.")}
                    </DialogDescription>
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

function IconAction({
    label,
    icon: Icon,
    action,
    danger = false,
}: {
    label: string;
    icon: typeof Pencil;
    action: () => void;
    danger?: boolean;
}) {
    return (
        <Button
            variant="ghost"
            size="icon"
            className={`size-10 ${danger ? "text-[#b42335]" : "text-muted-foreground"}`}
            aria-label={t(label)}
            title={t(label)}
            onClick={action}
        >
            <Icon className="size-4" />
        </Button>
    );
}

function Empty({
    icon: Icon,
    title,
    detail,
    action,
}: {
    icon: typeof Pencil;
    title: string;
    detail: string;
    action?: React.ReactNode;
}) {
    return (
        <div className="flex min-h-56 flex-col items-center justify-center rounded-lg border border-dashed bg-card px-6 py-9 text-center">
            <Icon className="size-7 text-muted-foreground" strokeWidth={1.6} />
            <h3 className="mt-4 font-semibold">{t(title)}</h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{t(detail)}</p>
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}

export default function AdminPage({
    paths,
    learners,
}: {
    paths: LearningPath[];
    learners: Learner[];
}) {
    const { url } = usePage();
    const section = (new URLSearchParams(url.split("?")[1] ?? "").get("section") ??
        "overview") as Section;
    const pathSlug = new URLSearchParams(url.split("?")[1] ?? "").get("path");
    const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
    const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [modal, setModal] = useState<FormConfig | null>(null);
    const [deleting, setDeleting] = useState<DeleteConfig | null>(null);
    const filteredPaths = paths.filter(
        (path) =>
            path.title.toLocaleLowerCase("id").includes(query.toLocaleLowerCase("id")) &&
            (statusFilter === "all" || path.status === statusFilter),
    );
    const selectedPath = filteredPaths.find((path) => path.slug === pathSlug) ?? filteredPaths[0];
    const selectedUnit =
        selectedPath?.units?.find((unit) => unit.id === selectedUnitId) ?? selectedPath?.units?.[0];
    const selectedLesson =
        selectedUnit?.lessons?.find((lesson) => lesson.id === selectedLessonId) ??
        selectedUnit?.lessons?.[0];
    const allLessons = paths.flatMap((path) =>
        (path.units ?? []).flatMap((unit) =>
            (unit.lessons ?? []).map((lesson) => ({
                ...lesson,
                unitTitle: unit.title,
                pathTitle: path.title,
            })),
        ),
    );
    const allBlocks = allLessons.flatMap((lesson) =>
        (lesson.blocks ?? []).map((block) => ({
            ...block,
            lessonTitle: lesson.title,
            pathTitle: lesson.pathTitle,
        })),
    );
    const allExercises = allLessons.flatMap((lesson) =>
        (lesson.exercises ?? []).map((exercise) => ({
            ...exercise,
            lessonTitle: lesson.title,
            pathTitle: lesson.pathTitle,
        })),
    );
    const matching = (text: string) =>
        text.toLocaleLowerCase("id").includes(query.toLocaleLowerCase("id"));
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
            fields: [
                titleField,
                { name: "description", label: "Tujuan unit", type: "textarea" },
                positionField,
                ...(unit ? [statusField] : []),
            ],
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
            fields: [
                titleField,
                { name: "summary", label: "Ringkasan", type: "textarea" },
                positionField,
                ...(lesson ? [statusField] : []),
            ],
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
    const openBlock = (block?: Block, lesson = selectedLesson) => {
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
                : { type: "text", position: lesson?.blocks?.length ?? 0 },
            hidden: block ? {} : { lesson_id: lesson!.id },
        });
    };
    const openExercise = (exercise?: Exercise, lesson = selectedLesson) => {
        if (!exercise && !lesson) return;
        setModal({
            title: exercise ? "Ubah latihan" : "Tambah latihan",
            description: "Beri judul latihan sebelum menambahkan soal dan kunci jawaban.",
            url: exercise ? `/admin/exercises/${exercise.id}` : "/admin/exercises",
            method: exercise ? "put" : "post",
            fields: [titleField, positionField],
            values: exercise
                ? { title: exercise.title, position: exercise.position }
                : { position: lesson?.exercises?.length ?? 0 },
            hidden: exercise ? {} : { lesson_id: lesson!.id },
        });
    };
    const openQuestion = (exercise: Exercise, question?: Question) =>
        setModal({
            title: question ? "Ubah soal" : "Tambah soal",
            description: `${t("Soal untuk")} ${exercise.title}. ${t("Pelajar akan melihat penjelasan setelah mengirim jawaban.")}`,
            url: question ? `/admin/questions/${question.id}` : "/admin/questions",
            method: question ? "put" : "post",
            fields: questionFields,
            values: question
                ? {
                      type: question.type,
                      prompt: question.prompt,
                      options: (question.options ?? []).join("\n"),
                      answer: question.answer?.value ?? "",
                      explanation: question.explanation ?? "",
                      position: question.position,
                  }
                : {
                      type: "multiple_choice",
                      position: exercise.questions?.length ?? 0,
                  },
            hidden: question ? {} : { exercise_id: exercise.id },
        });
    const goToPath = (path: LearningPath) => {
        router.get(`/admin?section=paths&path=${encodeURIComponent(path.slug)}`);
    };
    const sectionTitles: Record<Section, [string, string]> = {
        overview: [
            "Ringkasan pengelolaan",
            "Lihat apa yang perlu disiapkan sebelum pelajar mulai belajar.",
        ],
        paths: ["Kelas & pelajaran", "Susun unit, tulis materi, dan terbitkan pelajaran."],
        vocabulary: [
            "Kosakata & konteks",
            "Tinjau kosakata, aksara, dan ragam pemakaian dalam materi.",
        ],
        exercises: ["Latihan & soal", "Kelola latihan dan kunci jawaban untuk setiap pelajaran."],
        media: ["Audio & media", "Kelola audio pelafalan yang terhubung dengan materi."],
        learners: ["Pelajar & progres", "Lihat aktivitas belajar untuk mengevaluasi materi."],
    };
    const current = sectionTitles[section] ?? sectionTitles.overview;
    const draftCount = allLessons.filter((lesson) => lesson.status !== "published").length;
    const publishedCount = allLessons.filter((lesson) => lesson.status === "published").length;

    return (
        <>
            <Head title={t(current[0])} />
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="stitch-kicker">{t("STUDIO ADMIN / PENGELOLAAN")}</p>
                    <h1 className="mt-2 text-[28px] leading-tight font-extrabold tracking-tight md:text-[32px]">
                        {t(current[0])}
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                        {t(current[1])}
                    </p>
                </div>
                {section === "paths" && (
                    <Button
                        onClick={() => openPath()}
                        className="min-h-11 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        <Plus className="size-4" /> {t("Buat kelas")}
                    </Button>
                )}
            </div>

            {section === "overview" && (
                <div className="mt-7 space-y-7">
                    <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#493ee5] to-[#8573ee] p-7 text-white md:p-8">
                        <div
                            aria-hidden="true"
                            className="absolute right-8 top-1/2 hidden -translate-y-1/2 items-center gap-3 lg:flex"
                        >
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
                            <p className="text-[11px] font-extrabold tracking-widest text-white/75">
                                {t("SAWALA · STUDIO KONTEN")}
                            </p>
                            <h2 className="mt-3 max-w-xl text-2xl font-extrabold leading-tight md:text-3xl">
                                {t("Kelola pengalaman belajar yang bermakna.")}
                            </h2>
                            <p className="mt-2 max-w-lg text-sm leading-6 text-white/85">
                                {t("Susun kelas, lengkapi materi, dan tinjau progres pelajar dari satu ruang kerja.")}
                            </p>
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
                                <span className="text-sm font-medium text-muted-foreground">
                                    {t("Kelas belajar")}
                                </span>
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
                                <span className="text-sm font-medium text-muted-foreground">
                                    {t("Pelajaran siap tayang")}
                                </span>
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
                                <span className="text-sm font-medium text-muted-foreground">
                                    {t("Pelajar terdaftar")}
                                </span>
                                <span className="flex size-10 items-center justify-center rounded-xl bg-[#fff3d8] text-[#a34b05]">
                                    <Users className="size-5" />
                                </span>
                            </div>
                            <p className="mt-5 text-3xl font-extrabold">{learners.length}</p>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {t("Aktivitas tersedia di laporan pelajar")}
                            </p>
                        </div>
                    </div>
                    <div className="grid gap-7 xl:grid-cols-[1.6fr_1fr]">
                        <section className="stitch-card overflow-hidden">
                            <div className="flex items-center justify-between border-b px-6 py-5">
                                <div>
                                    <h2 className="text-lg font-semibold">{t("Kelas yang dikelola")}</h2>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {t("Pilih kelas untuk melanjutkan penyusunan materi.")}
                                    </p>
                                </div>
                                <Link
                                    href="/admin?section=paths"
                                    className="text-sm font-semibold text-link hover:underline"
                                >
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
                                                <span className="block font-semibold">
                                                    {path.title}
                                                </span>
                                                <span className="mt-1 block text-sm text-muted-foreground">
                                                    {path.units?.length ?? 0} {t("unit ·")}{" "}
                                                    {
                                                        (path.units ?? []).flatMap(
                                                            (unit) => unit.lessons ?? [],
                                                        ).length
                                                    }{" "}
                                                    {t("pelajaran")}
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
                                        action={
                                            <Button onClick={() => openPath()}>{t("Buat kelas")}</Button>
                                        }
                                    />
                                </div>
                            )}
                        </section>
                        <aside className="stitch-card p-6">
                            <h2 className="text-lg font-semibold">{t("Alur penerbitan")}</h2>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                {t("Materi harus lengkap dan ditinjau sebelum dibuka untuk pelajar.")}
                            </p>
                            <ol className="mt-6 space-y-5">
                                {[
                                    [
                                        "01",
                                        "Susun pelajaran",
                                        "Tambahkan isi materi, contoh, dan latihan.",
                                    ],
                                    [
                                        "02",
                                        "Tinjau konten",
                                        "Periksa ragam bahasa, aksara, dan jawaban.",
                                    ],
                                    [
                                        "03",
                                        "Terbitkan berurutan",
                                        "Pelajaran, unit, lalu kelas belajar.",
                                    ],
                                ].map(([number, title, description]) => (
                                    <li key={number} className="flex gap-4">
                                        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent text-xs font-semibold text-link">
                                            {number}
                                        </span>
                                        <span>
                                            <strong className="block text-sm">{title}</strong>
                                            <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                                                {description}
                                            </span>
                                        </span>
                                    </li>
                                ))}
                            </ol>
                            <Link
                                href="/admin?section=paths"
                                className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-link hover:underline"
                            >
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
                                <h2 className="text-sm font-extrabold">
                                    {t("Pilih kelas yang dikelola")}
                                </h2>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {paths.length} {t("kelas tersedia")}
                                </p>
                            </div>
                            <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                                <label className="relative min-w-[180px] flex-1 sm:w-56 sm:flex-none">
                                    <span className="sr-only">{t("Cari kelas")}</span>
                                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        value={query}
                                        onChange={(event) => setQuery(event.target.value)}
                                        placeholder={t("Cari kelas...")}
                                        className="h-10 bg-card pl-9"
                                    />
                                </label>
                                <label>
                                    <span className="sr-only">{t("Filter status kelas")}</span>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="h-10 min-w-36 bg-card">
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
                                </label>
                            </div>
                        </div>
                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                            {filteredPaths.map((path) => {
                                const isSelected = selectedPath?.id === path.id;
                                const lessons = (path.units ?? []).flatMap(
                                    (unit) => unit.lessons ?? [],
                                );
                                return (
                                    <Link
                                        key={path.id}
                                        href={`/admin?section=paths&path=${encodeURIComponent(path.slug)}`}
                                        aria-current={isSelected ? "page" : undefined}
                                        className={`flex min-h-24 items-center justify-between gap-3 rounded-2xl border p-4 transition-colors ${isSelected ? "border-[#493ee5] bg-[#f4f1ff]" : "border-border bg-card hover:border-[#ada7f5] hover:bg-[#faf9ff]"}`}
                                    >
                                        <span className="min-w-0">
                                            <strong
                                                className={`block truncate text-sm ${isSelected ? "text-[#493ee5]" : "text-foreground"}`}
                                            >
                                                {path.title}
                                            </strong>
                                            <span className="mt-1 block text-xs text-muted-foreground">
                                                {path.units?.length ?? 0} {t("unit ·")} {lessons.length}{" "}
                                                {t("pelajaran")}
                                            </span>
                                            <span className="mt-2 block text-[11px] font-bold text-muted-foreground">
                                                {t(labelStatus(path.status))}
                                            </span>
                                        </span>
                                        <ChevronRight
                                            className={`size-4 shrink-0 ${isSelected ? "text-[#493ee5]" : "text-muted-foreground"}`}
                                        />
                                    </Link>
                                );
                            })}
                            {filteredPaths.length === 0 && (
                                <div className="rounded-2xl border border-dashed p-5 text-sm text-muted-foreground">
                                    {t("Tidak ada kelas yang cocok. Ubah kata kunci atau status.")}
                                </div>
                            )}
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
                                                <h2 className="mt-3 text-2xl font-extrabold">
                                                    {selectedPath.title}
                                                </h2>
                                                <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                                                    {selectedPath.description ||
                                                        "Belum ada deskripsi kelas."}
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openPath(selectedPath)}
                                                >
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
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {t("Pilih unit untuk mengatur pelajaran di dalamnya.")}
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            className="min-h-10"
                                            onClick={() => openUnit()}
                                        >
                                            <Plus className="size-4" /> {t("Tambah unit")}
                                        </Button>
                                    </div>
                                    {selectedPath.units?.length ? (
                                        <div className="grid gap-3 p-4 md:grid-cols-2">
                                            {selectedPath.units.map((unit) => (
                                                <div
                                                    key={unit.id}
                                                    className={`flex min-h-24 items-center justify-between gap-3 rounded-2xl border px-4 py-3 ${selectedUnit?.id === unit.id ? "border-[#493ee5] bg-[#f4f1ff]" : "bg-card hover:border-[#ada7f5]"}`}
                                                >
                                                    <button
                                                        type="button"
                                                        className="min-w-0 flex-1 py-2 text-left"
                                                        onClick={() => {
                                                            setSelectedUnitId(unit.id);
                                                            setSelectedLessonId(null);
                                                        }}
                                                    >
                                                        <span className="block truncate font-semibold">
                                                            {unit.title}
                                                        </span>
                                                        <span className="mt-1 block text-xs text-muted-foreground">
                                                            {unit.lessons?.length ?? 0} {t("pelajaran ·")}{" "}
                                                            {t(labelStatus(unit.status))}
                                                        </span>
                                                    </button>
                                                    <ChevronRight
                                                        className="size-4 shrink-0 text-muted-foreground"
                                                        aria-hidden="true"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-5">
                                            <Empty
                                                icon={BookOpen}
                                                title="Belum ada unit"
                                                detail="Tambahkan unit untuk mulai menyusun urutan belajar."
                                                action={
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => openUnit()}
                                                    >
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
                                                <p className="text-xs font-semibold text-muted-foreground">
                                                    {t("UNIT TERPILIH")}
                                                </p>
                                                <h3 className="mt-1 text-lg font-semibold">
                                                    {selectedUnit.title}
                                                </h3>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {selectedUnit.description ||
                                                        "Belum ada tujuan unit."}
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Status value={selectedUnit.status} />
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openUnit(selectedUnit)}
                                                >
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
                                            <div className="mb-3 flex items-center justify-between">
                                                <h4 className="text-sm font-semibold">
                                                    {t("Urutan pelajaran")}
                                                </h4>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => openLesson()}
                                                    className="min-h-10 text-link"
                                                >
                                                    <Plus className="size-4" /> {t("Tambah pelajaran")}
                                                </Button>
                                            </div>
                                            {selectedUnit.lessons?.length ? (
                                                <div className="space-y-2">
                                                    {selectedUnit.lessons.map((lesson, index) => (
                                                        <button
                                                            key={lesson.id}
                                                            type="button"
                                                            onClick={() =>
                                                                setSelectedLessonId(lesson.id)
                                                            }
                                                            className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left ${selectedLesson?.id === lesson.id ? "border-[#493ee5] bg-[#f4f1ff]" : "hover:bg-secondary"}`}
                                                        >
                                                            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-card text-xs font-semibold">
                                                                {index + 1}
                                                            </span>
                                                            <span className="min-w-0 flex-1">
                                                                <strong className="block truncate text-sm">
                                                                    {lesson.title}
                                                                </strong>
                                                                <span className="block text-xs text-muted-foreground">
                                                                    {t(labelStatus(lesson.status))} ·{" "}
                                                                    {lesson.blocks?.length ?? 0}{" "}
                                                                    {t("blok ·")}{" "}
                                                                    {lesson.exercises?.length ?? 0}{" "}
                                                                    {t("latihan")}
                                                                </span>
                                                            </span>
                                                            <ChevronRight className="size-4 shrink-0" />
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <Empty
                                                    icon={FileText}
                                                    title="Belum ada pelajaran"
                                                    detail="Buat pelajaran pertama untuk unit ini."
                                                    action={
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => openLesson()}
                                                        >
                                                            {t("Tambah pelajaran")}
                                                        </Button>
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
                                        openQuestion={openQuestion}
                                        remove={setDeleting}
                                    />
                                )}
                            </>
                        ) : (
                            <Empty
                                icon={LibraryBig}
                                title={
                                    paths.length
                                        ? "Kelas tidak ditemukan"
                                        : "Belum ada kelas belajar"
                                }
                                detail={
                                    paths.length
                                        ? "Ubah pencarian atau filter status untuk melihat kelas lain."
                                        : "Buat kelas pertama Anda untuk memulai."
                                }
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
                    <SearchBar
                        query={query}
                        setQuery={setQuery}
                        placeholder={t("Cari kata, arti, aksara, atau ragam...")}
                    />
                    <div className="surface overflow-hidden">
                        <div className="border-b px-5 py-4">
                            <h2 className="font-semibold">{t("Entri kosakata & aksara")}</h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {t("Entri berasal dari blok materi pada pelajaran.")}
                            </p>
                        </div>
                        {allBlocks.filter(
                            (block) =>
                                ["vocabulary", "script", "dialogue"].includes(block.type) &&
                                matching(
                                    [
                                        block.title,
                                        block.latin,
                                        block.sundanese,
                                        block.translation,
                                        block.region,
                                        block.context,
                                    ].join(" "),
                                ),
                        ).length ? (
                            <div className="divide-y">
                                {allBlocks
                                    .filter(
                                        (block) =>
                                            ["vocabulary", "script", "dialogue"].includes(
                                                block.type,
                                            ) &&
                                            matching(
                                                [
                                                    block.title,
                                                    block.latin,
                                                    block.sundanese,
                                                    block.translation,
                                                    block.region,
                                                    block.context,
                                                ].join(" "),
                                            ),
                                    )
                                    .map((block) => (
                                        <div
                                            key={block.id}
                                            className="flex flex-wrap items-center justify-between gap-4 px-5 py-5"
                                        >
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-baseline gap-3">
                                                    <strong lang="su" className="text-lg">
                                                        {block.latin ||
                                                            block.title ||
                                                            "Entri tanpa judul"}
                                                    </strong>
                                                    {block.sundanese && (
                                                        <span
                                                            lang="su"
                                                            className="sunda-script text-2xl"
                                                        >
                                                            {block.sundanese}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {block.translation || "Arti belum ditulis"} ·{" "}
                                                    {block.lessonTitle}
                                                </p>
                                                {(block.region || block.register) && (
                                                    <p className="mt-2 text-xs font-medium text-muted-foreground">
                                                        {[block.region, block.register]
                                                            .filter(Boolean)
                                                            .join(" · ")}
                                                    </p>
                                                )}
                                            </div>
                                            <IconAction
                                                label="Ubah entri"
                                                icon={Pencil}
                                                action={() => openBlock(block)}
                                            />
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <div className="p-5">
                                <Empty
                                    icon={BookOpen}
                                    title={
                                        query
                                            ? "Tidak ada entri yang cocok"
                                            : "Belum ada kosakata atau aksara"
                                    }
                                    detail={
                                        query
                                            ? "Coba istilah pencarian lain."
                                            : "Tambahkan blok kosakata atau aksara pada pelajaran untuk melihatnya di sini."
                                    }
                                    action={
                                        !query && (
                                            <Link
                                                href="/admin?section=paths"
                                                className="btn-secondary"
                                            >
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

            {section === "exercises" && (
                <section className="mt-8 space-y-5">
                    <SearchBar
                        query={query}
                        setQuery={setQuery}
                        placeholder={t("Cari judul latihan atau pelajaran...")}
                    />
                    <div className="surface overflow-hidden">
                        <div className="border-b px-5 py-4">
                            <h2 className="font-semibold">{t("Latihan yang tersusun")}</h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {t("Kelola soal dan kunci jawaban pada latihan yang sudah dibuat.")}
                            </p>
                        </div>
                        {allExercises.filter((ex) => matching(`${ex.title} ${ex.lessonTitle}`))
                            .length ? (
                            <div className="divide-y">
                                {allExercises
                                    .filter((ex) => matching(`${ex.title} ${ex.lessonTitle}`))
                                    .map((exercise) => (
                                        <div key={exercise.id} className="p-5">
                                            <div className="flex flex-wrap items-start justify-between gap-3">
                                                <div>
                                                    <h3 className="font-semibold">
                                                        {exercise.title}
                                                    </h3>
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        {exercise.pathTitle} /{" "}
                                                        {exercise.lessonTitle} ·{" "}
                                                        {exercise.questions?.length ?? 0} {t("soal")}
                                                    </p>
                                                </div>
                                                <div className="flex gap-1">
                                                    <IconAction
                                                        label="Ubah latihan"
                                                        icon={Pencil}
                                                        action={() => openExercise(exercise)}
                                                    />
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
                                            <div className="mt-4 space-y-2">
                                                {exercise.questions?.map((question, index) => (
                                                    <div
                                                        key={question.id}
                                                        className="flex items-center justify-between gap-3 rounded-md bg-secondary px-3 py-2 text-sm"
                                                    >
                                                        <span className="min-w-0 truncate">
                                                            {index + 1}. {question.prompt}
                                                        </span>
                                                        <IconAction
                                                            label="Ubah soal"
                                                            icon={Pencil}
                                                            action={() =>
                                                                openQuestion(exercise, question)
                                                            }
                                                        />
                                                    </div>
                                                ))}
                                                <Button
                                                    variant="outline"
                                                    className="mt-2 min-h-10"
                                                    onClick={() => openQuestion(exercise)}
                                                >
                                                    <Plus className="size-4" /> {t("Tambah soal")}
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <div className="p-5">
                                <Empty
                                    icon={FileQuestion}
                                    title={query ? "Latihan tidak ditemukan" : "Belum ada latihan"}
                                    detail={
                                        query
                                            ? "Coba kata pencarian lain."
                                            : "Buka pelajaran dalam kelas belajar, lalu tambahkan latihan dan soal."
                                    }
                                    action={
                                        !query && (
                                            <Link
                                                href="/admin?section=paths"
                                                className="btn-secondary"
                                            >
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
                    <SearchBar
                        query={query}
                        setQuery={setQuery}
                        placeholder={t("Cari audio berdasarkan kata atau pelajaran...")}
                    />
                    <div className="surface overflow-hidden">
                        <div className="border-b px-5 py-4">
                            <h2 className="font-semibold">{t("Audio pelafalan")}</h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {t("Berkas audio tersimpan pada blok materi terkait.")}
                            </p>
                        </div>
                        {allBlocks.filter(
                            (block) =>
                                block.audio_path &&
                                matching(`${block.latin} ${block.title} ${block.lessonTitle}`),
                        ).length ? (
                            <div className="divide-y">
                                {allBlocks
                                    .filter(
                                        (block) =>
                                            block.audio_path &&
                                            matching(
                                                `${block.latin} ${block.title} ${block.lessonTitle}`,
                                            ),
                                    )
                                    .map((block) => (
                                        <div
                                            key={block.id}
                                            className="flex flex-wrap items-center justify-between gap-4 p-5"
                                        >
                                            <div>
                                                <p className="font-semibold">
                                                    {block.latin || block.title || "Audio materi"}
                                                </p>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {block.lessonTitle}
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3">
                                                <audio
                                                    controls
                                                    preload="none"
                                                    src={`/storage/${block.audio_path}`}
                                                    className="h-10 max-w-[240px]"
                                                >
                                                    {t("Audio tidak tersedia.")}
                                                </audio>
                                                <IconAction
                                                    label="Ubah blok audio"
                                                    icon={Pencil}
                                                    action={() => openBlock(block)}
                                                />
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <div className="p-5">
                                <Empty
                                    icon={AudioLines}
                                    title={query ? "Audio tidak ditemukan" : "Belum ada audio"}
                                    detail={
                                        query
                                            ? "Coba pencarian lain."
                                            : "Unggah pelafalan pada blok materi agar dapat didengarkan pelajar."
                                    }
                                    action={
                                        !query && (
                                            <Link
                                                href="/admin?section=paths"
                                                className="btn-secondary"
                                            >
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
                    />
                    <div className="surface overflow-hidden">
                        <div className="border-b px-5 py-4">
                            <h2 className="font-semibold">{t("Aktivitas pelajar")}</h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {t("Jumlah pelajaran yang dituntaskan dan percobaan latihan dari data akun.")}
                            </p>
                        </div>
                        {learners.filter((learner) => matching(`${learner.name} ${learner.email}`))
                            .length ? (
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
                                        {learners
                                            .filter((learner) =>
                                                matching(`${learner.name} ${learner.email}`),
                                            )
                                            .map((learner) => (
                                                <tr key={learner.id}>
                                                    <td className="px-5 py-4">
                                                        <strong className="block">
                                                            {learner.name}
                                                        </strong>
                                                        <span className="text-muted-foreground">
                                                            {learner.email}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        {learner.completed}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        {learner.attempts}
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-5">
                                <Empty
                                    icon={Users}
                                    title={query ? "Pelajar tidak ditemukan" : "Belum ada pelajar"}
                                    detail={
                                        query
                                            ? "Coba nama atau email lain."
                                            : "Aktivitas akan terlihat setelah akun pelajar terdaftar dan mulai belajar."
                                    }
                                />
                            </div>
                        )}
                    </div>
                </section>
            )}
            <FormModal config={modal} close={() => setModal(null)} />
            <DeleteModal config={deleting} close={() => setDeleting(null)} />
        </>
    );
}

function SearchBar({
    query,
    setQuery,
    placeholder,
}: {
    query: string;
    setQuery: (value: string) => void;
    placeholder: string;
}) {
    return (
        <div className="flex max-w-xl items-center gap-3">
            <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <label className="sr-only" htmlFor="content-search">
                    {t("Cari konten")}
                </label>
                <Input
                    id="content-search"
                    className="h-11 bg-card pl-9"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={t(placeholder)}
                />
            </div>
            <ListFilter className="size-5 text-muted-foreground" aria-hidden="true" />
        </div>
    );
}

function LessonWorkspace({
    lesson,
    openLesson,
    openBlock,
    openExercise,
    openQuestion,
    remove,
}: {
    lesson: Lesson;
    openLesson: () => void;
    openBlock: (block?: Block, lesson?: Lesson) => void;
    openExercise: (exercise?: Exercise, lesson?: Lesson) => void;
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
                    <p className="mt-1 text-sm text-muted-foreground">
                        {lesson.summary || t("Belum ada ringkasan pelajaran.")}
                    </p>
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
                            remove({ type: "lessons", id: lesson.id, label: lesson.title })
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
                    {t("Materi (")}{lesson.blocks?.length ?? 0})
                </button>
                <button
                    role="tab"
                    type="button"
                    aria-selected={tab === "exercise"}
                    onClick={() => setTab("exercise")}
                    className={`min-h-12 border-b-2 px-4 text-sm font-semibold ${tab === "exercise" ? "border-[#493ee5] text-link" : "border-transparent text-muted-foreground"}`}
                >
                    {t("Latihan (")}{lesson.exercises?.length ?? 0})
                </button>
            </div>
            <div className="p-5">
                {tab === "material" ? (
                    <>
                        <div className="mb-4 flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                {t("Susun teks dan contoh sesuai urutan belajar.")}
                            </p>
                            <Button
                                variant="outline"
                                className="min-h-10"
                                onClick={() => openBlock(undefined, lesson)}
                            >
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
                                                    {blockTypes.find(
                                                        (item) => item.value === block.type,
                                                    )?.label ?? "Materi"}
                                                </span>
                                                <h4 className="mt-1 font-semibold">
                                                    {block.title || block.latin || "Blok materi"}
                                                </h4>
                                            </div>
                                            <div className="flex shrink-0 gap-1">
                                                <IconAction
                                                    label="Ubah blok"
                                                    icon={Pencil}
                                                    action={() => openBlock(block, lesson)}
                                                />
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
                                        {block.body && (
                                            <p className="mt-3 line-clamp-3 text-sm leading-6 whitespace-pre-line text-muted-foreground">
                                                {block.body}
                                            </p>
                                        )}
                                        {block.sundanese && (
                                            <p lang="su" className="sunda-script mt-2 text-xl">
                                                {block.sundanese}
                                            </p>
                                        )}
                                        {block.translation && (
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {block.translation}
                                            </p>
                                        )}
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
                                    <Button
                                        variant="outline"
                                        onClick={() => openBlock(undefined, lesson)}
                                    >
                                        {t("Tambah materi")}
                                    </Button>
                                }
                            />
                        )}
                    </>
                ) : (
                    <>
                        <div className="mb-4 flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                {t("Soal dinilai menggunakan kunci jawaban admin.")}
                            </p>
                            <Button
                                variant="outline"
                                className="min-h-10"
                                onClick={() => openExercise(undefined, lesson)}
                            >
                                <Plus className="size-4" /> {t("Latihan")}
                            </Button>
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
                                                <IconAction
                                                    label="Ubah latihan"
                                                    icon={Pencil}
                                                    action={() => openExercise(exercise, lesson)}
                                                />
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
                                                                openQuestion(exercise, question)
                                                            }
                                                        />
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
                                        <Button
                                            variant="ghost"
                                            className="mt-2 min-h-10 text-link"
                                            onClick={() => openQuestion(exercise)}
                                        >
                                            <Plus className="size-4" /> {t("Tambah soal")}
                                        </Button>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <Empty
                                icon={CircleHelp}
                                title="Belum ada latihan"
                                detail="Tambahkan latihan, lalu tulis soal, jawaban, dan penjelasannya."
                                action={
                                    <Button
                                        variant="outline"
                                        onClick={() => openExercise(undefined, lesson)}
                                    >
                                        {t("Tambah latihan")}
                                    </Button>
                                }
                            />
                        )}
                    </>
                )}
            </div>
        </section>
    );
}
