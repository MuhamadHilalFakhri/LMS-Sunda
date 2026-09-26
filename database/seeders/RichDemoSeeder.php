<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/** Additive, repeatable sample data for previewing a busy LMS locally. */
class RichDemoSeeder extends Seeder
{
    use RichDemoLanguageContent;
    use RichDemoLearnerActivity;
    use RichDemoQuizContent;

    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            return;
        }

        DB::transaction(function (): void {
            $this->copyAudio();
            $this->seedLanguage();
            $this->seedSentenceAudio();
            $this->seedScript();
            $this->seedQuizzes();
            $this->seedLearnersAndActivity();
        });
    }
}
