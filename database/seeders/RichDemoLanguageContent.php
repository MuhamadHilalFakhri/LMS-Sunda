<?php

namespace Database\Seeders;

use App\Models\LearningPath;
use Illuminate\Support\Facades\Storage;

/** Additive, repeatable sample data for previewing a busy LMS locally. */
trait RichDemoLanguageContent
{
    private function copyAudio(): void
    {
        foreach ([
            'abdi', 'anjeun', 'akang', 'kuring',
            'sentence-darehdeh-someah', 'sentence-sanggeus-binih', 'sentence-istana-bogor',
        ] as $word) {
            $destination = 'demo-audio/'.$word.'.wav';
            if (! Storage::disk('public')->exists($destination)) {
                Storage::disk('public')->put($destination, file_get_contents(__DIR__.'/assets/'.$word.'.wav'));
            }
        }
    }

    private function audioSource(string $word): ?array
    {
        return match (mb_strtolower($word)) {
            'abdi', 'anjeun' => [
                'path' => 'demo-audio/'.mb_strtolower($word).'.wav',
                'credit' => 'Audio oleh Panonpoe tos moncorong (Lingua Libre/Wikimedia Commons), CC0 1.0.',
            ],
            'akang' => [
                'path' => 'demo-audio/akang.wav',
                'credit' => 'Audio oleh Griselda Orion (Lingua Libre/Wikimedia Commons), CC0 1.0.',
            ],
            'kuring' => [
                'path' => 'demo-audio/kuring.wav',
                'credit' => 'Audio “kuring” oleh Raflinoer32 (Lingua Libre/Wikimedia Commons), CC BY 4.0. Sumber: https://commons.wikimedia.org/wiki/File:LL-Q34002_(sun)-Raflinoer32-kuring.wav. Audio digunakan tanpa perubahan.',
            ],
            default => null,
        };
    }

    private function vocabularyGuide(string $word): ?string
    {
        return match (mb_strtolower(trim($word))) {
            'abdi' => 'Bentuk lemes untuk menyebut diri sendiri dengan sopan. Contoh: “Abdi badé diajar.” berarti “Saya akan belajar.”',
            'kuring' => 'Bentuk loma untuk menyebut diri sendiri dalam percakapan akrab. Contoh: “Kuring rék diajar.” berarti “Saya akan belajar.”',
            'anjeun' => 'Kata ganti sopan untuk orang yang diajak bicara. Contoh: “Anjeun badé angkat ka mana?” berarti “Anda akan pergi ke mana?”',
            'maneh' => 'Bentuk loma untuk menyapa orang yang sudah akrab. Hindari untuk orang yang lebih tua atau belum akrab karena dapat terdengar kasar. Contoh: “Maneh rék ka mana?” berarti “Kamu mau ke mana?”',
            'anjeunna' => 'Bentuk lemes untuk menyebut orang lain dengan hormat. Contoh: “Anjeunna parantos sumping.” berarti “Beliau sudah datang.”',
            'manehna' => 'Bentuk loma untuk menyebut orang lain dalam percakapan akrab. Contoh: “Manehna keur diajar.” berarti “Dia sedang belajar.”',
            default => null,
        };
    }

