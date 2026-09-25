<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\DemoAccountsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class DemoAccountsSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_demo_accounts_are_verified_and_have_the_correct_access(): void
    {
        $this->seed(DemoAccountsSeeder::class);

        $admin = User::query()->where('email', 'admin.demo@example.test')->firstOrFail();
        $student = User::query()->where('email', 'pelajar.demo@example.test')->firstOrFail();

        $this->assertSame('admin', $admin->role);
        $this->assertSame('pelajar', $student->role);
        $this->assertNotNull($admin->email_verified_at);
        $this->assertNotNull($student->email_verified_at);
        $this->assertTrue(Hash::check(config('demo.account_password'), $admin->password));
        $this->assertTrue(Hash::check(config('demo.account_password'), $student->password));
        $this->actingAs($admin)->get(route('admin.index'))->assertOk();
        $this->actingAs($student)->get(route('admin.index'))->assertRedirect(route('dashboard'));
    }

    public function test_reseeding_does_not_reset_existing_passwords_or_create_duplicates(): void
    {
        $this->seed(DemoAccountsSeeder::class);
        $admin = User::query()->where('email', 'admin.demo@example.test')->firstOrFail();
        $admin->password = Hash::make('KataSandiBaru123!');
        $admin->save();

        $this->seed(DemoAccountsSeeder::class);

        $this->assertSame(2, User::query()->count());
        $this->assertTrue(Hash::check('KataSandiBaru123!', $admin->fresh()->password));
    }
}
