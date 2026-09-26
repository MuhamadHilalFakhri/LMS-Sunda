<?php

namespace App\Http\Controllers;

use App\Models\Exercise;
use App\Models\LearningPath;
use App\Models\Lesson;
use App\Models\LessonBlock;
use App\Models\Unit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

trait LearningPageActions
{
    public function home(Request $request): Response
    {
        $paths = LearningPath::where('status', 'published')->orWhereIn('slug', ['bahasa-sunda', 'aksara-sunda'])->orderBy('position')->with(['units' => fn ($q) => $q->where('status', 'published')->with(['lessons' => fn ($q) => $q->where('status', 'published')])])->get();
        $userId = $request->user()->id;
        $progress = DB::table('lesson_progress')->where('user_id', $userId)->pluck('status', 'lesson_id');
        $recent = DB::table('lesson_progress')->where('user_id', $userId)->orderByDesc('updated_at')->first();
        $today = now()->toDateString();
        $todayStart = now()->startOfDay();
        $tomorrowStart = now()->addDay()->startOfDay();
        $todayActivities = DB::table('lesson_progress')->where('user_id', $userId)->where('completed_at', '>=', $todayStart)->where('completed_at', '<', $tomorrowStart)->count()
            + DB::table('exercise_attempts')->where('user_id', $userId)->where('created_at', '>=', $todayStart)->where('created_at', '<', $tomorrowStart)->count();
        $reviewDueCount = DB::table('review_cards')
            ->join('lesson_blocks', 'lesson_blocks.id', '=', 'review_cards.lesson_block_id')
            ->join('lessons', 'lessons.id', '=', 'lesson_blocks.lesson_id')
            ->join('units', 'units.id', '=', 'lessons.unit_id')
            ->join('learning_paths', 'learning_paths.id', '=', 'units.learning_path_id')
            ->where('review_cards.user_id', $userId)->where('review_cards.due_at', '<=', now())
            ->where('lessons.status', 'published')->where('units.status', 'published')->where('learning_paths.status', 'published')
            ->count();

        $activityStart = now()->subDays(365)->startOfDay();
        $activityDates = DB::table('lesson_progress')->where('user_id', $userId)->whereNotNull('completed_at')
            ->where('completed_at', '>=', $activityStart)->selectRaw('DATE(completed_at) as activity_date')->pluck('activity_date')
            ->merge(DB::table('exercise_attempts')->where('user_id', $userId)->where('created_at', '>=', $activityStart)->selectRaw('DATE(created_at) as activity_date')->pluck('activity_date'))
            ->unique()->flip();
        $streakDate = isset($activityDates[$today]) ? now()->startOfDay() : now()->subDay()->startOfDay();
        $streak = 0;
        while (isset($activityDates[$streakDate->toDateString()])) {
            $streak++;
            $streakDate = $streakDate->subDay();
        }

        return Inertia::render('dashboard', [
            'paths' => $paths,
            'progress' => $progress,
            'recentLesson' => $recent?->lesson_id,
            'learningGoal' => [
                'target' => (int) ($request->user()->daily_goal ?? 1),
                'completedToday' => $todayActivities,
                'streak' => $streak,
            ],
            'reviewDueCount' => $reviewDueCount,
        ]);
    }

    public function updateGoal(Request $request): RedirectResponse
    {
        $data = $request->validate(['daily_goal' => ['required', 'integer', Rule::in([1, 2, 3, 5])]]);
        $request->user()->forceFill(['daily_goal' => $data['daily_goal']])->save();

        return back();
    }

    public function path(Request $request, LearningPath $path): Response
    {
        abort_unless($path->status === 'published' || in_array($path->slug, ['bahasa-sunda', 'aksara-sunda'], true), 404);
        if ($path->status === 'published') {
            $path->load(['units' => fn ($q) => $q->where('status', 'published')->with(['lessons' => fn ($q) => $q->where('status', 'published')])]);
        } else {
            $path->setRelation('units', collect());
        }
        $lessonIds = $path->units->flatMap(fn (Unit $unit) => $unit->lessons->pluck('id'));

        return Inertia::render('learning/path', [
            'path' => $path,
            'progress' => $lessonIds->isEmpty()
                ? collect()
                : DB::table('lesson_progress')->where('user_id', $request->user()->id)->whereIn('lesson_id', $lessonIds)->pluck('status', 'lesson_id'),
            'savedUnitIds' => $path->units->isEmpty()
                ? []
                : DB::table('saved_units')->where('user_id', $request->user()->id)
                    ->whereIn('unit_id', $path->units->pluck('id'))->pluck('unit_id')->map(fn ($id) => (int) $id),
        ]);
    }

