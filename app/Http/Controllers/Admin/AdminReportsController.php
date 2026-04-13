<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Enums\UserRole;
use App\Models\VehicleViolation;
use Inertia\Inertia;
use Inertia\Response;

class AdminReportsController extends Controller
{
    public function index(): Response
    {
        \Illuminate\Support\Facades\Gate::authorize('view_reports');

        $paginatedViolations = VehicleViolation::with(['vehicle.user', 'violationType', 'reporter', 'assignee'])
            ->latest('reported_at')
            ->paginate(10);

        $violations = $paginatedViolations->items();

        $stats = [
            'totalCount' => VehicleViolation::count(),
            'pendingCount' => VehicleViolation::where('status', 'pending')->count(),
            'approvedCount' => VehicleViolation::where('status', 'approved')->count(),
            'resolvedCount' => VehicleViolation::where('status', 'resolved')->count(),
            'rejectedCount' => VehicleViolation::where('status', 'rejected')->count(),
        ];

        // Only vehicle owner roles (those that require approval)
        $vehicleOwnerRoles = collect(UserRole::cases())
            ->filter(fn(UserRole $role) => $role->requiresApproval())
            ->map(fn(UserRole $role) => ['value' => $role->value, 'label' => $role->label()])
            ->values();

        return Inertia::render('admin/reports/index', [
            'violations' => $violations,
            'stats' => $stats,
            'vehicleOwnerRoles' => $vehicleOwnerRoles,
            'canManage' => auth()->user()?->can('manage_reports') ?? false,
            'reportsPagination' => [
                'current_page' => $paginatedViolations->currentPage(),
                'last_page' => $paginatedViolations->lastPage(),
                'total' => $paginatedViolations->total(),
            ],
        ]);
    }
}
