<?php

namespace App\Http\Controllers;

use App\Models\Exercise;
use App\Models\LessonBlock;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

trait LearningProgressActions
{
    public function progress(Request $request): Response
    {
        $attemptQuery = DB::table('exercise_attempts')->join('exercises', 'exercises.id', '=', 'exercise_attempts.exercise_id')
            ->where('exercise_attempts.user_id', $request->user()->id)
            ->select('exercise_attempts.id', 'exercises.title', 'exercises.kind', 'exercise_attempts.correct_count', 'exercise_attempts.total_count', 'exercise_attempts.created_at');
        $attemptCount = (clone $attemptQuery)->count('exercise_attempts.id');
        $attempts = $attemptQuery->orderByDesc('exercise_attempts.created_at')->paginate(12, ['*'], 'attempt_page')->withQueryString();
        $progressQuery = DB::table('lesson_progress')->join('lessons', 'lessons.id', '=', 'lesson_progress.lesson_id')
            ->join('units', 'units.id', '=', 'lessons.unit_id')->join('learning_paths', 'learning_paths.id', '=', 'units.learning_path_id')
            ->where('lesson_progress.user_id', $request->user()->id);
        $progressCount = (clone $progressQuery)->count('lesson_progress.id');
        $completedLessonCount = (clone $progressQuery)->where('lesson_progress.status', 'completed')->count('lesson_progress.id');
        $progress = $progressQuery->select('lessons.id', 'lessons.title', 'learning_paths.title as path_title', 'lesson_progress.status', 'lesson_progress.updated_at')
            ->orderByDesc('lesson_progress.updated_at')->paginate(12, ['*'], 'lesson_page')->withQueryString();

        return Inertia::render('learning/progress', [
            'progress' => $progress->items(),
            'progressCount' => $progressCount,
            'completedLessonCount' => $completedLessonCount,
            'progressPages' => $this->paginationLinks($progress),
            'attempts' => $attempts->items(),
            'attemptCount' => $attemptCount,
            'attemptPages' => $this->paginationLinks($attempts),
        ]);
    }

    public function scriptExercises(Request $request): Response
    {
        $query = Exercise::query()->where('kind', 'practice')->whereHas('lesson.unit', fn ($query) => $query->where('status', 'published'))
            ->whereHas('lesson.unit.path', fn ($query) => $query->where('slug', 'aksara-sunda')->where('status', 'published'))
            ->whereHas('lesson', fn ($query) => $query->where('status', 'published'))
            ->with('lesson.unit')->withCount('questions')
            ->orderBy('position');
        $exerciseCount = (clone $query)->count();
        $exercises = $query->paginate(12)->withQueryString();

        $latestAttemptIds = DB::table('exercise_attempts')->select('exercise_id')
            ->selectRaw('MAX(id) as latest_id')->where('user_id', $request->user()->id)
            ->whereIn('exercise_id', collect($exercises->items())->pluck('id'))->groupBy('exercise_id');
        $attempts = DB::table('exercise_attempts as attempts')
            ->joinSub($latestAttemptIds, 'latest_attempts', 'latest_attempts.latest_id', '=', 'attempts.id')
            ->select('attempts.*')->get()->keyBy('exercise_id');

        return Inertia::render('learning/script-exercises', [
            'exercises' => $exercises->items(),
            'exerciseCount' => $exerciseCount,
            'pagination' => $this->paginationLinks($exercises),
            'attempts' => $attempts,
        ]);
    }

    public function review(Request $request): Response
    {
        $latestAttempts = DB::table('exercise_attempts')
            ->where('user_id', $request->user()->id)
            ->select('exercise_id')->selectRaw('MAX(id) as latest_id')->groupBy('exercise_id');
        $submittedJsonExpression = "JSON_EXTRACT(attempts.answers, CONCAT('$.', '\"', questions.id, '\"'))";
        $submittedExpression = "CASE WHEN JSON_TYPE({$submittedJsonExpression}) = 'NULL' THEN NULL ELSE JSON_UNQUOTE({$submittedJsonExpression}) END";
        $correctExpression = "JSON_UNQUOTE(JSON_EXTRACT(questions.answer, '$.value'))";
        $incorrectPage = DB::table('questions')
            ->join('exercises', 'exercises.id', '=', 'questions.exercise_id')
            ->join('lessons', 'lessons.id', '=', 'exercises.lesson_id')
            ->join('units', 'units.id', '=', 'lessons.unit_id')
            ->join('learning_paths', 'learning_paths.id', '=', 'units.learning_path_id')
            ->joinSub($latestAttempts, 'latest_attempts', 'latest_attempts.exercise_id', '=', 'exercises.id')
            ->join('exercise_attempts as attempts', 'attempts.id', '=', 'latest_attempts.latest_id')
            ->where('lessons.status', 'published')->where('units.status', 'published')->where('learning_paths.status', 'published')
            ->whereRaw("LOWER(TRIM(COALESCE({$submittedExpression}, ''))) <> LOWER(TRIM(COALESCE({$correctExpression}, '')))")
            ->select('questions.id', 'exercises.id as exercise_id', 'exercises.kind', 'exercises.title as exercise_title',
                'lessons.id as lesson_id', 'lessons.title as lesson_title', 'learning_paths.title as path_title',
                'questions.prompt', 'questions.explanation', 'attempts.created_at')
            ->selectRaw("{$submittedExpression} as submitted, {$correctExpression} as answer")
            ->orderByDesc('attempts.created_at')->orderBy('questions.id')
            ->paginate(20)->withQueryString();

        return Inertia::render('learning/review', [
            'items' => collect($incorrectPage->items())->map(fn ($item) => [
                'id' => $item->id,
                'exerciseId' => $item->exercise_id,
                'kind' => $item->kind,
                'exerciseTitle' => $item->exercise_title,
                'lessonId' => $item->lesson_id,
                'lessonTitle' => $item->lesson_title,
                'pathTitle' => $item->path_title,
                'prompt' => $item->prompt,
                'submitted' => $item->submitted,
                'answer' => $item->answer,
                'explanation' => $item->explanation,
                'createdAt' => $item->created_at,
            ]),
            'pagination' => $this->paginationLinks($incorrectPage),
            'reviewCount' => $incorrectPage->total(),
        ]);
    }

