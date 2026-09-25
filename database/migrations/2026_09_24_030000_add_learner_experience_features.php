<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedTinyInteger('daily_goal')->default(1);
        });

        Schema::table('exercises', function (Blueprint $table) {
            $table->string('kind')->default('practice');
            $table->unsignedSmallInteger('time_limit_minutes')->nullable();
            $table->unsignedTinyInteger('pass_percentage')->default(70);
            $table->unsignedSmallInteger('attempt_limit')->nullable();
            $table->index(['kind', 'lesson_id']);
        });

        Schema::create('saved_materials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('lesson_block_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['user_id', 'lesson_block_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('saved_materials');

        Schema::table('exercises', function (Blueprint $table) {
            $table->dropIndex(['kind', 'lesson_id']);
            $table->dropColumn(['kind', 'time_limit_minutes', 'pass_percentage', 'attempt_limit']);
        });

        Schema::table('users', fn (Blueprint $table) => $table->dropColumn('daily_goal'));
    }
};
