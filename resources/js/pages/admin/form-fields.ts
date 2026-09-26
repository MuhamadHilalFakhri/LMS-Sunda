import type { Field, FormValue } from '@/pages/admin/types';

export const statuses = [
    { value: 'draft', label: 'Draf' },
    { value: 'review', label: 'Ditinjau' },
    { value: 'published', label: 'Terbit' },
    { value: 'archived', label: 'Diarsipkan' },
];

export const blockTypes = [
    { value: 'text', label: 'Penjelasan' },
    { value: 'vocabulary', label: 'Kosakata' },
    { value: 'dialogue', label: 'Dialog' },
    { value: 'script', label: 'Aksara Sunda' },
];

export const questionTypes = [
    { value: 'multiple_choice', label: 'Pilihan ganda' },
    { value: 'listening', label: 'Menyimak audio' },
    { value: 'matching', label: 'Mencocokkan' },
    { value: 'fill_blank', label: 'Melengkapi teks' },
    { value: 'ordering', label: 'Susun urutan' },
    { value: 'script', label: 'Pilih aksara' },
];

export const titleField: Field = {
    name: 'title',
    label: 'Judul',
    required: true,
};

export const positionField: Field = {
    name: 'position',
    label: 'Urutan tampil',
    type: 'number',
    hint: 'Angka yang lebih kecil tampil lebih dulu.',
};

export const statusField: Field = {
    name: 'status',
    label: 'Status konten',
    type: 'select',
    options: statuses,
};

export const blockFields: Field[] = [
    { name: 'type', label: 'Jenis blok', type: 'select', options: blockTypes },
    { name: 'title', label: 'Judul blok' },
    { name: 'body', label: 'Isi materi', type: 'textarea' },
    { name: 'latin', label: 'Tulisan Latin' },
    { name: 'sundanese', label: 'Aksara Sunda (Unicode)' },
    { name: 'translation', label: 'Arti Bahasa Indonesia', type: 'textarea' },
    { name: 'region', label: 'Ragam wilayah' },
    { name: 'register', label: 'Tingkat tutur' },
    { name: 'context', label: 'Konteks pemakaian', type: 'textarea' },
    {
        name: 'audio',
        label: 'Audio pelafalan',
        type: 'file',
        hint: 'MP3, WAV, OGG, M4A, atau WEBM. Maksimum 10 MB.',
    },
    positionField,
];

