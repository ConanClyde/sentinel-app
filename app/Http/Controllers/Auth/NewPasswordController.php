<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\PasswordResetCode;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class NewPasswordController extends Controller
{
    /**
     * Step 2: Show reset code page.
     */
    public function create(Request $request): Response|RedirectResponse
    {
        $email = session('password_reset_email');

        if (!$email) {
            return to_route('password.request');
        }

        return Inertia::render('auth/reset-code', [
            'email' => $email,
        ]);
    }

    /**
     * Step 2: Verify the code.
     */
    public function verifyCode(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
        ]);

        $email = strtolower($request->email);

        $resetCode = PasswordResetCode::where('email', $email)
            ->where('code', $request->code)
            ->first();

        if (! $resetCode) {
            return back()->withErrors(['code' => 'Invalid reset code.'])->withInput();
        }

        // Check if code is expired (60 minutes)
        if ($resetCode->created_at && $resetCode->created_at->diffInMinutes(now()) > 60) {
            $resetCode->delete();
            return back()->withErrors(['code' => 'The reset code has expired.']);
        }

        // Store verified email and code in session
        session([
            'password_reset_email' => $email,
            'password_reset_code' => $request->code,
        ]);

        return to_route('password.reset-password');
    }

    /**
     * Step 3: Show password form.
     */
    public function showPasswordForm(Request $request): Response|RedirectResponse
    {
        $email = session('password_reset_email');
        $code = session('password_reset_code');

        if (!$email || !$code) {
            return to_route('password.request');
        }

        return Inertia::render('auth/reset-password');
    }

    /**
     * Step 3: Handle password reset.
     */
    public function store(Request $request): RedirectResponse
    {
        $email = session('password_reset_email');
        $code = session('password_reset_code');

        if (!$email || !$code) {
            return to_route('password.request');
        }

        $request->validate([
            'password' => ['required', 'confirmed', 'min:8', 'regex:/[A-Z]/', 'regex:/[0-9]/'],
        ]);

        $user = User::where('email', $email)->first();

        if (! $user) {
            return to_route('password.request')->withErrors(['email' => 'User not found.']);
        }

        $user->forceFill([
            'password' => Hash::make($request->password),
            'remember_token' => Str::random(60),
        ])->save();

        event(new PasswordReset($user));

        // Delete the used code
        PasswordResetCode::where('email', $email)->delete();

        // Clear session
        session()->forget(['password_reset_email', 'password_reset_code']);

        return to_route('login')->with('success', 'Your password has been reset.');
    }
}
