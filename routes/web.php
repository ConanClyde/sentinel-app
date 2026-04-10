<?php

use App\Enums\UserRole;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\PasswordController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

use App\Http\Controllers\Admin\AdminDashboardController;

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        $user = auth()->user();
        $role = $user?->role;

        // Role-based dashboard routing (Keeping URL at /dashboard)
        return match ($role) {
            UserRole::ADMINISTRATOR => (new AdminDashboardController())->index(),
            UserRole::STUDENT => Inertia::render('student/dashboard'),
            UserRole::STAFF => Inertia::render('staff/dashboard'),
            UserRole::STAKEHOLDER => Inertia::render('stakeholder/dashboard'),
            UserRole::SECURITY => Inertia::render('security/dashboard'),
            UserRole::REPORTER => Inertia::render('reporter/dashboard'),
            UserRole::DEPARTMENT => Inertia::render('department/dashboard'),
            default => Inertia::render('dashboard'),
        };
    })->name('dashboard');

    Route::get('profile', [ProfileController::class, 'edit'])->name('profile');
    Route::patch('profile', [ProfileController::class, 'update'])->name('profile.update');

    Route::get('settings', function () {
        return Inertia::render('settings');
    })->name('settings');

    Route::put('settings/password', [PasswordController::class, 'update'])->name('password.update');
});

require __DIR__.'/auth.php';
require __DIR__.'/admin.php';
