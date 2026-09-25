<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->index(['role', 'name'], 'users_role_name_idx');
        });

        if (DB::connection()->getDriverName() === 'mysql') {
            Schema::table('lesson_blocks', function (Blueprint $table) {
                $table->fullText(
                    ['title', 'body', 'latin', 'sundanese', 'translation', 'context'],
                    'lesson_blocks_tutor_search_idx',
                );
            });
        }
    }

    public function down(): void
    {
        if (DB::connection()->getDriverName() === 'mysql') {
            Schema::table('lesson_blocks', function (Blueprint $table) {
                $table->dropFullText('lesson_blocks_tutor_search_idx');
            });
        }

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('users_role_name_idx');
        });
    }
};
