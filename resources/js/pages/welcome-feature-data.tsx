import type { MeyaIcon } from '@/components/meya-icons';
import {
    BookOpen,
    Edit,
    Exam,
    MessageQuestion,
} from '@/components/meya-icons';

export type FeatureKind = 'language' | 'script' | 'practice' | 'tutor';

export const practiceAnswer = ['ᮘ', 'ᮞ'];

export const sectionLinks = [
    { href: '#kelas', label: 'Kelas belajar' },
    { href: '#aksara', label: 'Aksara Sunda' },
    { href: '#tutor', label: 'Tutor AI' },
    { href: '#cara-belajar', label: 'Cara belajar' },
];

export const featureDetails: Record<
    FeatureKind,
    { title: string; copy: string; href: string; icon: MeyaIcon }
> = {
    language: {
        title: 'Kelas Bahasa Sunda',
        copy: 'Mulai dari sapaan, kosakata, sampai ragam tutur dalam konteksnya.',
        href: '#kelas',
        icon: BookOpen,
    },
    script: {
        title: 'Ruang Aksara Sunda',
        copy: 'Pelajari karakter, rarangkén, membaca, dan menulis secara bertahap.',
        href: '#aksara',
        icon: Edit,
    },
    practice: {
        title: 'Latihan setelah belajar',
        copy: 'Coba soal singkat dan lihat penjelasan untuk menguatkan pemahaman.',
        href: '#cara-belajar',
        icon: Exam,
    },
    tutor: {
        title: 'Tanya Tutor AI',
        copy: 'Diskusikan materi dan lihat rujukan pelajaran yang digunakan.',
        href: '#tutor',
        icon: MessageQuestion,
    },
};
