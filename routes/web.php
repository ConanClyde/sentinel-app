<?php

use App\Enums\UserRole;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminReportsController;
use App\Http\Controllers\Admin\AdminVehicleController;
use App\Http\Controllers\Admin\MapLocationController;
use App\Http\Controllers\OperationController;
use App\Http\Controllers\Security\SecurityController;
use App\Http\Controllers\SecurityDashboardController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\StickerController;
use App\Http\Controllers\ViolationController;
use App\Models\StickerColor;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleViolation;
use App\Services\StickerService;
use chillerlan\QRCode\QRCode;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'initialStats' => [
            'users' => User::where('status', 'active')->count(),
            'vehicles' => Vehicle::where('is_active', true)->count(),
            'violations' => VehicleViolation::where('status', 'approved')->count(),
        ],
    ]);
})->name('welcome');

if (app()->environment('local')) {
    // Test route to generate example sticker (local only)
    Route::get('/test-sticker', function () {
        $service = new StickerService;

        $color = StickerColor::first();
        if (! $color) {
            $color = StickerColor::create(['name' => 'Blue', 'hex_code' => '#007BFF']);
        }

        $stickerNumber = $service->generateStickerNumber($color);

        $vehicle = new Vehicle([
            'sticker_number' => $stickerNumber,
            'sticker_color_id' => $color->id,
            'expires_at' => now()->addYears(4),
        ]);
        $vehicle->setRelation('stickerColor', $color);

        $user = new User([
            'first_name' => 'John',
            'surname' => 'Doe',
        ]);

        $svgPath = $service->generateSticker($vehicle, $user);
        $svgContent = Storage::disk('public')->get($svgPath);

        return response($svgContent, 200, ['Content-Type' => 'image/svg+xml']);
    });

    Route::get('/test-qr', function () {
        $qr = new QRCode;
        $svg = $qr->render('https://example.com');

        return response($svg, 200, ['Content-Type' => 'image/svg+xml']);
    });
}

// Sticker file access (authenticated users only)
Route::get('/stickers/{userId}/{filename}', [StickerController::class, 'show'])
    ->middleware('auth')
    ->name('sticker.show');

// User private file access (authenticated users only)
Route::get('/storage/users/{userId}/{filename}', function (string $userId, string $filename) {
    /** @var User|null $user */
    $user = Auth::user();

    // Only administrators, security personnel, department officers with view_users, or the owner can access their files
    if (! $user) {
        abort(403, 'Unauthorized access.');
    }

    $isDeptOfficerWithViewUsers = $user->role === UserRole::DEPARTMENT_OFFICER && $user->can('view_users');

    if (
        $user->role !== UserRole::ADMINISTRATOR &&
        $user->role !== UserRole::SECURITY_PERSONNEL &&
        ! $isDeptOfficerWithViewUsers &&
        (string) $user->id !== $userId
    ) {
        abort(403, 'Unauthorized access.');
    }

    $path = "users/{$userId}/{$filename}";
    /** @var FilesystemAdapter $disk */
    $disk = Storage::disk('private');

    if (! $disk->exists($path)) {
        abort(404);
    }

    $content = $disk->get($path);
    $mimeType = (string) $disk->mimeType($path);

    return response($content, 200, [
        'Content-Type' => $mimeType,
        'Content-Disposition' => 'inline; filename="'.$filename.'"',
    ]);
})->middleware('auth')->name('user.file.show');

// Violation evidence file access (authenticated users only)
Route::get('/storage/violations/evidence/{filename}', function (string $filename) {
    /** @var User|null $user */
    $user = Auth::user();

    if (! $user) {
        abort(403, 'Unauthorized access.');
    }

    $path = "violations/evidence/{$filename}";
    /** @var FilesystemAdapter $disk */
    $disk = Storage::disk('private');

    if (! $disk->exists($path)) {
        abort(404);
    }

    $content = $disk->get($path);
    $mimeType = (string) $disk->mimeType($path);

    return response($content, 200, [
        'Content-Type' => $mimeType,
        'Content-Disposition' => 'inline; filename="'.$filename.'"',
    ]);
})->middleware('auth')->name('violation.evidence.show');

