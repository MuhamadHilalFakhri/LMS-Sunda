<?php

namespace Tests\Feature;

use App\Models\Exercise;
use App\Models\LearningPath;
use App\Models\Lesson;
use App\Models\LessonBlock;
use App\Models\Question;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class LearningFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_draft_content_is_hidden_and_admin_routes_are_protected(): void
    {
        $student = User::factory()->create(['role' => 'pelajar']);
        $path = LearningPath::create(['slug' => 'bahasa-sunda', 'title' => 'Bahasa Sunda', 'status' => 'draft']);
        $unit = Unit::create(['learning_path_id' => $path->id, 'title' => 'Unit pertama', 'status' => 'draft']);
        $lesson = Lesson::create(['unit_id' => $unit->id, 'title' => 'Salam', 'status' => 'draft']);

        $this->actingAs($student)->get(route('paths.show', $path))
            ->assertOk()
            ->assertInertia(fn (\Inertia\Testing\AssertableInertia $page) => $page
                ->where('path.status', 'draft')
                ->has('path.units', 0),
            );
        $this->actingAs($student)->get(route('lessons.show', $lesson))->assertNotFound();
        $this->actingAs($student)->get(route('admin.index'))->assertRedirect(route('dashboard'));
        $this->actingAs($student)->post('/admin/paths', ['title' => 'Jalur baru'])->assertForbidden();
    }

    public function test_published_lesson_progress_and_repeatable_exercise_are_saved_per_user(): void
    {
        $student = User::factory()->create(['role' => 'pelajar']);
        $path = LearningPath::create(['slug' => 'aksara-sunda', 'title' => 'Aksara Sunda', 'status' => 'published']);
        $unit = Unit::create(['learning_path_id' => $path->id, 'title' => 'Mengenal aksara', 'status' => 'published']);
        $lesson = Lesson::create(['unit_id' => $unit->id, 'title' => 'Aksara awal', 'status' => 'published']);
        LessonBlock::create(['lesson_id' => $lesson->id, 'type' => 'script', 'sundanese' => 'ᮊ']);
        $exercise = Exercise::create(['lesson_id' => $lesson->id, 'title' => 'Latihan aksara']);
        $question = Question::create(['exercise_id' => $exercise->id, 'type' => 'script', 'prompt' => 'Pilih aksara ka', 'answer' => ['value' => 'ᮊ'], 'explanation' => 'Ini aksara ka.']);

        $this->actingAs($student)->get(route('lessons.show', $lesson))
            ->assertRedirect(route('modules.show', ['unit' => $unit->id, 'lesson' => $lesson->id]));
        $this->actingAs($student)->get(route('modules.show', $unit))
            ->assertOk()
            ->assertInertia(fn (\Inertia\Testing\AssertableInertia $page) => $page
                ->component('learning/module')
                ->where('lesson.id', $lesson->id)
                ->has('lessons', 1),
            );
        $this->assertDatabaseHas('lesson_progress', ['user_id' => $student->id, 'lesson_id' => $lesson->id, 'status' => 'in_progress']);
        $this->actingAs($student)->get(route('exercises.show', $exercise))->assertOk()->assertDontSee('Ini aksara ka.');
        $this->actingAs($student)->post(route('exercises.submit', $exercise), ['answers' => [$question->id => 'ᮊ'], 'duration_seconds' => 10])->assertRedirect();
        $this->actingAs($student)->post(route('exercises.submit', $exercise), ['answers' => [$question->id => 'ᮘ']])->assertRedirect();
        $this->assertEquals(2, DB::table('exercise_attempts')->where('user_id', $student->id)->count());
        $this->assertEquals(1, DB::table('exercise_attempts')->where('user_id', $student->id)->max('correct_count'));
        $this->actingAs($student)->post(route('lessons.complete', $lesson))
            ->assertRedirect(route('modules.show', ['unit' => $unit->id, 'lesson' => $lesson->id]));
        $this->assertDatabaseHas('lesson_progress', ['user_id' => $student->id, 'lesson_id' => $lesson->id, 'status' => 'completed']);
    }

    public function test_module_workspace_only_contains_its_published_lessons_and_resumes_recent_work(): void
    {
        $student = User::factory()->create(['role' => 'pelajar']);
        $path = LearningPath::create(['slug' => 'bahasa-sunda', 'title' => 'Bahasa Sunda', 'status' => 'published']);
        $unit = Unit::create(['learning_path_id' => $path->id, 'title' => 'Sapaan', 'status' => 'published']);
        $first = Lesson::create(['unit_id' => $unit->id, 'title' => 'Salam', 'status' => 'published', 'position' => 1]);
        $second = Lesson::create(['unit_id' => $unit->id, 'title' => 'Perkenalan', 'status' => 'published', 'position' => 2]);
        $third = Lesson::create(['unit_id' => $unit->id, 'title' => 'Pamit', 'status' => 'published', 'position' => 3]);
        Lesson::create(['unit_id' => $unit->id, 'title' => 'Draf tersembunyi', 'status' => 'draft', 'position' => 4]);
        $otherUnit = Unit::create(['learning_path_id' => $path->id, 'title' => 'Kegiatan', 'status' => 'published']);
        $foreignLesson = Lesson::create(['unit_id' => $otherUnit->id, 'title' => 'Materi lain', 'status' => 'published']);
        DB::table('lesson_progress')->insert([
            ['user_id' => $student->id, 'lesson_id' => $first->id, 'status' => 'completed', 'completed_at' => now(), 'created_at' => now(), 'updated_at' => now()->subMinutes(5)],
            ['user_id' => $student->id, 'lesson_id' => $second->id, 'status' => 'in_progress', 'completed_at' => null, 'created_at' => now(), 'updated_at' => now()->subMinutes(2)],
            ['user_id' => $student->id, 'lesson_id' => $third->id, 'status' => 'in_progress', 'completed_at' => null, 'created_at' => now(), 'updated_at' => now()],
            ['user_id' => $student->id, 'lesson_id' => $foreignLesson->id, 'status' => 'in_progress', 'completed_at' => null, 'created_at' => now(), 'updated_at' => now()->addMinute()],
        ]);

        $this->actingAs($student)->get(route('modules.show', $unit))
            ->assertOk()
            ->assertInertia(fn (\Inertia\Testing\AssertableInertia $page) => $page
                ->component('learning/module')
                ->where('lesson.id', $third->id)
                ->has('lessons', 3)
                ->where('lessons.0.id', $first->id)
                ->where('lessons.1.id', $second->id)
                ->where('lessons.2.id', $third->id),
            );
        $this->actingAs($student)->get(route('modules.show', ['unit' => $unit->id, 'lesson' => $first->id]))
            ->assertInertia(fn (\Inertia\Testing\AssertableInertia $page) => $page->where('lesson.id', $first->id));
        $this->actingAs($student)->get(route('modules.show', ['unit' => $unit->id, 'lesson' => $foreignLesson->id]))->assertNotFound();
    }

    public function test_module_workspace_uses_first_incomplete_then_last_completed_and_supports_empty_units(): void
    {
        $student = User::factory()->create(['role' => 'pelajar']);
        $path = LearningPath::create(['slug' => 'bahasa-sunda', 'title' => 'Bahasa Sunda', 'status' => 'published']);
        $unit = Unit::create(['learning_path_id' => $path->id, 'title' => 'Ungkapan', 'status' => 'published']);
        $first = Lesson::create(['unit_id' => $unit->id, 'title' => 'Wilujeng enjing', 'status' => 'published', 'position' => 1]);
        $last = Lesson::create(['unit_id' => $unit->id, 'title' => 'Hatur nuhun', 'status' => 'published', 'position' => 2]);
        DB::table('lesson_progress')->insert([
            'user_id' => $student->id, 'lesson_id' => $first->id, 'status' => 'completed', 'completed_at' => now(), 'created_at' => now(), 'updated_at' => now(),
        ]);

        $this->actingAs($student)->get(route('modules.show', $unit))
            ->assertInertia(fn (\Inertia\Testing\AssertableInertia $page) => $page->where('lesson.id', $last->id));

        DB::table('lesson_progress')->update(['status' => 'completed', 'completed_at' => now()]);
        $this->actingAs($student)->get(route('modules.show', $unit))
            ->assertInertia(fn (\Inertia\Testing\AssertableInertia $page) => $page->where('lesson.id', $last->id));

        $emptyUnit = Unit::create(['learning_path_id' => $path->id, 'title' => 'Modul kosong', 'status' => 'published']);
        Lesson::create(['unit_id' => $emptyUnit->id, 'title' => 'Belum terbit', 'status' => 'draft']);
        $this->actingAs($student)->get(route('modules.show', $emptyUnit))
            ->assertOk()
            ->assertInertia(fn (\Inertia\Testing\AssertableInertia $page) => $page
                ->component('learning/module')
                ->where('lesson', null)
                ->has('lessons', 0),
            );
        $draftUnit = Unit::create(['learning_path_id' => $path->id, 'title' => 'Modul draf', 'status' => 'draft']);
        $this->actingAs($student)->get(route('modules.show', $draftUnit))->assertNotFound();
    }

    public function test_admin_cannot_publish_an_empty_lesson(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $path = LearningPath::create(['slug' => 'bahasa-sunda', 'title' => 'Bahasa Sunda']);
        $unit = Unit::create(['learning_path_id' => $path->id, 'title' => 'Salam']);
        $lesson = Lesson::create(['unit_id' => $unit->id, 'title' => 'Perkenalan']);

        $this->actingAs($admin)->put("/admin/lessons/{$lesson->id}", ['title' => 'Perkenalan', 'status' => 'published'])->assertSessionHasErrors('status');
        $this->assertDatabaseHas('lessons', ['id' => $lesson->id, 'status' => 'draft']);
    }

    public function test_admin_can_edit_exercise_and_learner_cannot(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $student = User::factory()->create();
        $path = LearningPath::create(['slug' => 'bahasa-sunda', 'title' => 'Bahasa Sunda']);
        $unit = Unit::create(['learning_path_id' => $path->id, 'title' => 'Sapaan']);
        $lesson = Lesson::create(['unit_id' => $unit->id, 'title' => 'Perkenalan']);
        $exercise = Exercise::create(['lesson_id' => $lesson->id, 'title' => 'Latihan awal']);

        $this->actingAs($student)->put("/admin/exercises/{$exercise->id}", ['title' => 'Diubah pelajar'])->assertForbidden();
        $this->actingAs($admin)->put("/admin/exercises/{$exercise->id}", [
            'title' => 'Latihan perkenalan',
            'kind' => 'practice',
            'pass_percentage' => 70,
            'position' => 2,
        ])->assertRedirect();

        $this->assertDatabaseHas('exercises', ['id' => $exercise->id, 'title' => 'Latihan perkenalan', 'position' => 2]);
    }
}