export function questionFieldsForType(type: string): Field[] {
    const prompts: Record<string, { hint: string; placeholder: string }> = {
        multiple_choice: {
            hint: 'Tuliskan pertanyaan yang memiliki satu jawaban paling tepat.',
            placeholder: 'Contoh: Apa arti kata ‘punten’?',
        },
        listening: {
            hint: 'Unggah rekaman Bahasa Sunda, lalu tulis apa yang perlu dikenali dari audio.',
            placeholder: 'Contoh: Kalimat Sunda apa yang Anda dengar?',
        },
        matching: {
            hint: 'Jelaskan pasangan yang harus dicari pelajar.',
            placeholder:
                'Contoh: Pasangkan bunyi ‘ka’ dengan aksara yang benar.',
        },
        fill_blank: {
            hint: 'Tulis kalimat dengan bagian kosong, gunakan ___ sebagai penanda.',
            placeholder: 'Contoh: Lengkapi: Abdi ___ ka sakola.',
        },
        ordering: {
            hint: 'Jelaskan bagian apa yang perlu disusun dan hasil urutannya.',
            placeholder: 'Contoh: Susun kata berikut menjadi salam yang benar.',
        },
        script: {
            hint: 'Minta pelajar mengetik atau menyusun jawaban dalam Aksara Sunda.',
            placeholder: 'Contoh: Tuliskan aksara Sunda untuk bunyi ‘ka’.',
        },
    };
    const answers: Record<string, { hint: string; placeholder: string }> = {
        multiple_choice: {
            hint: 'Isi dengan teks salah satu pilihan secara persis. Contoh: Permisi.',
            placeholder: 'Contoh: Permisi',
        },
        listening: {
            hint: 'Isi dengan teks salah satu pilihan secara persis. Contoh: Wilujeng enjing.',
            placeholder: 'Contoh: Wilujeng enjing',
        },
        matching: {
            hint: 'Isi dengan satu pilihan pasangan secara persis, termasuk tanda pemisahnya.',
            placeholder: 'Contoh: ᮊ — ka',
        },
        fill_blank: {
            hint: 'Isi hanya bagian yang menggantikan tanda ___ pada soal.',
            placeholder: 'Contoh: badé',
        },
        ordering: {
            hint: 'Tuliskan bagian-bagian dalam urutan benar, pisahkan dengan spasi.',
            placeholder: 'Contoh: Wilujeng enjing',
        },
        script: {
            hint: 'Isi karakter Aksara Sunda yang benar. Contoh: ᮊ untuk bunyi ka.',
            placeholder: 'Contoh: ᮊ',
        },
    };
    const explanations: Record<string, { hint: string; placeholder: string }> =
        {
            multiple_choice: {
                hint: 'Jelaskan alasan jawaban benar dan arti pilihan yang ditanyakan.',
                placeholder:
                    'Contoh: ‘Punten’ digunakan untuk meminta izin atau menyela dengan sopan.',
            },
            listening: {
                hint: 'Tuliskan transkrip audio dan arti atau petunjuk pelafalannya.',
                placeholder:
                    'Contoh: Ucapan ‘Wilujeng enjing’ berarti selamat pagi.',
            },
            matching: {
                hint: 'Jelaskan hubungan antara pasangan yang benar.',
                placeholder: 'Contoh: Bunyi ka ditulis menggunakan karakter ᮊ.',
            },
            fill_blank: {
                hint: 'Terangkan mengapa kata tersebut melengkapi kalimat.',
                placeholder:
                    'Contoh: ‘Badé’ berarti akan atau ingin melakukan sesuatu.',
            },
            ordering: {
                hint: 'Jelaskan susunan yang benar dan makna hasilnya.',
                placeholder: 'Contoh: ‘Wilujeng enjing’ berarti selamat pagi.',
            },
            script: {
                hint: 'Sebutkan bunyi Latin atau petunjuk bentuk aksaranya.',
                placeholder: 'Contoh: Aksara ᮊ dibaca ka.',
            },
        };
    const selectedPrompt = prompts[type] ?? prompts.multiple_choice;
    const selectedAnswer = answers[type] ?? answers.multiple_choice;
    const selectedExplanation =
        explanations[type] ?? explanations.multiple_choice;
    const fields: Field[] = [
        {
            name: 'type',
            label: 'Jenis soal',
            type: 'select',
            options: questionTypes,
            hint: 'Jenis soal menentukan kolom yang tampil dan format jawaban.',
        },
        {
            name: 'prompt',
            label: 'Instruksi soal',
            required: true,
            type: 'textarea',
            hint: selectedPrompt.hint,
            placeholder: selectedPrompt.placeholder,
        },
    ];

    if (
        ['multiple_choice', 'matching', 'ordering', 'listening'].includes(type)
    ) {
        if (type === 'listening') {
            fields.push({
                name: 'audio',
                label: 'Rekaman soal',
                type: 'file',
                required: true,
                hint: 'Unggah suara kalimat Bahasa Sunda, maksimum 10 MB. Format: MP3, WAV, OGG, M4A, atau WEBM.',
            });
        }
        const options =
            type === 'ordering'
                ? {
                      label: 'Bagian yang disusun (satu per baris)',
                      hint: 'Isi satu kata atau potongan per baris. Urutan baris boleh diacak.',
                      placeholder: 'Wilujeng\nenjing',
                  }
                : type === 'matching'
                  ? {
                        label: 'Pilihan pasangan (satu per baris)',
                        hint: 'Isi satu pasangan per baris. Jawaban benar harus sama persis dengan salah satu baris.',
                        placeholder: 'ᮊ — ka\nᮌ — ga\nᮍ — nga',
                    }
                  : {
                        label: 'Pilihan jawaban',
                        hint: 'Isi pilihan pada kolom, lalu tandai radio pada jawaban yang benar.',
                        placeholder: 'Contoh: Permisi',
                    };
        fields.push({
            name: 'options',
            type: 'textarea',
            required: true,
            ...options,
        });
    }

    fields.push(
        {
            name: 'answer',
            label: 'Jawaban benar',
            required: true,
            ...selectedAnswer,
        },
        {
            name: 'explanation',
            label: 'Penjelasan untuk pelajar',
            required: true,
            type: 'textarea',
            ...selectedExplanation,
        },
        {
            ...positionField,
            hint: 'Angka kecil tampil lebih dulu. Contoh: 0 untuk soal pertama.',
        },
    );

    return fields;
}

export const labelStatus = (value: string) =>
    statuses.find((item) => item.value === value)?.label ?? value;

export const textValue = (value: FormValue | undefined) =>
    typeof value === 'string' || typeof value === 'number' ? `${value}` : '';
