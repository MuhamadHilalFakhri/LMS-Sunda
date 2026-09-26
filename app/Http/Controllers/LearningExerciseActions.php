<?php

namespace App\Http\Controllers;

use App\Models\Exercise;
use App\Models\LearningPath;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

trait LearningExerciseActions
{
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
}
