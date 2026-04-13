<?php

namespace App\Http\Controllers;

use App\Models\PatrolLog;
use App\Models\VehicleViolation;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class SecurityDashboardController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();

        // Get patrol logs for current security personnel (today's shift)
        $patrolLogs = PatrolLog::with('location')
            ->where('security_user_id', $user->id)
            ->whereDate('checked_in_at', today())
            ->orderBy('checked_in_at', 'desc')
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'location' => $log->location?->name ?? 'Checkpoint',
                    'notes' => $log->notes,
                    'status' => 'completed',
                    'created_at' => $log->checked_in_at,
                ];
            });

        // Get pending violations
        $violations = VehicleViolation::where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($violation) {
                return [
                    'id' => $violation->id,
                    'status' => $violation->status,
                    'plate_number' => $violation->plate_number,
                    'created_at' => $violation->created_at,
                ];
            });

        return Inertia::render('security/dashboard', [
            'patrolLogs' => $patrolLogs,
            'violations' => $violations,
        ]);
    }
}
