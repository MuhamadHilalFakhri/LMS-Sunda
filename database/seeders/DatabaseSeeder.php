<?php

namespace Database\Seeders;

use App\Models\LearningPath;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        LearningPath::firstOrCreate(['slug' => 'bahasa-sunda'], [
            'title' => 'Bahasa Sunda',
            'description' => 'Pelajari kosakata, ungkapan, dan cara menggunakan bahasa sesuai konteks.',
            'status' => 'draft',
            'position' => 0,
        ]);
        LearningPath::firstOrCreate(['slug' => 'aksara-sunda'], [
            'title' => 'Aksara Sunda',
            'description' => 'Kenali karakter, bacaan, dan latihan menulis Aksara Sunda.',
            'status' => 'draft',
            'position' => 1,
        ]);

        $this->call(DemoAccountsSeeder::class);
        $this->call(DemoContentSeeder::class);
        $this->call(RichDemoSeeder::class);
    }
}
