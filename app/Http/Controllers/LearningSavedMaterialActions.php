<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use App\Models\LessonBlock;
use App\Models\Unit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

trait LearningSavedMaterialActions
{
    public function savedMaterials(Request $request): Response
    {
        $search = trim((string) $request->query('q', ''));
        $kind = $request->query('kind') === 'modules' ? 'modules' : 'materials';
        $userId = $request->user()->id;
        $materialQuery = DB::table('saved_materials')
            ->join('lesson_blocks', 'lesson_blocks.id', '=', 'saved_materials.lesson_block_id')
            ->join('lessons', 'lessons.id', '=', 'lesson_blocks.lesson_id')
            ->join('units', 'units.id', '=', 'lessons.unit_id')
            ->join('learning_paths', 'learning_paths.id', '=', 'units.learning_path_id')
            ->where('saved_materials.user_id', $userId)
            ->where('lessons.status', 'published')->where('units.status', 'published')->where('learning_paths.status', 'published');
        $moduleQuery = DB::table('saved_units')
            ->join('units', 'units.id', '=', 'saved_units.unit_id')
            ->join('learning_paths', 'learning_paths.id', '=', 'units.learning_path_id')
            ->where('saved_units.user_id', $userId)
            ->where('units.status', 'published')->where('learning_paths.status', 'published')
            ->whereExists(fn ($query) => $query->selectRaw('1')->from('lessons')
                ->whereColumn('lessons.unit_id', 'units.id')->where('lessons.status', 'published'));
        $counts = [
            'materials' => (clone $materialQuery)->count(),
            'modules' => (clone $moduleQuery)->count(),
        ];
        if ($search !== '') {
            $materialQuery->where(function ($builder) use ($search) {
                $builder->where('lesson_blocks.title', 'like', "%{$search}%")
                    ->orWhere('lesson_blocks.latin', 'like', "%{$search}%")
                    ->orWhere('lesson_blocks.sundanese', 'like', "%{$search}%")
                    ->orWhere('lesson_blocks.translation', 'like', "%{$search}%");
            });
            $moduleQuery->where(function ($builder) use ($search) {
                $builder->where('units.title', 'like', "%{$search}%")
                    ->orWhere('units.description', 'like', "%{$search}%")
                    ->orWhere('learning_paths.title', 'like', "%{$search}%");
            });
        }
        $savedModules = $moduleQuery
            ->select('units.id', 'units.title', 'units.description', 'learning_paths.slug as path_slug', 'learning_paths.title as path_title', 'saved_units.created_at as saved_at')
            ->selectSub(DB::table('lessons')->selectRaw('COUNT(*)')->whereColumn('lessons.unit_id', 'units.id')->where('lessons.status', 'published'), 'lesson_count')
            ->selectSub(DB::table('lesson_progress')
                ->join('lessons', 'lessons.id', '=', 'lesson_progress.lesson_id')
                ->where('lesson_progress.user_id', $userId)
                ->where('lesson_progress.status', 'completed')
                ->where('lessons.status', 'published')
                ->whereColumn('lessons.unit_id', 'units.id')
                ->selectRaw('COUNT(*)'), 'completed_count')
            ->orderByDesc('saved_units.created_at')->paginate(12, ['*'], 'modules_page')->withQueryString();
        $savedMaterials = $materialQuery
            ->select('lesson_blocks.id', 'lesson_blocks.type', 'lesson_blocks.title', 'lesson_blocks.body', 'lesson_blocks.latin', 'lesson_blocks.sundanese', 'lesson_blocks.translation', 'lessons.id as lesson_id', 'lessons.title as lesson_title', 'learning_paths.title as path_title', 'saved_materials.created_at as saved_at')
            ->orderByDesc('saved_materials.created_at')->paginate(12)->withQueryString();

        return Inertia::render('learning/saved-materials', [
            'items' => $savedMaterials->items(),
            'modules' => $savedModules->items(),
            'search' => $search,
            'kind' => $kind,
            'counts' => $counts,
            'materialsPagination' => $this->paginationLinks($savedMaterials),
            'modulesPagination' => $this->paginationLinks($savedModules),
        ]);
    }

    public function saveModule(Request $request, Unit $unit): RedirectResponse
    {
        $unit->load('path');
        abort_unless($unit->status === 'published' && $unit->path->status === 'published', 404);
        abort_unless($unit->lessons()->where('status', 'published')->exists(), 404);

        DB::table('saved_units')->insertOrIgnore([
            'user_id' => $request->user()->id,
            'unit_id' => $unit->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back();
    }

    public function unsaveModule(Request $request, Unit $unit): RedirectResponse
    {
        DB::table('saved_units')->where('user_id', $request->user()->id)->where('unit_id', $unit->id)->delete();

        return back();
    }

    public function saveMaterial(Request $request, LessonBlock $block): RedirectResponse
    {
        $block->load('lesson.unit.path');
        abort_unless($block->lesson->status === 'published' && $block->lesson->unit->status === 'published' && $block->lesson->unit->path->status === 'published', 404);
        DB::table('saved_materials')->insertOrIgnore([
            'user_id' => $request->user()->id, 'lesson_block_id' => $block->id,
            'created_at' => now(), 'updated_at' => now(),
        ]);

        return back();
    }

    public function unsaveMaterial(Request $request, LessonBlock $block): RedirectResponse
    {
        DB::table('saved_materials')->where('user_id', $request->user()->id)->where('lesson_block_id', $block->id)->delete();

        return back();
    }

    public function search(Request $request): Response
    {
        $query = trim((string) $request->query('q', ''));
        $lessons = $query === '' ? null : Lesson::query()->where('status', 'published')
            ->whereHas('unit', fn ($builder) => $builder->where('status', 'published'))
            ->whereHas('unit.path', fn ($builder) => $builder->where('status', 'published'))
            ->where(fn ($builder) => $builder->where('title', 'like', "%{$query}%")
                ->orWhere('summary', 'like', "%{$query}%")
                ->orWhereHas('blocks', fn ($blocks) => $blocks->where('body', 'like', "%{$query}%")
                    ->orWhere('latin', 'like', "%{$query}%")
                    ->orWhere('sundanese', 'like', "%{$query}%")
                    ->orWhere('translation', 'like', "%{$query}%")))
            ->with('unit.path')->paginate(18)->withQueryString();

        return Inertia::render('learning/search', [
            'query' => $query,
            'lessons' => $lessons?->items() ?? [],
            'resultCount' => $lessons?->total() ?? 0,
            'pagination' => $lessons ? $this->paginationLinks($lessons) : ['previous' => null, 'next' => null, 'from' => 0, 'to' => 0, 'total' => 0],
        ]);
    }

    /**
     * @param  LengthAwarePaginator<int, mixed>  $paginator
     * @return array{previous: string|null, next: string|null, from: int, to: int, total: int}
     */
    private function paginationLinks(LengthAwarePaginator $paginator): array
    {
        return [
            'previous' => $paginator->previousPageUrl(),
            'next' => $paginator->nextPageUrl(),
            'from' => $paginator->firstItem() ?? 0,
            'to' => $paginator->lastItem() ?? 0,
            'total' => $paginator->total(),
        ];
    }
}
