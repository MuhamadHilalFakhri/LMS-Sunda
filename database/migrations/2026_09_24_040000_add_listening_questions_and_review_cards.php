<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            $table->string('audio_path')->nullable()->after('options');
        });

        Schema::create('review_cards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('lesson_block_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('interval_days')->default(0);
            $table->unsignedTinyInteger('repetitions')->default(0);
            $table->decimal('ease_factor', 3, 2)->default(2.50);
            $table->timestamp('due_at')->index();
            $table->timestamp('last_reviewed_at')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'lesson_block_id']);
            $table->index(['user_id', 'due_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('review_cards');
        Schema::table('questions', fn (Blueprint $table) => $table->dropColumn('audio_path'));
    }
};
