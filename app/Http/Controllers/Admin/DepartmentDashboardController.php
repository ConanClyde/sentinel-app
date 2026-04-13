<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleViolation;
use App\Models\StickerRequest;
use App\Models\Invoice;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DepartmentDashboardController extends Controller
{
    public function index(): Response
    {
        \Illuminate\Support\Facades\Gate::authorize('view_dashboard');

        $user = auth()->user();
        $deptName = $user->department?->name ?? $user->roleType?->name ?? 'Department';

        // Determine what this officer can see
        $canViewReports   = $user->can('view_reports') || $user->can('manage_reports');
        $canViewVehicles  = $user->can('view_vehicles') || $user->can('manage_vehicles');
        $canViewStickers  = $user->can('view_stickers') || $user->can('manage_stickers');
        $canViewInvoices  = $user->can('view_invoices') || $user->can('edit_invoices');
        $canViewPatrol    = $user->can('manage_patrols');
        $canViewStudents  = $user->can('view_students');
        $canViewStaff     = $user->can('view_staff');
        $canViewStakeholders = $user->can('view_stakeholders');
        $canViewSecurity  = $user->can('view_security');

        // Stats — only compute what's needed
        $stats = [];

        if ($canViewReports) {
            $stats['total_violations']   = VehicleViolation::count();
            $stats['pending_violations'] = VehicleViolation::where('status', 'pending')->count();
        }

        if ($canViewVehicles) {
            $stats['total_vehicles'] = Vehicle::where('is_active', true)->count();
        }

        if ($canViewStickers) {
            $stats['pending_sticker_requests'] = StickerRequest::where('status', 'pending')->count();
        }

        if ($canViewInvoices) {
            $stats['pending_invoices'] = Invoice::where('status', 'pending')->count();
        }

        if ($canViewStudents) {
            $stats['total_students'] = User::where('role', 'Student')->count();
        }

        if ($canViewStaff) {
            $stats['total_staff'] = User::where('role', 'Staff')->count();
        }

        if ($canViewStakeholders) {
            $stats['total_stakeholders'] = User::where('role', 'Stakeholder')->count();
        }

        if ($canViewSecurity) {
            $stats['total_security'] = User::where('role', 'Security Personnel')->count();
        }

        if ($canViewPatrol) {
            $stats['patrol_checkins_today'] = \App\Models\PatrolLog::whereDate('checked_in_at', today())->count();
        }

        // Charts — only if reports privilege
        $charts = [];

        if ($canViewReports) {
            $violationsTrend = VehicleViolation::select(
                    DB::raw('DATE_FORMAT(reported_at, "%Y-%m") as month'),
                    DB::raw('count(*) as count')
                )
                ->where('reported_at', '>=', now()->subMonths(11)->startOfMonth())
                ->groupBy('month')
                ->orderBy('month')
                ->get()
                ->map(fn($r) => ['month' => $r->month, 'count' => $r->count]);

            $months = collect();
            for ($i = 11; $i >= 0; $i--) {
                $key   = now()->subMonths($i)->format('Y-m');
                $found = $violationsTrend->firstWhere('month', $key);
                $months->push(['month' => $key, 'count' => $found ? $found['count'] : 0]);
            }

            $charts['violations_trend'] = $months;

            $charts['violations_by_status'] = VehicleViolation::select('status', DB::raw('count(*) as count'))
                ->groupBy('status')
                ->get()
                ->map(fn($r) => ['status' => $r->status, 'count' => $r->count]);

            $charts['recent_violations'] = VehicleViolation::with(['vehicle.user', 'violationType'])
                ->latest('reported_at')
                ->limit(5)
                ->get();
        }

        return Inertia::render('department/dashboard', [
            'deptName'        => $deptName,
            'stats'           => $stats,
            'charts'          => $charts,
            'permissions' => [
                'view_reports'      => $canViewReports,
                'view_vehicles'     => $canViewVehicles,
                'view_stickers'     => $canViewStickers,
                'view_invoices'     => $canViewInvoices,
                'view_patrol'       => $canViewPatrol,
                'view_students'     => $canViewStudents,
                'view_staff'        => $canViewStaff,
                'view_stakeholders' => $canViewStakeholders,
                'view_security'     => $canViewSecurity,
            ],
        ]);
    }
}
