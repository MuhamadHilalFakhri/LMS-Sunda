import { t } from "@/lib/ui-language";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { ArrowLeft, BookOpen, Bug, CheckCircle2, Clock3, Lightbulb, MessageSquareText, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type FeedbackItem = {
    id: number;
    category: "content" | "bug" | "idea" | "other";
    message: string;
    status: "new" | "reviewing" | "resolved";
    created_at: string;
};

const categories = [
    { value: "content", label: "Materi belajar", icon: BookOpen },
    { value: "bug", label: "Masalah teknis", icon: Bug },
    { value: "idea", label: "Ide atau saran", icon: Lightbulb },
    { value: "other", label: "Lainnya", icon: MessageSquareText },
] as const;

export default function FeedbackPage({ feedback }: { feedback: FeedbackItem[] }) {
    const { url } = usePage();
    const [category, setCategory] = useState<FeedbackItem["category"]>("content");
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);
    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        setProcessing(true);
        setErrors({});
        router.post("/umpan-balik", { category, message, page: url.split("?")[0] }, {
            preserveScroll: true,
            onError: setErrors,
            onSuccess: () => {
                setMessage("");
                toast.success(t("Terima kasih, masukan Anda sudah terkirim."));
            },
            onFinish: () => setProcessing(false),
        });
    };
    const dateLabel = (date: string) => new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(date));
    const statusDetails: Record<FeedbackItem["status"], { label: string; className: string }> = {
        new: { label: "Diterima", className: "bg-[#fff4e5] text-[#925000]" },
        reviewing: { label: "Sedang ditinjau", className: "bg-[#efedff] text-[#493ee5]" },
        resolved: { label: "Ditindaklanjuti", className: "bg-[#eaf8ef] text-[#17633a]" },
    };

    return (
        <div className="page-wrap space-y-7 py-7 md:py-9">
            <Head title={t("Umpan balik")} />
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground">
                <ArrowLeft className="size-4" /> {t("Kembali ke beranda")}
            </Link>
            <section className="relative overflow-hidden rounded-[28px] bg-[#064e3b] p-6 text-white md:p-8">
                <div className="relative z-10 max-w-2xl">
                    <span className="flex size-11 items-center justify-center rounded-2xl bg-white/15"><MessageSquareText className="size-5" /></span>
                    <h1 className="mt-4 text-2xl font-extrabold tracking-tight md:text-3xl">{t("Bantu Sawala jadi lebih baik")}</h1>
                    <p className="mt-2 text-sm leading-6 text-white/80">{t("Laporkan materi yang perlu diperbaiki, kendala teknis, atau ide untuk pengalaman belajar.")}</p>
                </div>
                <div aria-hidden="true" className="absolute -right-12 -bottom-28 size-64 rounded-full border border-white/10 md:size-80" />
                <div aria-hidden="true" className="absolute -right-2 -bottom-20 size-48 rounded-full border border-white/10 md:size-60" />
            </section>

            <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.85fr)]">
                <form onSubmit={submit} className="stitch-card space-y-5 p-5 md:p-6">
                    <div>
                        <h2 className="text-lg font-extrabold">{t("Kirim masukan")}</h2>
                        <p className="mt-1 text-sm text-muted-foreground">{t("Ceritakan dengan jelas agar tim dapat menindaklanjutinya.")}</p>
                    </div>
                    <fieldset>
                        <legend className="field-label">{t("Jenis masukan")}</legend>
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                            {categories.map(({ value, label, icon: Icon }) => (
                                <button key={value} type="button" onClick={() => setCategory(value)} aria-pressed={category === value} className={`flex min-h-11 items-center gap-2.5 rounded-xl border px-3 text-left text-sm font-semibold transition ${category === value ? "border-[#493ee5] bg-[#f2f0ff] text-[#493ee5] ring-2 ring-[#493ee5]/10" : "bg-card hover:bg-secondary"}`}>
                                    <Icon className="size-4 shrink-0" /> {t(label)}
                                </button>
                            ))}
                        </div>
                    </fieldset>
                    <label htmlFor="feedback-message" className="field-label">{t("Pesan")}</label>
                    <textarea id="feedback-message" required minLength={10} maxLength={2000} rows={6} value={message} onChange={(event) => setMessage(event.target.value)} placeholder={t("Tuliskan bagian yang dimaksud dan apa yang Anda harapkan...")} className="w-full resize-y rounded-xl border border-input bg-background px-3 py-3 text-sm leading-6 outline-none transition placeholder:text-muted-foreground focus:border-[#493ee5] focus:ring-2 focus:ring-[#493ee5]/15" />
                    {errors.message && <p className="-mt-4 text-xs text-destructive">{errors.message}</p>}
                    {errors.category && <p className="-mt-4 text-xs text-destructive">{errors.category}</p>}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="text-xs text-muted-foreground">{message.length}/2000 {t("karakter")}</span>
                        <Button type="submit" disabled={processing || message.trim().length < 10} className="min-h-11 gap-2"><Send className="size-4" />{processing ? t("Mengirim...") : t("Kirim masukan")}</Button>
                    </div>
                </form>

                <section className="stitch-card overflow-hidden">
                    <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
                        <div><h2 className="font-extrabold">{t("Masukan saya")}</h2><p className="mt-1 text-xs text-muted-foreground">{t("Lihat perkembangan tindak lanjut dari pengelola.")}</p></div>
                        <Clock3 className="size-5 text-muted-foreground" />
                    </div>
                    {feedback.length ? (
                        <div className="divide-y">
                            {feedback.map((item) => {
                                const status = statusDetails[item.status];
                                return (
                                    <article key={item.id} className="space-y-2.5 px-5 py-4">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <span className="text-xs font-bold text-muted-foreground">{t(categories.find((option) => option.value === item.category)?.label ?? "Lainnya")}</span>
                                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${status.className}`}><CheckCircle2 className="mr-1 inline size-3" />{t(status.label)}</span>
                                        </div>
                                        <p className="line-clamp-4 whitespace-pre-wrap text-sm leading-6">{item.message}</p>
                                        <p className="text-[11px] text-muted-foreground">{dateLabel(item.created_at)}</p>
                                    </article>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="px-5 py-10 text-center">
                            <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#efedff] text-[#493ee5]"><MessageSquareText className="size-5" /></span>
                            <h3 className="mt-3 text-sm font-bold">{t("Belum ada masukan terkirim")}</h3>
                            <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-muted-foreground">{t("Setelah mengirim masukan, status tindak lanjut akan tampil di sini.")}</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
