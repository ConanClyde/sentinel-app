<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\PasswordResetCode;
use App\Models\User;
use App\Notifications\ResetPasswordCodeNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    /**
     * Show the password reset link request page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/forgot-password');
    }

    /**
     * Handle an incoming password reset link request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $email = strtolower($request->email);

        $user = User::where('email', $email)->first();

        if (!$user) {
            return back()->withErrors(['email' => 'This email is not registered in our system.']);
        }

        // Delete any existing codes for this email
        PasswordResetCode::where('email', $email)->delete();

        // Generate a 6-digit code
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Store the code
        PasswordResetCode::create([
            'email' => $email,
            'code' => $code,
            'created_at' => now(),
        ]);

        // Send the notification
        try {
            $user->notify(new ResetPasswordCodeNotification($code));
        } catch (\Exception $e) {
            Log::error('Failed to send password reset email: ' . $e->getMessage());
            return back()->withErrors(['email' => 'Failed to send email. Please check SMTP configuration.']);
        }

        // Store email in session for security
        session(['password_reset_email' => $email]);

        return to_route('password.reset');
    }
}
