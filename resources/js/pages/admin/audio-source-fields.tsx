import { t } from '@/lib/ui-language';
import { Mic, Square, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Dispatch, SetStateAction } from 'react';
import type { AudioBlock, AudioLesson } from '@/pages/admin/types';
import { AudioTargetFields } from '@/pages/admin/audio-target-fields';

type Props = {
    blocks: AudioBlock[];
    lessons: AudioLesson[];
    targetMode: 'existing' | 'new';
    setTargetMode: Dispatch<SetStateAction<'existing' | 'new'>>;
    blockId: string;
    setBlockId: Dispatch<SetStateAction<string>>;
    lessonId: string;
    setLessonId: Dispatch<SetStateAction<string>>;
    newPhrase: string;
    setNewPhrase: Dispatch<SetStateAction<string>>;
    newMeaning: string;
    setNewMeaning: Dispatch<SetStateAction<string>>;
    selectedBlock?: AudioBlock;
    source: 'upload' | 'record' | null;
    setSource: Dispatch<SetStateAction<'upload' | 'record' | null>>;
    audioFile: File | null;
    setAudioFile: Dispatch<SetStateAction<File | null>>;
    previewUrl: string;
    isRecording: boolean;
    requestingMicrophone: boolean;
    elapsedSeconds: number;
    setElapsedSeconds: Dispatch<SetStateAction<number>>;
    error: string;
    setError: Dispatch<SetStateAction<string>>;
    stopRecording: () => void;
    startRecording: () => Promise<void>;
    maxAudioBytes: number;
    formatAudioDuration: (seconds: number) => string;
};

export function AudioSourceFields(props: Props) {
    const {
        blocks,
        lessons,
        targetMode,
        setTargetMode,
        blockId,
        setBlockId,
        lessonId,
        setLessonId,
        newPhrase,
        setNewPhrase,
        newMeaning,
        setNewMeaning,
        selectedBlock,
        source,
        setSource,
        audioFile,
        setAudioFile,
        previewUrl,
        isRecording,
        requestingMicrophone,
        elapsedSeconds,
        setElapsedSeconds,
        error,
        setError,
        stopRecording,
        startRecording,
        maxAudioBytes,
        formatAudioDuration,
    } = props;
    return (
        <div className="min-w-0 space-y-5 pt-2">
            <AudioTargetFields
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
                disabled={isRecording || requestingMicrophone}
            />

            <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                <button
                    type="button"
                    aria-pressed={source === 'upload'}
                    disabled={isRecording || requestingMicrophone}
                    onClick={() => {
                        setSource('upload');
                        setAudioFile(null);
                        setError('');
                    }}
                    className={`w-full min-w-0 rounded-xl border p-4 text-left transition-colors ${source === 'upload' ? 'border-primary bg-accent' : 'border-border hover:bg-secondary'}`}
                >
                    <span className="flex size-10 items-center justify-center rounded-lg bg-card text-link">
                        <Upload className="size-5" />
                    </span>
                    <span className="mt-3 block font-semibold">
                        {t('Unggah dari folder')}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                        {t('Pilih rekaman audio dari perangkat Anda.')}
                    </span>
                </button>
                <button
                    type="button"
                    aria-pressed={source === 'record'}
                    disabled={isRecording || requestingMicrophone}
                    onClick={() => {
                        setSource('record');
                        setAudioFile(null);
                        setElapsedSeconds(0);
                        setError('');
                    }}
                    className={`w-full min-w-0 rounded-xl border p-4 text-left transition-colors ${source === 'record' ? 'border-primary bg-accent' : 'border-border hover:bg-secondary'}`}
                >
                    <span className="flex size-10 items-center justify-center rounded-lg bg-card text-link">
                        <Mic className="size-5" />
                    </span>
                    <span className="mt-3 block font-semibold">
                        {t('Rekam langsung')}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                        {t(
                            'Gunakan mikrofon perangkat untuk merekam pelafalan.',
                        )}
                    </span>
                </button>
            </div>

            {source === 'upload' && (
                <div className="space-y-2 rounded-xl border border-dashed p-4">
                    <label htmlFor="audio-file" className="field-label">
                        {t('Pilih berkas audio')}
                    </label>
                    <Input
                        id="audio-file"
                        type="file"
                        accept=".mp3,.wav,.ogg,.m4a,.webm"
                        className="h-11 bg-card"
                        onChange={(event) => {
                            const file = event.target.files?.[0] ?? null;
                            setError('');
                            if (file && file.size > maxAudioBytes) {
                                setAudioFile(null);
                                setError('Ukuran audio melebihi batas 10 MB.');
                            } else setAudioFile(file);
                        }}
                    />
                    <p className="text-xs text-muted-foreground">
                        {t('MP3, WAV, OGG, M4A, atau WEBM. Maksimum 10 MB.')}
                    </p>
                </div>
            )}

            {source === 'record' && (
                <div className="space-y-4 rounded-xl border bg-secondary/40 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="font-semibold">
                                {isRecording
                                    ? t('Sedang merekam')
                                    : audioFile
                                      ? t('Rekaman siap')
                                      : t('Rekam pelafalan')}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {t(
                                    'Tekan tombol rekam, ucapkan materi dengan jelas, lalu hentikan rekaman.',
                                )}
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant={isRecording ? 'destructive' : 'outline'}
                            className="min-h-10 shrink-0"
                            disabled={requestingMicrophone}
                            onClick={() =>
                                isRecording
                                    ? stopRecording()
                                    : void startRecording()
                            }
                        >
                            {isRecording ? (
                                <Square className="size-4 fill-current" />
                            ) : (
                                <Mic className="size-4" />
                            )}
                            {requestingMicrophone
                                ? t('Menghubungkan mikrofon...')
                                : isRecording
                                  ? t('Hentikan rekaman')
                                  : audioFile
                                    ? t('Rekam ulang')
                                    : t('Mulai rekam')}
                        </Button>
                    </div>
                    <p className="text-xs font-medium text-muted-foreground tabular-nums">
                        {formatAudioDuration(elapsedSeconds)}
                    </p>
                    {previewUrl && (
                        <audio
                            controls
                            preload="metadata"
                            src={previewUrl}
                            className="h-10 w-full"
                        />
                    )}
                </div>
            )}

            {previewUrl && source === 'upload' && (
                <audio
                    controls
                    preload="metadata"
                    src={previewUrl}
                    className="h-10 w-full"
                />
            )}
            {audioFile && (
                <p className="text-xs text-muted-foreground">
                    {audioFile.name} ·{' '}
                    {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
            )}
            {error && (
                <p
                    role="alert"
                    className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                    {t(error)}
                </p>
            )}
        </div>
    );
}
