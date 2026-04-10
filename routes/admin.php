<?php

use App\Http\Controllers\Admin\PendingRegistrationController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\AdminVehicleController;
use App\Http\Controllers\Admin\AdminReportsController;
use App\Http\Controllers\Admin\AdminStickersController;
use App\Http\Controllers\Admin\AdminMapController;
use App\Http\Controllers\Admin\AdminPatrolController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

Route::middleware(['auth', 'role:Administrator'])->group(function () {
    Route::get('pending-registrations', [PendingRegistrationController::class, 'index'])
        ->name('admin.pending-registrations.index');

    Route::get('pending-registrations/{id}', [PendingRegistrationController::class, 'show'])
        ->name('admin.pending-registrations.show');

    Route::post('pending-registrations/{id}/approve', [PendingRegistrationController::class, 'approve'])
        ->name('admin.pending-registrations.approve');

    Route::post('pending-registrations/{id}/reject', [PendingRegistrationController::class, 'reject'])
        ->name('admin.pending-registrations.reject');

    Route::delete('pending-registrations/{id}', [PendingRegistrationController::class, 'destroy'])
        ->name('admin.pending-registrations.destroy');

    // User Management
    Route::get('users', [AdminUserController::class, 'index'])
        ->name('admin.users.index');
    Route::get('users/{id}', [AdminUserController::class, 'show'])
        ->name('admin.users.show');

    // Vehicle Registry
    Route::get('vehicles', [AdminVehicleController::class, 'index'])
        ->name('admin.vehicles.index');

    // Reports
    Route::get('reports', [AdminReportsController::class, 'index'])
        ->name('admin.reports.index');

    // Stickers
    Route::get('stickers', [AdminStickersController::class, 'index'])
        ->name('admin.stickers.index');

    // Campus Map
    Route::get('map', [AdminMapController::class, 'index'])
        ->name('admin.map.index');

    // Patrol Monitor
    Route::get('patrol', [AdminPatrolController::class, 'index'])
        ->name('admin.patrol.index');

    // Secure File Access
    Route::get('files/{path}', function ($path) {
        $path = str_replace('|', '/', $path);
        if (!Storage::disk('private')->exists($path)) {
            abort(404);
        }
        return Storage::disk('private')->response($path);
    })->where('path', '.*')->name('admin.files.show');
});
