<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_tutor_settings', function (Blueprint $table) {
            $table->id();
            $table->string('api_url')->default('https://api.openai.com/v1');
            $table->string('model')->default('gpt-4o-mini');
            $table->text('api_key_encrypted')->nullable();
            $table->boolean('enabled')->default(true);
            $table->string('response_language')->default('user');
            $table->string('response_style')->default('warm');
            $table->unsignedSmallInteger('max_tokens')->default(450);
            $table->timestamps();
        });

        Schema::create('learner_feedback', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('category', 40);
            $table->text('message');
            $table->string('page')->nullable();
            $table->string('status', 20)->default('new');
            $table->timestamps();
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('learner_feedback');
        Schema::dropIfExists('ai_tutor_settings');
    }
};
