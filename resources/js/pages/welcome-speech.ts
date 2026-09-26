import { useEffect, useRef, useState } from 'react';

export function useSundaneseSpeech() {
    const [speakingPhrase, setSpeakingPhrase] = useState<string | null>(null);
    const [speechError, setSpeechError] = useState<string | null>(null);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoiceURI, setSelectedVoiceURI] = useState('');
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window))
            return;

        const synthesis = window.speechSynthesis;
        const refreshVoices = () => {
            const availableVoices = synthesis
                .getVoices()
                .filter((voice) =>
                    /^su(?:[-_]|$)|^id(?:[-_]|$)/i.test(voice.lang),
                );
            setVoices(availableVoices);
            setSelectedVoiceURI((current) => {
                if (
                    current &&
                    availableVoices.some((voice) => voice.voiceURI === current)
                )
                    return current;
                const preferredVoice =
                    availableVoices.find((voice) =>
                        /^su(?:[-_]|$)/i.test(voice.lang),
                    ) ??
                    availableVoices.find((voice) =>
                        /^id(?:[-_]|$)/i.test(voice.lang),
                    );
                return preferredVoice?.voiceURI ?? '';
            });
        };

        refreshVoices();
        synthesis.addEventListener('voiceschanged', refreshVoices);
        return () =>
            synthesis.removeEventListener('voiceschanged', refreshVoices);
    }, []);

    const playPhrase = (phrase: string) => {
        if (
            typeof window === 'undefined' ||
            !('speechSynthesis' in window) ||
            typeof SpeechSynthesisUtterance === 'undefined'
        ) {
            setSpeechError('Browser ini belum mendukung suara.');
            return;
        }

        const synthesis = window.speechSynthesis;
        utteranceRef.current = null;
        synthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(phrase);
        const availableVoices = synthesis
            .getVoices()
            .filter((voice) => /^su(?:[-_]|$)|^id(?:[-_]|$)/i.test(voice.lang));
        const sundaneseVoice = availableVoices.find((voice) =>
            /^su(?:[-_]|$)/i.test(voice.lang),
        );
        const indonesianVoice = availableVoices.find((voice) =>
            /^id(?:[-_]|$)/i.test(voice.lang),
        );
        const voice =
            availableVoices.find(
                (item) => item.voiceURI === selectedVoiceURI,
            ) ??
            sundaneseVoice ??
            indonesianVoice;

        utterance.lang = voice?.lang ?? 'su-ID';
        if (voice) utterance.voice = voice;
        utterance.rate = 0.85;
        utteranceRef.current = utterance;
        setSpeakingPhrase(phrase);
        setSpeechError(null);

        utterance.onend = () => {
            if (utteranceRef.current !== utterance) return;
            utteranceRef.current = null;
            setSpeakingPhrase(null);
        };
        utterance.onerror = (event) => {
            if (utteranceRef.current !== utterance) return;
            utteranceRef.current = null;
            setSpeakingPhrase(null);
            if (event.error !== 'canceled' && event.error !== 'interrupted') {
                setSpeechError('Suara tidak dapat diputar di perangkat ini.');
            }
        };

        synthesis.speak(utterance);
    };

    useEffect(
        () => () => {
            utteranceRef.current = null;
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        },
        [],
    );

    return {
        playPhrase,
        speakingPhrase,
        speechError,
        voices,
        selectedVoiceURI,
        setSelectedVoiceURI,
    };
}
