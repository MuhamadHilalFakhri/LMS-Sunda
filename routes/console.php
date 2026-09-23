<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('admin:promote {email}', function (string $email) {
    $updated = DB::table('users')->where('email', $email)->update(['role' => 'admin', 'updated_at' => now()]);
    $updated ? $this->info('Akun berhasil diberi peran Admin.') : $this->error('Akun belum ditemukan. Daftarkan akun terlebih dahulu.');
})->purpose('Promosikan akun terdaftar menjadi admin');
