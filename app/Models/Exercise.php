<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Exercise extends Model
{
    protected $fillable = [
        'lesson_id', 'title', 'position', 'kind', 'time_limit_minutes', 'pass_percentage', 'attempt_limit',
    ];

    protected function casts(): array
    {
        return [
            'time_limit_minutes' => 'integer',
            'pass_percentage' => 'integer',
            'attempt_limit' => 'integer',
        ];
    }

    /** @return BelongsTo<Lesson, $this> */
    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    /** @return HasMany<Question, $this> */
    public function questions(): HasMany
    {
        return $this->hasMany(Question::class)->orderBy('position');
    }
}
