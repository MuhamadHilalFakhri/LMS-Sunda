<?php

namespace Database\Seeders;

use App\Models\Exercise;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/** Additive, repeatable sample data for previewing a busy LMS locally. */
trait RichDemoLearnerActivity
{
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
