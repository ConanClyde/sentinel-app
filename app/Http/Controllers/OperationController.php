<?php

namespace App\Http\Controllers;

use App\Http\Controllers\StickerRequestController;
use App\Models\MapLocation;
use App\Models\StickerColor;
use App\Models\StickerRequest;
use App\Models\Vehicle;
use App\Models\VehicleRequest;
use App\Models\VehicleType;
use App\Models\VehicleViolation;
use App\Models\ViolationType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OperationController extends Controller
{
    /**
     * Display the user's registered vehicles.
     */
    public function vehicles()
    {
        $user = auth()->user();

        // Administrator or Department Officer with view_vehicles sees the Full Vehicle Registry
        if ($user->isAdministrator() || ($user->role?->value === \App\Enums\UserRole::DEPARTMENT_OFFICER->value && $user->can('view_vehicles'))) {
            return app(Admin\AdminVehicleController::class)->index();
        }

        // Other roles see their own registered vehicles
        $paginated = Vehicle::where('user_id', $user->id)
            ->with(['stickerColor', 'vehicleType'])
            ->paginate(10);

        $vehicleTypes = VehicleType::all();

        $pendingRequests = VehicleRequest::where('user_id', $user->id)
            ->where('status', 'pending')
            ->with(['vehicleType'])
            ->get();

        return Inertia::render('shared/vehicles', [
            'vehicles'        => $paginated->items(),
            'vehicleTypes'    => $vehicleTypes,
            'pendingRequests' => $pendingRequests,
            'vehiclesPagination' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'total' => $paginated->total(),
            ],
        ]);
    }

    /**
     * Show the campus map.
     */
    public function map()
    {
        return Inertia::render('shared/map');
    }

    /**
     * Show the sticker request form.
     */
    public function stickerRequests()
    {
        $user = auth()->user();

        // Administrator sees the admin sticker requests management page
        if ($user->isAdministrator()) {
            return app(Admin\AdminStickerRequestController::class)->index();
        }

        $vehicles = Vehicle::where('user_id', $user->id)
            ->with(['vehicleType', 'stickerColor'])
            ->get()
            ->map(function ($vehicle) {
                $eligible = ! $vehicle->expires_at || $vehicle->expires_at->lte(now()->addDays(14));

                return array_merge($vehicle->toArray(), [
                    'renewal_eligible'   => $eligible,
                    'has_pending_request' => StickerRequest::where('vehicle_id', $vehicle->id)
                        ->where('status', 'pending')
                        ->exists(),
                ]);
            });

        $myRequestsPaginated = StickerRequest::where('user_id', $user->id)
            ->with(['vehicle.vehicleType'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        $replacementReasons = StickerRequestController::REPLACEMENT_REASONS;

        return Inertia::render('shared/sticker-requests', [
            'vehicles'           => $vehicles,
            'myRequests'         => $myRequestsPaginated->items(),
            'replacementReasons' => $replacementReasons,
            'myRequestsPagination' => [
                'current_page' => $myRequestsPaginated->currentPage(),
                'last_page' => $myRequestsPaginated->lastPage(),
                'total' => $myRequestsPaginated->total(),
            ],
        ]);
    }

    /**
     * Show the incident report form.
     */
    public function report()
    {
        $violationTypes = ViolationType::all();
        $stickerColors = StickerColor::all();
        $mapLocations = MapLocation::where('is_active', true)->get();
        $reporter = auth()->user();
        $reporterTypeName = $reporter?->roleType?->name ?? '';

        return Inertia::render('shared/report', [
            'violationTypes' => $violationTypes,
            'stickerColors' => $stickerColors,
            'mapLocations' => $mapLocations,
            'reporterTypeName' => $reporterTypeName,
        ]);
    }

    /**
     * Show the user's violation/report history.
     */
    public function reportHistory()
    {
        $user = auth()->user();
        // Violations received by the user's vehicles
        $paginated = VehicleViolation::whereHas('vehicle', function ($query) use ($user) {
            $query->where('vehicles.user_id', $user->id);
        })->with(['vehicle', 'violationType', 'reporter'])->latest('reported_at')->paginate(10);

        return Inertia::render('shared/report-history', [
            'violations' => $paginated->items(),
            'violationsPagination' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'total' => $paginated->total(),
            ],
        ]);
    }

    /**
     * Identify a vehicle by plate or sticker for reporting.
     */
    public function identify(Request $request)
    {
        $query = Vehicle::query()->with(['user', 'stickerColor', 'vehicleType']);

        if ($request->has('plate_number')) {
            $query->where('plate_number', $request->plate_number);
        } elseif ($request->has('sticker_number')) {
            $stickerNo = $request->sticker_number;

            // Handle partial 4-digit entry by prepending color name if color_id is present
            if ($request->has('sticker_color_id') && is_numeric($stickerNo)) {
                $color = StickerColor::find($request->sticker_color_id);
                if ($color) {
                    $prefix = strtoupper($color->name).'-';
                    $padded = str_pad($stickerNo, 4, '0', STR_PAD_LEFT);
                    $query->where('sticker_number', $prefix.$padded);
                } else {
                    $query->where('sticker_number', $stickerNo);
                }
            } else {
                $query->where('sticker_number', $stickerNo);
            }

            if ($request->has('sticker_color_id')) {
                $query->where('sticker_color_id', $request->sticker_color_id);
            }
        } else {
            return response()->json(['message' => 'No search parameter provided'], 400);
        }

        $vehicle = $query->first();

        if (! $vehicle) {
            return response()->json(['status' => 'not_found', 'message' => 'Target not registered in Sentinel Database']);
        }

        $owner = $vehicle->user;
        if (! $owner) {
            return response()->json(['status' => 'not_found', 'message' => 'Target not registered in Sentinel Database']);
        }

        // Explicit payload only — do not serialize the full Vehicle with nested User (avoids leaking email, etc.).
        return response()->json([
            'status' => 'found',
            'vehicle' => [
                'id' => $vehicle->id,
                'plate_number' => $vehicle->plate_number,
                'sticker_number' => $vehicle->sticker_number,
                'vehicle_type' => ['name' => $vehicle->vehicleType?->name ?? ''],
                'sticker_color' => [
                    'name' => $vehicle->stickerColor?->name ?? '',
                    'hex_code' => $vehicle->stickerColor?->hex_code ?? '',
                ],
            ],
            'owner' => [
                'name' => $owner->name,
                'role' => $owner->role instanceof \BackedEnum ? $owner->role->value : (string) $owner->role,
                'avatar' => $owner->avatar,
            ],
        ]);
    }

    /**
     * Display reports submitted by the authenticated user.
     */
    public function myReports()
    {
        $user = auth()->user();
        $paginated = VehicleViolation::where('reported_by', $user->id)
            ->with(['vehicle.user', 'violationType', 'assignee'])
            ->latest('reported_at')
            ->paginate(10);

        $reports = $paginated->items();

        $unresolvedCount = VehicleViolation::where('reported_by', $user->id)
            ->whereIn('status', ['pending', 'approved'])
            ->count();

        $resolvedCount = VehicleViolation::where('reported_by', $user->id)
            ->whereIn('status', ['resolved', 'rejected'])
            ->count();

        return Inertia::render('shared/my-reports', [
            'reports' => $reports,
            'stats' => [
                'totalCount' => $paginated->total(),
                'unresolvedCount' => $unresolvedCount,
                'resolvedCount' => $resolvedCount,
            ],
            'reportsPagination' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'total' => $paginated->total(),
            ],
        ]);
    }
}
