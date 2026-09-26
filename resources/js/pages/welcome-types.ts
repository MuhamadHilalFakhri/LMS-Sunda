import type { Auth } from '@/types';
import type { MouseEvent, RefObject } from 'react';
import type { FeatureKind } from '@/pages/welcome-feature-data';

export type WelcomeMainProps = {
    auth: { user: Auth['user'] | null };
    destination: string;
    featurePanelRef: RefObject<HTMLDivElement | null>;
    activeFeature: FeatureKind;
    setActiveFeature: (kind: FeatureKind) => void;
    playPhrase: (phrase: string) => void;
    speakingPhrase: string | null;
    speechError: string | null;
    voices: SpeechSynthesisVoice[];
    selectedVoiceURI: string;
    setSelectedVoiceURI: (uri: string) => void;
    handleSectionNavigation: (event: MouseEvent<HTMLAnchorElement>) => void;
};
