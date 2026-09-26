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
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

trait AdminAssessmentActions
{
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
