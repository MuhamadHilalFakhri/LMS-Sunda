<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\LoginResponse;

class RoleBasedLoginResponse implements LoginResponse
{
    public function toResponse($request)
    {
        if ($request->wantsJson()) {
            return response()->json(['two_factor' => false]);
        }

        return $request->user()?->role === 'admin'
            ? redirect()->route('admin.index')
            : redirect()->intended(route('dashboard'));
    }
}
