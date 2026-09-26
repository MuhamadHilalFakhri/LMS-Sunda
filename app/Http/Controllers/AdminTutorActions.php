<?php

namespace App\Http\Controllers;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

trait AdminTutorActions
{
    public function updateTutorSettings(Request $request): RedirectResponse
    {
        $this->authorizeAdmin($request);
        $data = $request->validate([
            'api_url' => 'required|url:http,https|max:255',
            'model' => 'required|string|max:100',
            'api_key' => 'nullable|string|max:4000',
            'clear_api_key' => 'sometimes|boolean',
            'enabled' => 'required|boolean',
            'response_language' => ['required', Rule::in(['user', 'id', 'su'])],
            'response_style' => ['required', Rule::in(['warm', 'concise', 'step_by_step'])],
            'max_tokens' => 'required|integer|min:100|max:1500',
        ]);
        $current = DB::table('ai_tutor_settings')->where('id', 1)->first();
        $apiKey = filled($data['api_key'] ?? null)
            ? Crypt::encryptString($data['api_key'])
            : (($data['clear_api_key'] ?? false) ? null : ($current->api_key_encrypted ?? null));
        unset($data['api_key']);
        unset($data['clear_api_key']);

        DB::table('ai_tutor_settings')->updateOrInsert(
            ['id' => 1],
            [...$data, 'api_key_encrypted' => $apiKey, 'created_at' => $current->created_at ?? now(), 'updated_at' => now()],
        );

        return back();
    }

    public function testTutorSettings(Request $request): RedirectResponse
    {
        $this->authorizeAdmin($request);
        $data = $request->validate([
            'api_url' => 'required|url:http,https|max:255',
            'model' => 'required|string|max:100',
            'api_key' => 'nullable|string|max:4000',
            'clear_api_key' => 'sometimes|boolean',
        ]);

        $settings = DB::table('ai_tutor_settings')->where('id', 1)->first();
        $apiKey = filled($data['api_key'] ?? null) ? $data['api_key'] : null;
        if (! $apiKey && ! ($data['clear_api_key'] ?? false) && $settings?->api_key_encrypted) {
            try {
                $apiKey = Crypt::decryptString($settings->api_key_encrypted);
            } catch (\Throwable $error) {
                report($error);
            }
        }
        $apiKey = $apiKey ?: config('services.tutor.key');
        if (! filled($apiKey)) {
            return $this->tutorTestToast('warning', 'Masukkan API key atau konfigurasi kunci di server sebelum menguji koneksi.');
        }

        try {
            $response = Http::withToken($apiKey)->timeout(15)->withOptions(['allow_redirects' => false])->post(rtrim($data['api_url'], '/').'/chat/completions', [
                'model' => $data['model'],
                'max_tokens' => 8,
                'messages' => [
                    ['role' => 'system', 'content' => 'Balas tepat dengan kata SAWALA.'],
                    ['role' => 'user', 'content' => 'SAWALA'],
                ],
            ]);

            if (! $response->successful()) {
                $message = match ($response->status()) {
                    401, 403 => 'Koneksi ditolak penyedia AI. Periksa API key dan izin model.',
                    404 => 'Endpoint tidak ditemukan. Periksa URL API; URL dasar harus menyediakan /chat/completions.',
                    429 => 'Penyedia AI membatasi permintaan. Periksa kuota atau coba lagi nanti.',
                    default => 'Penyedia AI mengembalikan respons gagal. Periksa URL, model, API key, atau kuota akun.',
                };

                return $this->tutorTestToast('error', $message);
            }

            if (! filled($response->json('choices.0.message.content'))) {
                return $this->tutorTestToast('error', 'Penyedia merespons, tetapi format jawabannya tidak sesuai API chat completions.');
            }
        } catch (ConnectionException) {
            return $this->tutorTestToast('error', 'Server tidak dapat terhubung ke penyedia AI. Periksa URL dan koneksi server.');
        }

        return $this->tutorTestToast('success', 'Koneksi penyedia AI berhasil. Pengaturan ini belum disimpan.');
    }

    private function tutorTestToast(string $type, string $message): RedirectResponse
    {
        Inertia::flash('toast', ['type' => $type, 'message' => $message]);

        return back();
    }
}
