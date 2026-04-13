<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PendingRegistration;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleViolation;
use App\Models\ViolationType;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function index(): Response
    {
        \Illuminate\Support\Facades\Gate::authorize('view_dashboard');

        // Stat cards
        $pendingApprovals = PendingRegistration::where('status', 'pending')->count();
        $totalUsers = User::count();
        $totalVehicles = Vehicle::where('is_active', true)->count();
        $totalViolations = VehicleViolation::count();
        $pendingViolations = VehicleViolation::where('status', 'pending')->count();

        // Recent activity
        $recentActivity = PendingRegistration::with(['roleType'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Violations by status (pie chart)
        $violationsByStatus = VehicleViolation::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->map(fn($r) => ['status' => $r->status, 'count' => $r->count]);

        // Violations by type (pie chart)
        $violationsByType = VehicleViolation::select('violation_type_id', DB::raw('count(*) as count'))
            ->with('violationType')
            ->groupBy('violation_type_id')
            ->orderByDesc('count')
            ->limit(6)
            ->get()
            ->map(fn($r) => [
                'type' => $r->violationType?->name ?? 'Unknown',
                'count' => $r->count,
            ]);

        // Violations over last 12 months (line chart)
        $violationsTrend = VehicleViolation::select(
                DB::raw('DATE_FORMAT(reported_at, "%Y-%m") as month'),
                DB::raw('count(*) as count')
            )
            ->where('reported_at', '>=', now()->subMonths(11)->startOfMonth())
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(fn($r) => ['month' => $r->month, 'count' => $r->count]);

        // Fill missing months with 0
        $months = collect();
        for ($i = 11; $i >= 0; $i--) {
            $key = now()->subMonths($i)->format('Y-m');
            $found = $violationsTrend->firstWhere('month', $key);
            $months->push(['month' => $key, 'count' => $found ? $found['count'] : 0]);
        }

        // Incident heatmap — one dot per violation, colored by location frequency
        $locationCounts = VehicleViolation::select('location', DB::raw('count(*) as count'))
            ->whereNotNull('pin_x')
            ->whereNotNull('pin_y')
            ->groupBy('location')
            ->pluck('count', 'location')
            ->toArray();

        $maxLocationCount = max(array_values($locationCounts) ?: [1]);

        $incidentHeatmap = VehicleViolation::select('location', 'pin_x', 'pin_y')
            ->whereNotNull('pin_x')
            ->whereNotNull('pin_y')
            ->get()
            ->map(fn($r) => [
                'location'       => $r->location ?? '',
                'pin_x'          => (float) $r->pin_x,
                'pin_y'          => (float) $r->pin_y,
                'location_count' => (int) ($locationCounts[$r->location] ?? 1),
                'max_count'      => $maxLocationCount,
            ]);

        // College distribution (students per college)
        $collegeDistribution = \App\Models\User::select('college_id', DB::raw('count(*) as count'))
            ->where('role', 'Student')
            ->whereNotNull('college_id')
            ->groupBy('college_id')
            ->with('college:id,name,code')
            ->get()
            ->map(fn($r) => [
                'college' => $r->college?->code ?? $r->college?->name ?? 'Unknown',
                'name'    => $r->college?->name ?? 'Unknown',
                'count'   => $r->count,
            ])
            ->sortByDesc('count')
            ->values();

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'pending_approvals' => $pendingApprovals,
                'total_users' => $totalUsers,
                'total_vehicles' => $totalVehicles,
                'total_violations' => $totalViolations,
                'pending_violations' => $pendingViolations,
                'recent_activity' => $recentActivity,
            ],
            'charts' => [
                'violations_by_status' => $violationsByStatus,
                'violations_by_type' => $violationsByType,
                'violations_trend' => $months,
                'incident_heatmap' => $incidentHeatmap,
                'college_distribution' => $collegeDistribution,
            ],
        ]);
    }
}
