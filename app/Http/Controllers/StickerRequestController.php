<?php

namespace App\Http\Controllers;

use App\Models\StickerRequest;
use App\Models\Vehicle;
use App\Services\NotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class StickerRequestController extends Controller
{
    // Replacement reasons (shown in frontend dropdown)
    public const REPLACEMENT_REASONS = [
        'damaged' => 'Damaged sticker',
        'lost'    => 'Lost sticker',
        'stolen'  => 'Stolen sticker',
        'faded'   => 'Faded / unreadable sticker',
        'other'   => 'Other reason',
    ];

    public function store(Request $request): RedirectResponse
    {
        $user = auth()->user();

        $validated = $request->validate([
            'vehicle_id' => 'required|exists:vehicles,id',
            'type'       => 'required|in:renewal,replacement',
            'reason'     => 'nullable|string|max:255',
        ]);

        // Security: ensure the vehicle belongs to the authenticated user
        $vehicle = Vehicle::where('id', $validated['vehicle_id'])
            ->where('user_id', $user->id)
            ->firstOrFail();

        // Prevent duplicate pending requests for the same vehicle
        $hasPending = StickerRequest::where('vehicle_id', $vehicle->id)
            ->where('status', 'pending')
            ->exists();

        if ($hasPending) {
            return back()->withErrors([
                'vehicle_id' => 'This vehicle already has a pending sticker request.',
            ])->withInput();
        }

        // Renewal eligibility: only if expired or expiring within 14 days
        if ($validated['type'] === 'renewal') {
            $eligible = ! $vehicle->expires_at || $vehicle->expires_at->lte(now()->addDays(14));
            if (! $eligible) {
                return back()->withErrors([
                    'type' => 'This vehicle is not yet eligible for renewal. Renewal opens 14 days before expiration.',
                ])->withInput();
            }
        }

        StickerRequest::create([
            'user_id'    => $user->id,
            'vehicle_id' => $vehicle->id,
            'type'       => $validated['type'],
            'reason'     => $validated['reason'],
            'status'     => 'pending',
        ]);

        // Notify admins about new sticker request
        NotificationService::notifyNewStickerRequest(
            $user,
            $validated['type'],
            $vehicle->plate_number ?? 'N/A'
        );

        return back()->with('success', 'Sticker request submitted successfully. You will be notified once processed.');
    }
}
