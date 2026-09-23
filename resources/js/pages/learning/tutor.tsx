import { t } from "@/lib/ui-language";
import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";
import { ArrowRight, BookOpen, MessageSquareText, Send, Sparkles } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type Message = {
    id: number;
    mode: string;
    prompt: string;
    response: string;
    references: { lesson_id: number; title: string }[] | string;
};
export default function TutorPage({ messages }: { messages: Message[] }) {
    const [mode, setMode] = useState("question");
    const [prompt, setPrompt] = useState("");
    const [processing, setProcessing] = useState(false);
    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        setProcessing(true);
        router.post(
            "/tutor",
            { mode, prompt },
            {
                onSuccess: () => setPrompt(""),
                onFinish: () => setProcessing(false),
            },
        );
    };
    return (
        <div className="page-wrap py-7 md:py-9">
            <Head title="Tutor AI" />
            <div className="mb-5 text-xs font-semibold text-muted-foreground">
                <Link href="/dashboard" className="hover:text-link">
                    {t("Beranda")}
                </Link>{" "}
                / <span className="text-foreground">{t("Tutor AI")}</span>
            </div>
            <div className="rounded-[28px] bg-gradient-to-r from-[#493ee5] to-[#8a77ed] p-7 text-white md:p-9">
                <span className="flex size-11 items-center justify-center rounded-xl bg-white/20">
                    <Sparkles className="size-6" />
                </span>
                <h1 className="mt-4 text-3xl font-extrabold">{t("Tutor AI Bahasa Sunda")}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-white/90">
                    {t("Tanyakan materi, berlatih percakapan, atau minta saran tulisan. Periksa kembali jawaban dengan rujukan pelajaran.")}
                </p>
            </div>
            <div className="mt-6 grid gap-5 xl:grid-cols-[260px_minmax(0,1fr)]">
                <aside className="space-y-4">
                    <div className="stitch-card p-5">
                        <p className="stitch-kicker">{t("PILIH CARA BELAJAR")}</p>
                        <div className="mt-4 space-y-2">
                            {[
                                { value: "question", label: "Tanya materi", icon: BookOpen },
                                {
                                    value: "conversation",
                                    label: "Latihan percakapan",
                                    icon: MessageSquareText,
                                },
                                { value: "writing", label: "Saran tulisan", icon: Sparkles },
                            ].map((item) => (
                                <button
                                    key={item.value}
                                    type="button"
                                    onClick={() => setMode(item.value)}
                                    className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-xs font-bold ${mode === item.value ? "bg-[#efedff] text-[#493ee5]" : "hover:bg-secondary"}`}
                                >
                                    <item.icon className="size-4" />
                                    {t(item.label)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="rounded-2xl bg-[#ecfdf5] p-5 text-[#064e3b]">
                        <h2 className="text-sm font-extrabold">{t("Belajar dari materi")}</h2>
                        <p className="mt-2 text-xs leading-5">
                            {t("Rujukan pelajaran muncul bersama jawaban jika tersedia.")}
                        </p>
                        <Link
                            href="/dashboard#kelas-belajar"
                            className="mt-3 inline-flex items-center gap-2 text-xs font-bold"
                        >
                            {t("Lihat kelas")} <ArrowRight className="size-3" />
                        </Link>
                    </div>
                </aside>
                <div className="min-w-0">
                    <div className="stitch-card min-h-[300px] space-y-5 p-5 md:p-7">
                        {messages.length ? (
                            messages.map((message) => {
                                const references =
                                    typeof message.references === "string"
                                        ? (JSON.parse(message.references) as {
                                              lesson_id: number;
                                              title: string;
                                          }[])
                                        : message.references;
                                return (
                                    <article key={message.id} className="space-y-3">
                                        <div className="ml-8 rounded-2xl bg-[#efedff] p-5 dark:bg-secondary">
                                            <p className="text-xs font-semibold text-muted-foreground">
                                                {t("PERTANYAAN ANDA")}
                                            </p>
                                            <p className="mt-2 whitespace-pre-line">
                                                {message.prompt}
                                            </p>
                                        </div>
                                        <div className="mr-8 rounded-2xl border bg-card p-5">
                                            <p className="text-xs font-semibold text-muted-foreground">
                                                {t("JAWABAN AI")}
                                            </p>
                                            <p className="mt-2 leading-7 whitespace-pre-line">
                                                {message.response}
                                            </p>
                                            {references.length > 0 && (
                                                <div className="mt-4 border-t pt-3 text-sm">
                                                    {t("Rujukan materi:")}{" "}
                                                    {references.map((reference) => (
                                                        <Link
                                                            key={reference.lesson_id}
                                                            href={`/pelajaran/${reference.lesson_id}`}
                                                            className="mr-3 font-semibold text-link underline"
                                                        >
                                                            {reference.title}
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </article>
                                );
                            })
                        ) : (
                            <div className="flex min-h-[245px] flex-col items-center justify-center text-center">
                                <span className="flex size-14 items-center justify-center rounded-2xl bg-[#efedff] text-[#493ee5]">
                                    <Sparkles className="size-7" />
                                </span>
                                <h2 className="mt-4 font-extrabold">{t("Mulai percakapan baru")}</h2>
                                <p className="mt-2 text-muted-foreground">
                                    {t("Ajukan pertanyaan tentang materi yang sudah diterbitkan untuk mulai belajar bersama tutor.")}
                                </p>
                            </div>
                        )}
                    </div>
                    <form onSubmit={submit} className="stitch-card mt-4 space-y-4 p-5">
                        <label htmlFor="mode" className="field-label">
                            {t("Jenis bantuan")}
                        </label>
                        <Select value={mode} onValueChange={setMode}>
                            <SelectTrigger id="mode" className="h-11 w-full bg-card">
                                <SelectValue placeholder={t("Pilih bantuan")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="question">{t("Tanya jawab materi")}</SelectItem>
                                <SelectItem value="conversation">
                                    {t("Latihan percakapan teks")}
                                </SelectItem>
                                <SelectItem value="writing">{t("Saran tulisan")}</SelectItem>
                            </SelectContent>
                        </Select>
                        <label htmlFor="prompt" className="field-label">
                            {t("Pesan Anda")}
                        </label>
                        <textarea
                            id="prompt"
                            className="field min-h-24"
                            required
                            minLength={3}
                            maxLength={1500}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={t("Tulis pertanyaan tentang pelajaran yang tersedia...")}
                        />
                        <button disabled={processing} className="btn-primary" type="submit">
                            {t(processing ? "Menyiapkan jawaban..." : "Kirim pesan")}{" "}
                            <Send className="ml-2 size-4" />
                        </button>
                    </form>
                    <p className="mt-3 text-xs text-muted-foreground">
                        {t("Tutor AI dapat membuat kekeliruan. Tinjau rujukan pelajaran sebelum menerapkan jawaban.")}
                    </p>
                </div>
            </div>
        </div>
    );
}
