<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use App\Models\VehicleRequest;
use App\Models\VehicleType;
use App\Services\NotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class VehicleRequestController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $user = auth()->user();

        $validated = $request->validate([
            'vehicle_type_id' => 'required|exists:vehicle_types,id',
            'plate_number'    => 'nullable|string|max:20',
        ]);

        // Enforce max 3: count existing vehicles + pending requests
        $existingCount = Vehicle::where('user_id', $user->id)->count();
        $pendingCount  = VehicleRequest::where('user_id', $user->id)->where('status', 'pending')->count();

        if ($existingCount + $pendingCount >= 3) {
            return back()->withErrors([
                'vehicle_type_id' => 'You have reached the maximum of 3 registered vehicles.',
            ])->withInput();
        }

        $plateNumber = $validated['plate_number'] ? strtoupper(trim($validated['plate_number'])) : null;

        // Check plate uniqueness across vehicles and pending requests
        if ($plateNumber) {
            if (Vehicle::where('plate_number', $plateNumber)->exists()) {
                return back()->withErrors(['plate_number' => 'This plate number is already registered.'])->withInput();
            }
            if (VehicleRequest::where('plate_number', $plateNumber)->where('status', 'pending')->exists()) {
                return back()->withErrors(['plate_number' => 'This plate number already has a pending request.'])->withInput();
            }
        }

        VehicleRequest::create([
            'user_id'         => $user->id,
            'vehicle_type_id' => $validated['vehicle_type_id'],
            'plate_number'    => $plateNumber,
            'status'          => 'pending',
        ]);

        // Notify admins about new vehicle request
        NotificationService::notifyNewVehicleRequest($user, $plateNumber ?? 'N/A');

        return back()->with('success', 'Vehicle request submitted. Awaiting admin approval.');
    }
}