    private function seedLanguage(): void
    {
        $path = LearningPath::where('slug', 'bahasa-sunda')->firstOrFail();
        $units = [
            ['Kata ganti orang', 'Kenali kata ganti dan ragam pemakaiannya.', [
                ['Saya: abdi dan kuring', [['abdi', 'saya', 'lemes'], ['kuring', 'saya', 'loma']]],
                ['Anda: anjeun dan maneh', [['anjeun', 'Anda', 'lemes'], ['maneh', 'kamu', 'loma']]],
                ['Dia: anjeunna dan manehna', [['anjeunna', 'beliau', 'lemes'], ['manehna', 'dia', 'loma']]],
            ]],
            ['Kata tanya', 'Gunakan kata tanya untuk mengenali maksud percakapan.', [
                ['Apa dan siapa', [['naon', 'apa'], ['saha', 'siapa']]],
                ['Kapan dan bagaimana', [['iraha', 'kapan'], ['kumaha', 'bagaimana']]],
                ['Mengapa dan apa', [['kunaon', 'mengapa'], ['naon', 'apa']]],
            ]],
            ['Bilangan dasar', 'Berlatih mengenali bilangan satu sampai sepuluh.', [
                ['Bilangan hiji sampai tilu', [['hiji', 'satu'], ['dua', 'dua'], ['tilu', 'tiga']]],
                ['Bilangan opat sampai genep', [['opat', 'empat'], ['lima', 'lima'], ['genep', 'enam']]],
                ['Bilangan tujuh sampai sapuluh', [['tujuh', 'tujuh'], ['dalapan', 'delapan'], ['salapan', 'sembilan'], ['sapuluh', 'sepuluh']]],
            ]],
            ['Keluarga', 'Kosakata anggota keluarga dalam percakapan.', [
                ['Indung dan bapa', [['indung', 'ibu'], ['bapa', 'ayah']]],
                ['Adi dan akang', [['adi', 'adik'], ['akang', 'kakak laki-laki']]],
                ['Aki dan nini', [['aki', 'kakek'], ['nini', 'nenek']]],
            ]],
            ['Percakapan singkat', 'Terapkan ungkapan dasar dalam situasi sederhana.', [
                ['Menyapa dan menanyakan kabar', [['Wilujeng enjing', 'Selamat pagi'], ['Kumaha damang?', 'Apa kabar?']]],
                ['Meminta izin dan mempersilakan', [['Punten', 'Permisi'], ['Mangga', 'Silakan']]],
                ['Berterima kasih dan masuk', [['Hatur nuhun', 'Terima kasih'], ['asup', 'masuk', 'loma'], ['lebet', 'masuk', 'lemes']]],
            ]],
        ];

        foreach ($units as $unitIndex => [$title, $description, $lessons]) {
            $unit = $path->units()->firstOrCreate(['title' => $title], [
                'description' => $description, 'status' => 'published', 'position' => $unitIndex + 2,
            ]);
            foreach ($lessons as $lessonIndex => [$lessonTitle, $terms]) {
                $lesson = $unit->lessons()->firstOrCreate(['title' => $lessonTitle], [
                    'summary' => 'Pelajari '.mb_strtolower($lessonTitle).' melalui contoh dan latihan.',
                    'status' => 'published', 'position' => $lessonIndex,
                ]);
                $intro = $lesson->blocks()->firstOrCreate(['title' => 'Fokus pelajaran: '.$lessonTitle], [
                    'type' => 'text',
                    'body' => 'Baca setiap pasangan kata dan arti. Perhatikan ragam tutur bila dicantumkan. Gunakan contoh ini sebagai pengenalan awal, kemudian cocokkan dengan konteks percakapan.',
                    'position' => 0,
                ]);
                if ($intro->body === 'Baca setiap pasangan kata dan arti. Perhatikan ragam tutur bila dicantumkan. Gunakan contoh ini sebagai pengenalan awal, kemudian cocokkan dengan konteks percakapan.') {
                    $intro->update(['body' => 'Di setiap kartu, kata Sunda ditampilkan bersama artinya. Jika ada ragam tutur, loma biasanya dipakai dalam percakapan akrab, sedangkan lemes dipakai untuk berbicara dengan sopan. Baca contoh kalimat, lalu dengarkan audio jika tersedia.']);
                }
                foreach ($terms as $position => $term) {
                    [$word, $meaning] = $term;
                    $block = $lesson->blocks()->firstOrCreate(['title' => 'Kosakata: '.$word], [
                        'type' => 'vocabulary', 'latin' => $word, 'translation' => $meaning,
                        'body' => $this->vocabularyGuide($word),
                        'register' => $term[2] ?? null,
                        'context' => 'Pasangan kata dan arti untuk latihan pengenalan kosakata.',
                        'position' => $position + 1,
                    ]);
                    $guide = $this->vocabularyGuide($word);
                    if ($guide && blank($block->body)) {
                        $block->update(['body' => $guide]);
                    }
                    $audio = $this->audioSource($word);
                    if ($audio && $block->type === 'vocabulary' && $block->latin === $word && ! $block->audio_path) {
                        $block->update([
                            'audio_path' => $audio['path'],
                            'context' => $block->context === 'Pasangan kata dan arti untuk latihan pengenalan kosakata.'
                                ? $audio['credit'] : $block->context,
                        ]);
                    }
                }
                $exercise = $lesson->exercises()->firstOrCreate(['title' => 'Latihan: '.$lessonTitle], ['position' => 0]);
                foreach (array_slice($terms, 0, 3) as $position => [$word, $meaning]) {
                    $options = array_values(array_unique(array_merge([$meaning], array_column($terms, 1), ['permisi', 'selamat pagi', 'terima kasih'])));
                    $options = array_slice($options, 0, max(3, count($terms)));
                    $exercise->questions()->firstOrCreate(['prompt' => 'Apa arti “'.$word.'” pada materi ini?'], [
                        'type' => 'multiple_choice', 'options' => $options,
                        'answer' => ['value' => $meaning], 'explanation' => 'Dalam materi ini, “'.$word.'” dipasangkan dengan arti “'.$meaning.'”.',
                        'position' => $position,
                    ]);
                }
                foreach (array_slice($terms, 0, 3) as $position => [$word, $meaning]) {
                    $exercise->questions()->firstOrCreate(['prompt' => 'Lengkapi arti kata “'.$word.'” dalam Bahasa Indonesia.'], [
                        'type' => 'fill_blank', 'options' => null, 'answer' => ['value' => $meaning],
                        'explanation' => 'Pada materi ini, “'.$word.'” berarti “'.$meaning.'”.',
                        'position' => $position + 3,
                    ]);
                }
            }
        }
    }

