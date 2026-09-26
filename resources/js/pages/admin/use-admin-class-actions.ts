import { router } from '@inertiajs/react';
import { t } from '@/lib/ui-language';
import {
    positionField,
    statusField,
    titleField,
} from '@/pages/admin/form-fields';
import type { LearningPath, Lesson, Unit } from '@/types/learning';
import type { AdminPageState } from '@/pages/admin/use-admin-page-state';

export function createAdminClassActions(state: AdminPageState) {
    const { paths, selectedPath, selectedUnit, setModal } = state;
    const openPath = (path?: LearningPath) =>
        setModal({
            title: path ? 'Ubah kelas belajar' : 'Buat kelas belajar',
            description: path
                ? 'Perbarui informasi dan status kelas belajar.'
                : 'Kelas baru disimpan sebagai draf. Setelah itu, tambahkan unit dan pelajaran sebelum menerbitkannya.',
            url: path ? `/admin/paths/${path.id}` : '/admin/paths',
            method: path ? 'put' : 'post',
            submitLabel: path ? 'Simpan perubahan' : 'Buat kelas',
            successMessage: path
                ? 'Kelas berhasil diperbarui.'
                : 'Kelas baru berhasil dibuat.',
            fields: [
                { ...titleField, label: 'Nama kelas' },
                {
                    name: 'description',
                    label: 'Deskripsi singkat',
                    type: 'textarea',
                },
                ...(path ? [positionField, statusField] : []),
            ],
            values: path
                ? {
                      title: path.title,
                      description: path.description ?? '',
                      position: path.position,
                      status: path.status,
                  }
                : {},
            hidden: path ? {} : { position: paths.length },
        });

    const openUnit = (unit?: Unit, path = selectedPath) => {
        if (!path) return;
        setModal({
            title: unit ? 'Ubah unit' : 'Tambah unit',
            description: `${t('Unit pada kelas')} ${path.title}. ${t('Susun tujuan dan urutan belajar.')}`,
            url: unit ? `/admin/units/${unit.id}` : '/admin/units',
            method: unit ? 'put' : 'post',
            fields: [
                titleField,
                { name: 'description', label: 'Tujuan unit', type: 'textarea' },
                positionField,
                ...(unit ? [statusField] : []),
            ],
            values: unit
                ? {
                      title: unit.title,
                      description: unit.description ?? '',
                      position: unit.position,
                      status: unit.status,
                  }
                : { position: path.units?.length ?? 0 },
            hidden: unit ? {} : { learning_path_id: path.id },
        });
    };

    const openLesson = (lesson?: Lesson, unit = selectedUnit) => {
        if (!unit) return;
        setModal({
            title: lesson ? 'Ubah pelajaran' : 'Tambah pelajaran',
            description: `${t('Pelajaran pada unit')} ${unit.title}.`,
            url: lesson ? `/admin/lessons/${lesson.id}` : '/admin/lessons',
            method: lesson ? 'put' : 'post',
            fields: [
                titleField,
                { name: 'summary', label: 'Ringkasan', type: 'textarea' },
                {
                    name: 'youtube_url',
                    label: 'Tautan video YouTube (opsional)',
                    type: 'url',
                    placeholder: 'https://www.youtube.com/watch?v=...',
                    hint: 'Video akan tampil di halaman materi. Tempel tautan youtube.com atau youtu.be.',
                },
                positionField,
                ...(lesson ? [statusField] : []),
            ],
            values: lesson
                ? {
                      title: lesson.title,
                      summary: lesson.summary ?? '',
                      youtube_url: lesson.youtube_url ?? '',
                      position: lesson.position,
                      status: lesson.status,
                  }
                : { position: unit.lessons?.length ?? 0 },
            hidden: lesson ? {} : { unit_id: unit.id },
        });
    };

    const goToPath = (path: LearningPath) => {
        router.get(
            `/admin?section=paths&path=${encodeURIComponent(path.slug)}`,
        );
    };

    return { openPath, openUnit, openLesson, goToPath };
}
