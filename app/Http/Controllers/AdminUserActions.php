<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Throwable;

trait AdminUserActions
{
    public function storeUser(Request $request): RedirectResponse
    {
        $this->authorizeAdmin($request);
        $request->merge([
            'name' => trim((string) $request->input('name')),
            'email' => mb_strtolower(trim((string) $request->input('email'))),
        ]);
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'role' => ['required', Rule::in(['pelajar', 'admin'])],
            'password' => ['required', 'confirmed', 'string', 'min:8'],
        ]);

        $user = new User;
        $user->forceFill([
            'name' => trim($data['name']),
            'email' => mb_strtolower(trim($data['email'])),
            'role' => $data['role'],
            'password' => Hash::make($data['password']),
            'is_active' => true,
            'email_verified_at' => null,
        ])->save();

        try {
            $user->sendEmailVerificationNotification();
        } catch (Throwable $error) {
            report($error);

            return $this->userToast('warning', 'Akun dibuat, tetapi email verifikasi belum dapat dikirim. Coba kirim ulang dari menu tindakan pengguna.');
        }

        return $this->userToast('success', 'Akun pengguna berhasil dibuat. Tautan verifikasi dikirim ke email pengguna.');
    }

    public function updateUser(Request $request, User $user): RedirectResponse
    {
        $this->authorizeAdmin($request);
        $request->merge([
            'name' => trim((string) $request->input('name')),
            'email' => mb_strtolower(trim((string) $request->input('email'))),
        ]);
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'role' => ['required', Rule::in(['pelajar', 'admin'])],
        ]);
        $emailChanged = mb_strtolower(trim($data['email'])) !== mb_strtolower($user->email);

        if ($user->is($request->user()) && $data['role'] !== 'admin') {
            throw ValidationException::withMessages([
                'role' => 'Anda tidak dapat menghapus peran admin dari akun yang sedang digunakan.',
            ]);
        }

        DB::transaction(function () use ($user, $data, $emailChanged): void {
            $lockedUser = User::query()->lockForUpdate()->findOrFail($user->id);
            $this->ensureActiveAdminRemains($lockedUser, $data['role'], $lockedUser->is_active, 'role');
            $lockedUser->forceFill([
                'name' => trim($data['name']),
                'email' => mb_strtolower(trim($data['email'])),
                'role' => $data['role'],
                ...($emailChanged ? ['email_verified_at' => null] : []),
            ])->save();
        });

        if ($emailChanged) {
            try {
                $user->refresh()->sendEmailVerificationNotification();
            } catch (Throwable $error) {
                report($error);

                return $this->userToast('warning', 'Perubahan akun tersimpan, tetapi email verifikasi belum dapat dikirim.');
            }
        }

        return $this->userToast(
            'success',
            $emailChanged
                ? 'Data pengguna diperbarui. Email baru perlu diverifikasi.'
                : 'Data pengguna berhasil diperbarui.',
        );
    }

    public function updateUserStatus(Request $request, User $user): RedirectResponse
    {
        $this->authorizeAdmin($request);
        $data = $request->validate(['is_active' => 'required|boolean']);
        $isActive = (bool) $data['is_active'];

        if ($user->is($request->user()) && ! $isActive) {
            throw ValidationException::withMessages([
                'is_active' => 'Anda tidak dapat menonaktifkan akun yang sedang digunakan.',
            ]);
        }

        DB::transaction(function () use ($user, $isActive): void {
            $lockedUser = User::query()->lockForUpdate()->findOrFail($user->id);
            $this->ensureActiveAdminRemains($lockedUser, $lockedUser->role, $isActive, 'is_active');
            $lockedUser->forceFill(['is_active' => $isActive])->save();

            if (! $isActive && config('session.driver') === 'database') {
                DB::table('sessions')->where('user_id', $lockedUser->id)->delete();
            }
        });

        return $this->userToast(
            'success',
            $isActive ? 'Akun pengguna diaktifkan.' : 'Akun pengguna dinonaktifkan.',
        );
    }

    public function sendUserPasswordReset(Request $request, User $user): RedirectResponse
    {
        $this->authorizeAdmin($request);

        try {
            $status = Password::sendResetLink(['email' => $user->email]);
        } catch (Throwable $error) {
            report($error);

            return $this->userToast('error', 'Tautan reset kata sandi gagal dikirim. Periksa konfigurasi email server.');
        }

        return $status === Password::RESET_LINK_SENT
            ? $this->userToast('success', 'Tautan reset kata sandi dikirim ke email pengguna.')
            : $this->userToast('error', 'Tautan reset kata sandi tidak dapat dikirim. Coba lagi beberapa saat.');
    }

    public function sendUserVerification(Request $request, User $user): RedirectResponse
    {
        $this->authorizeAdmin($request);

        if ($user->hasVerifiedEmail()) {
            return $this->userToast('info', 'Email pengguna sudah terverifikasi.');
        }

        try {
            $user->sendEmailVerificationNotification();
        } catch (Throwable $error) {
            report($error);

            return $this->userToast('error', 'Email verifikasi gagal dikirim. Periksa konfigurasi email server.');
        }

        return $this->userToast('success', 'Tautan verifikasi dikirim ke email pengguna.');
    }

    public function deleteUser(Request $request, User $user): RedirectResponse
    {
        $this->authorizeAdmin($request);

        abort_if($user->is($request->user()), 403, 'Anda tidak dapat menghapus akun yang sedang digunakan.');

        DB::transaction(function () use ($user): void {
            $lockedUser = User::query()->lockForUpdate()->findOrFail($user->id);
            $this->ensureActiveAdminRemains($lockedUser, 'pelajar', false, 'user');

            if (config('session.driver') === 'database') {
                DB::table('sessions')->where('user_id', $lockedUser->id)->delete();
            }

            DB::table('password_reset_tokens')->where('email', $lockedUser->email)->delete();
            $lockedUser->delete();
        });

        return back();
    }

    private function ensureActiveAdminRemains(User $user, string $newRole, bool $newStatus, string $field): void
    {
        if ($user->role !== 'admin' || ! $user->is_active || ($newRole === 'admin' && $newStatus)) {
            return;
        }

        $activeAdmins = User::query()
            ->where('role', 'admin')
            ->where('is_active', true)
            ->lockForUpdate()
            ->pluck('id');

        if ($activeAdmins->count() <= 1) {
            throw ValidationException::withMessages([
                $field => 'Aksi ditolak karena setidaknya satu admin aktif harus tetap tersedia.',
            ]);
        }
    }

    private function userToast(string $type, string $message): RedirectResponse
    {
        Inertia::flash('toast', ['type' => $type, 'message' => $message]);

        return back();
    }
}
