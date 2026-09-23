<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\LearningController;
use App\Http\Controllers\TutorController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified', 'role:pelajar'])->group(function () {
    Route::get('dashboard', [LearningController::class, 'home'])->name('dashboard');
    Route::get('kelas/{path}', [LearningController::class, 'path'])->name('paths.show');
    Route::get('jalur/{path}', fn (string $path) => redirect()->route('paths.show', ['path' => $path], 301));
    Route::get('belajar/{path:slug}', [LearningController::class, 'path'])->name('paths.by-slug');
    Route::get('pelajaran/{lesson}', [LearningController::class, 'lesson'])->name('lessons.show');
    Route::post('pelajaran/{lesson}/selesai', [LearningController::class, 'complete'])->name('lessons.complete');
    Route::get('latihan/{exercise}', [LearningController::class, 'exercise'])->name('exercises.show');
    Route::post('latihan/{exercise}', [LearningController::class, 'submit'])->name('exercises.submit');
    Route::get('hasil/{attempt}', [LearningController::class, 'result'])->name('attempts.show');
    Route::get('progres', [LearningController::class, 'progress'])->name('progress');
    Route::get('latihan-aksara', [LearningController::class, 'scriptExercises'])->name('script.exercises');
    Route::get('cari', [LearningController::class, 'search'])->name('learning.search');
    Route::get('tutor', [TutorController::class, 'index'])->name('tutor');
    Route::post('tutor', [TutorController::class, 'ask'])->middleware('throttle:10,60')->name('tutor.ask');
});

Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    Route::get('admin', [AdminController::class, 'index'])->name('admin.index');
    Route::post('admin/paths', [AdminController::class, 'storePath']);
    Route::put('admin/paths/{path}', [AdminController::class, 'updatePath']);
    Route::post('admin/units', [AdminController::class, 'storeUnit']);
    Route::put('admin/units/{unit}', [AdminController::class, 'updateUnit']);
    Route::post('admin/lessons', [AdminController::class, 'storeLesson']);
    Route::put('admin/lessons/{lesson}', [AdminController::class, 'updateLesson']);
    Route::post('admin/blocks', [AdminController::class, 'storeBlock']);
    Route::put('admin/blocks/{block}', [AdminController::class, 'updateBlock']);
    Route::post('admin/exercises', [AdminController::class, 'storeExercise']);
    Route::put('admin/exercises/{exercise}', [AdminController::class, 'updateExercise']);
    Route::post('admin/questions', [AdminController::class, 'storeQuestion']);
    Route::put('admin/questions/{question}', [AdminController::class, 'updateQuestion']);
    Route::delete('admin/{type}/{id}', [AdminController::class, 'destroy']);
});

require __DIR__.'/settings.php';
