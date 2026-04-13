<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class KioskMode
{
    public function handle(Request $request, Closure $next): Response
    {
        // If kiosk mode is active and trying to access non-registration routes, redirect back
        if (session('kiosk_mode') === true) {
            $currentRoute = $request->route()?->getName();

            // Allow registration routes and auth routes
            $allowedRoutes = [
                'admin.registration.index',
                'admin.registration.byRole',
                'admin.registration.store',
                'logout',
                'login',
            ];

            if (! in_array($currentRoute, $allowedRoutes)) {
                // Clear kiosk mode and redirect to registration
                session()->forget('kiosk_mode');

                return to_route('admin.registration.index');
            }
        }

        return $next($request);
    }
}
