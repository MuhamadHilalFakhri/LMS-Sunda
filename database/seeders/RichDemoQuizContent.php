<?php

namespace Database\Seeders;

use App\Models\LearningPath;
use App\Models\Lesson;

/** Additive, repeatable sample data for previewing a busy LMS locally. */
trait RichDemoQuizContent
{
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
}
