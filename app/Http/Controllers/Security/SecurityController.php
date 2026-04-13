<?php

namespace App\Http\Controllers\Security;

use App\Http\Controllers\Controller;
use App\Models\MapLocation;
use App\Models\PatrolLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SecurityController extends Controller
{
    /**
     * Display the security personnel dashboard.
     */
    public function dashboard()
    {
        return Inertia::render('security/dashboard');
    }

    /**
     * Show the patrol point scanning interface.
     */
    public function scan(Request $request)
    {
        $preselectedLocation = null;
        if ($request->has('location')) {
            $preselectedLocation = MapLocation::with('type')->find($request->location);
        }

        return Inertia::render('security/scan', [
            'preselectedLocation' => $preselectedLocation,
        ]);
    }

    /**
     * Display the user's personal patrol history.
     */
    public function history()
    {
        return Inertia::render('security/history');
    }

    /**
     * Record a patrol check-in.
     */
    public function checkIn(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'map_location_id' => 'required|numeric|exists:map_locations,id',
            'notes' => 'nullable|string|max:1000',
        ]);

        // Verify the location is active
        $location = MapLocation::findOrFail($validated['map_location_id']);

        if (! $location->is_active) {
            return response()->json([
                'message' => 'This patrol point is no longer active. Please contact administration.',
            ], 422);
        }

        // Create the patrol log
        $patrolLog = PatrolLog::create([
            'security_user_id' => auth()->id(),
            'map_location_id' => $validated['map_location_id'],
            'checked_in_at' => now(),
            'notes' => $validated['notes'] ?? null,
        ]);

        // Load relationships for response
        $patrolLog->load('location');

        return response()->json([
            'message' => 'Check-in recorded successfully.',
            'data' => $patrolLog,
        ], 201);
    }

    /**
     * Get patrol history for the authenticated user.
     */
    public function getHistory(Request $request): JsonResponse
    {
        $logs = PatrolLog::where('security_user_id', auth()->id())
            ->with('location')
            ->orderBy('checked_in_at', 'desc')
            ->paginate(15);

        return response()->json($logs);
    }

    /**
     * Handle redirection from a patrol point QR code.
     */
    public function patrolCheckin(MapLocation $location)
    {
        return redirect()->route('security.scan', ['location' => $location->id]);
    }
}
