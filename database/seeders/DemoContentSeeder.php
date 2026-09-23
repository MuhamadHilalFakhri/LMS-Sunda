<?php

namespace Database\Seeders;

use App\Models\Exercise;
use App\Models\LearningPath;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class DemoContentSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            return;
        }

        $this->copyAudio();

        foreach ($this->paths() as $slug => $definition) {
            $path = LearningPath::firstOrCreate(
                ['slug' => $slug],
                [
                    'title' => $definition['title'],
                    'description' => $definition['description'],
                    'status' => 'draft',
                    'position' => $definition['position'],
                ],
            );

            // Existing curricula belong to the admin; never append duplicate demo units.
            if ($path->units()->exists()) {
                continue;
            }

            DB::transaction(function () use ($path, $definition): void {
                foreach ($definition['units'] as $unitPosition => $unitData) {
                    $unit = $path->units()->create([
                        'title' => $unitData['title'],
                        'description' => $unitData['description'],
                        'status' => 'published',
                        'position' => $unitPosition,
                    ]);

                    foreach ($unitData['lessons'] as $lessonPosition => $lessonData) {
                        $lesson = $unit->lessons()->create([
                            'title' => $lessonData['title'],
                            'summary' => $lessonData['summary'],
                            'status' => 'published',
                            'position' => $lessonPosition,
                        ]);

                        foreach ($lessonData['blocks'] as $blockPosition => $block) {
                            $lesson->blocks()->create([
                                ...$block,
                                'position' => $blockPosition,
                            ]);
                        }

                        $exercise = $lesson->exercises()->create([
                            'title' => 'Latihan: '.$lessonData['title'],
                            'position' => 0,
                        ]);

                        foreach ($lessonData['questions'] as $questionPosition => $question) {
                            $exercise->questions()->create([
                                'type' => $question['type'],
                                'prompt' => $question['prompt'],
                                'options' => $question['options'] ?? null,
                                'answer' => ['value' => $question['answer']],
                                'explanation' => $question['explanation'],
                                'position' => $questionPosition,
                            ]);
                        }
                    }
                }

                // Published only in local/testing, so both learner paths can be explored.
                if ($path->status === 'draft') {
                    $path->update(['status' => 'published']);
                }
            });
        }

        $this->seedDemoActivity();
    }

    private function copyAudio(): void
    {
        $disk = Storage::disk('public');
        if (! $disk->exists('demo-audio/asup.wav')) {
            $disk->put('demo-audio/asup.wav', file_get_contents(__DIR__.'/assets/asup.wav'));
        }
    }

    private function seedDemoActivity(): void
    {
        $student = User::query()->where('email', 'pelajar.demo@example.test')->where('role', 'pelajar')->first();
        $greeting = Lesson::query()->where('title', 'Wilujeng enjing dan damang')->first();
        $script = Lesson::query()->where('title', 'Mengenal aksara swara A, I, U')->first();
        $courtesy = Lesson::query()->where('title', 'Punten, mangga, dan hatur nuhun')->first();

        if (! $student || ! $greeting || ! $script || ! $courtesy) {
            return;
        }

        if (! DB::table('lesson_progress')->where('user_id', $student->id)->exists()) {
            DB::table('lesson_progress')->insert([
                [
                    'user_id' => $student->id,
                    'lesson_id' => $greeting->id,
                    'status' => 'completed',
                    'completed_at' => now()->subDay(),
                    'created_at' => now()->subDays(2),
                    'updated_at' => now()->subDay(),
                ],
                [
                    'user_id' => $student->id,
                    'lesson_id' => $script->id,
                    'status' => 'in_progress',
                    'completed_at' => null,
                    'created_at' => now()->subHours(3),
                    'updated_at' => now()->subHours(3),
                ],
            ]);
        }

        $exercise = Exercise::query()->where('lesson_id', $greeting->id)->with('questions')->first();
        if ($exercise && ! DB::table('exercise_attempts')->where('user_id', $student->id)->exists()) {
            $answers = [];
            foreach ($exercise->questions as $question) {
                $answers[$question->id] = $question->position === 1 ? 'bagus' : $question->answer['value'];
            }

            DB::table('exercise_attempts')->insert([
                'user_id' => $student->id,
                'exercise_id' => $exercise->id,
                'answers' => json_encode($answers, JSON_UNESCAPED_UNICODE),
                'correct_count' => $exercise->questions->count() - 1,
                'total_count' => $exercise->questions->count(),
                'duration_seconds' => 95,
                'created_at' => now()->subDay(),
                'updated_at' => now()->subDay(),
            ]);
        }

        if (! DB::table('ai_messages')->where('user_id', $student->id)->exists()) {
            DB::table('ai_messages')->insert([
                'user_id' => $student->id,
                'mode' => 'question',
                'prompt' => 'Contoh demo: apa arti punten?',
                'response' => 'Ini contoh riwayat tutor untuk akun demo. Dalam materi, “punten” berarti “permisi”, dan “mangga” dapat menjadi tanggapannya. Buka pelajaran terkait untuk melihat konteksnya.',
                'references' => json_encode([['lesson_id' => $courtesy->id, 'title' => $courtesy->title]], JSON_UNESCAPED_UNICODE),
                'input_tokens' => 0,
                'output_tokens' => 0,
                'created_at' => now()->subDay(),
                'updated_at' => now()->subDay(),
            ]);
        }
    }

    private function paths(): array
    {
        return [
            'bahasa-sunda' => [
                'title' => 'Bahasa Sunda',
                'description' => 'Pelajari kosakata, ungkapan, dan cara menggunakan bahasa sesuai konteks.',
                'position' => 0,
                'units' => [
                    [
                        'title' => 'Sapaan dan ungkapan',
                        'description' => 'Mulai dari sapaan sederhana, permisi, dan terima kasih.',
                        'lessons' => [
                            [
                                'title' => 'Wilujeng enjing dan damang',
                                'summary' => 'Mengenal sapaan pagi dan pertanyaan kabar.',
                                'blocks' => [
                                    ['type' => 'text', 'title' => 'Menyapa di pagi hari', 'body' => '“Wilujeng enjing” dipakai untuk menyapa pada pagi hari. Dalam percakapan, “Kumaha damang?” dipakai untuk menanyakan kabar.'],
                                    ['type' => 'vocabulary', 'title' => 'Sapaan pagi', 'latin' => 'Wilujeng enjing', 'translation' => 'Selamat pagi', 'region' => 'umum', 'context' => 'Contoh penggunaan: menyapa saat bertemu di sekolah atau kantor.'],
                                    ['type' => 'vocabulary', 'title' => 'Menanyakan kabar', 'latin' => 'Kumaha damang?', 'translation' => 'Apa kabar? / Sehat?', 'region' => 'umum', 'context' => 'Dipakai saat menanyakan keadaan lawan bicara.'],
                                    ['type' => 'dialogue', 'title' => 'Percakapan singkat', 'body' => "A: Wilujeng enjing.\nB: Wilujeng enjing.\nA: Kumaha damang?\nB: Damang.", 'translation' => 'A dan B saling menyapa, kemudian A menanyakan kabar.'],
                                ],
                                'questions' => [
                                    ['type' => 'multiple_choice', 'prompt' => 'Apa arti “Wilujeng enjing”?', 'options' => ['Selamat pagi', 'Selamat malam', 'Terima kasih'], 'answer' => 'Selamat pagi', 'explanation' => '“Wilujeng enjing” adalah sapaan pagi.'],
                                    ['type' => 'fill_blank', 'prompt' => 'Lengkapi sapaan: Kumaha ____?', 'answer' => 'damang', 'explanation' => '“Kumaha damang?” dipakai untuk menanyakan kabar.'],
                                    ['type' => 'ordering', 'prompt' => 'Susun ungkapan untuk menyapa pada pagi hari.', 'options' => ['enjing', 'Wilujeng'], 'answer' => 'Wilujeng enjing', 'explanation' => 'Urutannya “Wilujeng” lalu “enjing”.'],
                                ],
                            ],
                            [
                                'title' => 'Punten, mangga, dan hatur nuhun',
                                'summary' => 'Ungkapan sopan dalam interaksi sehari-hari.',
                                'blocks' => [
                                    ['type' => 'text', 'title' => 'Memulai interaksi', 'body' => '“Punten” dapat dipakai saat meminta izin atau menyela. “Mangga” dapat menjadi tanggapan yang berarti “silakan”. “Hatur nuhun” berarti “terima kasih”.'],
                                    ['type' => 'vocabulary', 'title' => 'Meminta izin', 'latin' => 'Punten', 'translation' => 'Permisi', 'context' => 'Contoh: diucapkan sebelum masuk atau saat hendak menyela.'],
                                    ['type' => 'vocabulary', 'title' => 'Mempersilakan', 'latin' => 'Mangga', 'translation' => 'Silakan', 'context' => 'Dapat menjadi tanggapan setelah seseorang berkata “punten”.'],
                                    ['type' => 'vocabulary', 'title' => 'Berterima kasih', 'latin' => 'Hatur nuhun', 'translation' => 'Terima kasih', 'context' => 'Digunakan setelah menerima bantuan.'],
                                    ['type' => 'dialogue', 'title' => 'Di depan pintu', 'body' => "A: Punten.\nB: Mangga.\nA: Hatur nuhun.", 'translation' => 'A meminta izin, B mempersilakan, lalu A berterima kasih.'],
                                ],
                                'questions' => [
                                    ['type' => 'multiple_choice', 'prompt' => 'Ungkapan mana yang berarti “permisi”?', 'options' => ['Punten', 'Mangga', 'Hatur nuhun'], 'answer' => 'Punten', 'explanation' => '“Punten” berarti “permisi”.'],
                                    ['type' => 'matching', 'prompt' => 'Pilih tanggapan yang sesuai untuk “Punten”.', 'options' => ['Mangga', 'Wilujeng enjing', 'Damang'], 'answer' => 'Mangga', 'explanation' => '“Mangga” berarti “silakan” dan dapat menanggapi “punten”.'],
                                    ['type' => 'ordering', 'prompt' => 'Susun ungkapan untuk berterima kasih.', 'options' => ['nuhun', 'Hatur'], 'answer' => 'Hatur nuhun', 'explanation' => 'Ungkapan lengkapnya adalah “Hatur nuhun”.'],
                                ],
                            ],
                        ],
                    ],
                    [
                        'title' => 'Kata dalam kegiatan',
                        'description' => 'Kenali kata yang muncul dalam aktivitas sehari-hari.',
                        'lessons' => [
                            [
                                'title' => 'Asup dan lebet',
                                'summary' => 'Dua bentuk kata untuk “masuk” serta contoh audio pelafalan.',
                                'blocks' => [
                                    ['type' => 'text', 'title' => 'Kata dan ragam', 'body' => 'Kamus mencatat “asup” untuk “masuk” dan “lebet” sebagai bentuk lemes. Perhatikan pilihan kata sesuai lawan bicara dan konteks.'],
                                    ['type' => 'vocabulary', 'title' => 'Masuk', 'latin' => 'asup', 'translation' => 'masuk', 'register' => 'loma', 'audio_path' => 'demo-audio/asup.wav', 'context' => 'Audio “asup” oleh Raflinoer32 (Lingua Libre/Wikimedia Commons), CC BY 4.0.'],
                                    ['type' => 'vocabulary', 'title' => 'Masuk (bentuk lemes)', 'latin' => 'lebet', 'translation' => 'masuk', 'register' => 'lemes', 'context' => 'Kamus menandai “lebet” sebagai bentuk lemes.'],
                                ],
                                'questions' => [
                                    ['type' => 'multiple_choice', 'prompt' => 'Apa arti “asup”?', 'options' => ['masuk', 'pagi', 'silakan'], 'answer' => 'masuk', 'explanation' => 'Kamus mencatat “asup” dengan arti “masuk”.'],
                                    ['type' => 'fill_blank', 'prompt' => 'Lengkapi bentuk lemes untuk “masuk”: ____', 'answer' => 'lebet', 'explanation' => '“Lebet” adalah bentuk lemes yang dicatat dalam kamus.'],
                                    ['type' => 'matching', 'prompt' => 'Pilih kata yang sesuai dengan arti “masuk”.', 'options' => ['asup', 'punten', 'enjing'], 'answer' => 'asup', 'explanation' => '“Asup” berarti “masuk”.'],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
            'aksara-sunda' => [
                'title' => 'Aksara Sunda',
                'description' => 'Kenali karakter, bacaan, dan latihan menulis Aksara Sunda.',
                'position' => 1,
                'units' => [
                    [
                        'title' => 'Aksara swara',
                        'description' => 'Mengenal bentuk huruf vokal mandiri.',
                        'lessons' => [
                            [
                                'title' => 'Mengenal aksara swara A, I, U',
                                'summary' => 'Baca dan tulis tiga aksara vokal mandiri.',
                                'blocks' => [
                                    ['type' => 'text', 'title' => 'Vokal mandiri', 'body' => 'Aksara swara adalah huruf vokal mandiri. Mulailah dengan A (ᮃ), I (ᮄ), dan U (ᮅ). Ketiganya adalah karakter Unicode yang dapat disalin sebagai teks.'],
                                    ['type' => 'script', 'title' => 'Aksara A', 'latin' => 'a', 'sundanese' => 'ᮃ', 'translation' => 'Huruf vokal A'],
                                    ['type' => 'script', 'title' => 'Aksara I', 'latin' => 'i', 'sundanese' => 'ᮄ', 'translation' => 'Huruf vokal I'],
                                    ['type' => 'script', 'title' => 'Aksara U', 'latin' => 'u', 'sundanese' => 'ᮅ', 'translation' => 'Huruf vokal U'],
                                ],
                                'questions' => [
                                    ['type' => 'multiple_choice', 'prompt' => 'Manakah aksara swara A?', 'options' => ['ᮃ', 'ᮄ', 'ᮅ'], 'answer' => 'ᮃ', 'explanation' => 'ᮃ adalah aksara swara A (U+1B83).'],
                                    ['type' => 'matching', 'prompt' => 'Pilih aksara yang dibaca “i”.', 'options' => ['ᮅ', 'ᮃ', 'ᮄ'], 'answer' => 'ᮄ', 'explanation' => 'ᮄ adalah aksara swara I (U+1B84).'],
                                    ['type' => 'script', 'prompt' => 'Tulis aksara swara U menggunakan palet aksara.', 'answer' => 'ᮅ', 'explanation' => 'ᮅ adalah aksara swara U (U+1B85).'],
                                ],
                            ],
                        ],
                    ],
                    [
                        'title' => 'Aksara ngalagena',
                        'description' => 'Mengenal huruf dasar yang memiliki bunyi vokal bawaan.',
                        'lessons' => [
                            [
                                'title' => 'Mengenal aksara Ka, Ba, Sa',
                                'summary' => 'Bedakan bentuk dasar ᮊ, ᮘ, dan ᮞ.',
                                'blocks' => [
                                    ['type' => 'text', 'title' => 'Tiga huruf dasar', 'body' => 'Aksara ngalagena memiliki bunyi vokal bawaan. Pada latihan ini, kenali bentuk Ka (ᮊ), Ba (ᮘ), dan Sa (ᮞ) satu per satu.'],
                                    ['type' => 'script', 'title' => 'Aksara Ka', 'latin' => 'ka', 'sundanese' => 'ᮊ', 'translation' => 'Huruf dasar Ka'],
                                    ['type' => 'script', 'title' => 'Aksara Ba', 'latin' => 'ba', 'sundanese' => 'ᮘ', 'translation' => 'Huruf dasar Ba'],
                                    ['type' => 'script', 'title' => 'Aksara Sa', 'latin' => 'sa', 'sundanese' => 'ᮞ', 'translation' => 'Huruf dasar Sa'],
                                ],
                                'questions' => [
                                    ['type' => 'multiple_choice', 'prompt' => 'Manakah aksara Ka?', 'options' => ['ᮘ', 'ᮊ', 'ᮞ'], 'answer' => 'ᮊ', 'explanation' => 'ᮊ adalah aksara Ka (U+1B8A).'],
                                    ['type' => 'matching', 'prompt' => 'Pilih aksara yang dibaca “ba”.', 'options' => ['ᮞ', 'ᮊ', 'ᮘ'], 'answer' => 'ᮘ', 'explanation' => 'ᮘ adalah aksara Ba (U+1B98).'],
                                    ['type' => 'script', 'prompt' => 'Tulis aksara Sa menggunakan palet aksara.', 'answer' => 'ᮞ', 'explanation' => 'ᮞ adalah aksara Sa (U+1B9E).'],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];
    }
}
