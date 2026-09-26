import { router } from '@inertiajs/react';

import type { Section } from '@/pages/admin/types';
import type { AdminPageState } from '@/pages/admin/use-admin-page-state';

export function createAdminNavigationActions(state: AdminPageState) {
    const { section, allLessons, query } = state;
    const sectionTitles: Record<Section, [string, string]> = {
        overview: [
            'Ringkasan pengelolaan',
            'Lihat apa yang perlu disiapkan sebelum pelajar mulai belajar.',
        ],
        paths: [
            'Kelas & pelajaran',
            'Susun unit, tulis materi, dan terbitkan pelajaran.',
        ],
        vocabulary: [
            'Kosakata & konteks',
            'Tambah dan tinjau kosakata, arti, serta konteks pemakaiannya.',
        ],
        characters: [
            'Kumpulan Aksara Sunda',
            'Kelola karakter Aksara Sunda yang digunakan di materi pelajaran.',
        ],
        exercises: [
            'Latihan & soal',
            'Kelola latihan dan kunci jawaban untuk setiap pelajaran.',
        ],
        media: [
            'Audio & media',
            'Kelola audio pelafalan yang terhubung dengan materi.',
        ],
        learners: [
            'Pengguna & akun',
            'Kelola data, peran, akses, dan aktivitas akun pengguna.',
        ],
        analytics: [
            'Laporan & analitik',
            'Pantau aktivitas belajar, penyelesaian kelas, dan hasil latihan.',
        ],
        tutor: [
            'Pengaturan Tutor AI',
            'Atur cara tutor menjawab dan koneksi penyedia AI.',
        ],
        feedback: [
            'Umpan balik',
            'Tinjau laporan, saran, dan masukan yang dikirim pelajar.',
        ],
    };
    const current = sectionTitles[section] ?? sectionTitles.overview;
    const draftCount = allLessons.filter(
        (lesson) => lesson.status !== 'published',
    ).length;
    const publishedCount = allLessons.filter(
        (lesson) => lesson.status === 'published',
    ).length;
    const submitCollectionSearch = (
        event: React.FormEvent<HTMLFormElement>,
        targetSection: Section,
    ) => {
        event.preventDefault();
        router.get(
            '/admin',
            {
                section: targetSection,
                q: query.trim() || undefined,
                collection_page: 1,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: [
                    'paths',
                    'collectionItems',
                    'collectionPagination',
                    'mediaCounts',
                    'audioBlockOptions',
                ],
            },
        );
    };
    const changeMediaView = (view: 'uploaded' | 'missing') => {
        router.get(
            '/admin',
            {
                section: 'media',
                q: query.trim() || undefined,
                media_view: view,
                collection_page: 1,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: [
                    'paths',
                    'collectionItems',
                    'collectionPagination',
                    'mediaCounts',
                    'audioBlockOptions',
                ],
            },
        );
    };
    return {
        sectionTitles,
        current,
        draftCount,
        publishedCount,
        submitCollectionSearch,
        changeMediaView,
    };
}
