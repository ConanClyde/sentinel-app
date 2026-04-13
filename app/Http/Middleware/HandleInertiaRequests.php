<?php

namespace App\Http\Middleware;

use App\Models\Notification;
use App\Models\PendingRegistration;
use App\Models\VehicleViolation;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        return array_merge(parent::share($request), [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user()?->setVisible(['id', 'first_name', 'surname', 'name', 'email', 'role', 'permissions']),
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'warning' => $request->session()->get('warning'),
                'info' => $request->session()->get('info'),
            ],
            'pendingApprovalsCount' => $request->user() && $request->user()->isAdministrator()
                ? PendingRegistration::where('status', 'pending')->where('email_verified', true)->count()
                : 0,
            'pendingReportsCount' => $request->user() && $request->user()->isAdministrator()
                ? VehicleViolation::where('status', 'pending')->count()
                : 0,
            'myPendingReportsCount' => $request->user()
                ? VehicleViolation::where('reported_by', $request->user()->id)
                    ->whereIn('status', ['pending', 'approved'])
                    ->count()
                : 0,
            'unreadNotificationCount' => $request->user()
                ? Notification::where('user_id', $request->user()->id)
                    ->where('is_read', false)
                    ->count()
                : 0,
        ]);
    }
}
