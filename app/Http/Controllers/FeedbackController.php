<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class FeedbackController extends Controller
{
    public function index(Request $request): Response
    {
        $feedback = DB::table('learner_feedback')->where('user_id', $request->user()->id)
            ->orderByDesc('created_at')->limit(20)->get(['id', 'category', 'message', 'status', 'created_at']);

        return Inertia::render('learning/feedback', ['feedback' => $feedback]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'category' => 'required|in:content,bug,idea,other',
            'message' => 'required|string|min:10|max:2000',
            'page' => 'nullable|string|max:255',
        ]);

        DB::table('learner_feedback')->insert([
            'user_id' => $request->user()->id,
            'category' => $data['category'],
            'message' => trim($data['message']),
            'page' => $data['page'] ?? null,
            'status' => 'new',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back();
    }
}
