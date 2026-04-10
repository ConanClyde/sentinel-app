<?php

use App\Enums\UserRole;
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
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/admin.php';
