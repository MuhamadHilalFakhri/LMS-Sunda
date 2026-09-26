<?php

namespace App\Http\Controllers;

use App\Models\Exercise;
use App\Models\LearningPath;
use App\Models\Lesson;
use App\Models\Question;
use App\Models\User;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

trait AdminDataActions
{
    public function index(Request $request): Response
    {
        $this->authorizeAdmin($request);
        $section = (string) $request->query('section', 'overview');
        $pathSections = ['overview', 'paths', 'vocabulary', 'characters', 'exercises', 'media'];
        $paths = collect();
        $collectionItems = collect();
        $collectionPagination = ['previous' => null, 'next' => null, 'from' => 0, 'to' => 0, 'total' => 0];
        $mediaCounts = ['uploaded' => 0, 'missing' => 0];
        if ($section === 'overview') {
            $paths = LearningPath::orderBy('position')->with('units.lessons')->get();
        } elseif ($section === 'paths') {
            $summaries = LearningPath::orderBy('position')->with('units.lessons')->get();
            $requestedSlug = (string) $request->query('path', '');
            $selectedSlug = $summaries->firstWhere('slug', $requestedSlug)->slug ?? $summaries->first()->slug;
            $selectedPath = $selectedSlug
                ? LearningPath::where('slug', $selectedSlug)->with(['units.lessons.blocks', 'units.lessons.exercises.questions'])->first()
                : null;
            $paths = $summaries->map(function (LearningPath $path) use ($selectedSlug, $selectedPath) {
                if ($path->slug === $selectedSlug && $selectedPath) {
                    $path->setRelation('units', $selectedPath->units);
                }

                return $path;
            });
        } elseif (in_array($section, ['vocabulary', 'characters', 'exercises', 'media'], true)) {
            // Keep the lesson selector light. Large blocks and question sets are fetched
            // only for the current collection page below.
            $paths = LearningPath::orderBy('position')->with('units.lessons')->get();
            $search = trim((string) $request->query('q', ''));
            if ($section === 'exercises') {
                $exerciseQuery = Exercise::query()->with(['lesson.unit.path', 'questions'])->withCount('questions');
                if ($search !== '') {
                    $exerciseQuery->where(function ($builder) use ($search) {
                        $builder->where('exercises.title', 'like', "%{$search}%")
                            ->orWhereHas('lesson', fn ($lesson) => $lesson->where('title', 'like', "%{$search}%")
                                ->orWhereHas('unit', fn ($unit) => $unit->where('title', 'like', "%{$search}%")
                                    ->orWhereHas('path', fn ($path) => $path->where('title', 'like', "%{$search}%"))));
                    });
                }
                $exercisePage = $exerciseQuery->orderBy('lesson_id')->orderBy('position')->orderBy('id')
                    ->paginate(6, ['*'], 'collection_page')->withQueryString();
                $collectionItems = collect($exercisePage->items())->map(fn (Exercise $exercise) => [
                    ...$exercise->toArray(),
                    'lessonTitle' => $exercise->lesson->title,
                    'pathTitle' => $exercise->lesson->unit->path->title,
                ]);
                $collectionPagination = $this->paginationLinks($exercisePage);
            } else {
                $baseBlocks = $this->adminBlockCollectionQuery();
                if ($section === 'vocabulary') {
                    $baseBlocks->whereIn('lesson_blocks.type', ['vocabulary', 'script', 'dialogue']);
                } elseif ($section === 'characters') {
                    $baseBlocks->where('lesson_blocks.type', 'script');
                }
                if ($search !== '') {
                    $baseBlocks->where(function ($builder) use ($search) {
                        foreach (['lesson_blocks.title', 'lesson_blocks.body', 'lesson_blocks.latin', 'lesson_blocks.sundanese', 'lesson_blocks.translation', 'lesson_blocks.region', 'lesson_blocks.register', 'lesson_blocks.context', 'lessons.title', 'learning_paths.title'] as $column) {
                            $builder->orWhere($column, 'like', "%{$search}%");
                        }
                    });
                }
                if ($section === 'media') {
                    $countsQuery = clone $baseBlocks;
                    $mediaCounts = [
                        'uploaded' => (clone $countsQuery)->whereNotNull('lesson_blocks.audio_path')->count(),
                        'missing' => (clone $countsQuery)->whereNull('lesson_blocks.audio_path')->count(),
                    ];
                    $mediaView = $request->query('media_view') === 'missing' ? 'missing' : 'uploaded';
                    $mediaView === 'missing'
                        ? $baseBlocks->whereNull('lesson_blocks.audio_path')
                        : $baseBlocks->whereNotNull('lesson_blocks.audio_path');
                }
                $blockPageSize = $section === 'media' ? 8 : 12;
                $blockPage = $baseBlocks->orderBy('learning_paths.position')->orderBy('units.position')
                    ->orderBy('lessons.position')->orderBy('lesson_blocks.position')->orderBy('lesson_blocks.id')
                    ->paginate($blockPageSize, ['lesson_blocks.*', 'lessons.title as lessonTitle', 'learning_paths.title as pathTitle'], 'collection_page')->withQueryString();
                $collectionItems = collect($blockPage->items());
                $collectionPagination = $this->paginationLinks($blockPage);
            }
        }

        $audioBlockOptions = $section === 'media'
            ? $this->adminBlockCollectionQuery()
                ->orderBy('learning_paths.position')->orderBy('units.position')->orderBy('lessons.position')->orderBy('lesson_blocks.position')
                ->get()
            : collect();

        $users = collect();
        $usersPagination = ['previous' => null, 'next' => null, 'from' => 0, 'to' => 0, 'total' => 0];
        if ($section === 'learners') {
            $userQuery = User::query();
            $userSearch = trim((string) $request->query('q', ''));
            if ($userSearch !== '') {
                $userQuery->where(function ($query) use ($userSearch) {
                    $query->where('users.name', 'like', "%{$userSearch}%")
                        ->orWhere('users.email', 'like', "%{$userSearch}%")
                        ->orWhere('users.role', 'like', "%{$userSearch}%");
                });
            }
            $userPage = $userQuery
                ->select('users.id', 'users.name', 'users.email', 'users.role', 'users.is_active', 'users.email_verified_at', 'users.created_at')
                ->selectSub(DB::table('lesson_progress')->selectRaw('COUNT(*)')
                    ->whereColumn('lesson_progress.user_id', 'users.id')->where('lesson_progress.status', 'completed'), 'completed')
                ->selectSub(DB::table('exercise_attempts')->selectRaw('COUNT(*)')
                    ->whereColumn('exercise_attempts.user_id', 'users.id'), 'attempts')
                ->orderBy('users.role')->orderBy('users.name')->orderBy('users.id')
                ->paginate(15, ['*'], 'learners_page')->withQueryString();
            $users = $userPage->getCollection()->map(fn (User $user) => [
                'id' => (int) $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'is_active' => (bool) $user->is_active,
                'email_verified_at' => $user->email_verified_at,
                'completed' => (int) $user->completed,
                'attempts' => (int) $user->attempts,
                'created_at' => $user->created_at,
                'is_self' => (int) $user->id === (int) $request->user()->id,
            ]);
            $usersPagination = [
                'previous' => $userPage->previousPageUrl(),
                'next' => $userPage->nextPageUrl(),
                'from' => $userPage->firstItem() ?? 0,
                'to' => $userPage->lastItem() ?? 0,
                'total' => $userPage->total(),
            ];
        }

        $tutorSettings = [
            'apiUrl' => config('services.tutor.url'), 'model' => config('services.tutor.model'),
            'enabled' => true, 'responseLanguage' => 'user', 'responseStyle' => 'warm', 'maxTokens' => 450,
            'hasApiKey' => filled(config('services.tutor.key')), 'keySource' => filled(config('services.tutor.key')) ? 'environment' : 'none',
            'messagesToday' => 0, 'tokensToday' => 0,
        ];
        if ($section === 'tutor') {
            $settings = DB::table('ai_tutor_settings')->where('id', 1)->first();
            $databaseKeyConfigured = false;
            if ($settings?->api_key_encrypted) {
                try {
                    $databaseKeyConfigured = filled(Crypt::decryptString($settings->api_key_encrypted));
                } catch (\Throwable $error) {
                    report($error);
                }
            }
            $environmentKeyConfigured = filled(config('services.tutor.key'));
            $today = now()->startOfDay();
            $tomorrow = $today->copy()->addDay();
            $dailyMessages = DB::table('ai_messages')->where('created_at', '>=', $today)->where('created_at', '<', $tomorrow);
            $tutorSettings = [
                'apiUrl' => $settings->api_url ?? config('services.tutor.url'),
                'model' => $settings->model ?? config('services.tutor.model'),
                'enabled' => (bool) ($settings->enabled ?? true),
                'responseLanguage' => $settings->response_language ?? 'user',
                'responseStyle' => $settings->response_style ?? 'warm',
                'maxTokens' => (int) ($settings->max_tokens ?? 450),
                'hasApiKey' => $databaseKeyConfigured || $environmentKeyConfigured,
                'keySource' => $databaseKeyConfigured ? 'database' : ($environmentKeyConfigured ? 'environment' : 'none'),
                'messagesToday' => (clone $dailyMessages)->count(),
                'tokensToday' => (int) (clone $dailyMessages)->sum(DB::raw('input_tokens + output_tokens')),
            ];
        }

        $feedback = collect();
        $feedbackQuery = trim((string) $request->query('q', ''));
        $feedbackPagination = ['previous' => null, 'next' => null, 'from' => 0, 'to' => 0, 'total' => 0];
        $feedbackStats = ['new' => 0, 'reviewing' => 0, 'resolved' => 0];
        if ($section === 'feedback') {
            $feedbackTotals = DB::table('learner_feedback')->select('status')->selectRaw('COUNT(*) as total')->groupBy('status')->pluck('total', 'status');
            foreach (array_keys($feedbackStats) as $status) {
                $feedbackStats[$status] = (int) ($feedbackTotals[$status] ?? 0);
            }

            $feedbackQueryBuilder = DB::table('learner_feedback')->join('users', 'users.id', '=', 'learner_feedback.user_id');
            if ($feedbackQuery !== '') {
                $feedbackQueryBuilder->where(function ($builder) use ($feedbackQuery) {
                    $builder->where('users.name', 'like', "%{$feedbackQuery}%")
                        ->orWhere('users.email', 'like', "%{$feedbackQuery}%")
                        ->orWhere('learner_feedback.message', 'like', "%{$feedbackQuery}%");
                });
            }
            $feedbackPage = $feedbackQueryBuilder
                ->select('learner_feedback.id', 'learner_feedback.category', 'learner_feedback.message', 'learner_feedback.page', 'learner_feedback.status', 'learner_feedback.created_at', 'users.name as learner_name', 'users.email as learner_email')
                ->orderByRaw("CASE learner_feedback.status WHEN 'new' THEN 0 WHEN 'reviewing' THEN 1 ELSE 2 END")
                ->orderByDesc('learner_feedback.created_at')->orderByDesc('learner_feedback.id')
                ->paginate(20, ['*'], 'feedback_page')->withQueryString();
            $feedback = collect($feedbackPage->items());
            $feedbackPagination = $this->paginationLinks($feedbackPage);
        }

        return Inertia::render('admin/index', [
            'paths' => $paths,
            'collectionItems' => $collectionItems,
            'collectionPagination' => $collectionPagination,
            'mediaCounts' => $mediaCounts,
            'audioBlockOptions' => $audioBlockOptions,
            'users' => $users,
            'usersPagination' => $usersPagination,
            'viewerId' => $request->user()->id,
            'learnerCount' => $section === 'overview' ? DB::table('users')->where('role', 'pelajar')->count() : 0,
            'analytics' => $section === 'analytics' ? $this->analytics() : [
                'learners' => 0, 'activeLearners' => 0, 'completedLessons' => 0, 'attempts' => 0,
                'averageAccuracy' => 0, 'pathCompletions' => [], 'hardestExercises' => [], 'tutorMessages' => 0,
            ],
            'tutorSettings' => $tutorSettings,
            'feedback' => $feedback,
            'feedbackPagination' => $feedbackPagination,
            'feedbackStats' => $feedbackStats,
            'feedbackQuery' => $feedbackQuery,
        ]);
    }

