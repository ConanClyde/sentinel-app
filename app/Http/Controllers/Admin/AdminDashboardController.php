<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PendingRegistration;
use App\Models\User;
use App\Models\Vehicle;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/dashboard', [
            'stats' => [
                'pending_registrations' => PendingRegistration::where('status', 'pending')->count(),
                'total_users' => User::count(),
                'total_vehicles' => Vehicle::where('is_active', true)->count(),
                'recent_activity' => PendingRegistration::with(['roleType'])
                    ->orderBy('created_at', 'desc')
                    ->limit(5)
                    ->get(),
            ]
        ]);
    }
}
