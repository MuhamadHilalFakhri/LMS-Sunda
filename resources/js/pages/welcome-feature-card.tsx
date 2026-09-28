import { t } from '@/lib/ui-language';
import type { MeyaIcon } from '@/components/meya-icons';
import { FeaturePreview } from '@/pages/welcome-feature-preview';
import type { FeatureKind } from '@/pages/welcome-feature-data';

export function FeatureCard({
    kind,
    title,
    description,
    icon: Icon,
    tint,
    active,
    onSelect,
    playPhrase,
    speakingPhrase,
    speechError,
}: {
    kind: FeatureKind;
    title: string;
    description: string;
    icon: MeyaIcon;
    tint: string;
    active: boolean;
    onSelect: () => void;
    playPhrase: (phrase: string) => void;
    speakingPhrase: string | null;
    speechError: string | null;
}) {
    return (
        <article
            className={`rounded-[24px] p-4 transition-all duration-200 sm:p-5 ${tint} ${active ? 'shadow-[0_8px_20px_rgba(66,85,255,0.12)] ring-2 ring-[#4255ff] ring-inset' : 'hover:-translate-y-1 hover:shadow-[0_6px_16px_rgba(40,46,62,0.1)]'}`}
        >
            <button
                type="button"
                aria-pressed={active}
                aria-controls="feature-detail"
                onClick={onSelect}
                className="flex min-h-[72px] w-full items-start gap-3 rounded-md text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4255ff]"
            >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#282e3e]">
                    <Icon className="size-5" />
                </span>
                <div>
                    <h3 className="text-[17px] leading-6 font-bold">
                        {t(title)}
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-[#586380]">
                        {t(description)}
                    </p>
                </div>
            </button>
            <div className="mt-4 min-h-[154px] rounded-lg bg-white p-3.5 text-[#282e3e] shadow-[0_2px_4px_rgba(40,46,62,0.1)]">
                <FeaturePreview
                    kind={kind}
                    playPhrase={playPhrase}
                    speakingPhrase={speakingPhrase}
                    speechError={speechError}
                />
            </div>
        </article>
    );
}
