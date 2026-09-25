<?php

namespace App\Http\Controllers;

use App\Models\Exercise;
use App\Models\LearningPath;
use App\Models\Lesson;
use App\Models\LessonBlock;
use App\Models\Unit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class LearningController extends Controller
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

            $reviewableBlocks = $lesson->blocks->filter(fn (LessonBlock $block) =>
                in_array($block->type, ['vocabulary', 'script'], true)
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

    public function exercise(Exercise $exercise): Response|RedirectResponse
    {
        $exercise->load('lesson.unit.path', 'questions');
        abort_unless($exercise->lesson->status === 'published' && $exercise->lesson->unit->status === 'published' && $exercise->lesson->unit->path->status === 'published', 404);
        if ($exercise->kind === 'quiz') {
            return redirect()->route('quizzes.show', $exercise);
        }

        return $this->renderExercise($exercise, false);
    }

    public function submit(Request $request, Exercise $exercise): RedirectResponse
    {
        abort_if($exercise->kind === 'quiz', 404);

        return $this->storeAttempt($request, $exercise, false);
    }

    public function quizzes(Request $request): Response
    {
        $query = Exercise::query()->where('kind', 'quiz')->has('questions')
            ->whereHas('lesson', fn ($builder) => $builder->where('status', 'published')
                ->whereHas('unit', fn ($unit) => $unit->where('status', 'published')
                    ->whereHas('path', fn ($path) => $path->where('status', 'published'))))
            ->with('lesson.unit.path')->withCount('questions')
            ->withCount(['questions as listening_questions_count' => fn ($query) => $query->where('type', 'listening')])
            ->orderBy('position');
        $search = trim((string) $request->query('q', ''));
        $pathSlug = (string) $request->query('path', '');
        $type = in_array($request->query('type'), ['listening', 'standard'], true) ? $request->query('type') : 'all';
        $status = in_array($request->query('status'), ['started', 'unstarted'], true) ? $request->query('status') : 'all';

        if ($search !== '') {
            $query->where(function ($matches) use ($search) {
                $matches->where('exercises.title', 'like', "%{$search}%")
                    ->orWhereHas('lesson', fn ($lesson) => $lesson->where('title', 'like', "%{$search}%")
                        ->orWhereHas('unit', fn ($unit) => $unit->where('title', 'like', "%{$search}%")
                            ->orWhereHas('path', fn ($path) => $path->where('title', 'like', "%{$search}%"))));
            });
        }
        if ($pathSlug !== '') {
            $query->whereHas('lesson.unit.path', fn ($path) => $path->where('slug', $pathSlug));
        }
        if ($type === 'listening') {
            $query->whereHas('questions', fn ($question) => $question->where('type', 'listening'));
        } elseif ($type === 'standard') {
            $query->whereDoesntHave('questions', fn ($question) => $question->where('type', 'listening'));
        }
        if ($status !== 'all') {
            $attempts = DB::table('exercise_attempts')->selectRaw('1')
                ->whereColumn('exercise_attempts.exercise_id', 'exercises.id')
                ->where('exercise_attempts.user_id', $request->user()->id);
            if ($status === 'started') {
                $query->whereExists($attempts);
            } else {
                $query->whereNotExists($attempts);
            }
        }

        $quizCount = (clone $query)->count();
        $quizzes = $query->paginate(12)->withQueryString();
        $attempts = DB::table('exercise_attempts')->where('user_id', $request->user()->id)
            ->whereIn('exercise_id', collect($quizzes->items())->pluck('id'))
            ->selectRaw('exercise_id, COUNT(*) as attempt_count')->groupBy('exercise_id')->pluck('attempt_count', 'exercise_id');
        $pathOptions = LearningPath::query()->where('status', 'published')
            ->whereHas('units', fn ($unit) => $unit->where('status', 'published')
                ->whereHas('lessons', fn ($lesson) => $lesson->where('status', 'published')
                    ->whereHas('exercises', fn ($exercise) => $exercise->where('kind', 'quiz')->whereHas('questions'))))
            ->orderBy('position')->get(['slug', 'title']);

        return Inertia::render('learning/quizzes', [
            'quizzes' => $quizzes->items(),
            'quizCount' => $quizCount,
            'attempts' => $attempts,
            'pagination' => $this->paginationLinks($quizzes),
            'filters' => ['q' => $search, 'path' => $pathSlug, 'type' => $type, 'status' => $status],
            'pathOptions' => $pathOptions,
        ]);
    }

    public function quiz(Request $request, Exercise $exercise): Response
    {
        abort_unless($exercise->kind === 'quiz', 404);
        $exercise->load('lesson.unit.path', 'questions');
        abort_unless($exercise->questions->isNotEmpty(), 404);
        abort_unless($exercise->lesson->status === 'published' && $exercise->lesson->unit->status === 'published' && $exercise->lesson->unit->path->status === 'published', 404);

        // Keep the start time in the session so a refresh or a backgrounded tab
        // cannot silently restart the countdown.
        $startKey = $this->quizStartSessionKey($request, $exercise);
        $startedAt = (int) $request->session()->get($startKey, now()->timestamp);
        $request->session()->put($startKey, $startedAt);

        return $this->renderExercise($exercise, true, $request->user()->id, $startedAt);
    }

    public function submitQuiz(Request $request, Exercise $exercise): RedirectResponse
    {
        abort_unless($exercise->kind === 'quiz', 404);

        return DB::transaction(function () use ($request, $exercise): RedirectResponse {
            $lockedExercise = Exercise::query()->whereKey($exercise->id)->lockForUpdate()->firstOrFail();
            $used = DB::table('exercise_attempts')->where('user_id', $request->user()->id)
                ->where('exercise_id', $lockedExercise->id)->count();
            abort_if($lockedExercise->attempt_limit && $used >= $lockedExercise->attempt_limit, 403, 'Batas percobaan kuis telah tercapai.');

            return $this->storeAttempt($request, $lockedExercise, true);
        });
    }

    private function renderExercise(Exercise $exercise, bool $isQuiz, ?int $userId = null, ?int $startedAt = null): Response
    {
        $attemptsUsed = $isQuiz && $userId
            ? DB::table('exercise_attempts')->where('user_id', $userId)->where('exercise_id', $exercise->id)->count()
            : 0;

        return Inertia::render('learning/exercise', ['exercise' => [
            'id' => $exercise->id,
            'title' => $exercise->title,
            'kind' => $exercise->kind,
            'lesson' => $exercise->lesson,
            'questions' => $exercise->questions->map(fn ($question) => $question->only(['id', 'type', 'prompt', 'options', 'audio_path'])),
            'time_limit_minutes' => $isQuiz ? $exercise->time_limit_minutes : null,
            'pass_percentage' => $exercise->pass_percentage,
            'attempt_limit' => $isQuiz ? $exercise->attempt_limit : null,
            'attempts_used' => $attemptsUsed,
            'attempts_remaining' => $isQuiz && $exercise->attempt_limit ? max(0, $exercise->attempt_limit - $attemptsUsed) : null,
            'started_at' => $isQuiz ? $startedAt : null,
        ]]);
    }

    private function storeAttempt(Request $request, Exercise $exercise, bool $isQuiz): RedirectResponse
    {
        $exercise->load('questions', 'lesson.unit.path');
        abort_unless($exercise->lesson->status === 'published' && $exercise->lesson->unit->status === 'published' && $exercise->lesson->unit->path->status === 'published', 404);
        $data = $request->validate([
            'answers' => ['required', 'array'],
            // ConvertEmptyStringsToNull turns unanswered form fields into null.
            // They are valid for quizzes because learners may leave questions blank.
            'answers.*' => ['nullable', 'string', 'max:2000'],
            // Timer callbacks can be delayed when a browser tab is backgrounded.
            // Keep the duration bounded without rejecting an otherwise valid attempt.
            'duration_seconds' => ['nullable', 'integer', 'min:0', 'max:86400'],
        ], [
            'answers.required' => 'Pilih minimal satu jawaban sebelum mengumpulkan kuis.',
        ]);
        $hasAnswer = collect($data['answers'])->contains(fn ($answer) => is_string($answer) && trim($answer) !== '');
        $startedAt = $isQuiz ? $request->session()->get($this->quizStartSessionKey($request, $exercise)) : null;
        if ($isQuiz && $exercise->time_limit_minutes && ! is_numeric($startedAt)) {
            throw ValidationException::withMessages([
                'answers' => 'Sesi kuis sudah berakhir. Buka kuis kembali untuk memulai percobaan baru.',
            ]);
        }
        $serverDuration = is_numeric($startedAt) ? max(0, now()->timestamp - (int) $startedAt) : null;
        $timeExpired = $isQuiz
            && $exercise->time_limit_minutes
            && ($serverDuration ?? ($data['duration_seconds'] ?? 0)) >= $exercise->time_limit_minutes * 60;
        if ($isQuiz && ! $hasAnswer && ! $timeExpired) {
            throw ValidationException::withMessages([
                'answers' => 'Pilih minimal satu jawaban sebelum mengumpulkan kuis.',
            ]);
        }
        $results = $exercise->questions->map(function ($question) use ($data) {
            $submitted = $data['answers'][$question->id] ?? null;
            $correct = $question->answer['value'] ?? null;
            $normalize = fn ($value) => is_string($value) ? mb_strtolower(trim($value)) : $value;

            return ['id' => $question->id, 'prompt' => $question->prompt, 'submitted' => $submitted, 'answer' => $correct, 'correct' => $normalize($submitted) === $normalize($correct), 'explanation' => $question->explanation];
        });
        $durationSeconds = $isQuiz ? ($serverDuration ?? $data['duration_seconds'] ?? null) : ($data['duration_seconds'] ?? null);
        if ($isQuiz && $exercise->time_limit_minutes && $durationSeconds !== null) {
            $durationSeconds = min($durationSeconds, $exercise->time_limit_minutes * 60);
        }
        $id = DB::table('exercise_attempts')->insertGetId([
            'user_id' => $request->user()->id, 'exercise_id' => $exercise->id,
            'answers' => json_encode($data['answers'], JSON_UNESCAPED_UNICODE),
            'correct_count' => $results->where('correct', true)->count(), 'total_count' => $results->count(),
            'duration_seconds' => $durationSeconds, 'created_at' => now(), 'updated_at' => now(),
        ]);

        if ($isQuiz && $exercise->time_limit_minutes) {
            $request->session()->forget($this->quizStartSessionKey($request, $exercise));
        }

        return redirect()->route('attempts.show', $id);
    }

    private function quizStartSessionKey(Request $request, Exercise $exercise): string
    {
        return "quiz_started.{$request->user()->id}.{$exercise->id}";
    }

    public function result(Request $request, int $attempt): Response
    {
        $record = DB::table('exercise_attempts')->where('id', $attempt)->where('user_id', $request->user()->id)->first();
        abort_unless($record !== null, 404);
        $exercise = Exercise::query()->with('questions', 'lesson.blocks', 'lesson.unit.path')->whereKey($record->exercise_id)->firstOrFail();
        $answers = json_decode($record->answers, true) ?? [];
        $results = $exercise->questions->map(function ($question) use ($answers) {
            $submitted = $answers[$question->id] ?? null;
            $correct = $question->answer['value'] ?? null;
            $normalize = fn ($value) => is_string($value) ? mb_strtolower(trim($value)) : $value;

            return ['id' => $question->id, 'prompt' => $question->prompt, 'submitted' => $submitted, 'answer' => $correct, 'correct' => $normalize($submitted) === $normalize($correct), 'explanation' => $question->explanation];
        });

        $isQuiz = $exercise->kind === 'quiz';
        $attemptsUsed = DB::table('exercise_attempts')->where('user_id', $request->user()->id)->where('exercise_id', $exercise->id)->count();
        $percentage = $record->total_count > 0 ? (int) round(($record->correct_count / $record->total_count) * 100) : 0;
        $recommendation = null;

        if ($isQuiz) {
            $lesson = $exercise->lesson;
            $unit = $lesson->unit;
            $path = $unit->path;
            $lessonIsAvailable = $lesson->status === 'published'
                && $unit->status === 'published'
                && $path->status === 'published';

            if ($lessonIsAvailable) {
                $missedCount = $results->where('correct', false)->count();

                if ($missedCount > 0) {
                    $topicCounts = [];
                    foreach ($results->where('correct', false) as $missedResult) {
                        $prompt = mb_strtolower($missedResult['prompt']);
                        $matchedBlock = null;
                        $matchedLength = 0;

                        foreach ($lesson->blocks as $block) {
                            foreach ([$block->latin, $block->title] as $term) {
                                $term = is_string($term) ? trim(mb_strtolower($term)) : '';
                                if (mb_strlen($term) < 2) {
                                    continue;
                                }

                                $pattern = '/(?<![\p{L}\p{N}])'.preg_quote($term, '/').'(?![\p{L}\p{N}])/u';
                                if (preg_match($pattern, $prompt) === 1 && mb_strlen($term) > $matchedLength) {
                                    $matchedBlock = $block;
                                    $matchedLength = mb_strlen($term);
                                }
                            }
                        }

                        if ($matchedBlock) {
                            $topicCounts[$matchedBlock->id] ??= ['block' => $matchedBlock, 'count' => 0];
                            $topicCounts[$matchedBlock->id]['count']++;
                        }
                    }

                    uasort($topicCounts, fn (array $left, array $right) => $right['count'] <=> $left['count']);
                    $weakTopics = collect($topicCounts)->take(3)->map(fn (array $topic) => [
                        'block_id' => $topic['block']->id,
                        'title' => $topic['block']->latin ?: $topic['block']->title ?: $topic['block']->translation ?: $lesson->title,
                    ])->values();
                    if ($weakTopics->isEmpty()) {
                        $weakTopics->push(['block_id' => null, 'title' => $lesson->title]);
                    }

                    $practice = Exercise::query()
                        ->where('lesson_id', $lesson->id)
                        ->where('kind', 'practice')
                        ->whereHas('questions')
                        ->orderBy('position')
                        ->first(['id', 'title']);

                    $recommendation = [
                        'type' => 'review',
                        'missed_count' => $missedCount,
                        'lesson_id' => $lesson->id,
                        'lesson_title' => $lesson->title,
                        'weak_topics' => $weakTopics,
                        'practice' => $practice ? ['id' => $practice->id, 'title' => $practice->title] : null,
                    ];
                } else {
                    $currentLessonCompleted = DB::table('lesson_progress')
                        ->where('user_id', $request->user()->id)
                        ->where('lesson_id', $lesson->id)
                        ->where('status', 'completed')
                        ->exists();

                    if (! $currentLessonCompleted) {
                        $recommendation = [
                            'type' => 'finish_lesson',
                            'lesson_id' => $lesson->id,
                            'lesson_title' => $lesson->title,
                        ];
                    } else {
                        $nextLesson = DB::table('lessons')
                            ->join('units', 'units.id', '=', 'lessons.unit_id')
                            ->leftJoin('lesson_progress as progress', function (\Illuminate\Database\Query\JoinClause $join) use ($request) {
                                $join->on('progress.lesson_id', '=', 'lessons.id')
                                    ->where('progress.user_id', '=', $request->user()->id);
                            })
                            ->where('units.learning_path_id', $path->id)
                            ->where('units.status', 'published')
                            ->where('lessons.status', 'published')
                            ->where(function ($query) use ($unit, $lesson) {
                                $query->where('units.position', '>', $unit->position)
                                    ->orWhere(fn ($query) => $query->where('units.position', $unit->position)->where('units.id', '>', $unit->id))
                                    ->orWhere(fn ($query) => $query->where('units.id', $unit->id)->where(function ($lessonOrder) use ($lesson) {
                                        $lessonOrder->where('lessons.position', '>', $lesson->position)
                                            ->orWhere(fn ($query) => $query->where('lessons.position', $lesson->position)->where('lessons.id', '>', $lesson->id));
                                    }));
                            })
                            ->where(fn ($query) => $query->whereNull('progress.id')->orWhere('progress.status', '!=', 'completed'))
                            ->orderBy('units.position')->orderBy('units.id')->orderBy('lessons.position')->orderBy('lessons.id')
                            ->first(['lessons.id', 'lessons.title']);

                        if ($nextLesson) {
                            $recommendation = ['type' => 'continue', 'lesson_id' => $nextLesson->id, 'lesson_title' => $nextLesson->title];
                        } else {
                            $unfinishedLesson = DB::table('lessons')
                                ->join('units', 'units.id', '=', 'lessons.unit_id')
                                ->leftJoin('lesson_progress as progress', function (\Illuminate\Database\Query\JoinClause $join) use ($request) {
                                    $join->on('progress.lesson_id', '=', 'lessons.id')
                                        ->where('progress.user_id', '=', $request->user()->id);
                                })
                                ->where('units.learning_path_id', $path->id)
                                ->where('units.status', 'published')
                                ->where('lessons.status', 'published')
                                ->where('lessons.id', '!=', $lesson->id)
                                ->where(fn ($query) => $query->whereNull('progress.id')->orWhere('progress.status', '!=', 'completed'))
                                ->orderBy('units.position')->orderBy('units.id')->orderBy('lessons.position')->orderBy('lessons.id')
                                ->first(['lessons.id', 'lessons.title']);

                            $recommendation = $unfinishedLesson
                                ? ['type' => 'catch_up', 'lesson_id' => $unfinishedLesson->id, 'lesson_title' => $unfinishedLesson->title]
                                : ['type' => 'path_complete', 'path_title' => $path->title];
                        }
                    }
                }
            }
        }

        return Inertia::render('learning/result', [
            'attempt' => $record,
            'exercise' => $exercise->only(['id', 'title', 'lesson_id']),
            'results' => $results,
            'isQuiz' => $isQuiz,
            'passed' => $isQuiz ? $percentage >= $exercise->pass_percentage : null,
            'passPercentage' => $exercise->pass_percentage,
            'canRetry' => ! $isQuiz || ! $exercise->attempt_limit || $attemptsUsed < $exercise->attempt_limit,
            'recommendation' => $recommendation,
        ]);
    }

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

    public function savedMaterials(Request $request): Response
    {
        $search = trim((string) $request->query('q', ''));
        $query = DB::table('saved_materials')
            ->join('lesson_blocks', 'lesson_blocks.id', '=', 'saved_materials.lesson_block_id')
            ->join('lessons', 'lessons.id', '=', 'lesson_blocks.lesson_id')
            ->join('units', 'units.id', '=', 'lessons.unit_id')
            ->join('learning_paths', 'learning_paths.id', '=', 'units.learning_path_id')
            ->where('saved_materials.user_id', $request->user()->id)
            ->where('lessons.status', 'published')->where('units.status', 'published')->where('learning_paths.status', 'published');
        if ($search !== '') {
            $query->where(function ($builder) use ($search) {
                $builder->where('lesson_blocks.title', 'like', "%{$search}%")
                    ->orWhere('lesson_blocks.latin', 'like', "%{$search}%")
                    ->orWhere('lesson_blocks.sundanese', 'like', "%{$search}%")
                    ->orWhere('lesson_blocks.translation', 'like', "%{$search}%");
            });
        }
        $saved = $query->select('lesson_blocks.id', 'lesson_blocks.type', 'lesson_blocks.title', 'lesson_blocks.body', 'lesson_blocks.latin', 'lesson_blocks.sundanese', 'lesson_blocks.translation', 'lessons.id as lesson_id', 'lessons.title as lesson_title', 'learning_paths.title as path_title', 'saved_materials.created_at as saved_at')
            ->orderByDesc('saved_materials.created_at')->paginate(12)->withQueryString();

        return Inertia::render('learning/saved-materials', [
            'items' => $saved->items(), 'search' => $search,
            'pagination' => $this->paginationLinks($saved),
        ]);
    }

    public function saveMaterial(Request $request, LessonBlock $block): RedirectResponse
    {
        $block->load('lesson.unit.path');
        abort_unless($block->lesson->status === 'published' && $block->lesson->unit->status === 'published' && $block->lesson->unit->path->status === 'published', 404);
        DB::table('saved_materials')->insertOrIgnore([
            'user_id' => $request->user()->id, 'lesson_block_id' => $block->id,
            'created_at' => now(), 'updated_at' => now(),
        ]);

        return back();
    }

    public function unsaveMaterial(Request $request, LessonBlock $block): RedirectResponse
    {
        DB::table('saved_materials')->where('user_id', $request->user()->id)->where('lesson_block_id', $block->id)->delete();

        return back();
    }

    public function search(Request $request): Response
    {
        $query = trim((string) $request->query('q', ''));
        $lessons = $query === '' ? null : Lesson::query()->where('status', 'published')
            ->whereHas('unit', fn ($builder) => $builder->where('status', 'published'))
            ->whereHas('unit.path', fn ($builder) => $builder->where('status', 'published'))
            ->where(fn ($builder) => $builder->where('title', 'like', "%{$query}%")
                ->orWhere('summary', 'like', "%{$query}%")
                ->orWhereHas('blocks', fn ($blocks) => $blocks->where('body', 'like', "%{$query}%")
                    ->orWhere('latin', 'like', "%{$query}%")
                    ->orWhere('sundanese', 'like', "%{$query}%")
                    ->orWhere('translation', 'like', "%{$query}%")))
            ->with('unit.path')->paginate(18)->withQueryString();

        return Inertia::render('learning/search', [
            'query' => $query,
            'lessons' => $lessons?->items() ?? [],
            'resultCount' => $lessons?->total() ?? 0,
            'pagination' => $lessons ? $this->paginationLinks($lessons) : ['previous' => null, 'next' => null, 'from' => 0, 'to' => 0, 'total' => 0],
        ]);
    }

    private function paginationLinks(LengthAwarePaginator $paginator): array
    {
        return [
            'previous' => $paginator->previousPageUrl(),
            'next' => $paginator->nextPageUrl(),
            'from' => $paginator->firstItem() ?? 0,
            'to' => $paginator->lastItem() ?? 0,
            'total' => $paginator->total(),
        ];
    }
}
