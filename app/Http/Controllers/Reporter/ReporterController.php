<?php

namespace App\Http\Controllers\Reporter;

use App\Http\Controllers\Controller;
use App\Models\VehicleViolation;
use Inertia\Inertia;

class ReporterController extends Controller
{
    /**
     * Display the reporter dashboard.
     */
    public function dashboard()
    {
        $user = auth()->user();
        $totalReports = VehicleViolation::where('reported_by', $user->id)->count();
        $pendingReports = VehicleViolation::where('reported_by', $user->id)
            ->whereIn('status', ['pending', 'assigned'])
            ->count();
        $recentReports = VehicleViolation::where('reported_by', $user->id)
            ->with(['vehicle', 'violationType'])
            ->latest('reported_at')
            ->limit(5)
            ->get();

        return Inertia::render('reporter/dashboard', [
            'stats' => [
                'total' => $totalReports,
                'pending' => $pendingReports,
            ],
            'recentReports' => $recentReports,
        ]);
    }
}
