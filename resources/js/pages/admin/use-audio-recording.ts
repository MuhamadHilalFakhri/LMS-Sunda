import { useEffect, useRef, useState } from 'react';

const MAX_AUDIO_BYTES = 10 * 1024 * 1024;

export function useAudioRecording(open: boolean) {
    const [source, setSource] = useState<'upload' | 'record' | null>(null);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [recording, setRecording] = useState(false);
    const [requestingMicrophone, setRequestingMicrophone] = useState(false);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [error, setError] = useState('');
    const recorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const discardRecordingRef = useRef(false);
    const timerRef = useRef<number | null>(null);
    const isOpenRef = useRef(open);
    isOpenRef.current = open;

    useEffect(() => {
        if (!open) return;
        setSource(null);
        setAudioFile(null);
        setError('');
        setElapsedSeconds(0);
    }, [open]);

    useEffect(() => {
        if (!audioFile) {
            setPreviewUrl('');
            return;
        }
        const objectUrl = URL.createObjectURL(audioFile);
        setPreviewUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [audioFile]);

    useEffect(
        () => () => {
            if (timerRef.current !== null)
                window.clearInterval(timerRef.current);
            if (recorderRef.current?.state === 'recording')
                recorderRef.current.stop();
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
        if (recorderRef.current?.state === 'recording')
            recorderRef.current.stop();
        setRecording(false);
        if (timerRef.current !== null) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const discardRecording = () => {
        discardRecordingRef.current = true;
        if (recorderRef.current?.state === 'recording')
            recorderRef.current.stop();
        releaseMicrophone();
        setRecording(false);
    };

    const startRecording = async () => {
        if (
            !navigator.mediaDevices?.getUserMedia ||
            typeof MediaRecorder === 'undefined'
        ) {
            setError(
                'Browser ini belum mendukung perekaman audio. Silakan unggah berkas dari folder.',
            );
            return;
        }

        setRequestingMicrophone(true);
        setError('');
        setAudioFile(null);
        setElapsedSeconds(0);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            if (!isOpenRef.current) {
                stream.getTracks().forEach((track) => track.stop());
                return;
            }
            const supportedMimeType = [
                'audio/webm;codecs=opus',
                'audio/ogg;codecs=opus',
                'audio/mp4',
            ].find((mimeType) => MediaRecorder.isTypeSupported(mimeType));
            const recorder = supportedMimeType
                ? new MediaRecorder(stream, { mimeType: supportedMimeType })
                : new MediaRecorder(stream);
            streamRef.current = stream;
            recorderRef.current = recorder;
            chunksRef.current = [];
            discardRecordingRef.current = false;
            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) chunksRef.current.push(event.data);
            };
            recorder.onerror = () => {
                setError('Rekaman gagal. Periksa mikrofon lalu coba lagi.');
                discardRecordingRef.current = true;
                releaseMicrophone();
                setRecording(false);
            };
            recorder.onstop = () => {
                const mimeType =
                    recorder.mimeType || supportedMimeType || 'audio/webm';
                const blob = new Blob(chunksRef.current, { type: mimeType });
                const extension = mimeType.includes('ogg')
                    ? 'ogg'
                    : mimeType.includes('mp4')
                      ? 'm4a'
                      : 'webm';
                if (!discardRecordingRef.current && blob.size > 0) {
                    if (blob.size > MAX_AUDIO_BYTES) {
                        setError(
                            'Ukuran rekaman melebihi batas 10 MB. Silakan rekam ulang dengan durasi lebih singkat.',
                        );
                    } else {
                        setAudioFile(
                            new File(
                                [blob],
                                `rekaman-sawala-${Date.now()}.${extension}`,
                                { type: mimeType },
                            ),
                        );
                    }
                }
                releaseMicrophone();
                setRecording(false);
            };
            recorder.start(250);
            setRecording(true);
            timerRef.current = window.setInterval(
                () => setElapsedSeconds((seconds) => seconds + 1),
                1000,
            );
        } catch {
            setError(
                'Mikrofon tidak dapat diakses. Izinkan akses mikrofon atau unggah berkas dari folder.',
            );
        } finally {
            setRequestingMicrophone(false);
        }
    };

    return {
        source,
        setSource,
        audioFile,
        setAudioFile,
        previewUrl,
        recording,
        requestingMicrophone,
        elapsedSeconds,
        setElapsedSeconds,
        error,
        setError,
        stopRecording,
        discardRecording,
        startRecording,
    };
}

export const maxAudioBytes = MAX_AUDIO_BYTES;
export const formatAudioDuration = (seconds: number) =>
    `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
