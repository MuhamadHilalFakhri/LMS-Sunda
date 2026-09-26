import { usePage } from '@inertiajs/react';
import navigationAdmin from '@/lib/ui-language/navigation-admin';
import exerciseForms from '@/lib/ui-language/exercise-forms';
import learningContent from '@/lib/ui-language/learning-content';
import tutor from '@/lib/ui-language/tutor';
import reviewMedia from '@/lib/ui-language/review-media';

export type UiLocale = 'id' | 'su';

const su: Record<string, string> = {
    ...navigationAdmin,
    ...exerciseForms,
    ...learningContent,
    ...tutor,
    ...reviewMedia,
};

export function translateUi(text: string, locale: UiLocale): string {
    return locale === 'su' ? (su[text] ?? text) : text;
}

export function t(text: string): string {
    return translateUi(
        text,
        typeof document !== 'undefined' &&
            document.documentElement.lang === 'su'
            ? 'su'
            : 'id',
    );
}

export function useUiLanguage() {
    const { uiLocale } = usePage<{ uiLocale?: UiLocale }>().props;
    const locale: UiLocale = uiLocale === 'su' ? 'su' : 'id';
    return { locale, t: (text: string) => translateUi(text, locale) };
}
