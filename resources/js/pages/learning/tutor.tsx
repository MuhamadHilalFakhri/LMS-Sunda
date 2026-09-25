import { t } from "@/lib/ui-language";
import { Head, Link, router } from "@inertiajs/react";
import { AlertCircle, ArrowRight, BookOpen, Languages, MessageSquareText, Send, ShieldCheck, Sparkles, Trash2 } from "lucide-react";
import { Fragment, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type TutorMode = "question" | "conversation" | "writing" | "translation";
type Reference = { lesson_id: number; title: string };
type Message = {
    id: number;
    mode: TutorMode;
    prompt: string;
    response: string;
    references: Reference[] | string;
};
type TutorStatus = {
    enabled: boolean;
    configured: boolean;
    canConfigure: boolean;
};
type PendingMessage = { id: number; mode: TutorMode; prompt: string };

const modes: { value: TutorMode; label: string; icon: typeof BookOpen; hint: string; placeholder: string }[] = [
    {
        value: "question",
        label: "Tanya materi",
        icon: BookOpen,
        hint: "Tanyakan arti, penggunaan, atau isi pelajaran Bahasa Sunda.",
        placeholder: "Contoh: Naon hartina punten?",
    },
    {
        value: "conversation",
        label: "Latihan percakapan",
        icon: MessageSquareText,
        hint: "Berlatih bergiliran. Tutor mengingat percakapan sebelumnya dalam mode ini dan mengajukan pertanyaan lanjutan.",
        placeholder: "Contoh: Wilujeng enjing, kumaha damang?",
    },
    {
        value: "writing",
        label: "Saran tulisan",
        icon: Sparkles,
        hint: "Tempel kalimat Bahasa Sunda yang ingin diperiksa.",
        placeholder: "Tulis kalimat Bahasa Sunda yang ingin ditinjau...",
    },
    {
        value: "translation",
        label: "Terjemahan Indo–Sunda",
        icon: Languages,
        hint: "Terjemahkan kata atau kalimat Bahasa Indonesia ke Bahasa Sunda.",
        placeholder: "Contoh: Terjemahkan ‘Saya ingin belajar’ ke Bahasa Sunda.",
    },
];

function parseReferences(value: Message["references"]): Reference[] {
    if (Array.isArray(value)) return value;
    try {
        const parsed: unknown = JSON.parse(value);
        return Array.isArray(parsed) ? parsed as Reference[] : [];
    } catch {
        return [];
    }
}

function formatTutorResponse(value: string) {
    return value.replace(/\r\n?/g, "\n").split(/(\*\*[\s\S]+?\*\*|__[\s\S]+?__)/g).map((part, index) => {
        const bold = part.match(/^(\*\*|__)([\s\S]+)\1$/);
        return bold
            ? <strong key={index}>{bold[2]}</strong>
            : <Fragment key={index}>{part.replace(/\*\*/g, "").replace(/__/g, "")}</Fragment>;
    });
}

export default function TutorPage({
    messages,
    olderCursor,
    isLatest,
    tutorStatus,
}: {
    messages: Message[];
    olderCursor: number | null;
    isLatest: boolean;
    tutorStatus: TutorStatus;
}) {
    const [mode, setMode] = useState<TutorMode>("question");
    const [prompt, setPrompt] = useState("");
    const [processing, setProcessing] = useState(false);
    const [clearing, setClearing] = useState(false);
    const [clearDialogOpen, setClearDialogOpen] = useState(false);
    const [pendingMessage, setPendingMessage] = useState<PendingMessage | null>(null);
    const [error, setError] = useState<string | null>(null);
    const historyRef = useRef<HTMLDivElement>(null);
    const latestMessageId = messages[messages.length - 1]?.id;
    const activeMode = modes.find((item) => item.value === mode) ?? modes[0];

    useEffect(() => {
        if (isLatest && historyRef.current) {
            historyRef.current.scrollTo({ top: historyRef.current.scrollHeight, behavior: "smooth" });
        }
    }, [latestMessageId, isLatest, pendingMessage?.id]);

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        const cleanPrompt = prompt.trim();
        if (processing || cleanPrompt.length < 3) return;

        const autoTranslation = mode === "question"
            && /(?:\bterjemah(?:kan|an)?\b|\btranslate\b|\bke\s+bahasa\s+sunda\b|\bbahasa\s+sundanya\b|\bsundanya\b)/iu.test(cleanPrompt);
        const sentMode: TutorMode = autoTranslation ? "translation" : mode;
        setPendingMessage({ id: Date.now(), mode: sentMode, prompt: cleanPrompt });
        setPrompt("");
        setProcessing(true);
        setError(null);
        router.post(
            "/tutor",
            { mode: sentMode, prompt: cleanPrompt },
            {
                preserveScroll: true,
                preserveState: true,
                showProgress: false,
                onSuccess: () => setPendingMessage(null),
                onError: (errors) => {
                    setPendingMessage(null);
                    setPrompt(cleanPrompt);
                    setError(errors.tutor ?? errors.prompt ?? t("Pesan belum terkirim. Coba lagi."));
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    const clearChat = () => {
        if (processing || clearing || messages.length === 0) return;

        setClearing(true);
        router.delete("/tutor", {
            showProgress: false,
            onSuccess: () => setClearDialogOpen(false),
            onFinish: () => setClearing(false),
        });
    };

    return (
        <div className="page-wrap py-3 md:py-5">
            <Head title="Tutor AI" />
            <div className="mb-4 text-xs font-semibold text-muted-foreground">
                <Link href="/dashboard" className="hover:text-link">{t("Beranda")}</Link>{" "}
                / <span className="text-foreground">{t("Tutor AI")}</span>
            </div>
            <header className="rounded-[24px] bg-gradient-to-r from-[#493ee5] to-[#8a77ed] p-4 text-white md:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
                            <Sparkles className="size-5" />
                        </span>
                        <div className="min-w-0">
                            <h1 className="text-xl font-extrabold md:text-2xl">{t("Tutor AI Bahasa Sunda")}</h1>
                            <p className="mt-1 max-w-3xl text-xs leading-5 text-white/90 md:text-sm">
                                {t("Tanyakan materi, berlatih percakapan, atau minta saran tulisan. Periksa kembali jawaban dengan rujukan pelajaran.")}
                            </p>
                        </div>
                    </div>
                    {(!tutorStatus.configured || !tutorStatus.enabled) && (
                        <div className="flex shrink-0 items-start gap-2.5 rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-white sm:max-w-[360px]" role="status">
                            <AlertCircle className="mt-0.5 size-4 shrink-0 text-white/90" />
                            <div className="min-w-0">
                                <p className="text-xs font-extrabold md:text-sm">
                                    {tutorStatus.enabled ? t("AI belum terhubung") : t("Tutor AI dinonaktifkan")}
                                </p>
                                <p className="mt-0.5 text-[11px] leading-4 text-white/85">
                                    {tutorStatus.enabled
                                        ? t("Pertanyaan tetap mencari materi terbit, tetapi jawaban AI baru aktif setelah pengelola mengatur penyedia AI.")
                                        : t("Pertanyaan tetap mencari rujukan materi. Pengelola perlu mengaktifkan kembali Tutor AI untuk jawaban otomatis.")}
                                </p>
                                {tutorStatus.canConfigure && (
                                    <Link href="/admin?section=tutor" className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold underline underline-offset-4">
                                        <ShieldCheck className="size-3.5" /> {t("Buka pengaturan Tutor AI")}
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {(!isLatest || olderCursor) && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3 text-sm">
                    <span className="text-muted-foreground">{t("Riwayat Tutor AI ditampilkan per 100 pesan.")}</span>
                    <div className="flex items-center gap-4">
                        {!isLatest && <Link href="/tutor" className="font-semibold text-link hover:underline">{t("Kembali ke percakapan terbaru")}</Link>}
                        {olderCursor && <Link href={`/tutor?before=${olderCursor}`} className="font-semibold text-link hover:underline">{t("Muat percakapan sebelumnya")} <ArrowRight className="ml-1 inline size-4" /></Link>}
                    </div>
                </div>
            )}

            <div className="mt-3 grid items-stretch gap-4 xl:grid-cols-[260px_minmax(0,1fr)]">
                <aside className="flex min-h-0 flex-col gap-4">
                    <section className="stitch-card shrink-0 p-4" aria-label={t("Mode balasan")}>
                        <p className="stitch-kicker">{t("MODE BALASAN")}</p>
                        <div className="mt-3 space-y-1.5">
                            {modes.map((item) => (
                                <button
                                    key={item.value}
                                    type="button"
                                    aria-pressed={mode === item.value}
                                    onClick={() => setMode(item.value)}
                                    className={`flex min-h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-bold transition-colors ${mode === item.value ? "bg-[#efedff] text-[#493ee5]" : "hover:bg-secondary"}`}
                                >
                                    <item.icon className="size-4 shrink-0" /> {t(item.label)}
                                </button>
                            ))}
                        </div>
                        <p className="mt-3 border-t pt-3 text-xs leading-5 text-muted-foreground">{t(activeMode.hint)}</p>
                        <p className="mt-2 text-[11px] leading-4 text-muted-foreground">{t("Mode ini mengatur balasan pesan berikutnya. Riwayat tetap di percakapan yang sama.")}</p>
                    </section>
                    <section className="flex min-h-[136px] flex-1 flex-col justify-center rounded-2xl bg-[#ecfdf5] p-5 text-[#064e3b]">
                        <div className="flex items-center gap-2">
                            <span className="flex size-8 items-center justify-center rounded-lg bg-white/80"><BookOpen className="size-4" /></span>
                            <h2 className="text-sm font-extrabold">{t("Belajar dari materi")}</h2>
                        </div>
                        <p className="mt-2 text-xs leading-5">{t("Rujukan pelajaran muncul bersama jawaban jika tersedia.")}</p>
                        <Link href="/dashboard#kelas-belajar" className="mt-3 inline-flex items-center gap-2 text-xs font-bold">
                            {t("Lihat kelas")} <ArrowRight className="size-3" />
                        </Link>
                    </section>
                </aside>

                <section className="stitch-card flex h-[min(680px,calc(100dvh-15.5rem))] min-h-[420px] max-h-[720px] min-w-0 flex-col overflow-hidden" aria-label={t("Percakapan Tutor AI")}>
                    <div className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-2.5 md:px-5">
                        <div className="flex min-w-0 items-center gap-2">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#efedff] text-[#493ee5]">
                                <activeMode.icon className="size-4" />
                            </span>
                            <span className="truncate text-sm font-bold">{t(activeMode.label)}</span>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                            <span className="text-xs text-muted-foreground">{messages.length + Number(Boolean(pendingMessage))} {t("percakapan")}</span>
                            {messages.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setClearDialogOpen(true)}
                                    disabled={processing || clearing}
                                    className="inline-flex min-h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-muted-foreground hover:bg-[#fff1f0] hover:text-[#a03a39] disabled:opacity-50"
                                    aria-label={t("Hapus percakapan")}
                                >
                                    <Trash2 className="size-3.5" />
                                    <span className="hidden sm:inline">{t(clearing ? "Menghapus..." : "Hapus")}</span>
                                </button>
                            )}
                        </div>
                    </div>

                    <div ref={historyRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2.5 md:p-3" aria-live="polite">
                        {olderCursor && (
                            <div className="text-center">
                                <Link href={`/tutor?before=${olderCursor}`} className="inline-flex min-h-9 items-center gap-2 rounded-full border bg-card px-4 text-xs font-semibold text-link hover:bg-secondary">
                                    {t("Muat percakapan sebelumnya")} <ArrowRight className="size-3" />
                                </Link>
                            </div>
                        )}
                        {messages.length || pendingMessage ? <>
                        {messages.map((message) => {
                            const references = parseReferences(message.references);
                            const isDemo = message.prompt.startsWith("Contoh demo:") || message.response.startsWith("Riwayat tutor contoh.") || message.response.startsWith("Ini contoh riwayat tutor untuk akun demo.");
                            const response = isDemo ? message.response.replace(/^(?:Riwayat tutor contoh\.|Ini contoh riwayat tutor untuk akun demo\.)\s*/, "") : message.response;
                            const messageMode = modes.find((item) => item.value === message.mode);
                            return (
                                <article key={message.id} className="space-y-2">
                                    <div className="ml-2 rounded-2xl bg-[#efedff] p-2.5 text-sm md:ml-5 md:p-3 dark:bg-secondary">
                                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold text-muted-foreground md:text-xs">
                                            <span>{t("PERTANYAAN ANDA")}</span>
                                            {messageMode && <span className="rounded-full bg-white/70 px-2 py-0.5">{t(messageMode.label)}</span>}
                                            {isDemo && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-900">{t("Contoh riwayat")}</span>}
                                        </div>
                                        <p className="mt-1 whitespace-pre-line leading-5">{message.prompt}</p>
                                    </div>
                                    <div className="mr-2 rounded-2xl border bg-card p-2.5 text-sm md:mr-5 md:p-3">
                                        <p className="text-[10px] font-semibold text-muted-foreground md:text-[11px]">{isDemo ? t("JAWABAN CONTOH") : t("JAWABAN AI")}</p>
                                        <p className="mt-1 whitespace-pre-line leading-5">{formatTutorResponse(response)}</p>
                                        {references.length > 0 && (
                                            <div className="mt-2 border-t pt-2 text-[11px] leading-4">
                                                <span className="font-medium">{t("Rujukan materi:")}</span>{" "}
                                                {references.map((reference) => (
                                                    <Link key={`${message.id}-${reference.lesson_id}`} href={`/pelajaran/${reference.lesson_id}`} className="mr-3 font-semibold text-link underline">
                                                        {reference.title}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                        {pendingMessage && (
                            <article key={pendingMessage.id} className="space-y-2" aria-label={t("Pesan sedang dikirim")}>
                                <div className="ml-2 rounded-2xl bg-[#efedff] p-2.5 text-sm md:ml-5 md:p-3 dark:bg-secondary">
                                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold text-muted-foreground md:text-xs">
                                        <span>{t("PERTANYAAN ANDA")}</span>
                                        <span className="rounded-full bg-white/70 px-2 py-0.5">{t(modes.find((item) => item.value === pendingMessage.mode)?.label ?? "Tanya materi")}</span>
                                    </div>
                                    <p className="mt-1 whitespace-pre-line leading-5">{pendingMessage.prompt}</p>
                                </div>
                                <div className="mr-2 rounded-2xl border bg-card p-2.5 text-sm md:mr-5 md:p-3">
                                    <p className="text-[10px] font-semibold text-muted-foreground md:text-[11px]">{t("JAWABAN AI")}</p>
                                    <div className="mt-2 flex min-h-5 items-center gap-1.5 text-muted-foreground" role="status" aria-live="polite">
                                        <span className="sr-only">{t("Tutor sedang menyiapkan jawaban...")}</span>
                                        <span className="size-2 animate-bounce rounded-full bg-[#493ee5] [animation-delay:-0.3s]" />
                                        <span className="size-2 animate-bounce rounded-full bg-[#493ee5] [animation-delay:-0.15s]" />
                                        <span className="size-2 animate-bounce rounded-full bg-[#493ee5]" />
                                    </div>
                                </div>
                            </article>
                        )}
                        </> : (
                            <div className="flex h-full min-h-[220px] flex-col items-center justify-center px-4 text-center">
                                <span className="flex size-14 items-center justify-center rounded-2xl bg-[#efedff] text-[#493ee5]"><Sparkles className="size-7" /></span>
                                <h2 className="mt-4 font-extrabold">{t("Mulai percakapan baru")}</h2>
                                <p className="mt-2 max-w-md text-sm text-muted-foreground">{t("Ajukan pertanyaan tentang materi yang sudah diterbitkan untuk mulai belajar bersama tutor.")}</p>
                            </div>
                        )}
                    </div>

                    <form onSubmit={submit} className="shrink-0 border-t bg-card p-2.5 md:p-3">
                        <div className="flex items-end gap-2">
                            <div className="flex min-w-0 flex-1 flex-col">
                                <div className="mb-1 flex items-center justify-between gap-3 px-1">
                                    <label htmlFor="prompt" className="text-xs font-bold">{t("Pesan Anda")}</label>
                                    <span className="text-[11px] text-muted-foreground">{prompt.length}/1500</span>
                                </div>
                                <textarea
                                    id="prompt"
                                    className="field min-h-12 max-h-28 resize-y"
                                    required
                                    minLength={3}
                                    maxLength={1500}
                                    value={prompt}
                                    onChange={(event) => { setPrompt(event.target.value); setError(null); }}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter" && !event.shiftKey) {
                                            event.preventDefault();
                                            event.currentTarget.form?.requestSubmit();
                                        }
                                    }}
                                    placeholder={t(activeMode.placeholder)}
                                    disabled={processing || clearing}
                                />
                            </div>
                            <button
                                aria-label={t(processing ? "Menunggu balasan..." : tutorStatus.configured && tutorStatus.enabled ? "Kirim pesan" : "Cari rujukan materi")}
                                disabled={processing || prompt.trim().length < 3}
                                className="btn-primary flex min-h-12 shrink-0 items-center justify-center gap-2 px-3"
                                type="submit"
                            >
                                <Send className="size-4" />
                                <span className="hidden sm:inline">{t(processing ? "Menunggu balasan..." : tutorStatus.configured && tutorStatus.enabled ? "Kirim pesan" : "Cari rujukan materi")}</span>
                            </button>
                        </div>
                        {error && <p className="mt-2 text-sm font-medium text-destructive" role="alert">{error}</p>}
                        <p className="mt-1.5 text-[11px] leading-4 text-muted-foreground">{t("Gunakan Enter untuk mengirim, Shift+Enter untuk baris baru.")}</p>
                    </form>
                </section>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{t("Tutor AI dapat membuat kekeliruan. Tinjau rujukan pelajaran sebelum menerapkan jawaban.")}</p>

            <Dialog open={clearDialogOpen} onOpenChange={(open) => { if (!clearing) setClearDialogOpen(open); }}>
                <DialogContent className="overflow-hidden border-border bg-card p-0 sm:max-w-[440px]">
                    <div className="p-6 pb-5">
                        <span className="flex size-11 items-center justify-center rounded-xl bg-[#fff1f0] text-[#b42335]">
                            <Trash2 className="size-5" />
                        </span>
                        <DialogHeader className="mt-4 text-left">
                            <DialogTitle className="text-lg">{t("Hapus riwayat Tutor AI?")}</DialogTitle>
                            <DialogDescription className="leading-6">
                                {t("Semua percakapan Tutor AI akan dihapus permanen dan tidak dapat dipulihkan.")}
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                    <DialogFooter className="border-t bg-secondary/30 p-4 sm:flex-row-reverse sm:justify-end">
                        <Button type="button" variant="destructive" onClick={clearChat} disabled={clearing || processing}>
                            <Trash2 className="size-4" />
                            {t(clearing ? "Menghapus..." : "Hapus semua percakapan")}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setClearDialogOpen(false)} disabled={clearing}>
                            {t("Batal")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
