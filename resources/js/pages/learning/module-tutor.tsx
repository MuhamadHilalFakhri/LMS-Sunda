import { t } from '@/lib/ui-language';
import type { Lesson } from '@/types/learning';
import { Link } from '@inertiajs/react';
import { ArrowUpRight, Bot, LoaderCircle, MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';

type ChatMessage = {
    key: string;
    role: 'user' | 'assistant';
    content: string;
    references?: { lesson_id: number; title: string }[];
    pending?: boolean;
};

export default function ModuleTutor({ lesson }: { lesson: Pick<Lesson, 'id' | 'title' | 'summary'> }) {
    const [open, setOpen] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const historyRef = useRef<HTMLDivElement>(null);
    const activeRequest = useRef<AbortController | null>(null);

    useEffect(() => {
        activeRequest.current?.abort();
        activeRequest.current = null;
        setOpen(false);
        setPrompt('');
        setSending(false);
        setError(null);
        setMessages([]);

        return () => {
            activeRequest.current?.abort();
            activeRequest.current = null;
        };
    }, [lesson.id]);

    useEffect(() => {
        if (open) inputRef.current?.focus();
    }, [open]);

    useEffect(() => {
        historyRef.current?.scrollTo({ top: historyRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages, sending]);

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        const cleanPrompt = prompt.trim();
        if (sending || cleanPrompt.length < 3) return;

        const requestId = Date.now().toString();
        const replyKey = `${requestId}-reply`;
        setMessages((current) => [
            ...current,
            { key: requestId, role: 'user', content: cleanPrompt },
            { key: replyKey, role: 'assistant', content: '', pending: true },
        ]);
        setPrompt('');
        setSending(true);
        setError(null);
        const controller = new AbortController();
        activeRequest.current?.abort();
        activeRequest.current = controller;

        try {
            const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;
            const response = await fetch('/tutor/inline', {
                method: 'POST',
                credentials: 'same-origin',
                signal: controller.signal,
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                },
                body: JSON.stringify({ mode: 'question', prompt: cleanPrompt, lesson_id: lesson.id }),
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) {
                const validationMessage = result.errors?.prompt?.[0] ?? result.errors?.lesson_id?.[0];
                throw new Error(validationMessage ?? result.message ?? t('Jawaban belum tersedia. Coba lagi.'));
            }
            const reply = result.message;
            setMessages((current) => current.map((message) => message.key === replyKey
                ? { key: String(reply.id), role: 'assistant', content: reply.response, references: reply.references ?? [] }
                : message));
        } catch (caught) {
            if (caught instanceof Error && caught.name === 'AbortError') return;
            const message = caught instanceof Error ? caught.message : t('Jawaban belum tersedia. Coba lagi.');
            setMessages((current) => current.filter((item) => item.key !== replyKey));
            setPrompt(cleanPrompt);
            setError(message);
        } finally {
            if (activeRequest.current === controller) {
                activeRequest.current = null;
                setSending(false);
            }
        }
    };

    return (
        <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6">
            {open && (
                <section className="flex h-[min(600px,calc(100dvh-6rem))] min-h-[240px] w-[min(390px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border bg-card shadow-2xl" role="dialog" aria-modal="false" aria-labelledby="module-tutor-title">
                    <header className="flex shrink-0 items-center gap-3 bg-[#493ee5] px-4 py-3.5 text-white">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/15"><Bot className="size-5" /></span>
                        <div className="min-w-0 flex-1">
                            <h2 id="module-tutor-title" className="text-sm font-extrabold">{t('Tanya Tutor AI')}</h2>
                            <p className="truncate text-[11px] text-white/80">{lesson.title}</p>
                        </div>
                        <Link href="/tutor" title={t('Buka Tutor AI penuh')} className="flex size-9 items-center justify-center rounded-lg text-white/90 hover:bg-white/15" aria-label={t('Buka Tutor AI penuh')}><ArrowUpRight className="size-4" /></Link>
                        <button type="button" onClick={() => setOpen(false)} className="flex size-9 items-center justify-center rounded-lg text-white/90 hover:bg-white/15" aria-label={t('Tutup chat')}><X className="size-4" /></button>
                    </header>

                    <div ref={historyRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-[#fbfaff] p-3.5" aria-live="polite">
                        {!messages.length && (
                            <div className="flex min-h-full flex-col justify-center gap-3 py-5">
                                <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#efedff] text-[#493ee5]"><Sparkles className="size-6" /></span>
                                <div className="text-center">
                                    <p className="text-sm font-bold">{t('Ada yang ingin ditanyakan?')}</p>
                                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{t('Tutor akan menjawab dengan konteks materi ini.')}</p>
                                </div>
                                <div className="mt-1 grid gap-2">
                                    {[
                                        t('Jelaskan bagian ini dengan sederhana'),
                                        t('Beri contoh penggunaan materi ini'),
                                    ].map((suggestion) => (
                                        <button key={suggestion} type="button" onClick={() => { setPrompt(suggestion); inputRef.current?.focus(); }} className="rounded-xl border bg-card px-3 py-2.5 text-left text-xs font-medium text-foreground transition-colors hover:border-[#aaa4ff] hover:bg-[#f7f5ff]">{suggestion}</button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {messages.map((message) => (
                            <article key={message.key} className={`max-w-[92%] rounded-2xl px-3.5 py-3 text-sm leading-6 ${message.role === 'user' ? 'ml-auto bg-[#efedff] text-foreground' : 'mr-auto border bg-card'}`}>
                                <p className="mb-1 text-[10px] font-bold tracking-wide text-muted-foreground">{message.role === 'user' ? t('ANDA') : t('TUTOR AI')}</p>
                                {message.pending ? (
                                    <div className="flex h-6 items-center gap-1.5" role="status" aria-label={t('Tutor sedang menyiapkan jawaban')}>
                                        <span className="size-2 animate-bounce rounded-full bg-[#493ee5] [animation-delay:-0.3s]" />
                                        <span className="size-2 animate-bounce rounded-full bg-[#493ee5] [animation-delay:-0.15s]" />
                                        <span className="size-2 animate-bounce rounded-full bg-[#493ee5]" />
                                    </div>
                                ) : <p className="whitespace-pre-line">{message.content}</p>}
                                {!!message.references?.length && (
                                    <div className="mt-2 border-t pt-2 text-[11px] leading-4 text-muted-foreground">
                                        <span className="font-semibold">{t('Rujukan materi:')}</span>{' '}
                                        {message.references.map((reference) => <Link key={`${message.key}-${reference.lesson_id}`} href={`/pelajaran/${reference.lesson_id}`} className="font-semibold text-link underline">{reference.title}</Link>)}
                                    </div>
                                )}
                            </article>
                        ))}
                    </div>

                    <form onSubmit={submit} className="shrink-0 border-t bg-card p-3">
                        <label className="sr-only" htmlFor="module-tutor-prompt">{t('Pesan Anda')}</label>
                        <div className="flex items-end gap-2">
                            <textarea
                                ref={inputRef}
                                id="module-tutor-prompt"
                                value={prompt}
                                onChange={(event) => { setPrompt(event.target.value); setError(null); }}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' && !event.shiftKey) {
                                        event.preventDefault();
                                        event.currentTarget.form?.requestSubmit();
                                    }
                                }}
                                placeholder={t('Tanyakan tentang materi ini...')}
                                maxLength={1500}
                                rows={2}
                                disabled={sending}
                                className="field min-h-11 max-h-24 min-w-0 flex-1 resize-y text-sm"
                            />
                            <button type="submit" disabled={sending || prompt.trim().length < 3} className="btn-primary flex size-11 shrink-0 items-center justify-center p-0" aria-label={t('Kirim pesan')}>
                                {sending ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
                            </button>
                        </div>
                        {error && <p role="alert" className="mt-2 text-xs font-medium text-destructive">{error}</p>}
                        <p className="mt-1.5 text-[10px] leading-4 text-muted-foreground">{t('Jawaban mengacu pada materi yang sedang dibuka.')}</p>
                    </form>
                </section>
            )}
            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                aria-expanded={open}
                aria-label={t(open ? 'Tutup chat' : 'Tanya Tutor AI tentang materi ini')}
                className="relative flex size-14 items-center justify-center rounded-full bg-[#493ee5] text-white shadow-lg shadow-[#493ee5]/25 transition hover:scale-[1.03] hover:bg-[#3d32d8] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#493ee5]/25"
            >
                {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
            </button>
        </div>
    );
}
