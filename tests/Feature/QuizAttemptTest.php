<?php

namespace Tests\Feature;

use App\Models\Exercise;
use App\Models\LearningPath;
use App\Models\Lesson;
use App\Models\Question;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class QuizAttemptTest extends TestCase
{
    use RefreshDatabase;

    public function test_quiz_start_time_survives_refresh_and_server_duration_is_saved(): void
    {
        $learner = User::factory()->create(['role' => 'pelajar']);
        [$quiz, $questions] = $this->createTimedQuiz();
        $start = Carbon::parse('2026-09-25 09:00:00');

        Carbon::setTestNow($start);
        try {
            $this->actingAs($learner)->get(route('quizzes.show', $quiz))
                ->assertInertia(fn (Assert $page) => $page->where('exercise.started_at', $start->timestamp));

            Carbon::setTestNow($start->copy()->addSeconds(30));
            $this->actingAs($learner)->get(route('quizzes.show', $quiz))
                ->assertInertia(fn (Assert $page) => $page->where('exercise.started_at', $start->timestamp));

            $this->actingAs($learner)->post(route('quizzes.submit', $quiz), [
                'answers' => [$questions[0]->id => 'Permisi', $questions[1]->id => 'Selamat pagi'],
                'duration_seconds' => 1,
            ])->assertRedirect();

            $this->assertDatabaseHas('exercise_attempts', [
                'user_id' => $learner->id,
                'exercise_id' => $quiz->id,
                'correct_count' => 2,
                'duration_seconds' => 30,
            ]);
        } finally {
            Carbon::setTestNow();
        }
    }

    public function test_empty_quiz_is_rejected_before_the_server_deadline(): void
    {
        $learner = User::factory()->create(['role' => 'pelajar']);
        [$quiz, $questions] = $this->createTimedQuiz();

        $this->actingAs($learner)->get(route('quizzes.show', $quiz))->assertOk();
        $this->actingAs($learner)->post(route('quizzes.submit', $quiz), [
            'answers' => [$questions[0]->id => null, $questions[1]->id => null],
            'duration_seconds' => 10,
        ])->assertSessionHasErrors('answers');

        $this->assertSame(0, DB::table('exercise_attempts')->count());
    }

    public function test_timed_out_quiz_can_be_submitted_with_unanswered_questions(): void
    {
        $learner = User::factory()->create(['role' => 'pelajar']);
        [$quiz, $questions] = $this->createTimedQuiz();
        $start = Carbon::parse('2026-09-25 10:00:00');

        Carbon::setTestNow($start);
        try {
            $this->actingAs($learner)->get(route('quizzes.show', $quiz))->assertOk();
            Carbon::setTestNow($start->copy()->addSeconds(75));

            $this->actingAs($learner)->post(route('quizzes.submit', $quiz), [
                'answers' => [$questions[0]->id => null, $questions[1]->id => null],
                'duration_seconds' => 1,
            ])->assertRedirect();

            $this->assertDatabaseHas('exercise_attempts', [
                'user_id' => $learner->id,
                'exercise_id' => $quiz->id,
                'correct_count' => 0,
                'duration_seconds' => 60,
            ]);
        } finally {
            Carbon::setTestNow();
        }
    }

    private function createTimedQuiz(): array
    {
        $path = LearningPath::create(['slug' => 'bahasa-sunda', 'title' => 'Bahasa Sunda', 'status' => 'published']);
        $unit = Unit::create(['learning_path_id' => $path->id, 'title' => 'Sapaan', 'status' => 'published']);
        $lesson = Lesson::create(['unit_id' => $unit->id, 'title' => 'Ngawilujengkeun', 'status' => 'published']);
        $quiz = Exercise::create([
            'lesson_id' => $lesson->id,
            'title' => 'Kuis sapaan',
            'kind' => 'quiz',
            'time_limit_minutes' => 1,
            'pass_percentage' => 70,
            'attempt_limit' => 2,
        ]);
        $questions = collect([
            ['prompt' => 'Apa arti punten?', 'answer' => 'Permisi'],
            ['prompt' => 'Apa arti wilujeng enjing?', 'answer' => 'Selamat pagi'],
        ])->map(fn (array $item) => Question::create([
            'exercise_id' => $quiz->id,
            'type' => 'multiple_choice',
            'prompt' => $item['prompt'],
            'options' => ['Permisi', 'Selamat pagi', 'Terima kasih', 'Sampai jumpa'],
            'answer' => ['value' => $item['answer']],
            'explanation' => 'Contoh pembahasan.',
        ]));

        return [$quiz, $questions];
    }
}
