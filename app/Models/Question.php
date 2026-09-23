<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** @property array{value: string} $answer */
class Question extends Model
{
    protected $fillable = ['exercise_id', 'type', 'prompt', 'options', 'answer', 'explanation', 'position'];

    protected function casts(): array
    {
        return ['options' => 'array', 'answer' => 'array'];
    }
}
