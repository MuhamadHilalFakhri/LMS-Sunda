<?php

namespace App\Http\Controllers;

use App\Models\Exercise;
use Illuminate\Database\Query\JoinClause;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

trait LearningResultActions
{
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
                            ->leftJoin('lesson_progress as progress', function (JoinClause $join) use ($request) {
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
                                ->leftJoin('lesson_progress as progress', function (JoinClause $join) use ($request) {
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
}
