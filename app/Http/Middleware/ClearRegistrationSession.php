<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ClearRegistrationSession
{
    /**
     * Handle an incoming request.
     * Clears registration session when user exits the /register flow.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only check if we're leaving the register page
        if ($request->is('register*') || $request->routeIs('register*')) {
            return $response;
        }

        // If leaving to non-register page and has registration session, clear it
        if (session()->has('registration_main_role')) {
            // Only clear if not coming from register (to avoid clearing on internal navigation)
            $referer = $request->header('referer');
            if ($referer && !str_contains($referer, '/register')) {
                session()->forget([
                    'registration_main_role',
                    'registration_requires_approval',
                    'registration_role_type_id',
                    'registration_name',
                    'registration_role_specific',
                    'registration_vehicles',
                    'registration_email',
                    'pending_registration_id',
                    'registration_step',
                    'registration_completed_recently'
                ]);
            }
        }

        return $response;
    }
}
