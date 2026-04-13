<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PatrolLog;
use Inertia\Inertia;
use Inertia\Response;

class AdminPatrolController extends Controller
{
    public function index(): Response
    {
        \Illuminate\Support\Facades\Gate::authorize('manage_patrols');

        $patrolLogs = PatrolLog::with(['securityUser', 'location'])
            ->orderBy('checked_in_at', 'desc')
            ->paginate(15);

        // Get map locations for heatmap
        $mapLocations = \App\Models\MapLocation::with('type')
            ->where('is_active', true)
            ->get();

        // Calculate patrol frequency per location for heatmap
        $patrolFrequency = PatrolLog::selectRaw('map_location_id, COUNT(*) as count')
            ->groupBy('map_location_id')
            ->pluck('count', 'map_location_id');

        return Inertia::render('admin/patrol/index', [
            'patrolLogs' => $patrolLogs,
            'mapLocations' => $mapLocations,
            'patrolFrequency' => $patrolFrequency,
        ]);
    }
}
