<?php

namespace App\Http\Controllers;

use App\Models\Exercise;
use App\Models\LearningPath;
use App\Models\Lesson;
use App\Models\LessonBlock;
use App\Models\Question;
use App\Models\Unit;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    private function authorizeAdmin(Request $request): void
    {
        abort_unless($request->user()?->role === 'admin', 403);
    }

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
            $selectedSlug = $summaries->firstWhere('slug', $requestedSlug)?->slug ?? $summaries->first()?->slug;
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
                    'lessonTitle' => $exercise->lesson?->title ?? '',
                    'pathTitle' => $exercise->lesson?->unit?->path?->title ?? '',
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

        $learners = collect();
        $learnersPagination = ['previous' => null, 'next' => null, 'from' => 0, 'to' => 0, 'total' => 0];
        if ($section === 'learners') {
            $learnerQuery = DB::table('users')->where('users.role', 'pelajar');
            $learnerSearch = trim((string) $request->query('q', ''));
            if ($learnerSearch !== '') {
                $learnerQuery->where(function ($query) use ($learnerSearch) {
                    $query->where('users.name', 'like', "%{$learnerSearch}%")
                        ->orWhere('users.email', 'like', "%{$learnerSearch}%");
                });
            }
            $learnerPage = $learnerQuery
                ->select('users.id', 'users.name', 'users.email')
                ->selectSub(DB::table('lesson_progress')->selectRaw('COUNT(*)')
                    ->whereColumn('lesson_progress.user_id', 'users.id')->where('lesson_progress.status', 'completed'), 'completed')
                ->selectSub(DB::table('exercise_attempts')->selectRaw('COUNT(*)')
                    ->whereColumn('exercise_attempts.user_id', 'users.id'), 'attempts')
                ->orderBy('users.name')->orderBy('users.id')
                ->paginate(15, ['*'], 'learners_page')->withQueryString();
            $learners = collect($learnerPage->items());
            $learnersPagination = [
                'previous' => $learnerPage->previousPageUrl(),
                'next' => $learnerPage->nextPageUrl(),
                'from' => $learnerPage->firstItem() ?? 0,
                'to' => $learnerPage->lastItem() ?? 0,
                'total' => $learnerPage->total(),
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
            'learners' => $learners,
            'learnersPagination' => $learnersPagination,
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

    private function adminBlockCollectionQuery(): \Illuminate\Database\Query\Builder
    {
        return DB::table('lesson_blocks')
            ->join('lessons', 'lessons.id', '=', 'lesson_blocks.lesson_id')
            ->join('units', 'units.id', '=', 'lessons.unit_id')
            ->join('learning_paths', 'learning_paths.id', '=', 'units.learning_path_id')
            ->select('lesson_blocks.*', 'lessons.title as lessonTitle', 'learning_paths.title as pathTitle');
    }

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

    public function updateTutorSettings(Request $request): RedirectResponse
    {
        $this->authorizeAdmin($request);
        $data = $request->validate([
            'api_url' => 'required|url:http,https|max:255',
            'model' => 'required|string|max:100',
            'api_key' => 'nullable|string|max:4000',
            'clear_api_key' => 'sometimes|boolean',
            'enabled' => 'required|boolean',
            'response_language' => ['required', Rule::in(['user', 'id', 'su'])],
            'response_style' => ['required', Rule::in(['warm', 'concise', 'step_by_step'])],
            'max_tokens' => 'required|integer|min:100|max:1500',
        ]);
        $current = DB::table('ai_tutor_settings')->where('id', 1)->first();
        $apiKey = filled($data['api_key'] ?? null)
            ? Crypt::encryptString($data['api_key'])
            : (($data['clear_api_key'] ?? false) ? null : ($current->api_key_encrypted ?? null));
        unset($data['api_key']);
        unset($data['clear_api_key']);

        DB::table('ai_tutor_settings')->updateOrInsert(
            ['id' => 1],
            [...$data, 'api_key_encrypted' => $apiKey, 'created_at' => $current->created_at ?? now(), 'updated_at' => now()],
        );

        return back();
    }

    public function testTutorSettings(Request $request): RedirectResponse
    {
        $this->authorizeAdmin($request);
        $data = $request->validate([
            'api_url' => 'required|url:http,https|max:255',
            'model' => 'required|string|max:100',
            'api_key' => 'nullable|string|max:4000',
            'clear_api_key' => 'sometimes|boolean',
        ]);

        $settings = DB::table('ai_tutor_settings')->where('id', 1)->first();
        $apiKey = filled($data['api_key'] ?? null) ? $data['api_key'] : null;
        if (! $apiKey && ! ($data['clear_api_key'] ?? false) && $settings?->api_key_encrypted) {
            try {
                $apiKey = Crypt::decryptString($settings->api_key_encrypted);
            } catch (\Throwable $error) {
                report($error);
            }
        }
        $apiKey = $apiKey ?: config('services.tutor.key');
        if (! filled($apiKey)) {
            return $this->tutorTestToast('warning', 'Masukkan API key atau konfigurasi kunci di server sebelum menguji koneksi.');
        }

        try {
            $response = Http::withToken($apiKey)->timeout(15)->withOptions(['allow_redirects' => false])->post(rtrim($data['api_url'], '/').'/chat/completions', [
                'model' => $data['model'],
                'max_tokens' => 8,
                'messages' => [
                    ['role' => 'system', 'content' => 'Balas tepat dengan kata SAWALA.'],
                    ['role' => 'user', 'content' => 'SAWALA'],
                ],
            ]);

            if (! $response->successful()) {
                $message = match ($response->status()) {
                    401, 403 => 'Koneksi ditolak penyedia AI. Periksa API key dan izin model.',
                    404 => 'Endpoint tidak ditemukan. Periksa URL API; URL dasar harus menyediakan /chat/completions.',
                    429 => 'Penyedia AI membatasi permintaan. Periksa kuota atau coba lagi nanti.',
                    default => 'Penyedia AI mengembalikan respons gagal. Periksa URL, model, API key, atau kuota akun.',
                };

                return $this->tutorTestToast('error', $message);
            }

            if (! filled($response->json('choices.0.message.content'))) {
                return $this->tutorTestToast('error', 'Penyedia merespons, tetapi format jawabannya tidak sesuai API chat completions.');
            }
        } catch (ConnectionException) {
            return $this->tutorTestToast('error', 'Server tidak dapat terhubung ke penyedia AI. Periksa URL dan koneksi server.');
        }

        return $this->tutorTestToast('success', 'Koneksi penyedia AI berhasil. Pengaturan ini belum disimpan.');
    }

    private function tutorTestToast(string $type, string $message): RedirectResponse
    {
        Inertia::flash('toast', ['type' => $type, 'message' => $message]);

        return back();
    }

    public function updateFeedback(Request $request, int $feedback): RedirectResponse
    {
        $this->authorizeAdmin($request);
        $data = $request->validate(['status' => ['required', Rule::in(['new', 'reviewing', 'resolved'])]]);
        DB::table('learner_feedback')->where('id', $feedback)->update(['status' => $data['status'], 'updated_at' => now()]);

        return back();
    }

    public function storePath(Request $request): RedirectResponse
    {
        $this->authorizeAdmin($request);
        $data = $request->validate(['title' => 'required|string|max:160', 'description' => 'nullable|string|max:1000', 'position' => 'nullable|integer|min:0']);
        $slug = Str::slug($data['title']);
        $path = LearningPath::create([...$data, 'slug' => $slug.'-'.Str::lower(Str::random(5))]);

        return redirect()->route('admin.index', ['section' => 'paths', 'path' => $path->slug]);
    }

    public function updatePath(Request $request, LearningPath $path): RedirectResponse
    {
        $this->authorizeAdmin($request);
        $data = $request->validate(['title' => 'required|string|max:160', 'description' => 'nullable|string|max:1000', 'position' => 'nullable|integer|min:0', 'status' => Rule::in(['draft', 'review', 'published', 'archived'])]);
        if (($data['status'] ?? null) === 'published' && ! $path->units()->where('status', 'published')->exists()) {
            throw ValidationException::withMessages(['status' => 'Terbitkan setidaknya satu unit terlebih dahulu.']);
        }
        $path->update($data);

        return back();
    }

    public function storeUnit(Request $request): RedirectResponse
    {
        $this->authorizeAdmin($request);
        Unit::create($request->validate(['learning_path_id' => 'required|exists:learning_paths,id', 'title' => 'required|string|max:160', 'description' => 'nullable|string|max:1000', 'position' => 'nullable|integer|min:0']));

        return back();
    }

    public function updateUnit(Request $request, Unit $unit): RedirectResponse
    {
        $this->authorizeAdmin($request);
        $data = $request->validate(['title' => 'required|string|max:160', 'description' => 'nullable|string|max:1000', 'position' => 'nullable|integer|min:0', 'status' => Rule::in(['draft', 'review', 'published', 'archived'])]);
        if (($data['status'] ?? null) === 'published' && ! $unit->lessons()->where('status', 'published')->exists()) {
            throw ValidationException::withMessages(['status' => 'Terbitkan paling sedikit satu pelajaran dalam unit ini terlebih dahulu.']);
        }
        $unit->update($data);

        return back();
    }

    public function storeLesson(Request $request): RedirectResponse
    {
        $this->authorizeAdmin($request);
        Lesson::create($request->validate(['unit_id' => 'required|exists:units,id', 'title' => 'required|string|max:160', 'summary' => 'nullable|string|max:1000', 'position' => 'nullable|integer|min:0']));

        return back();
    }

    public function updateLesson(Request $request, Lesson $lesson): RedirectResponse
    {
        $this->authorizeAdmin($request);
        $data = $request->validate(['title' => 'required|string|max:160', 'summary' => 'nullable|string|max:1000', 'position' => 'nullable|integer|min:0', 'status' => Rule::in(['draft', 'review', 'published', 'archived'])]);
        if (($data['status'] ?? null) === 'published') {
            if (! $lesson->blocks()->where(function ($query) {
                $query->whereNotNull('body')->orWhereNotNull('latin')->orWhereNotNull('sundanese');
            })->exists()) {
                throw ValidationException::withMessages(['status' => 'Tambahkan setidaknya satu blok materi berisi teks atau contoh sebelum menerbitkan pelajaran.']);
            }
            if ($lesson->exercises()->whereDoesntHave('questions')->exists()) {
                throw ValidationException::withMessages(['status' => 'Setiap latihan harus memiliki paling sedikit satu soal.']);
            }
        }
        $lesson->update($data);

        return back();
    }

    public function storeBlock(Request $request): RedirectResponse
    {
        $this->authorizeAdmin($request);
        $data = $request->validate([
            'lesson_id' => 'required|exists:lessons,id', 'type' => ['required', Rule::in(['text', 'vocabulary', 'dialogue', 'script'])],
            'title' => 'nullable|string|max:160', 'body' => 'nullable|string|max:10000', 'latin' => 'nullable|string|max:255',
            'sundanese' => 'nullable|string|max:255', 'translation' => 'nullable|string|max:2000',
            'region' => 'nullable|string|max:160', 'register' => 'nullable|string|max:160', 'context' => 'nullable|string|max:2000',
            'position' => 'nullable|integer|min:0', 'audio' => 'nullable|file|mimes:mp3,wav,ogg,m4a,webm|max:10240',
        ]);
        if ($request->hasFile('audio')) {
            $data['audio_path'] = $request->file('audio')->store('lesson-audio', 'public');
        }
        unset($data['audio']);
        LessonBlock::create($data);

        return back();
    }

    public function updateBlock(Request $request, LessonBlock $block): RedirectResponse
    {
        $this->authorizeAdmin($request);
        $data = $request->validate([
            'type' => ['required', Rule::in(['text', 'vocabulary', 'dialogue', 'script'])], 'title' => 'nullable|string|max:160',
            'body' => 'nullable|string|max:10000', 'latin' => 'nullable|string|max:255', 'sundanese' => 'nullable|string|max:255',
            'translation' => 'nullable|string|max:2000', 'region' => 'nullable|string|max:160', 'register' => 'nullable|string|max:160',
            'context' => 'nullable|string|max:2000', 'position' => 'nullable|integer|min:0', 'audio' => 'nullable|file|mimes:mp3,wav,ogg,m4a,webm|max:10240',
        ]);
        if ($request->hasFile('audio')) {
            $oldAudioPath = $block->audio_path;
            $data['audio_path'] = $request->file('audio')->store('lesson-audio', 'public');
        } else {
            $oldAudioPath = null;
        }
        unset($data['audio']);
        $block->update($data);
        if ($oldAudioPath) {
            $this->deleteAudioIfUnused([$oldAudioPath]);
        }

        return back();
    }

    public function updateBlockAudio(Request $request, LessonBlock $block): RedirectResponse
    {
        $this->authorizeAdmin($request);
        $data = $request->validate([
            'audio' => 'required|file|mimes:mp3,wav,ogg,m4a,webm|max:10240',
        ]);

        $audioPath = $data['audio']->store('lesson-audio', 'public');
        $oldAudioPath = $block->audio_path;
        $block->update(['audio_path' => $audioPath]);
        if ($oldAudioPath) {
            $this->deleteAudioIfUnused([$oldAudioPath]);
        }

        return back();
    }

    public function storeExercise(Request $request): RedirectResponse
    {
        $this->authorizeAdmin($request);
        Exercise::create($request->validate([
            'lesson_id' => 'required|exists:lessons,id', 'title' => 'required|string|max:160',
            'kind' => ['required', Rule::in(['practice', 'quiz'])],
            'time_limit_minutes' => 'nullable|integer|min:1|max:180',
            'pass_percentage' => 'required|integer|min:1|max:100',
            'attempt_limit' => 'nullable|integer|min:1|max:10',
            'position' => 'nullable|integer|min:0',
        ]));

        return back();
    }

    public function storeQuiz(Request $request): RedirectResponse
    {
        $this->authorizeAdmin($request);
        $data = $request->validate([
            'lesson_id' => 'required|exists:lessons,id',
            'title' => 'required|string|max:160',
            'time_limit_minutes' => 'required|integer|min:1|max:180',
            'pass_percentage' => 'required|integer|min:1|max:100',
            'attempt_limit' => 'nullable|integer|min:1|max:10',
            'questions' => 'required|array|min:1|max:100',
            'questions.*.type' => ['required', Rule::in(['multiple_choice', 'listening'])],
            'questions.*.prompt' => 'required|string|max:2000',
            'questions.*.options' => 'required|array|size:4',
            'questions.*.options.*' => 'required|string|max:255|distinct',
            'questions.*.answer_index' => 'required|integer|between:0,3',
            'questions.*.explanation' => 'required|string|max:2000',
            'questions.*.audio' => 'nullable|file|mimes:mp3,wav,ogg,m4a,webm|max:10240',
        ]);

        foreach ($data['questions'] as $position => $question) {
            if (($question['type'] ?? 'multiple_choice') === 'listening' && ! $request->hasFile("questions.{$position}.audio")) {
                throw ValidationException::withMessages([
                    "questions.{$position}.audio" => 'Unggah audio untuk setiap soal menyimak.',
                ]);
            }
        }

        $storedAudioPaths = [];
        try {
            DB::transaction(function () use ($data, &$storedAudioPaths): void {
                $exercise = Exercise::create([
                    'lesson_id' => $data['lesson_id'],
                    'title' => $data['title'],
                    'kind' => 'quiz',
                    'time_limit_minutes' => $data['time_limit_minutes'],
                    'pass_percentage' => $data['pass_percentage'],
                    'attempt_limit' => $data['attempt_limit'] ?? null,
                    'position' => (Exercise::where('lesson_id', $data['lesson_id'])->max('position') ?? -1) + 1,
                ]);

                foreach ($data['questions'] as $position => $question) {
                    $audioPath = null;
                    if (($question['type'] ?? 'multiple_choice') === 'listening' && ($question['audio'] ?? null)) {
                        $audioPath = $question['audio']->store('question-audio', 'public');
                        $storedAudioPaths[] = $audioPath;
                    }
                    $exercise->questions()->create([
                        'type' => $question['type'] ?? 'multiple_choice',
                        'prompt' => $question['prompt'],
                        'options' => $question['options'],
                        'audio_path' => $audioPath,
                        'answer' => ['value' => $question['options'][$question['answer_index']]],
                        'explanation' => $question['explanation'],
                        'position' => $position,
                    ]);
                }
            });
        } catch (\Throwable $error) {
            Storage::disk('public')->delete($storedAudioPaths);
            throw $error;
        }

        return back();
    }

    public function updateExercise(Request $request, Exercise $exercise): RedirectResponse
    {
        $this->authorizeAdmin($request);
        $exercise->update($request->validate([
            'title' => 'required|string|max:160',
            'kind' => ['required', Rule::in(['practice', 'quiz'])],
            'time_limit_minutes' => 'nullable|integer|min:1|max:180',
            'pass_percentage' => 'required|integer|min:1|max:100',
            'attempt_limit' => 'nullable|integer|min:1|max:10',
            'position' => 'nullable|integer|min:0',
        ]));

        return back();
    }

    public function storeQuestion(Request $request): RedirectResponse
    {
        $this->authorizeAdmin($request);
        $data = $request->validate([
            'exercise_id' => 'required|exists:exercises,id', 'type' => ['required', Rule::in(['multiple_choice', 'fill_blank', 'script', 'matching', 'ordering', 'listening'])],
            'prompt' => 'required|string|max:2000', 'options' => [Rule::requiredIf(in_array($request->input('type'), ['multiple_choice', 'matching', 'ordering', 'listening'], true)), 'nullable', 'array'], 'options.*' => 'string|max:255',
            'audio' => 'nullable|file|mimes:mp3,wav,ogg,m4a,webm|max:10240',
            'answer' => 'required|string|max:2000', 'explanation' => 'required|string|max:2000', 'position' => 'nullable|integer|min:0',
        ]);
        if ($data['type'] === 'listening' && ! $request->hasFile('audio')) {
            throw ValidationException::withMessages(['audio' => 'Unggah audio untuk soal menyimak.']);
        }
        if ($data['type'] === 'listening' && $request->hasFile('audio')) {
            $data['audio_path'] = $request->file('audio')->store('question-audio', 'public');
        }
        unset($data['audio']);
        $data['answer'] = ['value' => $data['answer']];
        Question::create($data);

        return back();
    }

    public function updateQuestion(Request $request, Question $question): RedirectResponse
    {
        $this->authorizeAdmin($request);
        $data = $request->validate([
            'type' => ['required', Rule::in(['multiple_choice', 'fill_blank', 'script', 'matching', 'ordering', 'listening'])], 'prompt' => 'required|string|max:2000',
            'options' => [Rule::requiredIf(in_array($request->input('type'), ['multiple_choice', 'matching', 'ordering', 'listening'], true)), 'nullable', 'array'], 'options.*' => 'string|max:255',
            'audio' => 'nullable|file|mimes:mp3,wav,ogg,m4a,webm|max:10240', 'answer' => 'required|string|max:2000',
            'explanation' => 'required|string|max:2000', 'position' => 'nullable|integer|min:0',
        ]);
        $audioPath = $question->audio_path;
        $oldAudioPath = $audioPath;
        if ($data['type'] === 'listening' && $request->hasFile('audio')) {
            $audioPath = $request->file('audio')->store('question-audio', 'public');
        } elseif ($data['type'] !== 'listening') {
            if ($audioPath) {
                Storage::disk('public')->delete($audioPath);
            }
            $audioPath = null;
        }
        if ($data['type'] === 'listening' && ! $audioPath) {
            throw ValidationException::withMessages(['audio' => 'Unggah audio untuk soal menyimak.']);
        }
        unset($data['audio']);
        $question->update([...$data, 'answer' => ['value' => $data['answer']]]);
        $question->update(['audio_path' => $audioPath]);
        if ($oldAudioPath && $oldAudioPath !== $audioPath) {
            $this->deleteAudioIfUnused([$oldAudioPath]);
        }

        return back();
    }

    public function destroy(Request $request, string $type, int $id): RedirectResponse
    {
        $this->authorizeAdmin($request);
        $model = match ($type) {
            'paths' => LearningPath::class, 'units' => Unit::class, 'lessons' => Lesson::class,
            'blocks' => LessonBlock::class, 'exercises' => Exercise::class, 'questions' => Question::class,
            default => abort(404),
        };
        $record = $model::findOrFail($id);
        $blockAudioPaths = match (true) {
            $record instanceof LessonBlock => collect([$record->audio_path]),
            $record instanceof Lesson => DB::table('lesson_blocks')->where('lesson_id', $record->id)->whereNotNull('audio_path')->pluck('audio_path'),
            $record instanceof Unit => DB::table('lesson_blocks')->join('lessons', 'lessons.id', '=', 'lesson_blocks.lesson_id')
                ->where('lessons.unit_id', $record->id)->whereNotNull('lesson_blocks.audio_path')->pluck('lesson_blocks.audio_path'),
            $record instanceof LearningPath => DB::table('lesson_blocks')->join('lessons', 'lessons.id', '=', 'lesson_blocks.lesson_id')
                ->join('units', 'units.id', '=', 'lessons.unit_id')->where('units.learning_path_id', $record->id)
                ->whereNotNull('lesson_blocks.audio_path')->pluck('lesson_blocks.audio_path'),
            default => collect(),
        };
        $questionAudioPaths = match (true) {
            $record instanceof Question => collect([$record->audio_path]),
            $record instanceof Exercise => $record->questions()->whereNotNull('audio_path')->pluck('audio_path'),
            $record instanceof Lesson => DB::table('questions')->join('exercises', 'exercises.id', '=', 'questions.exercise_id')
                ->where('exercises.lesson_id', $record->id)->whereNotNull('questions.audio_path')->pluck('questions.audio_path'),
            $record instanceof Unit => DB::table('questions')->join('exercises', 'exercises.id', '=', 'questions.exercise_id')
                ->join('lessons', 'lessons.id', '=', 'exercises.lesson_id')->where('lessons.unit_id', $record->id)
                ->whereNotNull('questions.audio_path')->pluck('questions.audio_path'),
            $record instanceof LearningPath => DB::table('questions')->join('exercises', 'exercises.id', '=', 'questions.exercise_id')
                ->join('lessons', 'lessons.id', '=', 'exercises.lesson_id')->join('units', 'units.id', '=', 'lessons.unit_id')
                ->where('units.learning_path_id', $record->id)->whereNotNull('questions.audio_path')->pluck('questions.audio_path'),
            default => collect(),
        };
        $record->delete();
        $this->deleteAudioIfUnused($blockAudioPaths->merge($questionAudioPaths)->filter()->unique()->values()->all());

        return back();
    }

    /** @param iterable<string|null> $paths */
    private function deleteAudioIfUnused(iterable $paths): void
    {
        $paths = collect($paths)->filter()->unique()->values();
        if ($paths->isEmpty()) {
            return;
        }

        $referenced = DB::table('lesson_blocks')->whereIn('audio_path', $paths)->pluck('audio_path')
            ->merge(DB::table('questions')->whereIn('audio_path', $paths)->pluck('audio_path'))
            ->unique()->flip();
        $unused = $paths->reject(fn (string $path) => isset($referenced[$path]))->all();
        if ($unused) {
            Storage::disk('public')->delete($unused);
        }
    }
}
