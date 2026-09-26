import { blockFields } from '@/pages/admin/form-fields';
import type { AudioBlock, FormValue } from '@/pages/admin/types';
import type { Block } from '@/types/learning';
import type { AdminPageState } from '@/pages/admin/use-admin-page-state';

export function createAdminMaterialActions(state: AdminPageState) {
    const { selectedLesson, allLessons, setModal, setAudioModalTarget } = state;
    const openBlock = (
        block?: Block,
        lesson = selectedLesson,
        defaults: Record<string, FormValue> = {},
    ) => {
        if (!block && !lesson) return;
        setModal({
            title: block ? 'Ubah blok materi' : 'Tambah blok materi',
            description:
                'Teks, kosakata, aksara, konteks pemakaian, dan audio dalam satu blok.',
            url: block ? `/admin/blocks/${block.id}` : '/admin/blocks',
            method: block ? 'put' : 'post',
            fields: blockFields,
            values: block
                ? {
                      type: block.type,
                      title: block.title ?? '',
                      body: block.body ?? '',
                      latin: block.latin ?? '',
                      sundanese: block.sundanese ?? '',
                      translation: block.translation ?? '',
                      region: block.region ?? '',
                      register: block.register ?? '',
                      context: block.context ?? '',
                      position: block.position,
                  }
                : {
                      type: 'text',
                      position: lesson?.blocks?.length ?? 0,
                      ...defaults,
                  },
            hidden: block ? {} : { lesson_id: lesson!.id },
        });
    };

    const openVocabularyBlock = () => {
        const lessonOptions = allLessons.map((lesson) => ({
            value: String(lesson.id),
            label: `${lesson.pathTitle} / ${lesson.unitTitle} / ${lesson.title}`,
        }));
        const vocabularyFields = blockFields.filter(
            (field) =>
                !['type', 'body'].includes(field.name) &&
                field.name !== 'sundanese',
        );

        setModal({
            title: 'Tambah kosakata & konteks',
            description:
                'Pilih materi tujuan, lalu isi kosakata, arti, tingkat tutur, dan konteks penggunaannya.',
            url: '/admin/blocks',
            method: 'post',
            fields: [
                {
                    name: 'lesson_id',
                    label: 'Materi tujuan',
                    type: 'select',
                    required: true,
                    options: lessonOptions,
                    hint: 'Entri akan ditampilkan di materi yang Anda pilih.',
                },
                ...vocabularyFields,
            ],
            values: { lesson_id: '', type: 'vocabulary', position: 0 },
            hidden: { type: 'vocabulary' },
            successMessage: 'Kosakata dan konteks berhasil ditambahkan.',
        });
    };

    const openBlockAudio = (block?: AudioBlock | null) =>
        setAudioModalTarget(block ?? null);

    return { openBlock, openVocabularyBlock, openBlockAudio };
}

