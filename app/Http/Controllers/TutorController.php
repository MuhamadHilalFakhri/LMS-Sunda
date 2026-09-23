<?php

namespace App\Http\Controllers;

use App\Models\LessonBlock;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class TutorController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('learning/tutor', ['messages' => DB::table('ai_messages')->where('user_id', $request->user()->id)->orderBy('id')->get()]);
    }

    public function ask(Request $request): RedirectResponse
    {
        $data = $request->validate(['mode' => 'required|in:question,conversation,writing', 'prompt' => 'required|string|min:3|max:1500']);
        $blocks = LessonBlock::query()->join('lessons', 'lessons.id', '=', 'lesson_blocks.lesson_id')
            ->join('units', 'units.id', '=', 'lessons.unit_id')->join('learning_paths', 'learning_paths.id', '=', 'units.learning_path_id')
            ->where('lessons.status', 'published')->where('units.status', 'published')->where('learning_paths.status', 'published')
            ->select('lesson_blocks.*', 'lessons.title as lesson_title')->get();
        $words = collect(preg_split('/\s+/u', mb_strtolower($data['prompt'])) ?: [])->filter(fn (string $word) => mb_strlen($word) >= 4)->unique();
        $sources = $blocks->filter(function (LessonBlock $block) use ($words) {
            $haystack = mb_strtolower(implode(' ', [$block->title, $block->body, $block->latin, $block->sundanese, $block->translation, $block->context]));

            return $words->contains(fn (string $word) => str_contains($haystack, $word));
        })->take(4)->values();
        $useSundanese = $request->user()->ui_locale === 'su';

        if ($sources->isEmpty()) {
            $response = $useSundanese
                ? 'Abdi teu acan mendakan matéri terbit anu patali sareng patalékan ieu. Cobi anggo istilah tina pangajaran anu sayogi atanapi buka kelas diajar heula.'
                : 'Saya belum menemukan materi terbit yang relevan untuk menjawab ini. Coba gunakan istilah dari pelajaran yang tersedia atau buka kelas belajar terlebih dahulu.';
            $tokens = [0, 0];
        } elseif (! config('services.tutor.key')) {
            $response = $useSundanese
                ? 'Matéri anu patali parantos kapendak, nanging tutor AI teu acan diatur. Buka rujukan pangajaran di handap kanggo diajar tina matéri anu parantos ditinjau.'
                : 'Materi terkait sudah ditemukan, tetapi tutor AI belum dikonfigurasi. Buka rujukan pelajaran di bawah untuk belajar dari materi yang ditinjau.';
            $tokens = [0, 0];
        } else {
            $context = $sources->map(fn ($block) => "Pelajaran #{$block->lesson_id} ({$block->lesson_title}): {$block->title} {$block->body} {$block->latin} {$block->sundanese} {$block->translation} {$block->context}")->implode("\n");
            $responseLanguage = $useSundanese ? 'Bahasa Sunda yang jelas dan sopan' : 'Bahasa Indonesia yang jelas dan sopan';
            try {
                $result = Http::withToken(config('services.tutor.key'))->timeout(20)->post(rtrim(config('services.tutor.url'), '/').'/chat/completions', [
                    'model' => config('services.tutor.model'), 'max_tokens' => 450,
                    'messages' => [
                        ['role' => 'system', 'content' => "Anda tutor Bahasa Sunda. Mode: {$data['mode']}. Jawab dalam {$responseLanguage} dengan hangat dan ringkas. Gunakan HANYA materi terbit berikut. Jika materi tidak cukup, nyatakan ketidakpastian; jangan mengarang kosakata, aturan aksara, atau koreksi. Untuk latihan percakapan, ajukan satu pertanyaan lanjutan. Materi:\n{$context}"],
                        ['role' => 'user', 'content' => $data['prompt']],
                    ],
                ])->throw()->json();
                $response = $result['choices'][0]['message']['content'] ?? ($useSundanese ? 'Tutor teu acan tiasa ngawaler. Mangga cobi deui.' : 'Tutor belum dapat menjawab. Silakan coba lagi.');
                $tokens = [$result['usage']['prompt_tokens'] ?? 0, $result['usage']['completion_tokens'] ?? 0];
            } catch (\Throwable $error) {
                report($error);
                $response = $useSundanese
                    ? 'Ladenan tutor nuju teu sayogi. Mangga cobi deui engké atanapi buka rujukan matéri di handap.'
                    : 'Layanan tutor sedang tidak tersedia. Silakan coba lagi nanti atau buka rujukan materi di bawah.';
                $tokens = [0, 0];
            }
        }

        DB::table('ai_messages')->insert([
            'user_id' => $request->user()->id, 'mode' => $data['mode'], 'prompt' => $data['prompt'], 'response' => $response,
            'references' => $sources->map(fn ($block) => ['lesson_id' => $block->lesson_id, 'title' => $block->lesson_title])->unique('lesson_id')->values()->toJson(),
            'input_tokens' => $tokens[0], 'output_tokens' => $tokens[1], 'created_at' => now(), 'updated_at' => now(),
        ]);

        return back();
    }
}
