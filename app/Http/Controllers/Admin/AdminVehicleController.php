<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleType;
use App\Services\StickerService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminVehicleController extends Controller
{
    public function __construct(protected StickerService $stickerService) {}

    public function index(): Response
    {
        \Illuminate\Support\Facades\Gate::authorize('view_vehicles');

        $paginated = Vehicle::with(['user', 'vehicleType', 'stickerColor'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        $vehicleTypes = VehicleType::all();

        // Only roles that are permitted to have registered vehicles
        $vehicleOwnerRoles = [
            UserRole::STUDENT->value,
            UserRole::STAFF->value,
            UserRole::STAKEHOLDER->value,
            UserRole::SECURITY_PERSONNEL->value,
        ];

        $users = User::select('id', 'first_name', 'middle_name', 'surname', 'email', 'role')
            ->withCount('vehicles')
            ->whereIn('role', $vehicleOwnerRoles)
            ->orderBy('surname')
            ->get()
            ->map(fn ($user) => [
                'id'            => $user->id,
                'name'          => $user->full_name,
                'email'         => $user->email,
                'role'          => $user->role_name,
                'vehicle_count' => $user->vehicles_count,
            ]);

        return Inertia::render('admin/vehicles/index', [
            'vehicles' => $paginated->items(),
            'vehicleTypes' => $vehicleTypes,
            'users' => $users,
            'canManage' => auth()->user()?->can('create_vehicle') ?? false,
            'vehiclesPagination' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'total' => $paginated->total(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        \Illuminate\Support\Facades\Gate::authorize('create_vehicle');

        $validated = $request->validate([
            'user_id'          => 'required|exists:users,id',
            'vehicle_type_id'  => 'required|exists:vehicle_types,id',
            'plate_number'     => 'nullable|string|max:20|unique:vehicles,plate_number',
        ]);

        $user        = User::findOrFail($validated['user_id']);
        $plateNumber = $validated['plate_number'] ? strtoupper($validated['plate_number']) : null;

        // Enforce maximum of 3 vehicles per user
        $existingCount = Vehicle::where('user_id', $user->id)->count();
        if ($existingCount >= 3) {
            return back()->withErrors([
                'user_id' => "{$user->full_name} already has the maximum of 3 registered vehicles.",
            ])->withInput();
        }

        // Determine sticker color based on the user's role and the specific plate being registered
        $stickerColor  = $this->stickerService->calculateStickerColor($user, $plateNumber);

        // Generate a sequential, race-condition-safe sticker number
        $stickerNumber = $this->stickerService->generateStickerNumber($stickerColor);

        $vehicle = Vehicle::create([
            'user_id'          => $user->id,
            'vehicle_type_id'  => $validated['vehicle_type_id'],
            'plate_number'     => $plateNumber,
            'sticker_number'   => $stickerNumber,
            'sticker_color_id' => $stickerColor->id,
            'expires_at'       => $this->stickerService->calculateExpirationDate($user),
            'is_active'        => true,
        ]);

        // Dispatch background job to generate the SVG sticker
        \App\Jobs\GenerateVehicleStickerJob::dispatch($vehicle, $user);

        \Illuminate\Support\Facades\Log::info('Vehicle manually registered by admin', [
            'vehicle_id' => $vehicle->id,
            'user_id' => $user->id,
            'plate_number' => $vehicle->plate_number,
            'sticker_number' => $vehicle->sticker_number,
            'created_by' => auth()->id()
        ]);

        return back()->with('success', 'Vehicle added. Sticker is being generated in the background.');
    }

    public function destroy(Vehicle $vehicle): RedirectResponse
    {
        \Illuminate\Support\Facades\Gate::authorize('delete_vehicle');

        $vehicle->delete();

        \Illuminate\Support\Facades\Log::info('Vehicle deleted by admin', [
            'vehicle_id' => $vehicle->id,
            'plate_number' => $vehicle->plate_number,
            'deleted_by' => auth()->id()
        ]);

        return back()->with('success', 'Vehicle deleted successfully.');
    }
}
