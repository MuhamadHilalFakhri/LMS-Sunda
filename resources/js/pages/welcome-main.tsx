import { HeroSection } from '@/pages/welcome-sections/hero-section';
import { LanguageSection } from '@/pages/welcome-sections/language-section';
import { ScriptSection } from '@/pages/welcome-sections/script-section';
import { TutorSection } from '@/pages/welcome-sections/tutor-section';
import { StepsSection } from '@/pages/welcome-sections/steps-section';
import { CallToActionSection } from '@/pages/welcome-sections/call-to-action-section';
import type { WelcomeMainProps } from '@/pages/welcome-types';

export function WelcomeMain(props: WelcomeMainProps) {
    return (
        <main>
            <HeroSection props={props} />
            <LanguageSection props={props} />
            <ScriptSection props={props} />
            <TutorSection props={props} />
            <StepsSection props={props} />
            <CallToActionSection props={props} />
        </main>
    );
}
