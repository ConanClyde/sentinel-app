<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\ConfirmablePasswordController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\EmailVerificationPromptController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\VerifyEmailController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    // Registration - single URL with session-based step detection
    Route::get('register', [RegisteredUserController::class, 'show'])
        ->name('register');

    Route::get('register/back', [RegisteredUserController::class, 'goBack'])
        ->name('register.back');

    // POST routes for form submissions
    Route::post('register/role', [RegisteredUserController::class, 'storeRoleSelection'])
        ->name('register.store-role');

    Route::post('register/role-type', [RegisteredUserController::class, 'storeRoleTypeSelection'])
        ->name('register.store-role-type');

    Route::post('register/name', [RegisteredUserController::class, 'storeName'])
        ->name('register.store-name');

    Route::post('register/role-specific', [RegisteredUserController::class, 'storeRoleSpecificFields'])
        ->name('register.store-role-specific');

    Route::post('register/vehicles', [RegisteredUserController::class, 'storeVehicles'])
        ->name('register.store-vehicles');

    Route::post('register/credentials', [RegisteredUserController::class, 'storeCredentials'])
        ->middleware('throttle:5,1')
        ->name('register.store-credentials');

    Route::post('register/resend-code', [RegisteredUserController::class, 'resendCode'])
        ->middleware('throttle:3,1')
        ->name('register.resend-code');

    Route::post('register/verify', [RegisteredUserController::class, 'verifyCode'])
        ->middleware('throttle:10,1')
        ->name('register.verify-code');

    // Pending Approval (separate URL since it's after verification)
    Route::get('register/pending-approval', function () {
        if (!session('registration_completed_recently')) {
            return redirect()->route('register');
        }
        return Inertia\Inertia::render('auth/pending-approval');
    })->name('register.pending-approval');

    Route::get('login', [AuthenticatedSessionController::class, 'create'])
        ->name('login');

    Route::post('login', [AuthenticatedSessionController::class, 'store'])
        ->middleware('throttle:5,1'); // 5 login attempts per minute

    Route::get('forgot-password', [PasswordResetLinkController::class, 'create'])
        ->name('password.request');

    Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])
        ->middleware('throttle:3,1') // 3 password reset requests per minute
        ->name('password.email');

    // Step 2: Reset code
    Route::get('reset-password', [NewPasswordController::class, 'create'])
        ->name('password.reset');

    Route::post('reset-password/verify', [NewPasswordController::class, 'verifyCode'])
        ->middleware('throttle:10,1') // 10 verification attempts per minute
        ->name('password.verify-code');

    Route::post('reset-password/resend-code', [PasswordResetLinkController::class, 'store'])
        ->middleware('throttle:3,1') // 3 resend requests per minute
        ->name('password.resend-code');

    // Step 3: New password
    Route::get('reset-password/new', [NewPasswordController::class, 'showPasswordForm'])
        ->name('password.reset-password');

    Route::post('reset-password/new', [NewPasswordController::class, 'store'])
        ->name('password.store');
});

Route::middleware('auth')->group(function () {
    Route::get('verify-email', EmailVerificationPromptController::class)
        ->name('verification.notice');

    Route::get('verify-email/{id}/{hash}', VerifyEmailController::class)
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');

    Route::post('email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('verification.send');

    Route::get('confirm-password', [ConfirmablePasswordController::class, 'show'])
        ->name('password.confirm');

    Route::post('confirm-password', [ConfirmablePasswordController::class, 'store']);

    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');
});
