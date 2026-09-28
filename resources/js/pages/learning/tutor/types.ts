import { BookOpen, Edit, Languages, MessageSquareText } from '@/components/meya-icons';

export type TutorMode = "question" | "conversation" | "writing" | "translation";
export type Reference = { lesson_id: number; title: string };
export type Message = {
    id: number;
    mode: TutorMode;
    prompt: string;
    response: string;
    references: Reference[] | string;
};
export type TutorStatus = {
    enabled: boolean;
    configured: boolean;
    canConfigure: boolean;
};
export type PendingMessage = { id: number; mode: TutorMode; prompt: string };
export type TutorModeOption = {
    value: TutorMode;
    label: string;
    icon: typeof BookOpen;
    hint: string;
    placeholder: string;
};

export const modes: TutorModeOption[] = [
    {
        value: "question",
        label: "Tanya materi",
        icon: BookOpen,
        hint: "Tanyakan arti, penggunaan, atau isi pelajaran Bahasa Sunda.",
        placeholder: "Contoh: Naon hartina punten?",
    },
    {
        value: "conversation",
        label: "Latihan percakapan",
        icon: MessageSquareText,
        hint: "Berlatih bergiliran. Tutor mengingat percakapan sebelumnya dalam mode ini dan mengajukan pertanyaan lanjutan.",
        placeholder: "Contoh: Wilujeng enjing, kumaha damang?",
    },
    {
        value: "writing",
        label: "Saran tulisan",
        icon: Edit,
        hint: "Tempel kalimat Bahasa Sunda yang ingin diperiksa.",
        placeholder: "Tulis kalimat Bahasa Sunda yang ingin ditinjau...",
    },
    {
        value: "translation",
        label: "Terjemahan Indo–Sunda",
        icon: Languages,
        hint: "Terjemahkan kata atau kalimat Bahasa Indonesia ke Bahasa Sunda.",
        placeholder: "Contoh: Terjemahkan ‘Saya ingin belajar’ ke Bahasa Sunda.",
    },
];

export function parseReferences(value: Message["references"]): Reference[] {
    if (Array.isArray(value)) return value;
    try {
        const parsed: unknown = JSON.parse(value);
        return Array.isArray(parsed) ? parsed as Reference[] : [];
    } catch {
        return [];
    }
}

export function formatTutorResponse(value: string): { key: number; bold?: string; text?: string }[] {
    return value.replace(/\r\n?/g, "\n").split(/(\*\*[\s\S]+?\*\*|__[\s\S]+__)/g).map((part, index) => {
        const bold = part.match(/^(\*\*|__)([\s\S]+)\1$/);
        return bold ? { key: index, bold: bold[2] } : { key: index, text: part.replace(/\*\*/g, "").replace(/__/g, "") };
    });
}
