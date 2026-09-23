<?php

namespace Database\Seeders;

use App\Models\LearningPath;
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
            $this->seedScript();
            $this->seedLearnersAndActivity();
        });
    }

    private function copyAudio(): void
    {
        foreach (['abdi', 'anjeun', 'akang'] as $word) {
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
                $lesson->blocks()->firstOrCreate(['title' => 'Fokus pelajaran: '.$lessonTitle], [
                    'type' => 'text',
                    'body' => 'Baca setiap pasangan kata dan arti. Perhatikan ragam tutur bila dicantumkan. Gunakan contoh ini sebagai pengenalan awal, kemudian cocokkan dengan konteks percakapan.',
                    'position' => 0,
                ]);
                foreach ($terms as $position => $term) {
                    [$word, $meaning] = $term;
                    $block = $lesson->blocks()->firstOrCreate(['title' => 'Kosakata: '.$word], [
                        'type' => 'vocabulary', 'latin' => $word, 'translation' => $meaning,
                        'register' => $term[2] ?? null,
                        'context' => 'Pasangan kata dan arti untuk latihan pengenalan kosakata.',
                        'position' => $position + 1,
                    ]);
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
            }
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
            ->with('exercises.questions')->orderBy('id')->get();
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
                if (! $exercise || $exercise->questions->isEmpty()
                    || DB::table('exercise_attempts')->where('user_id', $student->id)->where('exercise_id', $exercise->id)->exists()) {
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
        }
    }
}
