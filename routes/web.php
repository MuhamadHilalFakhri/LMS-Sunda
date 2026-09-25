<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\LearningController;
use App\Http\Controllers\TutorController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified', 'role:pelajar'])->group(function () {
    Route::get('dashboard', [LearningController::class, 'home'])->name('dashboard');
    Route::patch('target-belajar', [LearningController::class, 'updateGoal'])->name('learning.goal.update');
    Route::get('kelas/{path}', [LearningController::class, 'path'])->name('paths.show');
    Route::get('jalur/{path}', fn (string $path) => redirect()->route('paths.show', ['path' => $path], 301));
    Route::get('belajar/{path:slug}', [LearningController::class, 'path'])->name('paths.by-slug');
    Route::get('pelajaran/{lesson}', [LearningController::class, 'lesson'])->name('lessons.show');
    Route::post('pelajaran/{lesson}/selesai', [LearningController::class, 'complete'])->name('lessons.complete');
    Route::get('latihan/{exercise}', [LearningController::class, 'exercise'])->name('exercises.show');
    Route::post('latihan/{exercise}', [LearningController::class, 'submit'])->name('exercises.submit');
    Route::get('kuis', [LearningController::class, 'quizzes'])->name('quizzes.index');
    Route::get('kuis/{exercise}', [LearningController::class, 'quiz'])->name('quizzes.show');
    Route::post('kuis/{exercise}', [LearningController::class, 'submitQuiz'])->name('quizzes.submit');
    Route::get('hasil/{attempt}', [LearningController::class, 'result'])->name('attempts.show');
    Route::get('progres', [LearningController::class, 'progress'])->name('progress');
    Route::get('ulasan', [LearningController::class, 'review'])->name('learning.review');
    Route::get('ulangan', [LearningController::class, 'spacedReview'])->name('learning.spaced-review');
    Route::post('ulangan/{block}', [LearningController::class, 'submitSpacedReview'])->name('learning.spaced-review.submit');
    Route::get('materi-tersimpan', [LearningController::class, 'savedMaterials'])->name('saved-materials.index');
    Route::post('materi-tersimpan/{block}', [LearningController::class, 'saveMaterial'])->name('saved-materials.store');
    Route::delete('materi-tersimpan/{block}', [LearningController::class, 'unsaveMaterial'])->name('saved-materials.destroy');
    Route::inertia('aksara-sunda/kumpulan', 'learning/characters')->name('characters.index');
    Route::get('latihan-aksara', [LearningController::class, 'scriptExercises'])->name('script.exercises');
    Route::get('cari', [LearningController::class, 'search'])->name('learning.search');
    Route::get('tutor', [TutorController::class, 'index'])->name('tutor');
    Route::post('tutor', [TutorController::class, 'ask'])->middleware('throttle:10,60')->name('tutor.ask');
    Route::delete('tutor', [TutorController::class, 'clear'])->name('tutor.clear');
    Route::get('umpan-balik', [FeedbackController::class, 'index'])->name('feedback.index');
    Route::post('umpan-balik', [FeedbackController::class, 'store'])->middleware('throttle:5,10')->name('feedback.store');
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
    Route::put('admin/blocks/{block}/audio', [AdminController::class, 'updateBlockAudio']);
    Route::post('admin/exercises', [AdminController::class, 'storeExercise']);
    Route::post('admin/quizzes', [AdminController::class, 'storeQuiz'])->name('admin.quizzes.store');
    Route::put('admin/exercises/{exercise}', [AdminController::class, 'updateExercise']);
    Route::post('admin/questions', [AdminController::class, 'storeQuestion']);
    Route::put('admin/questions/{question}', [AdminController::class, 'updateQuestion']);
    Route::put('admin/tutor-settings', [AdminController::class, 'updateTutorSettings'])->name('admin.tutor-settings.update');
    Route::post('admin/tutor-settings/test', [AdminController::class, 'testTutorSettings'])->middleware('throttle:5,1')->name('admin.tutor-settings.test');
    Route::put('admin/feedback/{feedback}', [AdminController::class, 'updateFeedback'])->name('admin.feedback.update');
    Route::delete('admin/{type}/{id}', [AdminController::class, 'destroy']);
});

require __DIR__.'/settings.php';
