<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** @property-read string $lesson_title */
class LessonBlock extends Model
{
    protected $fillable = ['lesson_id', 'type', 'title', 'body', 'latin', 'sundanese', 'translation', 'region', 'register', 'context', 'audio_path', 'position'];
}
