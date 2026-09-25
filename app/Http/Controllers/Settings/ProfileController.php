<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileDeleteRequest;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Http\Requests\Settings\TwoFactorAuthenticationRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(TwoFactorAuthenticationRequest $request): Response
    {
        $user = $request->user();
        $canManageTwoFactor = Features::canManageTwoFactorAuthentication();
        $canManagePasskeys = Features::canManagePasskeys();

        if ($canManageTwoFactor) {
            $request->ensureStateIsValid();
        }

        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'canManageTwoFactor' => $canManageTwoFactor,
            'canManagePasskeys' => $canManagePasskeys,
            'passkeys' => $canManagePasskeys
                ? $user->passkeys()
                    ->select(['id', 'name', 'credential', 'created_at', 'last_used_at'])
                    ->latest()
                    ->get()
                    ->map(fn ($passkey) => [
                        'id' => $passkey->id,
                        'name' => $passkey->name,
                        'authenticator' => $passkey->authenticator,
                        'created_at_diff' => $passkey->created_at->diffForHumans(),
                        'last_used_at_diff' => $passkey->last_used_at?->diffForHumans(),
                    ])
                    ->values()
                    ->all()
                : [],
            'passwordRules' => Password::defaults()->toPasswordRulesString(),
            'twoFactorEnabled' => $canManageTwoFactor && $user->hasEnabledTwoFactorAuthentication(),
            'requiresConfirmation' => $canManageTwoFactor
                && Features::optionEnabled(Features::twoFactorAuthentication(), 'confirm'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $request->user()->ui_locale === 'su' ? 'Profil parantos dirobih.' : 'Profil berhasil diperbarui.',
        ]);

        return to_route('profile.edit');
    }

    public function updateLanguage(Request $request): RedirectResponse
    {
        $data = $request->validate(['ui_locale' => ['required', Rule::in(['id', 'su'])]]);
        $request->user()->forceFill(['ui_locale' => $data['ui_locale']])->save();

        return back();
    }

    /**
     * Delete the user's profile.
     */
    public function destroy(ProfileDeleteRequest $request): RedirectResponse
    {
        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
