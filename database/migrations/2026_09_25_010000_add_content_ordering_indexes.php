<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('learning_paths', fn (Blueprint $table) => $table->index('position', 'paths_position_idx'));
        Schema::table('units', fn (Blueprint $table) => $table->index(['learning_path_id', 'position'], 'units_path_position_idx'));
        Schema::table('lessons', fn (Blueprint $table) => $table->index(['unit_id', 'position'], 'lessons_unit_position_idx'));
        Schema::table('lesson_blocks', fn (Blueprint $table) => $table->index(['lesson_id', 'position'], 'blocks_lesson_position_idx'));
        Schema::table('exercises', fn (Blueprint $table) => $table->index(['lesson_id', 'position'], 'exercises_lesson_position_idx'));
        Schema::table('questions', fn (Blueprint $table) => $table->index(['exercise_id', 'position'], 'questions_exercise_position_idx'));
    }

    public function down(): void
    {
        Schema::table('questions', fn (Blueprint $table) => $table->dropIndex('questions_exercise_position_idx'));
        Schema::table('exercises', fn (Blueprint $table) => $table->dropIndex('exercises_lesson_position_idx'));
        Schema::table('lesson_blocks', fn (Blueprint $table) => $table->dropIndex('blocks_lesson_position_idx'));
        Schema::table('lessons', fn (Blueprint $table) => $table->dropIndex('lessons_unit_position_idx'));
        Schema::table('units', fn (Blueprint $table) => $table->dropIndex('units_path_position_idx'));
        Schema::table('learning_paths', fn (Blueprint $table) => $table->dropIndex('paths_position_idx'));
    }
};
