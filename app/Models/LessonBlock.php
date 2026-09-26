<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** @property-read string $lesson_title */
class LessonBlock extends Model
{
    protected $fillable = ['lesson_id', 'type', 'title', 'body', 'latin', 'sundanese', 'translation', 'region', 'register', 'context', 'audio_path', 'position'];

    /** @return BelongsTo<Lesson, $this> */
    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }
}
