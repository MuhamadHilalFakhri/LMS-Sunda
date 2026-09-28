import { t } from '@/lib/ui-language';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    ShieldCheck,
    MessageQuestion,
    Trash2,
} from '@/components/meya-icons';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import TutorConversation from '@/pages/learning/tutor/conversation';
import {
    modes,
    type Message,
    type PendingMessage,
    type TutorMode,
    type TutorStatus,
} from '@/pages/learning/tutor/types';

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
    const [mode, setMode] = useState<TutorMode>('question');
    const [prompt, setPrompt] = useState('');
    const [processing, setProcessing] = useState(false);
    const [clearing, setClearing] = useState(false);
    const [clearDialogOpen, setClearDialogOpen] = useState(false);
    const [pendingMessage, setPendingMessage] = useState<PendingMessage | null>(
        null,
    );
    const [error, setError] = useState<string | null>(null);
    const historyRef = useRef<HTMLDivElement>(null);
    const latestMessageId = messages[messages.length - 1]?.id;
    const activeMode = modes.find((item) => item.value === mode) ?? modes[0];

    useEffect(() => {
        if (isLatest && historyRef.current) {
            historyRef.current.scrollTo({
                top: historyRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    }, [latestMessageId, isLatest, pendingMessage?.id]);

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        const cleanPrompt = prompt.trim();
        if (processing || cleanPrompt.length < 3) return;

        const autoTranslation =
            mode === 'question' &&
            /(?:\bterjemah(?:kan|an)?\b|\btranslate\b|\bke\s+bahasa\s+sunda\b|\bbahasa\s+sundanya\b|\bsundanya\b)/iu.test(
                cleanPrompt,
            );
        const sentMode: TutorMode = autoTranslation ? 'translation' : mode;
        setPendingMessage({
            id: Date.now(),
            mode: sentMode,
            prompt: cleanPrompt,
        });
        setPrompt('');
        setProcessing(true);
        setError(null);
        router.post(
            '/tutor',
            { mode: sentMode, prompt: cleanPrompt },
            {
                preserveScroll: true,
                preserveState: true,
                showProgress: false,
                onSuccess: () => setPendingMessage(null),
                onError: (errors) => {
                    setPendingMessage(null);
                    setPrompt(cleanPrompt);
                    setError(
                        errors.tutor ??
                            errors.prompt ??
                            t('Pesan belum terkirim. Coba lagi.'),
                    );
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    const clearChat = () => {
        if (processing || clearing || messages.length === 0) return;

        setClearing(true);
        router.delete('/tutor', {
            showProgress: false,
            onSuccess: () => setClearDialogOpen(false),
            onFinish: () => setClearing(false),
        });
    };

    return (
        <div className="page-wrap py-3 md:py-5">
            <Head title="Tutor AI" />
            <div className="mb-4 text-xs font-semibold text-muted-foreground">
                <Link href="/dashboard" className="hover:text-link">
                    {t('Beranda')}
                </Link>{' '}
                / <span className="text-foreground">{t('Tutor AI')}</span>
            </div>
            <header className="rounded-[24px] bg-gradient-to-r from-[#493ee5] to-[#8a77ed] p-4 text-white md:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
                            <MessageQuestion className="size-5" />
                        </span>
                        <div className="min-w-0">
                            <h1 className="text-xl font-extrabold md:text-2xl">
                                {t('Tutor AI Bahasa Sunda')}
                            </h1>
                            <p className="mt-1 max-w-3xl text-xs leading-5 text-white/90 md:text-sm">
                                {t(
                                    'Tanyakan materi, berlatih percakapan, atau minta saran tulisan. Periksa kembali jawaban dengan rujukan pelajaran.',
                                )}
                            </p>
                        </div>
                    </div>
                    {(!tutorStatus.configured || !tutorStatus.enabled) && (
                        <div
                            className="flex shrink-0 items-start gap-2.5 rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-white sm:max-w-[360px]"
                            role="status"
                        >
                            <AlertCircle className="mt-0.5 size-4 shrink-0 text-white/90" />
                            <div className="min-w-0">
                                <p className="text-xs font-extrabold md:text-sm">
                                    {tutorStatus.enabled
                                        ? t('AI belum terhubung')
                                        : t('Tutor AI dinonaktifkan')}
                                </p>
                                <p className="mt-0.5 text-[11px] leading-4 text-white/85">
                                    {tutorStatus.enabled
                                        ? t(
                                              'Pertanyaan tetap mencari materi terbit, tetapi jawaban AI baru aktif setelah pengelola mengatur penyedia AI.',
                                          )
                                        : t(
                                              'Pertanyaan tetap mencari rujukan materi. Pengelola perlu mengaktifkan kembali Tutor AI untuk jawaban otomatis.',
                                          )}
                                </p>
                                {tutorStatus.canConfigure && (
                                    <Link
                                        href="/admin?section=tutor"
                                        className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold underline underline-offset-4"
                                    >
                                        <ShieldCheck className="size-3.5" />{' '}
                                        {t('Buka pengaturan Tutor AI')}
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {(!isLatest || olderCursor) && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3 text-sm">
                    <span className="text-muted-foreground">
                        {t('Riwayat Tutor AI ditampilkan per 100 pesan.')}
                    </span>
                    <div className="flex items-center gap-4">
                        {!isLatest && (
                            <Link
                                href="/tutor"
                                className="font-semibold text-link hover:underline"
                            >
                                {t('Kembali ke percakapan terbaru')}
                            </Link>
                        )}
                        {olderCursor && (
                            <Link
                                href={`/tutor?before=${olderCursor}`}
                                className="font-semibold text-link hover:underline"
                            >
                                {t('Muat percakapan sebelumnya')}{' '}
                                <ArrowRight className="ml-1 inline size-4" />
                            </Link>
                        )}
                    </div>
                </div>
            )}

            <TutorConversation
                messages={messages}
                olderCursor={olderCursor}
                pendingMessage={pendingMessage}
                activeMode={activeMode}
                mode={mode}
                setMode={setMode}
                historyRef={historyRef}
                processing={processing}
                clearing={clearing}
                openClearDialog={() => setClearDialogOpen(true)}
                prompt={prompt}
                setPrompt={setPrompt}
                error={error}
                clearError={() => setError(null)}
                onSubmit={submit}
                tutorStatus={tutorStatus}
            />
            <p className="mt-3 text-xs text-muted-foreground">
                {t(
                    'Tutor AI dapat membuat kekeliruan. Tinjau rujukan pelajaran sebelum menerapkan jawaban.',
                )}
            </p>

            <Dialog
                open={clearDialogOpen}
                onOpenChange={(open) => {
                    if (!clearing) setClearDialogOpen(open);
                }}
            >
                <DialogContent className="overflow-hidden border-border bg-card p-0 sm:max-w-[440px]">
                    <div className="p-6 pb-5">
                        <span className="flex size-11 items-center justify-center rounded-xl bg-[#fff1f0] text-[#b42335]">
                            <Trash2 className="size-5" />
                        </span>
                        <DialogHeader className="mt-4 text-left">
                            <DialogTitle className="text-lg">
                                {t('Hapus riwayat Tutor AI?')}
                            </DialogTitle>
                            <DialogDescription className="leading-6">
                                {t(
                                    'Semua percakapan Tutor AI akan dihapus permanen dan tidak dapat dipulihkan.',
                                )}
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                    <DialogFooter className="border-t bg-secondary/30 p-4 sm:flex-row-reverse sm:justify-end">
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={clearChat}
                            disabled={clearing || processing}
                        >
                            <Trash2 className="size-4" />
                            {t(
                                clearing
                                    ? 'Menghapus...'
                                    : 'Hapus semua percakapan',
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setClearDialogOpen(false)}
                            disabled={clearing}
                        >
                            {t('Batal')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