    private function seedScript(): void
    {
        $path = LearningPath::where('slug', 'aksara-sunda')->firstOrFail();
        $units = [
            ['Aksara swara lanjutan', 'Empat vokal mandiri setelah A, I, dan U.', [
                ['Swara É dan O', [['é', 'ᮆ'], ['o', 'ᮇ']]],
                ['Swara E dan Eu', [['e', 'ᮈ'], ['eu', 'ᮉ']]],
                ['Ulang swara lanjutan', [['é', 'ᮆ'], ['o', 'ᮇ'], ['e', 'ᮈ'], ['eu', 'ᮉ']]],
            ]],
            ['Ngalagena kelompok awal', 'Kenali bentuk Ka sampai Nya.', [
                ['Ka, Ga, dan Nga', [['ka', 'ᮊ'], ['ga', 'ᮌ'], ['nga', 'ᮍ']]],
                ['Ca, Ja, dan Nya', [['ca', 'ᮎ'], ['ja', 'ᮏ'], ['nya', 'ᮑ']]],
                ['Ulang kelompok Ka sampai Nya', [['ka', 'ᮊ'], ['nga', 'ᮍ'], ['nya', 'ᮑ']]],
            ]],
            ['Ngalagena kelompok tengah', 'Kenali Ta, Da, Na, Pa, Ba, dan Ma.', [
                ['Ta, Da, dan Na', [['ta', 'ᮒ'], ['da', 'ᮓ'], ['na', 'ᮔ']]],
                ['Pa, Ba, dan Ma', [['pa', 'ᮕ'], ['ba', 'ᮘ'], ['ma', 'ᮙ']]],
                ['Ulang kelompok Ta sampai Ma', [['ta', 'ᮒ'], ['pa', 'ᮕ'], ['ma', 'ᮙ']]],
            ]],
            ['Ngalagena kelompok akhir', 'Kenali Ya, Ra, La, Wa, Sa, dan Ha.', [
                ['Ya, Ra, dan La', [['ya', 'ᮚ'], ['ra', 'ᮛ'], ['la', 'ᮜ']]],
                ['Wa, Sa, dan Ha', [['wa', 'ᮝ'], ['sa', 'ᮞ'], ['ha', 'ᮠ']]],
                ['Ulang kelompok Ya sampai Ha', [['ya', 'ᮚ'], ['sa', 'ᮞ'], ['ha', 'ᮠ']]],
            ]],
            ['Angka Aksara Sunda', 'Cocokkan angka dengan karakter Unicode Aksara Sunda.', [
                ['Angka 0 sampai 3', [['0', '᮰'], ['1', '᮱'], ['2', '᮲'], ['3', '᮳']]],
                ['Angka 4 sampai 6', [['4', '᮴'], ['5', '᮵'], ['6', '᮶']]],
                ['Angka 7 sampai 9', [['7', '᮷'], ['8', '᮸'], ['9', '᮹']]],
            ]],
            ['Rarangken vokal', 'Lihat pengaruh tanda vokal pada aksara dasar Ka.', [
                ['Ka dengan bunyi i dan u', [['ki', 'ᮊᮤ'], ['ku', 'ᮊᮥ']]],
                ['Ka dengan bunyi o dan e', [['ko', 'ᮊᮧ'], ['ke', 'ᮊᮨ']]],
                ['Ka dengan bunyi eu', [['keu', 'ᮊᮩ'], ['ka', 'ᮊ']]],
            ]],
        ];

        foreach ($units as $unitIndex => [$title, $description, $lessons]) {
            $unit = $path->units()->firstOrCreate(['title' => $title], [
                'description' => $description, 'status' => 'published', 'position' => $unitIndex + 2,
            ]);
            foreach ($lessons as $lessonIndex => [$lessonTitle, $glyphs]) {
                $lesson = $unit->lessons()->firstOrCreate(['title' => $lessonTitle], [
                    'summary' => 'Kenali bentuk dan bacaan '.mb_strtolower($lessonTitle).'.',
                    'status' => 'published', 'position' => $lessonIndex,
                ]);
                $lesson->blocks()->firstOrCreate(['title' => 'Fokus aksara: '.$lessonTitle], [
                    'type' => 'text',
                    'body' => 'Perhatikan bentuk Unicode dan bacaan Latin. Tanda vokal ditampilkan bersama aksara dasar agar posisi tanda terlihat jelas.',
                    'position' => 0,
                ]);
                foreach ($glyphs as $position => [$reading, $glyph]) {
                    $lesson->blocks()->firstOrCreate(['title' => 'Aksara: '.$reading], [
                        'type' => 'script', 'latin' => $reading, 'sundanese' => $glyph,
                        'translation' => 'Dibaca '.$reading, 'position' => $position + 1,
                    ]);
                }
                $exercise = $lesson->exercises()->firstOrCreate(['title' => 'Latihan: '.$lessonTitle], ['position' => 0]);
                foreach (array_slice($glyphs, 0, 3) as $position => [$reading, $glyph]) {
                    $options = array_values(array_unique(array_merge([$glyph], array_column($glyphs, 1), ['ᮃ', 'ᮄ', 'ᮅ'])));
                    $options = array_slice($options, 0, max(3, count($glyphs)));
                    $exercise->questions()->firstOrCreate(['prompt' => 'Pilih aksara yang dibaca “'.$reading.'”.'], [
                        'type' => 'matching', 'options' => $options,
                        'answer' => ['value' => $glyph], 'explanation' => '“'.$reading.'” ditulis dengan '.$glyph.' pada materi ini.',
                        'position' => $position,
                    ]);
                }
                foreach ($glyphs as $position => [$reading, $glyph]) {
                    $exercise->questions()->firstOrCreate(['prompt' => 'Tuliskan aksara Sunda untuk bunyi “'.$reading.'”.'], [
                        'type' => 'script', 'options' => null, 'answer' => ['value' => $glyph],
                        'explanation' => 'Bunyi “'.$reading.'” ditulis dengan aksara '.$glyph.'.',
                        'position' => $position + 3,
                    ]);
                }
            }
        }
    }