Route::middleware(['auth', 'kiosk'])->group(function () {
    // Unified Dashboard for all roles
    Route::get('dashboard', function () {
        /** @var User|null $user */
        $user = Auth::user();
        $role = $user?->role;

        return match ($role) {
            UserRole::ADMINISTRATOR => (new AdminDashboardController)->index(),
            UserRole::DEPARTMENT_OFFICER => (new \App\Http\Controllers\Admin\DepartmentDashboardController)->index(),
            UserRole::STUDENT, UserRole::STAFF, UserRole::STAKEHOLDER => Inertia::render('shared/dashboard'),
            UserRole::SECURITY_PERSONNEL => (new SecurityDashboardController)->index(),
            UserRole::REPORTER => Inertia::render('reporter/dashboard'),
            default => Inertia::render('dashboard'),
        };
    })->name('dashboard');

    Route::get('profile', [ProfileController::class, 'edit'])->name('profile');
    Route::patch('profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings', function () {
        return Inertia::render('settings');
    })->name('settings');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');
    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance');

    Route::put('settings/password', [PasswordController::class, 'update'])->name('password.update');

    // Shared Operations
    Route::name('shared.')->group(function () {
        Route::get('vehicles', [OperationController::class, 'vehicles'])->name('vehicles');

        // Admin-only vehicle management (using the same URI /vehicles)
        Route::middleware(['role:Administrator'])->group(function () {
            Route::post('vehicles', [AdminVehicleController::class, 'store'])
                ->middleware('permission:create_vehicle')
                ->name('vehicles.store');

            Route::delete('vehicles/{vehicle}', [AdminVehicleController::class, 'destroy'])
                ->middleware('permission:delete_vehicle')
                ->name('vehicles.destroy');
        });

        // User vehicle requests (non-admin)
        Route::post('vehicle-requests', [App\Http\Controllers\VehicleRequestController::class, 'store'])
            ->name('vehicle-requests.store');

        Route::get('sticker-requests', [OperationController::class, 'stickerRequests'])->name('sticker-requests');
        Route::post('sticker-requests', [App\Http\Controllers\StickerRequestController::class, 'store'])
            ->name('sticker-requests.store');
        Route::get('map', [OperationController::class, 'map'])->name('map');
        Route::get('api/map/locations', [MapLocationController::class, 'getLocations'])
            ->middleware('throttle:map_api')
            ->name('api.map.locations');
        Route::get('api/map/types', [MapLocationController::class, 'getTypes'])
            ->middleware('throttle:map_api')
            ->name('api.map.types');

        Route::get('report', [OperationController::class, 'report'])->name('report');
        Route::get('my-reports', [OperationController::class, 'myReports'])->name('my-reports');
        Route::get('report-history', [OperationController::class, 'reportHistory'])
            ->middleware('role:Student,Staff,Stakeholder,Security Personnel')
            ->name('report-history');
        Route::get('identify', [OperationController::class, 'identify'])->name('identify');
    });

    // Security Operations (Patrol Routes)
    Route::middleware(['role:Security Personnel'])->group(function () {
        Route::get('patrol-scan', [SecurityController::class, 'scan'])->name('security.scan');
        Route::get('patrol-history', [SecurityController::class, 'history'])->name('security.history');

        // API routes
        Route::post('api/patrol/check-in', [SecurityController::class, 'checkIn'])->name('api.patrol.check-in');
        Route::get('api/patrol/history', [SecurityController::class, 'getHistory'])->name('api.patrol.history');

        Route::get('patrol/check-in/{location}', [SecurityController::class, 'patrolCheckin'])->name('security.patrol.checkin');
    });

    // Reporter Operations
    Route::middleware(['role:Reporter'])->prefix('reporter')->name('reporter.')->group(function () {});

    // Violation Reporting
    Route::post('violations', [ViolationController::class, 'store'])
        ->middleware(['permission:create_report', 'throttle:reports'])
        ->name('violations.store');

    Route::put('violations/{violation}/status', [ViolationController::class, 'updateStatus'])
        ->middleware('permission:manage_reports')
        ->name('violations.update-status');

    // Notification API
    Route::get('api/notifications', [App\Http\Controllers\NotificationController::class, 'index'])->name('api.notifications.index');
    Route::post('api/notifications/{notification}/read', [App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('api.notifications.read');
    Route::post('api/notifications/read-all', [App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('api.notifications.read-all');
    Route::delete('api/notifications/{notification}', [App\Http\Controllers\NotificationController::class, 'delete'])->name('api.notifications.delete');

});

require __DIR__.'/auth.php';

require __DIR__.'/admin.php';
