<?php

namespace Database\Seeders;

use App\Models\LearningPath;
use App\Models\Exercise;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

/** Additive, repeatable sample data for previewing a busy LMS locally. */
class RichDemoSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            return;
        }

        DB::transaction(function (): void {
            $this->copyAudio();
            $this->seedLanguage();
            $this->seedSentenceAudio();
            $this->seedScript();
            $this->seedQuizzes();
            $this->seedLearnersAndActivity();
        });
    }

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

    private function seedQuizzes(): void
    {
        $languagePath = LearningPath::where('slug', 'bahasa-sunda')->firstOrFail();
        $languageLesson = $languagePath->units()->where('title', 'Percakapan singkat')->firstOrFail()
            ->lessons()->where('title', 'Menyapa dan menanyakan kabar')->firstOrFail();
        $this->createDemoQuiz($languageLesson, 'Kuis: Sapaan dan ungkapan', 10, 70, 3, [
            ['Apa arti “Wilujeng enjing”?', ['Selamat pagi', 'Selamat malam', 'Terima kasih', 'Permisi'], 'Selamat pagi', '“Wilujeng enjing” digunakan sebagai sapaan pada pagi hari.'],
            ['Ungkapan mana yang berarti “Apa kabar”?', ['Kumaha damang?', 'Hatur nuhun', 'Mangga linggih', 'Wilujeng wengi'], 'Kumaha damang?', '“Kumaha damang?” digunakan untuk menanyakan kabar.'],
            ['Apa arti “Hatur nuhun”?', ['Terima kasih', 'Silakan', 'Selamat datang', 'Sampai jumpa'], 'Terima kasih', '“Hatur nuhun” berarti terima kasih.'],
        ]);

        $scriptPath = LearningPath::where('slug', 'aksara-sunda')->firstOrFail();
        $scriptLesson = $scriptPath->units()->where('title', 'Ngalagena kelompok awal')->firstOrFail()
            ->lessons()->where('title', 'Ka, Ga, dan Nga')->firstOrFail();
        $this->createDemoQuiz($scriptLesson, 'Kuis: Aksara Ka, Ga, jeung Nga', 8, 70, 3, [
            ['Pilih aksara yang dibaca “ka”.', ['ᮊ', 'ᮌ', 'ᮍ', 'ᮞ'], 'ᮊ', 'Aksara Ka adalah ᮊ.'],
            ['Pilih aksara yang dibaca “ga”.', ['ᮍ', 'ᮌ', 'ᮊ', 'ᮔ'], 'ᮌ', 'Aksara Ga adalah ᮌ.'],
            ['Pilih aksara yang dibaca “nga”.', ['ᮎ', 'ᮊ', 'ᮍ', 'ᮏ'], 'ᮍ', 'Aksara Nga adalah ᮍ.'],
        ]);

        $this->seedListeningQuiz();

        $paths = LearningPath::query()->whereIn('slug', ['bahasa-sunda', 'aksara-sunda'])
            ->with('units.lessons.blocks')->get();
        foreach ($paths as $path) {
            $isScript = $path->slug === 'aksara-sunda';
            $lessons = $path->units->flatMap(fn ($unit) => $unit->lessons)
                ->filter(fn ($lesson) => $lesson->status === 'published')->values();
            $allBlocks = $lessons->flatMap(fn ($lesson) => $lesson->blocks);
            $eligibleBlocks = $allBlocks->filter(fn ($block) => $isScript
                ? $block->type === 'script' && filled($block->latin) && filled($block->sundanese)
                : $block->type === 'vocabulary' && filled($block->latin) && filled($block->translation));
            $answerPool = $eligibleBlocks->map(fn ($block) => $isScript ? $block->sundanese : $block->translation)
                ->filter()->unique()->values();
            $fallbackOptions = $isScript
                ? ['ᮃ', 'ᮄ', 'ᮅ', 'ᮊ', 'ᮌ', 'ᮍ', 'ᮎ', 'ᮏ']
                : ['permisi', 'terima kasih', 'selamat pagi', 'apa kabar', 'silakan', 'sampai jumpa'];

            foreach ($lessons as $lesson) {
                $questions = [];
                $lessonBlocks = $lesson->blocks->filter(fn ($block) => $isScript
                    ? $block->type === 'script' && filled($block->latin) && filled($block->sundanese)
                    : $block->type === 'vocabulary' && filled($block->latin) && filled($block->translation));

                foreach ($lessonBlocks->take(6)->values() as $position => $block) {
                    $answer = $isScript ? $block->sundanese : $block->translation;
                    $wrongOptions = $answerPool->reject(fn ($option) => $option === $answer)->take(3)->all();
                    foreach ($fallbackOptions as $fallback) {
                        if (count($wrongOptions) >= 3) {
                            break;
                        }
                        if ($fallback !== $answer && ! in_array($fallback, $wrongOptions, true)) {
                            $wrongOptions[] = $fallback;
                        }
                    }
                    if (count($wrongOptions) < 3) {
                        continue;
                    }

                    $prompt = $isScript
                        ? 'Evaluasi materi “'.$lesson->title.'”: aksara untuk bunyi “'.$block->latin.'” adalah …'
                        : 'Evaluasi materi “'.$lesson->title.'”: arti kata “'.$block->latin.'” adalah …';
                    $options = array_slice($wrongOptions, 0, 3);
                    array_splice($options, ($lesson->id + $position) % 4, 0, [$answer]);
                    $explanation = $isScript
                        ? 'Dalam materi “'.$lesson->title.'”, bunyi “'.$block->latin.'” ditulis '.$answer.'.'
                        : 'Dalam materi “'.$lesson->title.'”, kata “'.$block->latin.'” berarti “'.$answer.'”.';
                    $questions[] = [$prompt, $options, $answer, $explanation];
                }

                if ($questions) {
                    $this->createDemoQuiz(
                        $lesson,
                        'Evaluasi: '.$path->title.' · '.$lesson->title,
                        $isScript ? 10 : 8,
                        75,
                        2,
                        $questions,
                    );
                }
            }
        }
    }

    /** @param list<array{string, list<string>, string, string}> $questions */
    private function createDemoQuiz(Lesson $lesson, string $title, int $minutes, int $passPercentage, int $attemptLimit, array $questions): void
    {
        $quiz = $lesson->exercises()->firstOrCreate(['title' => $title], [
            'kind' => 'quiz', 'time_limit_minutes' => $minutes, 'pass_percentage' => $passPercentage,
            'attempt_limit' => $attemptLimit, 'position' => 10,
        ]);

        foreach ($questions as $position => [$prompt, $options, $answer, $explanation]) {
            $quiz->questions()->firstOrCreate(['prompt' => $prompt], [
                'type' => 'multiple_choice', 'options' => $options, 'answer' => ['value' => $answer],
                'explanation' => $explanation, 'position' => $position,
            ]);
        }
    }

    private function seedListeningQuiz(): void
    {
        $lesson = Lesson::query()->where('title', 'Kalimat dalam konteks')
            ->whereHas('unit.path', fn ($query) => $query->where('slug', 'bahasa-sunda'))
            ->with('blocks')->first();
        if (! $lesson) {
            return;
        }

        $sentences = $lesson->blocks->filter(fn ($block) => $block->audio_path && $block->body && $block->translation)->values();
        if ($sentences->count() < 3) {
            return;
        }

        $quiz = $lesson->exercises()->firstOrCreate(['title' => 'Kuis menyimak: Kalimat Sunda'], [
            'kind' => 'quiz', 'time_limit_minutes' => 8, 'pass_percentage' => 70,
            'attempt_limit' => 3, 'position' => 11,
        ]);
        $options = $sentences->take(3)->pluck('body')->push('Wilujeng enjing, kumaha damang?')->values()->all();
        foreach ($sentences->take(3) as $position => $sentence) {
            $quiz->questions()->firstOrCreate([
                'prompt' => 'Tuliskan kalimat yang terdengar pada rekaman '.($position + 1).'.',
            ], [
                'type' => 'listening',
                'options' => $options,
                'audio_path' => $sentence->audio_path,
                'answer' => ['value' => $sentence->body],
                'explanation' => $sentence->body.' berarti “'.$sentence->translation.'” Audio oleh speaker laki-laki OpenSLR SLR44, lisensi CC BY-SA 4.0.',
                'position' => $position,
            ]);
        }
    }

    private function seedLearnersAndActivity(): void
    {
        $names = [
            'Pelajar Demo',
            'Alya Putri', 'Bagas Pratama', 'Citra Maharani', 'Daffa Ramadhan',
            'Elina Safitri', 'Farhan Maulana', 'Gina Permata', 'Hana Aulia',
            'Iqbal Saputra', 'Jihan Nabila', 'Kinan Salsabila', 'Laras Wulandari',
            'Maulana Fikri', 'Nadia Kartika', 'Oki Firmansyah', 'Putri Anindya',
            'Raka Saputra', 'Salsa Nurhaliza', 'Tegar Wibowo', 'Uli Rahmawati',
            'Vina Agustina', 'Wahyu Nugraha', 'Yasmin Zahra', 'Zidan Akbar',
        ];
        $lessons = Lesson::query()->where('status', 'published')
            ->whereHas('unit', fn ($query) => $query->where('status', 'published'))
            ->whereHas('unit.path', fn ($query) => $query->where('status', 'published'))
            ->with(['exercises.questions', 'blocks'])->orderBy('id')->get();
        $quizzes = Exercise::query()->whereIn('title', ['Kuis: Sapaan dan ungkapan', 'Kuis: Aksara Ka, Ga, jeung Nga', 'Kuis menyimak: Kalimat Sunda'])
            ->where('kind', 'quiz')->with('questions')->orderBy('id')->get();
        $courtesy = Lesson::where('title', 'Punten, mangga, dan hatur nuhun')->first();

        foreach ($names as $index => $name) {
            $email = $index === 0 ? 'pelajar.demo@example.test'
                : 'pelajar.demo.'.str_pad((string) $index, 2, '0', STR_PAD_LEFT).'@example.test';
            $student = User::where('email', $email)->first();
            if (! $student) {
                $student = User::factory()->create([
                    'name' => $name, 'email' => $email, 'role' => 'pelajar',
                    'email_verified_at' => now(), 'password' => Hash::make(config('demo.account_password')),
                ]);
            }
            if ($student->role !== 'pelajar') {
                continue;
            }

            $target = min($lessons->count(), $index === 0 ? 18 : 5 + ($index % 10) * 2);
            foreach ($lessons->take($target) as $lessonIndex => $lesson) {
                $completed = $lessonIndex < max(0, $target - 2);
                $date = now()->subDays(max(1, $target - $lessonIndex + $index % 4));
                DB::table('lesson_progress')->insertOrIgnore([
                    'user_id' => $student->id, 'lesson_id' => $lesson->id,
                    'status' => $completed ? 'completed' : 'in_progress',
                    'completed_at' => $completed ? $date : null,
                    'created_at' => $date, 'updated_at' => $date,
                ]);
            }

            foreach ($lessons->take(min($target, $index === 0 ? 10 : 3 + $index % 7)) as $lessonIndex => $lesson) {
                $exercise = $lesson->exercises->first();
                if (! $exercise || $exercise->questions->isEmpty()) {
                    continue;
                }

                $existingAttempt = DB::table('exercise_attempts')->where('user_id', $student->id)
                    ->where('exercise_id', $exercise->id)->first();
                if ($existingAttempt) {
                    continue;
                }

                $answers = [];
                $correct = 0;
                foreach ($exercise->questions as $questionIndex => $question) {
                    $answer = $question->answer['value'];
                    $submitted = ($questionIndex + $index + $lessonIndex) % 5 === 0
                        ? ($question->options[0] ?? 'belum yakin') : $answer;
                    $answers[$question->id] = $submitted;
                    $correct += mb_strtolower(trim($submitted)) === mb_strtolower(trim($answer)) ? 1 : 0;
                }
                $date = now()->subDays(max(1, $target - $lessonIndex + $index % 4));
                DB::table('exercise_attempts')->insert([
                    'user_id' => $student->id, 'exercise_id' => $exercise->id,
                    'answers' => json_encode($answers, JSON_UNESCAPED_UNICODE),
                    'correct_count' => $correct, 'total_count' => $exercise->questions->count(),
                    'duration_seconds' => 60 + ($index * 17 + $lessonIndex * 11) % 180,
                    'created_at' => $date, 'updated_at' => $date,
                ]);
            }

            $attemptedQuizIds = DB::table('exercise_attempts')->where('user_id', $student->id)
                ->whereIn('exercise_id', $quizzes->pluck('id'))->pluck('exercise_id')->flip();
            foreach ($quizzes as $quizIndex => $quiz) {
                if ($quiz->questions->isEmpty() || isset($attemptedQuizIds[$quiz->id])) {
                    continue;
                }
                $answers = [];
                $correct = 0;
                foreach ($quiz->questions as $questionIndex => $question) {
                    $answer = $question->answer['value'];
                    $wrongOptions = array_values(array_filter($question->options ?? [], fn ($option) => $option !== $answer));
                    $submitted = ($questionIndex + $index + $quizIndex) % 5 === 0 && $wrongOptions
                        ? $wrongOptions[0] : $answer;
                    $answers[$question->id] = $submitted;
                    $correct += mb_strtolower(trim($submitted)) === mb_strtolower(trim($answer)) ? 1 : 0;
                }
                $date = now()->subDays(1 + ($index + $quizIndex) % 14);
                DB::table('exercise_attempts')->insert([
                    'user_id' => $student->id, 'exercise_id' => $quiz->id,
                    'answers' => json_encode($answers, JSON_UNESCAPED_UNICODE),
                    'correct_count' => $correct, 'total_count' => $quiz->questions->count(),
                    'duration_seconds' => 90 + ($index * 13 + $quizIndex * 19) % 240,
                    'created_at' => $date, 'updated_at' => $date,
                ]);
                $attemptedQuizIds[$quiz->id] = true;
            }

            if ($courtesy) {
                foreach ([
                    ['Contoh demo: kapan memakai punten?', 'Dalam materi, “punten” digunakan saat meminta izin atau menyela.'],
                    ['Contoh demo: apa arti hatur nuhun?', 'Dalam materi, “hatur nuhun” berarti “terima kasih”.'],
                ] as [$prompt, $response]) {
                    if (DB::table('ai_messages')->where('user_id', $student->id)->where('prompt', $prompt)->exists()) {
                        continue;
                    }
                    $date = now()->subDays(1 + $index % 12);
                    DB::table('ai_messages')->insert([
                        'user_id' => $student->id, 'mode' => 'question',
                        'prompt' => $prompt, 'response' => 'Riwayat tutor contoh. '.$response,
                        'references' => json_encode([['lesson_id' => $courtesy->id, 'title' => $courtesy->title]], JSON_UNESCAPED_UNICODE),
                        'input_tokens' => 0, 'output_tokens' => 0,
                        'created_at' => $date, 'updated_at' => $date,
                    ]);
                }
            }

            $reviewBlocks = $lessons->take($target)->flatMap(fn ($lesson) => $lesson->blocks)
                ->filter(fn ($block) => in_array($block->type, ['vocabulary', 'script'], true)
                    && (filled($block->latin) || filled($block->sundanese) || filled($block->body))
                    && (filled($block->translation) || filled($block->latin) || filled($block->sundanese)))
                ->unique('id')->take(24)->values();
            $reviewNow = now();
            foreach ($reviewBlocks as $reviewIndex => $block) {
                $isDue = ($reviewIndex + $index) % 3 !== 0;
                $intervalDays = $isDue ? 0 : 1 + (($reviewIndex + $index) % 4);
                $dueAt = $isDue ? $reviewNow->copy()->subMinutes(5 + $reviewIndex) : $reviewNow->copy()->addDays($intervalDays);
                DB::table('review_cards')->insertOrIgnore([
                    'user_id' => $student->id, 'lesson_block_id' => $block->id,
                    'interval_days' => $intervalDays, 'repetitions' => $isDue ? 0 : 1 + ($reviewIndex % 3),
                    'ease_factor' => '2.50', 'due_at' => $dueAt,
                    'last_reviewed_at' => $isDue ? null : $reviewNow->copy()->subDays(max(1, $intervalDays)),
                    'created_at' => $reviewNow, 'updated_at' => $reviewNow,
                ]);
            }
        }

        $demoUserIds = User::query()->where('role', 'pelajar')
            ->where('email', 'like', 'pelajar.demo%@example.test')->pluck('id');
        $demoAttempts = DB::table('exercise_attempts')->whereIn('user_id', $demoUserIds)->get();

        foreach ($demoAttempts as $attempt) {
            $exercise = Exercise::query()->with('questions')->find($attempt->exercise_id);
            if (! $exercise || $exercise->questions->isEmpty()) {
                continue;
            }

            $savedAnswers = is_array($attempt->answers)
                ? $attempt->answers
                : json_decode((string) $attempt->answers, true);
            $answers = is_array($savedAnswers) ? $savedAnswers : [];
            $hasAllCurrentAnswers = $exercise->questions->every(
                fn ($question) => array_key_exists($question->id, $answers),
            );

            if ((int) $attempt->total_count === $exercise->questions->count() && $hasAllCurrentAnswers) {
                continue;
            }

            foreach ($exercise->questions as $question) {
                if (! array_key_exists($question->id, $answers)) {
                    $answers[$question->id] = $question->answer['value'];
                }
            }

            $correct = 0;
            foreach ($exercise->questions as $question) {
                $submitted = $answers[$question->id] ?? null;
                $correct += mb_strtolower(trim((string) $submitted)) === mb_strtolower(trim((string) $question->answer['value'])) ? 1 : 0;
            }

            DB::table('exercise_attempts')->where('id', $attempt->id)->update([
                'answers' => json_encode($answers, JSON_UNESCAPED_UNICODE),
                'correct_count' => $correct,
                'total_count' => $exercise->questions->count(),
                'updated_at' => now(),
            ]);
        }
    }
}