    private function seedSentenceAudio(): void
    {
        $path = LearningPath::where('slug', 'bahasa-sunda')->firstOrFail();
        $unit = $path->units()->firstOrCreate(['title' => 'Contoh kalimat'], [
            'description' => 'Dengarkan contoh kalimat Sunda utuh dan pahami artinya dalam konteks.',
            'status' => 'published', 'position' => 7,
        ]);
        $lesson = $unit->lessons()->firstOrCreate(['title' => 'Kalimat dalam konteks'], [
            'summary' => 'Latihan menyimak beberapa kalimat Sunda dengan transkrip dan arti.',
            'status' => 'published', 'position' => 0,
        ]);

        $sentences = [
            [
                'title' => 'Kalimat: Darehdeh jeung someah',
                'body' => 'Darehdeh jeung someah beda hartina.',
                'translation' => 'Darehdeh dan someah berbeda artinya.',
                'file' => 'sentence-darehdeh-someah.wav',
                'recording' => 'sum_00060_00520158487',
            ],
            [
                'title' => 'Kalimat: Sanggeus kitu',
                'body' => 'Sanggeus kitu, tinggal melak binih dina media tanam.',
                'translation' => 'Setelah itu, tanam benih di media tanam.',
                'file' => 'sentence-sanggeus-binih.wav',
                'recording' => 'sum_00060_01321259314',
            ],
            [
                'title' => 'Kalimat: Milarian gambar',
                'body' => 'Seueur nu milarian gambar Istana Bogor di internet.',
                'translation' => 'Banyak orang mencari gambar Istana Bogor di internet.',
                'file' => 'sentence-istana-bogor.wav',
                'recording' => 'sum_00060_01093908884',
            ],
        ];

        foreach ($sentences as $position => $sentence) {
            $lesson->blocks()->firstOrCreate(['title' => $sentence['title']], [
                'type' => 'dialogue',
                'body' => $sentence['body'],
                'translation' => $sentence['translation'],
                'audio_path' => 'demo-audio/'.$sentence['file'],
                'context' => 'Rekaman Sunda dari OpenSLR SLR44, speaker laki-laki '.$sentence['recording'].'. Lisensi CC BY-SA 4.0. Sumber: https://openslr.org/44/. Audio digunakan tanpa perubahan.',
                'position' => $position,
            ]);
        }
    }
}
