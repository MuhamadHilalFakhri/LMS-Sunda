<?php

namespace Tests\Feature;

use App\Models\LearningPath;
use App\Models\Lesson;
use App\Models\LessonBlock;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class TutorControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_translation_mode_uses_provider_even_when_no_lesson_matches_and_cleans_markdown(): void
    {
        $learner = User::factory()->create(['role' => 'pelajar']);
        config([
            'services.tutor.key' => 'test-key',
            'services.tutor.url' => 'https://tutor.test/v1',
            'services.tutor.model' => 'test-model',
        ]);
        Http::fake(['tutor.test/*' => Http::response([
            'choices' => [['message' => ['content' => "**Wilujeng enjing**\n\n1. *Wilujeng* berarti selamat." ]]],
            'usage' => ['prompt_tokens' => 10, 'completion_tokens' => 8],
        ])]);

        $this->actingAs($learner)->post(route('tutor.ask'), [
            'mode' => 'translation',
            'prompt' => 'Selamat pagi',
        ])->assertRedirect(route('tutor'));

        $message = DB::table('ai_messages')->where('user_id', $learner->id)->firstOrFail();
        $this->assertSame('translation', $message->mode);
        $this->assertStringNotContainsString('**', $message->response);
        $this->assertStringNotContainsString('*Wilujeng*', $message->response);
        $this->assertStringContainsString('Wilujeng enjing', $message->response);
        Http::assertSent(fn ($request) => str_ends_with($request->url(), '/chat/completions')
            && $request['model'] === 'test-model'
            && str_contains($request['messages'][0]['content'], 'mode terjemahan'));
    }

    public function test_unrelated_question_without_matching_lesson_is_answered_locally_without_provider_call(): void
    {
        $learner = User::factory()->create(['role' => 'pelajar']);
        config([
            'services.tutor.key' => 'test-key',
            'services.tutor.url' => 'https://tutor.test/v1',
            'services.tutor.model' => 'test-model',
        ]);
        Http::fake();

        $this->actingAs($learner)->post(route('tutor.ask'), [
            'mode' => 'question',
            'prompt' => 'Ceritakan tentang pemrograman Python',
        ])->assertRedirect(route('tutor'));

        $message = DB::table('ai_messages')->where('user_id', $learner->id)->firstOrFail();
        $this->assertStringContainsString('belum menemukan materi terbit', mb_strtolower($message->response));
        Http::assertNothingSent();
    }
}
