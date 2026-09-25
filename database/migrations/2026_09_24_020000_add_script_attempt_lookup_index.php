<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('exercise_attempts', function (Blueprint $table) {
            $table->index(['user_id', 'exercise_id', 'id'], 'ea_user_exercise_idx');
        });
    }

    public function down(): void
    {
        Schema::table('exercise_attempts', function (Blueprint $table) {
            $table->dropIndex('ea_user_exercise_idx');
        });
    }
};
