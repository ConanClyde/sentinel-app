<?php

use App\Http\Middleware\ClearRegistrationSession;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\KioskMode;
use App\Http\Middleware\PermissionMiddleware;
use App\Http\Middleware\RoleMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $trusted = env('TRUSTED_PROXIES', '*');
        if ($trusted === null || $trusted === '' || $trusted === '*') {
            $middleware->trustProxies(at: '*');
        } else {
            $middleware->trustProxies(at: array_values(array_filter(array_map('trim', explode(',', $trusted)))));
        }

        $middleware->redirectUsersTo('/dashboard');

        $middleware->alias([
            'role' => RoleMiddleware::class,
            'kiosk' => KioskMode::class,
            'permission' => PermissionMiddleware::class,
        ]);
        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            ClearRegistrationSession::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->respond(function (Response $response, Throwable $exception, Request $request) {
            if (in_array($response->getStatusCode(), [500, 503, 404, 403, 429])) {
                return Inertia::render('error', ['status' => $response->getStatusCode()])
                    ->toResponse($request)
                    ->setStatusCode($response->getStatusCode());
            } elseif ($response->getStatusCode() === 419) {
                return back()->with([
                    'message' => 'The page expired, please try again.',
                ]);
            }

            return $response;
        });
    })->create();
