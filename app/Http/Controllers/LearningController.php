<?php

namespace App\Http\Controllers;

use App\Models\Exercise;
use App\Models\LearningPath;
use App\Models\Lesson;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class LearningController extends Controller
{
    public function home(Request $request): Response
    {
        $paths = LearningPath::where('status', 'published')->orWhereIn('slug', ['bahasa-sunda', 'aksara-sunda'])->orderBy('position')->with(['units' => fn ($q) => $q->where('status', 'published')->with(['lessons' => fn ($q) => $q->where('status', 'published')])])->get();
        $progress = DB::table('lesson_progress')->where('user_id', $request->user()->id)->pluck('status', 'lesson_id');
        $recent = DB::table('lesson_progress')->where('user_id', $request->user()->id)->orderByDesc('updated_at')->first();

        return Inertia::render('dashboard', ['paths' => $paths, 'progress' => $progress, 'recentLesson' => $recent?->lesson_id]);
    }

    public function path(Request $request, LearningPath $path): Response
    {
        abort_unless($path->status === 'published' || in_array($path->slug, ['bahasa-sunda', 'aksara-sunda'], true), 404);
        if ($path->status === 'published') {
            $path->load(['units' => fn ($q) => $q->where('status', 'published')->with(['lessons' => fn ($q) => $q->where('status', 'published')])]);
        } else {
            $path->setRelation('units', collect());
        }

        return Inertia::render('learning/path', [
            'path' => $path,
            'progress' => DB::table('lesson_progress')->where('user_id', $request->user()->id)->pluck('status', 'lesson_id'),
        ]);
    }

    public function lesson(Request $request, Lesson $lesson): Response
    {
        $lesson->load('unit.path', 'blocks', 'exercises');
        abort_unless($lesson->status === 'published' && $lesson->unit->status === 'published' && $lesson->unit->path->status === 'published', 404);
        DB::table('lesson_progress')->insertOrIgnore([
            'user_id' => $request->user()->id, 'lesson_id' => $lesson->id,
            'status' => 'in_progress', 'created_at' => now(), 'updated_at' => now(),
        ]);
        DB::table('lesson_progress')->where('user_id', $request->user()->id)->where('lesson_id', $lesson->id)->update(['updated_at' => now()]);

        return Inertia::render('learning/lesson', ['lesson' => $lesson]);
    }

    public function complete(Request $request, Lesson $lesson): RedirectResponse
    {
        abort_unless($lesson->status === 'published' && $lesson->unit->status === 'published' && $lesson->unit->path->status === 'published', 404);
        DB::table('lesson_progress')->updateOrInsert(
            ['user_id' => $request->user()->id, 'lesson_id' => $lesson->id],
            ['status' => 'completed', 'completed_at' => now(), 'updated_at' => now()]
        );

        return redirect()->route('paths.by-slug', ['path' => $lesson->unit->path->slug]);
    }

    public function exercise(Exercise $exercise): Response
    {
        $exercise->load('lesson.unit.path', 'questions');
        abort_unless($exercise->lesson->status === 'published' && $exercise->lesson->unit->status === 'published' && $exercise->lesson->unit->path->status === 'published', 404);

        return Inertia::render('learning/exercise', ['exercise' => [
            'id' => $exercise->id, 'title' => $exercise->title, 'lesson' => $exercise->lesson,
            'questions' => $exercise->questions->map(fn ($question) => $question->only(['id', 'type', 'prompt', 'options'])),
        ]]);
    }

    public function submit(Request $request, Exercise $exercise): RedirectResponse
    {
        $exercise->load('questions', 'lesson.unit.path');
        abort_unless($exercise->lesson->status === 'published' && $exercise->lesson->unit->status === 'published' && $exercise->lesson->unit->path->status === 'published', 404);
        $data = $request->validate(['answers' => ['required', 'array'], 'answers.*' => ['string', 'max:2000'], 'duration_seconds' => ['nullable', 'integer', 'min:0', 'max:86400']]);
        $results = $exercise->questions->map(function ($question) use ($data) {
            $submitted = $data['answers'][$question->id] ?? null;
            $correct = $question->answer['value'] ?? null;
            $normalize = fn ($value) => is_string($value) ? mb_strtolower(trim($value)) : $value;

            return ['id' => $question->id, 'prompt' => $question->prompt, 'submitted' => $submitted, 'answer' => $correct, 'correct' => $normalize($submitted) === $normalize($correct), 'explanation' => $question->explanation];
        });
        $id = DB::table('exercise_attempts')->insertGetId([
            'user_id' => $request->user()->id, 'exercise_id' => $exercise->id,
            'answers' => json_encode($data['answers'], JSON_UNESCAPED_UNICODE),
            'correct_count' => $results->where('correct', true)->count(), 'total_count' => $results->count(),
            'duration_seconds' => $data['duration_seconds'] ?? null, 'created_at' => now(), 'updated_at' => now(),
        ]);

        return redirect()->route('attempts.show', $id);
    }

    public function result(Request $request, int $attempt): Response
    {
        $record = DB::table('exercise_attempts')->where('id', $attempt)->where('user_id', $request->user()->id)->first();
        abort_unless($record !== null, 404);
        $exercise = Exercise::query()->with('questions', 'lesson')->whereKey($record->exercise_id)->firstOrFail();
        $answers = json_decode($record->answers, true);
        $results = $exercise->questions->map(function ($question) use ($answers) {
            $submitted = $answers[$question->id] ?? null;
            $correct = $question->answer['value'] ?? null;
            $normalize = fn ($value) => is_string($value) ? mb_strtolower(trim($value)) : $value;

            return ['prompt' => $question->prompt, 'submitted' => $submitted, 'answer' => $correct, 'correct' => $normalize($submitted) === $normalize($correct), 'explanation' => $question->explanation];
        });

        return Inertia::render('learning/result', ['attempt' => $record, 'exercise' => $exercise->only(['id', 'title', 'lesson_id']), 'results' => $results]);
    }

    public function progress(Request $request): Response
    {
        return Inertia::render('learning/progress', [
            'progress' => DB::table('lesson_progress')->join('lessons', 'lessons.id', '=', 'lesson_progress.lesson_id')->join('units', 'units.id', '=', 'lessons.unit_id')->join('learning_paths', 'learning_paths.id', '=', 'units.learning_path_id')->where('lesson_progress.user_id', $request->user()->id)->select('lessons.id', 'lessons.title', 'learning_paths.title as path_title', 'lesson_progress.status', 'lesson_progress.updated_at')->orderByDesc('lesson_progress.updated_at')->get(),
            'attempts' => DB::table('exercise_attempts')->join('exercises', 'exercises.id', '=', 'exercise_attempts.exercise_id')->where('exercise_attempts.user_id', $request->user()->id)->select('exercise_attempts.id', 'exercises.title', 'exercise_attempts.correct_count', 'exercise_attempts.total_count', 'exercise_attempts.created_at')->orderByDesc('exercise_attempts.created_at')->get(),
        ]);
    }

    public function scriptExercises(Request $request): Response
    {
        $exercises = Exercise::query()->whereHas('lesson.unit', fn ($query) => $query->where('status', 'published'))
            ->whereHas('lesson.unit.path', fn ($query) => $query->where('slug', 'aksara-sunda')->where('status', 'published'))
            ->whereHas('lesson', fn ($query) => $query->where('status', 'published'))
            ->with('lesson.unit')->withCount('questions')
            ->orderBy('position')->get();

        $attempts = DB::table('exercise_attempts')->where('user_id', $request->user()->id)
            ->whereIn('exercise_id', $exercises->pluck('id'))->orderByDesc('created_at')->get()->unique('exercise_id')->keyBy('exercise_id');

        return Inertia::render('learning/script-exercises', ['exercises' => $exercises, 'attempts' => $attempts]);
    }

    public function search(Request $request): Response
    {
        $query = trim((string) $request->query('q', ''));
        $lessons = $query === '' ? collect() : Lesson::query()->where('status', 'published')
            ->whereHas('unit', fn ($builder) => $builder->where('status', 'published'))
            ->whereHas('unit.path', fn ($builder) => $builder->where('status', 'published'))
            ->where(fn ($builder) => $builder->where('title', 'like', "%{$query}%")
                ->orWhere('summary', 'like', "%{$query}%")
                ->orWhereHas('blocks', fn ($blocks) => $blocks->where('body', 'like', "%{$query}%")
                    ->orWhere('latin', 'like', "%{$query}%")
                    ->orWhere('sundanese', 'like', "%{$query}%")
                    ->orWhere('translation', 'like', "%{$query}%")))
            ->with('unit.path')->limit(30)->get();

        return Inertia::render('learning/search', ['query' => $query, 'lessons' => $lessons]);
    }
}
