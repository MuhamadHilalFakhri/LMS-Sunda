import { t } from '@/lib/ui-language';
import { Block } from '@/types/learning';

export function registerExplanation(register: string) {
    const value = register.toLocaleLowerCase('id');
    if (value.includes('loma'))
        return t(
            'Ragam loma digunakan dalam percakapan akrab. Sesuaikan dengan hubungan dan situasi.',
        );
    if (value.includes('lemes') || value.includes('halus'))
        return t(
            'Ragam lemes digunakan untuk berbicara dengan sopan dan menghormati lawan bicara.',
        );
    return t('Tingkat tutur dapat berubah sesuai lawan bicara dan situasi.');
}

export function cleanBlockTitle(block: Block) {
    return (block.title ?? '')
        .replace(/^(?:Kosakata|Aksara|Fokus pelajaran|Fokus aksara):\s*/i, '')
        .trim();
}

export function isAudioAttribution(value: string) {
    return /(?:CC\s?BY|CC0|Wikimedia|OpenSLR|Lingua Libre|audio .* oleh)/iu.test(
        value,
    );
}

export function getModuleContentSections(blocks: Block[]) {
    return blocks.reduce<Block[]>((sections, block) => {
        if (
            block.type !== 'vocabulary' ||
            !sections.some((item) => item.type === 'vocabulary')
        ) {
            sections.push(block);
        }
        return sections;
    }, []);
}
