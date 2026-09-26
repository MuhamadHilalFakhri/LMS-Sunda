import { t } from '@/lib/ui-language';
import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { AudioBlock, AudioLesson } from '@/pages/admin/types';
import { AudioSourceFields } from '@/pages/admin/audio-source-fields';
import {
    formatAudioDuration,
    maxAudioBytes,
    useAudioRecording,
} from '@/pages/admin/use-audio-recording';

export function AudioManagerModal({
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
    const [blockId, setBlockId] = useState('');
    const [targetMode, setTargetMode] = useState<'existing' | 'new'>(
        'existing',
    );
    const [lessonId, setLessonId] = useState('');
    const [newPhrase, setNewPhrase] = useState('');
    const [newMeaning, setNewMeaning] = useState('');
    const [processing, setProcessing] = useState(false);
    const recording = useAudioRecording(open);
    const {
        source,
        setSource,
        audioFile,
        setAudioFile,
        previewUrl,
        recording: isRecording,
        requestingMicrophone,
        elapsedSeconds,
        setElapsedSeconds,
        error,
        setError,
        stopRecording,
        discardRecording,
        startRecording,
    } = recording;
    const selectedBlock = blocks.find((block) => String(block.id) === blockId);
    const selectedLesson = lessons.find(
        (lesson) => String(lesson.id) === lessonId,
    );
    const targetReady =
        targetMode === 'existing'
            ? Boolean(selectedBlock)
            : Boolean(selectedLesson && newPhrase.trim());

    useEffect(() => {
        if (!open) return;
        setBlockId(initialBlock ? String(initialBlock.id) : '');
        setTargetMode('existing');
        setLessonId(lessons[0] ? String(lessons[0].id) : '');
        setNewPhrase('');
        setNewMeaning('');
        setElapsedSeconds(0);
    }, [open, initialBlock?.id, lessons, setElapsedSeconds]);

    const handleClose = () => {
        discardRecording();
        close();
    };

    const submit = () => {
        if (!targetReady || !audioFile) return;
        const data = new FormData();
        data.append('audio', audioFile);
        const url =
            targetMode === 'existing'
                ? `/admin/blocks/${selectedBlock!.id}/audio`
                : '/admin/blocks';
        if (targetMode === 'existing') {
            data.append('_method', 'PUT');
        } else {
            const phrase = newPhrase.trim();
            data.append('lesson_id', lessonId);
            data.append('type', 'vocabulary');
            data.append('title', phrase);
            data.append('latin', phrase);
            if (newMeaning.trim())
                data.append('translation', newMeaning.trim());
        }

        setProcessing(true);
        setError('');
        router.post(url, data, {
            forceFormData: true,
            preserveScroll: true,
            onError: (errors) =>
                setError(
                    errors.audio ??
                        'Audio tidak dapat disimpan. Periksa format dan ukuran berkas.',
                ),
            onSuccess: () => {
                handleClose();
                toast.success(t('Audio berhasil disimpan.'));
            },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (!nextOpen && !processing) handleClose();
            }}
        >
            <DialogContent className="max-h-[min(90vh,780px)] w-[calc(100vw-2rem)] min-w-0 overflow-x-hidden overflow-y-auto border-border bg-card sm:max-w-[620px]">
                <DialogHeader className="min-w-0 pr-7 text-left">
                    <DialogTitle className="text-xl">
                        {t('Tambah audio pelafalan')}
                    </DialogTitle>
                    <DialogDescription className="min-w-0 break-words whitespace-normal">
                        {t(
                            'Pilih materi yang sudah ada atau buat materi baru, lalu rekam atau unggah audionya.',
                        )}
                    </DialogDescription>
                </DialogHeader>
                <AudioSourceFields
                    blocks={blocks}
                    lessons={lessons}
                    targetMode={targetMode}
                    setTargetMode={setTargetMode}
                    blockId={blockId}
                    setBlockId={setBlockId}
                    lessonId={lessonId}
                    setLessonId={setLessonId}
                    newPhrase={newPhrase}
                    setNewPhrase={setNewPhrase}
                    newMeaning={newMeaning}
                    setNewMeaning={setNewMeaning}
                    selectedBlock={selectedBlock}
                    source={source}
                    setSource={setSource}
                    audioFile={audioFile}
                    setAudioFile={setAudioFile}
                    previewUrl={previewUrl}
                    isRecording={isRecording}
                    requestingMicrophone={requestingMicrophone}
                    elapsedSeconds={elapsedSeconds}
                    setElapsedSeconds={setElapsedSeconds}
                    error={error}
                    setError={setError}
                    stopRecording={stopRecording}
                    startRecording={startRecording}
                    maxAudioBytes={maxAudioBytes}
                    formatAudioDuration={formatAudioDuration}
                />
                <DialogFooter className="border-t pt-5">
                    <Button
                        type="button"
                        variant="outline"
                        className="min-h-11"
                        disabled={processing}
                        onClick={handleClose}
                    >
                        {t('Batal')}
                    </Button>
                    <Button
                        type="button"
                        className="min-h-11 bg-primary text-primary-foreground hover:bg-primary/90"
                        disabled={
                            !targetReady ||
                            !audioFile ||
                            isRecording ||
                            requestingMicrophone ||
                            processing
                        }
                        onClick={submit}
                    >
                        {processing ? t('Menyimpan...') : t('Simpan audio')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
