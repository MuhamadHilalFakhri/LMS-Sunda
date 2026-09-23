<?php

namespace App\Http\Controllers;

use App\Models\Exercise;
use App\Models\LearningPath;
use App\Models\Lesson;
use App\Models\LessonBlock;
use App\Models\Question;
use App\Models\Unit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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

        return Inertia::render('admin/index', [
            'paths' => LearningPath::orderBy('position')->with(['units.lessons.blocks', 'units.lessons.exercises.questions'])->get(),
            'learners' => DB::table('users')->where('role', 'pelajar')->select('id', 'name', 'email')->get()->map(function ($user) {
                $user->completed = DB::table('lesson_progress')->where('user_id', $user->id)->where('status', 'completed')->count();
                $user->attempts = DB::table('exercise_attempts')->where('user_id', $user->id)->count();

                return $user;
            }),
        ]);
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
            'position' => 'nullable|integer|min:0', 'audio' => 'nullable|file|mimes:mp3,wav,ogg,m4a|max:10240',
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
            'context' => 'nullable|string|max:2000', 'position' => 'nullable|integer|min:0', 'audio' => 'nullable|file|mimes:mp3,wav,ogg,m4a|max:10240',
        ]);
        if ($request->hasFile('audio')) {
            if ($block->audio_path) {
                Storage::disk('public')->delete($block->audio_path);
            }
            $data['audio_path'] = $request->file('audio')->store('lesson-audio', 'public');
        }
        unset($data['audio']);
        $block->update($data);

        return back();
    }

    public function storeExercise(Request $request): RedirectResponse
    {
        $this->authorizeAdmin($request);
        Exercise::create($request->validate(['lesson_id' => 'required|exists:lessons,id', 'title' => 'required|string|max:160', 'position' => 'nullable|integer|min:0']));

        return back();
    }

    public function updateExercise(Request $request, Exercise $exercise): RedirectResponse
    {
        $this->authorizeAdmin($request);
        $exercise->update($request->validate(['title' => 'required|string|max:160', 'position' => 'nullable|integer|min:0']));

        return back();
    }

    public function storeQuestion(Request $request): RedirectResponse
    {
        $this->authorizeAdmin($request);
        $data = $request->validate([
            'exercise_id' => 'required|exists:exercises,id', 'type' => ['required', Rule::in(['multiple_choice', 'fill_blank', 'script', 'matching', 'ordering'])],
            'prompt' => 'required|string|max:2000', 'options' => 'nullable|array', 'options.*' => 'string|max:255',
            'answer' => 'required|string|max:2000', 'explanation' => 'required|string|max:2000', 'position' => 'nullable|integer|min:0',
        ]);
        $data['answer'] = ['value' => $data['answer']];
        Question::create($data);

        return back();
    }

    public function updateQuestion(Request $request, Question $question): RedirectResponse
    {
        $this->authorizeAdmin($request);
        $data = $request->validate([
            'type' => ['required', Rule::in(['multiple_choice', 'fill_blank', 'script', 'matching', 'ordering'])], 'prompt' => 'required|string|max:2000',
            'options' => 'nullable|array', 'options.*' => 'string|max:255', 'answer' => 'required|string|max:2000',
            'explanation' => 'required|string|max:2000', 'position' => 'nullable|integer|min:0',
        ]);
        $question->update([...$data, 'answer' => ['value' => $data['answer']]]);

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
        if ($record instanceof LessonBlock && $record->audio_path) {
            Storage::disk('public')->delete($record->audio_path);
        }
        $record->delete();

        return back();
    }
}