    public function spacedReview(Request $request): Response
    {
        $userId = $request->user()->id;
        $now = now();
        $reviewQuery = DB::table('review_cards as cards')
            ->join('lesson_blocks as blocks', 'blocks.id', '=', 'cards.lesson_block_id')
            ->join('lessons', 'lessons.id', '=', 'blocks.lesson_id')
            ->join('units', 'units.id', '=', 'lessons.unit_id')
            ->join('learning_paths', 'learning_paths.id', '=', 'units.learning_path_id')
            ->where('cards.user_id', $userId)
            ->where('lessons.status', 'published')->where('units.status', 'published')->where('learning_paths.status', 'published');
        $dueCount = (clone $reviewQuery)->where('cards.due_at', '<=', $now)->count();
        $totalCount = (clone $reviewQuery)->count();
        $cards = (clone $reviewQuery)->where('cards.due_at', '<=', $now)
            ->orderBy('cards.due_at')->orderBy('cards.id')->limit(20)->get([
                'cards.id', 'cards.lesson_block_id', 'blocks.type', 'blocks.title', 'blocks.body', 'blocks.latin',
                'blocks.sundanese', 'blocks.translation', 'blocks.context', 'blocks.audio_path',
                'lessons.id as lesson_id', 'lessons.title as lesson_title', 'learning_paths.title as path_title',
            ]);
        $nextReviewAt = $dueCount === 0
            ? (clone $reviewQuery)->where('cards.due_at', '>', $now)->min('cards.due_at')
            : null;

        return Inertia::render('learning/spaced-review', [
            'cards' => $cards,
            'dueCount' => $dueCount,
            'totalCount' => $totalCount,
            'nextReviewAt' => $nextReviewAt,
        ]);
    }

    public function submitSpacedReview(Request $request, LessonBlock $block): RedirectResponse
    {
        $data = $request->validate(['rating' => ['required', Rule::in(['again', 'hard', 'good', 'easy'])]]);
        $userId = $request->user()->id;
        $published = DB::table('lesson_blocks')->join('lessons', 'lessons.id', '=', 'lesson_blocks.lesson_id')
            ->join('units', 'units.id', '=', 'lessons.unit_id')->join('learning_paths', 'learning_paths.id', '=', 'units.learning_path_id')
            ->where('lesson_blocks.id', $block->id)->where('lessons.status', 'published')
            ->where('units.status', 'published')->where('learning_paths.status', 'published')->exists();
        abort_unless($published, 404);

        DB::transaction(function () use ($data, $block, $userId): void {
            $card = DB::table('review_cards')->where('user_id', $userId)
                ->where('lesson_block_id', $block->id)->where('due_at', '<=', now())->lockForUpdate()->first();
            abort_unless($card, 404);

            $now = now();
            $ease = (float) $card->ease_factor;
            $interval = (int) $card->interval_days;
            $repetitions = (int) $card->repetitions;
            if ($data['rating'] === 'again') {
                $repetitions = 0;
                $interval = 0;
                $ease = max(1.3, $ease - 0.2);
                $dueAt = $now->copy()->addMinutes(10);
            } else {
                if ($data['rating'] === 'hard') {
                    $interval = max(1, (int) round(max(1, $interval) * 1.2));
                    $ease = max(1.3, $ease - 0.15);
                } elseif ($data['rating'] === 'good') {
                    $interval = $repetitions === 0 ? 1 : ($repetitions === 1 ? 3 : max(1, (int) round($interval * $ease)));
                } else {
                    $interval = $repetitions === 0 ? 4 : max(4, (int) round(max(1, $interval) * $ease * 1.3));
                    $ease = min(3.0, $ease + 0.15);
                }
                $repetitions++;
                $dueAt = $now->copy()->addDays($interval);
            }

            DB::table('review_cards')->where('id', $card->id)->update([
                'interval_days' => $interval,
                'repetitions' => $repetitions,
                'ease_factor' => $ease,
                'due_at' => $dueAt,
                'last_reviewed_at' => $now,
                'updated_at' => $now,
            ]);
        });

        return back();
    }
}
