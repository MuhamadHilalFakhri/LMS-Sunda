<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Laravel\Fortify\Contracts\TwoFactorLoginResponse;

class RoleBasedTwoFactorLoginResponse implements TwoFactorLoginResponse
{
    public function toResponse($request)
    {
        if ($request->wantsJson()) {
            return new JsonResponse('', 204);
        }

        return $request->user()?->role === 'admin'
            ? redirect()->route('admin.index')
            : redirect()->intended(route('dashboard'));
    }
}
