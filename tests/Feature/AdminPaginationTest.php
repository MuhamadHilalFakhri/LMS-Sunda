<?php

namespace Tests\Feature;

use App\Models\LearningPath;
use App\Models\Lesson;
use App\Models\LessonBlock;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminPaginationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_content_collections_are_paginated_by_the_server(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $path = LearningPath::create(['slug' => 'bahasa-sunda', 'title' => 'Bahasa Sunda']);
        $unit = Unit::create(['learning_path_id' => $path->id, 'title' => 'Sapaan']);
        $lesson = Lesson::create(['unit_id' => $unit->id, 'title' => 'Ungkapan awal']);
        for ($index = 1; $index <= 13; $index++) {
            LessonBlock::create([
                'lesson_id' => $lesson->id,
                'type' => 'vocabulary',
                'latin' => "Kecap {$index}",
                'translation' => "Arti {$index}",
            ]);
        }

        $this->actingAs($admin)->get('/admin?section=vocabulary')
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/index')
                ->has('collectionItems', 12)
                ->where('collectionPagination.from', 1)
                ->where('collectionPagination.to', 12)
                ->where('collectionPagination.total', 13),
            );

        $this->actingAs($admin)->get('/admin?section=vocabulary&collection_page=2')
            ->assertInertia(fn (Assert $page) => $page
                ->has('collectionItems', 1)
                ->where('collectionPagination.from', 13)
                ->where('collectionPagination.total', 13),
            );
    }

    public function test_admin_feedback_search_and_summary_use_full_dataset_with_pagination(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $learner = User::factory()->create(['role' => 'pelajar']);
        $now = now();
        $rows = [];
        for ($index = 1; $index <= 23; $index++) {
            $rows[] = [
                'user_id' => $learner->id,
                'category' => 'idea',
                'message' => "Masukan {$index}",
                'status' => $index <= 10 ? 'new' : ($index <= 18 ? 'reviewing' : 'resolved'),
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        DB::table('learner_feedback')->insert($rows);

        $this->actingAs($admin)->get('/admin?section=feedback')
            ->assertInertia(fn (Assert $page) => $page
                ->has('feedback', 20)
                ->where('feedbackPagination.total', 23)
                ->where('feedbackStats.new', 10)
                ->where('feedbackStats.reviewing', 8)
                ->where('feedbackStats.resolved', 5),
            );

        $this->actingAs($admin)->get('/admin?section=feedback&q=Masukan%2022')
            ->assertInertia(fn (Assert $page) => $page
                ->has('feedback', 1)
                ->where('feedbackPagination.total', 1)
                ->where('feedback.0.message', 'Masukan 22'),
            );
    }
}
