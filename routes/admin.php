<?php

use App\Http\Controllers\Admin\AdminConfigController;
use App\Http\Controllers\Admin\AdminInvoiceController;
use App\Http\Controllers\Admin\AdminPatrolController;
use App\Http\Controllers\Admin\AdminRegistrationController;
use App\Http\Controllers\Admin\AdminReportsController;
use App\Http\Controllers\Admin\AdminStickersController;
use App\Http\Controllers\Admin\AdminStickerRequestController;
use App\Http\Controllers\Admin\AdminVehicleRequestController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\MapLocationController;
use App\Http\Controllers\Admin\PendingRegistrationController;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

Route::middleware(['auth', 'role:Administrator,Department Officer', 'kiosk'])->group(function () {
    Route::middleware('permission:view_registrations')->group(function () {
        Route::get('pending-approvals', [PendingRegistrationController::class, 'index'])
            ->name('admin.pending-approvals.index');

        Route::get('pending-approvals/{id}', [PendingRegistrationController::class, 'show'])
            ->name('admin.pending-approvals.show');
    });

    Route::post('pending-approvals/{id}/approve', [PendingRegistrationController::class, 'approve'])
        ->middleware('permission:approve_registration')
        ->name('admin.pending-approvals.approve');

    Route::post('pending-approvals/{id}/reject', [PendingRegistrationController::class, 'reject'])
        ->middleware('permission:reject_registration')
        ->name('admin.pending-approvals.reject');

    Route::delete('pending-approvals/{id}', [PendingRegistrationController::class, 'destroy'])
        ->middleware('permission:reject_registration')
        ->name('admin.pending-approvals.destroy');

    Route::middleware('permission:view_users')->group(function () {
        Route::get('users', [AdminUserController::class, 'index'])
            ->name('admin.users.index');
        Route::get('users/{role}', [AdminUserController::class, 'byRole'])
            ->name('admin.users.byRole');
        Route::get('users/show/{id}', [AdminUserController::class, 'show'])
            ->name('admin.users.show');
    });

    Route::put('users/update/{id}', [AdminUserController::class, 'update'])
        ->middleware('permission:edit_user')
        ->name('admin.users.update');

    Route::delete('users/{id}', [AdminUserController::class, 'destroy'])
        ->middleware('permission:delete_user')
        ->name('admin.users.destroy');

    Route::middleware('permission:direct_registration')->group(function () {
        Route::get('registration', [AdminRegistrationController::class, 'index'])
            ->name('admin.registration.index');
        Route::get('registration/{role}', [AdminRegistrationController::class, 'byRole'])
            ->name('admin.registration.byRole');
        Route::post('registration', [AdminRegistrationController::class, 'store'])
            ->middleware('throttle:registration')
            ->name('admin.registration.store');

        Route::get('kiosk', [AdminRegistrationController::class, 'kiosk'])
            ->name('admin.registration.kiosk');
    });

    Route::get('reports', [AdminReportsController::class, 'index'])
        ->middleware('permission:view_reports')
        ->name('admin.reports.index');

    Route::get('stickers', [AdminStickersController::class, 'index'])
        ->middleware('permission:view_stickers')
        ->name('admin.stickers.index');

    // Pending vehicle requests
    Route::get('pending-vehicles', [AdminVehicleRequestController::class, 'index'])
        ->middleware('permission:view_vehicles')
        ->name('admin.pending-vehicles.index');

    Route::post('pending-vehicles/{id}/approve', [AdminVehicleRequestController::class, 'approve'])
        ->middleware('permission:create_vehicle')
        ->name('admin.pending-vehicles.approve');

    Route::post('pending-vehicles/{id}/reject', [AdminVehicleRequestController::class, 'reject'])
        ->middleware('permission:create_vehicle')
        ->name('admin.pending-vehicles.reject');

    Route::get('admin-sticker-requests', [AdminStickerRequestController::class, 'index'])
        ->middleware('permission:view_stickers')
        ->name('admin.sticker-requests.index');

    Route::post('admin-sticker-requests/{id}/approve', [AdminStickerRequestController::class, 'approve'])
        ->middleware('permission:print_stickers')
        ->name('admin.sticker-requests.approve');

    Route::post('admin-sticker-requests/{id}/reject', [AdminStickerRequestController::class, 'reject'])
        ->middleware('permission:print_stickers')
        ->name('admin.sticker-requests.reject');

    // Invoices
    Route::get('invoices', [AdminInvoiceController::class, 'index'])
        ->middleware('permission:view_invoices')
        ->name('admin.invoices.index');
    Route::post('invoices/{id}/mark-paid', [AdminInvoiceController::class, 'markPaid'])
        ->middleware('permission:edit_invoices')
        ->name('admin.invoices.mark-paid');
    Route::post('invoices/{id}/cancel', [AdminInvoiceController::class, 'cancel'])
        ->middleware('permission:edit_invoices')
        ->name('admin.invoices.cancel');

    Route::get('patrol', [AdminPatrolController::class, 'index'])
        ->middleware('permission:manage_patrols')
        ->name('admin.patrol.index');

    Route::middleware('permission:view_config')->group(function () {
        Route::get('configuration', [AdminConfigController::class, 'index'])
            ->name('admin.config.index');
        Route::get('configuration/colleges', [AdminConfigController::class, 'colleges'])
            ->name('admin.config.colleges');
        Route::get('configuration/programs', [AdminConfigController::class, 'programs'])
            ->name('admin.config.programs');
        Route::get('configuration/vehicle-types', [AdminConfigController::class, 'vehicleTypes'])
            ->name('admin.config.vehicle-types');
        Route::get('configuration/sticker-colors', [AdminConfigController::class, 'stickerColors'])
            ->name('admin.config.sticker-colors');
        Route::get('configuration/stakeholder-types', [AdminConfigController::class, 'stakeholderTypes'])
            ->name('admin.config.stakeholder-types');
        Route::get('configuration/departments', [AdminConfigController::class, 'departments'])
            ->name('admin.config.departments');
        Route::get('configuration/sticker-rules', [AdminConfigController::class, 'stickerRules'])
            ->name('admin.config.sticker-rules');
        Route::get('configuration/sticker-fees', [AdminConfigController::class, 'stickerFees'])
            ->name('admin.config.sticker-fees');
        Route::get('configuration/violation-types', [AdminConfigController::class, 'violationTypes'])
            ->name('admin.config.violation-types');
        Route::get('configuration/violation-routing', [AdminConfigController::class, 'violationRouting'])
            ->name('admin.config.violation-routing');
        Route::get('configuration/campus-map', [AdminConfigController::class, 'campusMap'])
            ->name('admin.config.campus-map');
        Route::get('configuration/location-types', [AdminConfigController::class, 'locationTypes'])
            ->name('admin.config.location-types');
    });

    Route::post('configuration/colleges', [AdminConfigController::class, 'storeCollege'])
        ->middleware('permission:edit_colleges')
        ->name('admin.config.colleges.store');
    Route::put('configuration/colleges/{college}', [AdminConfigController::class, 'updateCollege'])
        ->middleware('permission:edit_colleges')
        ->name('admin.config.colleges.update');
    Route::delete('configuration/colleges/{college}', [AdminConfigController::class, 'destroyCollege'])
        ->middleware('permission:edit_colleges')
        ->name('admin.config.colleges.destroy');

    Route::post('configuration/programs', [AdminConfigController::class, 'storeProgram'])
        ->middleware('permission:edit_programs')
        ->name('admin.config.programs.store');
    Route::put('configuration/programs/{program}', [AdminConfigController::class, 'updateProgram'])
        ->middleware('permission:edit_programs')
        ->name('admin.config.programs.update');
    Route::delete('configuration/programs/{program}', [AdminConfigController::class, 'destroyProgram'])
        ->middleware('permission:edit_programs')
        ->name('admin.config.programs.destroy');

    Route::post('configuration/vehicle-types', [AdminConfigController::class, 'storeVehicleType'])
        ->middleware('permission:edit_vehicle_types')
        ->name('admin.config.vehicle-types.store');
    Route::put('configuration/vehicle-types/{vehicleType}', [AdminConfigController::class, 'updateVehicleType'])
        ->middleware('permission:edit_vehicle_types')
        ->name('admin.config.vehicle-types.update');
    Route::delete('configuration/vehicle-types/{vehicleType}', [AdminConfigController::class, 'destroyVehicleType'])
        ->middleware('permission:edit_vehicle_types')
        ->name('admin.config.vehicle-types.destroy');

    Route::post('configuration/sticker-colors', [AdminConfigController::class, 'storeStickerColor'])
        ->middleware('permission:edit_sticker_colors')
        ->name('admin.config.sticker-colors.store');
    Route::put('configuration/sticker-colors/{stickerColor}', [AdminConfigController::class, 'updateStickerColor'])
        ->middleware('permission:edit_sticker_colors')
        ->name('admin.config.sticker-colors.update');
    Route::delete('configuration/sticker-colors/{stickerColor}', [AdminConfigController::class, 'destroyStickerColor'])
        ->middleware('permission:edit_sticker_colors')
        ->name('admin.config.sticker-colors.destroy');

    Route::post('configuration/location-types', [AdminConfigController::class, 'storeLocationType'])
        ->middleware('permission:edit_config')
        ->name('admin.config.location-types.store');
    Route::put('configuration/location-types/{locationType}', [AdminConfigController::class, 'updateLocationType'])
        ->middleware('permission:edit_config')
        ->name('admin.config.location-types.update');
    Route::delete('configuration/location-types/{locationType}', [AdminConfigController::class, 'destroyLocationType'])
        ->middleware('permission:edit_config')
        ->name('admin.config.location-types.destroy');

    Route::post('configuration/role-types', [AdminConfigController::class, 'storeRoleType'])
        ->middleware('permission:edit_stakeholder_types')
        ->name('admin.config.role-types.store');
    Route::put('configuration/role-types/{roleType}', [AdminConfigController::class, 'updateRoleType'])
        ->middleware('permission:edit_stakeholder_types')
        ->name('admin.config.role-types.update');
    Route::delete('configuration/role-types/{roleType}', [AdminConfigController::class, 'destroyRoleType'])
        ->middleware('permission:edit_stakeholder_types')
        ->name('admin.config.role-types.destroy');

    Route::put('configuration/sticker-rules', [AdminConfigController::class, 'updateStickerRules'])
        ->middleware('permission:edit_config')
        ->name('admin.config.sticker-rules.update');

    Route::post('configuration/sticker-fees', [AdminConfigController::class, 'storeStickerFee'])
        ->middleware('permission:edit_config')
        ->name('admin.config.sticker-fees.store');
    Route::put('configuration/sticker-fees/{stickerFee}', [AdminConfigController::class, 'updateStickerFee'])
        ->middleware('permission:edit_config')
        ->name('admin.config.sticker-fees.update');
    Route::delete('configuration/sticker-fees/{stickerFee}', [AdminConfigController::class, 'destroyStickerFee'])
        ->middleware('permission:edit_config')
        ->name('admin.config.sticker-fees.destroy');

    Route::post('configuration/violation-types', [AdminConfigController::class, 'storeViolationType'])
        ->middleware('permission:edit_config')
        ->name('admin.config.violation-types.store');
    Route::put('configuration/violation-types/{violationType}', [AdminConfigController::class, 'updateViolationType'])
        ->middleware('permission:edit_config')
        ->name('admin.config.violation-types.update');
    Route::delete('configuration/violation-types/{violationType}', [AdminConfigController::class, 'destroyViolationType'])
        ->middleware('permission:edit_config')
        ->name('admin.config.violation-types.destroy');

    Route::put('configuration/violation-routing', [AdminConfigController::class, 'updateViolationRouting'])
        ->middleware('permission:edit_config')
        ->name('admin.config.violation-routing.update');

    Route::get('files/{path}', function ($path) {
        $user = auth()->user();
        if (! $user) abort(403);

        // Allow: view_config (admins), view_users (dept officers viewing ID docs), view_registrations (approvers)
        $canAccess = $user->can('view_config')
            || $user->can('view_users')
            || $user->can('view_registrations');

        if (! $canAccess) abort(403, 'You do not have permission to access this file.');

        $path = str_replace('|', '/', $path);
        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk('private');
        if (! $disk->exists($path)) {
            abort(404);
        }
        $content = $disk->get($path);
        $mimeType = (string) $disk->mimeType($path);

        return response($content)->header('Content-Type', $mimeType);
    })->where('path', '.*')->name('admin.files.show');

    // Campus map CRUD (editor UI lives under Configuration → Campus map)
    Route::prefix('configuration/map')->name('admin.config.map.')->group(function () {
        Route::get('api/locations', [MapLocationController::class, 'getLocations'])->name('api.locations');
        Route::get('api/types', [MapLocationController::class, 'getTypes'])->name('api.types');
        Route::post('locations', [MapLocationController::class, 'store'])
            ->middleware('permission:manage_map')
            ->name('locations.store');
        Route::put('locations/{location}', [MapLocationController::class, 'update'])
            ->middleware('permission:manage_map')
            ->name('locations.update');
        Route::delete('locations/{location}', [MapLocationController::class, 'destroy'])
            ->middleware('permission:manage_map')
            ->name('locations.destroy');
        Route::post('locations/{location}/toggle', [MapLocationController::class, 'toggleActive'])
            ->middleware('permission:manage_map')
            ->name('locations.toggle');
        Route::get('locations/{location}/sticker', [MapLocationController::class, 'downloadSticker'])
            ->middleware('permission:view_map')
            ->name('locations.sticker');
    });
});
