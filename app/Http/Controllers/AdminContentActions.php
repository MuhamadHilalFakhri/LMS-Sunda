<?php

namespace App\Http\Controllers;

use App\Models\LearningPath;
use App\Models\Lesson;
use App\Models\LessonBlock;
use App\Models\Unit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

trait AdminContentActions
{
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
        Lesson::create($request->validate([
            'unit_id' => 'required|exists:units,id', 'title' => 'required|string|max:160',
            'summary' => 'nullable|string|max:1000',
            'youtube_url' => ['nullable', 'url:http,https', 'regex:/^https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\//i', 'max:255'],
            'position' => 'nullable|integer|min:0',
        ], [
            'youtube_url.regex' => 'Gunakan tautan video youtube.com atau youtu.be yang valid.',
        ]));

        return back();
    }

    public function updateLesson(Request $request, Lesson $lesson): RedirectResponse
    {
        $this->authorizeAdmin($request);
        $data = $request->validate([
            'title' => 'required|string|max:160', 'summary' => 'nullable|string|max:1000',
            'youtube_url' => ['nullable', 'url:http,https', 'regex:/^https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\//i', 'max:255'],
            'position' => 'nullable|integer|min:0', 'status' => Rule::in(['draft', 'review', 'published', 'archived']),
        ], [
            'youtube_url.regex' => 'Gunakan tautan video youtube.com atau youtu.be yang valid.',
        ]);
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
}