    /**
     * @param  LengthAwarePaginator<int, mixed>  $paginator
     * @return array{previous: string|null, next: string|null, from: int, to: int, total: int}
     */
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

    private function adminBlockCollectionQuery(): Builder
    {
        return DB::table('lesson_blocks')
            ->join('lessons', 'lessons.id', '=', 'lesson_blocks.lesson_id')
            ->join('units', 'units.id', '=', 'lessons.unit_id')
            ->join('learning_paths', 'learning_paths.id', '=', 'units.learning_path_id')
            ->select('lesson_blocks.*', 'lessons.title as lessonTitle', 'learning_paths.title as pathTitle');
    }

    /** @return array<string, mixed> */
    private function analytics(): array
    {
        $activeSince = now()->subDays(7);
        $reportSince = now()->subDays(30);
        $recentProgress = DB::table('lesson_progress')->select('user_id')->where('updated_at', '>=', $activeSince);
        $recentAttempts = DB::table('exercise_attempts')->select('user_id')->where('created_at', '>=', $activeSince);
        $activeLearners = DB::query()->fromSub($recentProgress->union($recentAttempts), 'recent_learners')->count('user_id');
        $attemptSummary = DB::table('exercise_attempts')->where('created_at', '>=', $reportSince)
            ->selectRaw('COUNT(*) as attempts, COALESCE(SUM(correct_count), 0) as correct, COALESCE(SUM(total_count), 0) as total')
            ->first();
        $pathCompletions = DB::table('learning_paths')
            ->leftJoin('units', 'units.learning_path_id', '=', 'learning_paths.id')
            ->leftJoin('lessons', 'lessons.unit_id', '=', 'units.id')
            ->leftJoin('lesson_progress', function ($join) use ($reportSince) {
                $join->on('lesson_progress.lesson_id', '=', 'lessons.id')
                    ->where('lesson_progress.status', '=', 'completed')
                    ->where('lesson_progress.updated_at', '>=', $reportSince);
            })
            ->select('learning_paths.id', 'learning_paths.title', DB::raw('COUNT(lesson_progress.id) as completions'))
            ->groupBy('learning_paths.id', 'learning_paths.title')->orderByDesc('completions')->get();
        $hardestExercises = DB::table('exercise_attempts')
            ->where('exercise_attempts.created_at', '>=', $reportSince)
            ->join('exercises', 'exercises.id', '=', 'exercise_attempts.exercise_id')
            ->join('lessons', 'lessons.id', '=', 'exercises.lesson_id')
            ->select('exercises.id', 'exercises.title', 'lessons.title as lesson_title')
            ->selectRaw('COUNT(*) as attempts, AVG(CASE WHEN exercise_attempts.total_count > 0 THEN exercise_attempts.correct_count / exercise_attempts.total_count ELSE NULL END) as accuracy')
            ->groupBy('exercises.id', 'exercises.title', 'lessons.title')
            ->havingRaw('COUNT(*) >= ?', [5])
            ->orderBy('accuracy')->orderByDesc('attempts')->limit(5)->get()
            ->map(fn ($exercise) => [...(array) $exercise, 'accuracy' => round((float) $exercise->accuracy * 100)]);

        return [
            'learners' => DB::table('users')->where('role', 'pelajar')->count(),
            'activeLearners' => $activeLearners,
            'completedLessons' => DB::table('lesson_progress')->where('status', 'completed')->where('updated_at', '>=', $reportSince)->count(),
            'attempts' => (int) ($attemptSummary->attempts ?? 0),
            'averageAccuracy' => (int) (($attemptSummary->total ?? 0) > 0 ? round(($attemptSummary->correct / $attemptSummary->total) * 100) : 0),
            'pathCompletions' => $pathCompletions,
            'hardestExercises' => $hardestExercises,
            'tutorMessages' => DB::table('ai_messages')->where('created_at', '>=', now()->subDays(30))->count(),
        ];
    }
}
