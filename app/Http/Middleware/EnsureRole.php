<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        if ($request->user()?->role !== $role) {
            $home = match ($request->user()?->role) {
                'admin' => 'admin.index',
                'pelajar' => 'dashboard',
                default => null,
            };

            if ($home && $request->isMethod('GET') && ! $request->expectsJson()) {
                return redirect()->route($home);
            }

            abort(403);
        }

        return $next($request);
    }
}
