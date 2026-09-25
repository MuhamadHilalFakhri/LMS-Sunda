<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lesson_progress', function (Blueprint $table) {
            $table->index(['updated_at', 'user_id'], 'lp_updated_user_idx');
            $table->index(['user_id', 'updated_at'], 'lp_user_updated_idx');
        });

        Schema::table('exercise_attempts', function (Blueprint $table) {
            $table->index(['created_at', 'user_id'], 'ea_created_user_idx');
            $table->index(['user_id', 'created_at'], 'ea_user_created_idx');
        });

        Schema::table('ai_messages', function (Blueprint $table) {
            $table->index('created_at', 'ai_messages_created_idx');
        });

        Schema::table('learner_feedback', function (Blueprint $table) {
            $table->index(['user_id', 'created_at'], 'lf_user_created_idx');
        });
    }

    public function down(): void
    {
        Schema::table('lesson_progress', function (Blueprint $table) {
            $table->dropIndex('lp_updated_user_idx');
            $table->dropIndex('lp_user_updated_idx');
        });

        Schema::table('exercise_attempts', function (Blueprint $table) {
            $table->dropIndex('ea_created_user_idx');
            $table->dropIndex('ea_user_created_idx');
        });

        Schema::table('ai_messages', fn (Blueprint $table) => $table->dropIndex('ai_messages_created_idx'));
        Schema::table('learner_feedback', fn (Blueprint $table) => $table->dropIndex('lf_user_created_idx'));
    }
};
