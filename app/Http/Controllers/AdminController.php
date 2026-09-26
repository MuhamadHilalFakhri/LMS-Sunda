<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AdminController extends Controller
{
    use AdminAssessmentActions;
    use AdminContentActions;
    use AdminDataActions;
    use AdminTutorActions;
    use AdminUserActions;

    private function authorizeAdmin(Request $request): void
    {
        abort_unless($request->user()?->role === 'admin', 403);
    }
}