    public function module(Request $request, Unit $unit): Response
    {
        $unit->load([
            'path',
            'lessons' => fn ($query) => $query->where('status', 'published')->orderBy('position')->orderBy('id'),
        ]);
        abort_unless($unit->status === 'published' && $unit->path->status === 'published', 404);

        $lessons = $unit->lessons;
        $lessonIds = $lessons->pluck('id');
        $userId = $request->user()->id;
        $progress = $lessonIds->isEmpty()
            ? collect()
            : DB::table('lesson_progress')->where('user_id', $userId)->whereIn('lesson_id', $lessonIds)->pluck('status', 'lesson_id');

        $requestedLessonId = $request->query('lesson');
        if ($requestedLessonId !== null) {
            abort_unless(is_scalar($requestedLessonId) && ctype_digit((string) $requestedLessonId), 404);
            $lesson = $lessons->firstWhere('id', (int) $requestedLessonId);
            abort_unless($lesson !== null, 404);
        } elseif ($lessons->isEmpty()) {
            $lesson = null;
        } else {
            $recentInProgressId = DB::table('lesson_progress')->where('user_id', $userId)
                ->whereIn('lesson_id', $lessonIds)->where('status', '!=', 'completed')
                ->orderByDesc('updated_at')->value('lesson_id');
            $lesson = $lessons->firstWhere('id', (int) $recentInProgressId)
                ?? $lessons->first(fn (Lesson $item) => $progress->get($item->id) !== 'completed')
                ?? $lessons->last();
        }

        $savedBlockIds = collect();
        if ($lesson) {
            $lesson->load('blocks', 'exercises');
            DB::table('lesson_progress')->insertOrIgnore([
                'user_id' => $userId, 'lesson_id' => $lesson->id,
                'status' => 'in_progress', 'created_at' => now(), 'updated_at' => now(),
            ]);
            DB::table('lesson_progress')->where('user_id', $userId)->where('lesson_id', $lesson->id)->update(['updated_at' => now()]);

            $reviewableBlocks = $lesson->blocks->filter(fn (LessonBlock $block) => in_array($block->type, ['vocabulary', 'script'], true)
                && (filled($block->latin) || filled($block->sundanese) || filled($block->body))
                && (filled($block->translation) || filled($block->latin) || filled($block->sundanese))
            );
            if ($reviewableBlocks->isNotEmpty()) {
                $createdAt = now();
                DB::table('review_cards')->insertOrIgnore($reviewableBlocks->map(fn (LessonBlock $block) => [
                    'user_id' => $userId,
                    'lesson_block_id' => $block->id,
                    'due_at' => $createdAt,
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ])->all());
            }

            $savedBlockIds = DB::table('saved_materials')->where('user_id', $userId)
                ->whereIn('lesson_block_id', $lesson->blocks->pluck('id'))->pluck('lesson_block_id');
        }

        return Inertia::render('learning/module', [
            'path' => $unit->path->only(['id', 'slug', 'title']),
            'unit' => $unit->only(['id', 'title', 'description']),
            'lessons' => $lessons->map(fn (Lesson $item) => $item->only(['id', 'title', 'summary', 'position']))->values(),
            'lesson' => $lesson ? [
                ...$lesson->only(['id', 'title', 'summary', 'youtube_url', 'status', 'position']),
                'unit' => [
                    'id' => $unit->id,
                    'title' => $unit->title,
                    'path' => $unit->path->only(['id', 'slug', 'title']),
                ],
                'blocks' => $lesson->blocks->values()->toArray(),
                'exercises' => $lesson->exercises->map(fn (Exercise $exercise) => $exercise->only(['id', 'title', 'position', 'kind']))->values(),
            ] : null,
            'progress' => $progress,
            'savedBlockIds' => $savedBlockIds,
        ]);
    }

    public function lesson(Lesson $lesson): RedirectResponse
    {
        $lesson->load('unit.path');
        abort_unless($lesson->status === 'published' && $lesson->unit->status === 'published' && $lesson->unit->path->status === 'published', 404);

        return redirect()->route('modules.show', ['unit' => $lesson->unit_id, 'lesson' => $lesson->id]);
    }

    public function complete(Request $request, Lesson $lesson): RedirectResponse
    {
        $lesson->load('unit.path');
        abort_unless($lesson->status === 'published' && $lesson->unit->status === 'published' && $lesson->unit->path->status === 'published', 404);
        DB::table('lesson_progress')->updateOrInsert(
            ['user_id' => $request->user()->id, 'lesson_id' => $lesson->id],
            ['status' => 'completed', 'completed_at' => now(), 'updated_at' => now()]
        );

        return redirect()->route('modules.show', ['unit' => $lesson->unit_id, 'lesson' => $lesson->id]);
    }
}
