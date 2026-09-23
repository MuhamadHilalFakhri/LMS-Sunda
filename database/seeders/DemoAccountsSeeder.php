<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoAccountsSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            return;
        }

        foreach ([
            ['name' => 'Admin Demo', 'email' => 'admin.demo@example.test', 'role' => 'admin'],
            ['name' => 'Pelajar Demo', 'email' => 'pelajar.demo@example.test', 'role' => 'pelajar'],
        ] as $account) {
            if (User::query()->where('email', $account['email'])->exists()) {
                continue;
            }

            User::factory()->create([
                ...$account,
                'email_verified_at' => now(),
                'password' => Hash::make(config('demo.account_password')),
            ]);
        }
    }
}
