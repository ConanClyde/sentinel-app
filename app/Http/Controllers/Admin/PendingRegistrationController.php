<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PendingRegistration;
use App\Models\PendingVehicle;
use App\Models\User;
use App\Models\Vehicle;
use App\Services\StickerService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class PendingRegistrationController extends Controller
{
    protected StickerService $stickerService;

    public function __construct(StickerService $stickerService)
    {
        $this->stickerService = $stickerService;
    }

    public function index(): Response
    {
        $pendingRegistrations = PendingRegistration::with(['roleType', 'vehicles.vehicleType'])
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('admin/pending-registrations/index', [
            'pendingRegistrations' => $pendingRegistrations,
        ]);
    }

    public function show(int $id): Response
    {
        $pending = PendingRegistration::with(['roleType', 'vehicles.vehicleType'])->findOrFail($id);

        return Inertia::render('admin/pending-registrations/show', [
            'pendingRegistration' => $pending,
        ]);
    }

    public function approve(Request $request, int $id): RedirectResponse
    {
        $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        $pending = PendingRegistration::with(['roleType', 'vehicles.vehicleType', 'college', 'program'])->findOrFail($id);

        // Check if email is verified
        if (!$pending->email_verified) {
            return back()->withErrors(['email' => 'Email not verified yet.']);
        }

        // Create user from pending registration with all role-specific fields
        $userData = [
            'first_name' => $pending->first_name,
            'middle_name' => $pending->middle_name,
            'surname' => $pending->surname,
            'name_extension' => $pending->name_extension,
            'email' => $pending->email,
            'password' => $pending->password,
            'role' => $pending->role,
            'role_type_id' => $pending->role_type_id,
            // Common optional fields
            'license_number' => $pending->license_number,
            'license_image' => $pending->license_image,
            'face_scan_data' => $pending->face_scan_data,
        ];

        // Add role-specific fields
        if ($pending->college_id) {
            $userData['college_id'] = $pending->college_id;
        }
        if ($pending->program_id) {
            $userData['program_id'] = $pending->program_id;
        }
        if ($pending->student_id) {
            $userData['student_id'] = $pending->student_id;
            $userData['student_id_image'] = $pending->student_id_image;
        }
        if ($pending->staff_id) {
            $userData['staff_id'] = $pending->staff_id;
        }
        if ($pending->stakeholder_type) {
            $userData['stakeholder_type'] = $pending->stakeholder_type;
        }
        if ($pending->student_school_id_image) {
            $userData['student_id_image'] = $pending->student_school_id_image;
        }

        $user = User::create($userData);

        // Create vehicles and activate them
        foreach ($pending->vehicles as $pendingVehicle) {
            $vehicleType = $pendingVehicle->vehicleType;
            $stickerColor = $this->stickerService->calculateStickerColor($pending);

            $vehicle = Vehicle::create([
                'user_id' => $user->id,
                'vehicle_type_id' => $pendingVehicle->vehicle_type_id,
                'plate_number' => $pendingVehicle->plate_number,
                'sticker_number' => $this->stickerService->generateStickerNumber(),
                'sticker_color_id' => $stickerColor->id,
                'qr_code_path' => null,
                'is_active' => true,
            ]);

            // Generate QR code
            $vehicle->qr_code_path = $this->stickerService->generateQRCode($vehicle, $user);
            $vehicle->save();
        }

        // Update pending registration status
        $pending->update([
            'status' => 'approved',
            'approved_by' => auth()->user()?->id,
            'approved_at' => now(),
            'notes' => $request->notes,
        ]);

        return to_route('admin.pending-registrations.index')
            ->with('success', "Registration approved for {$user->full_name}");
    }

    public function reject(Request $request, int $id): RedirectResponse
    {
        $request->validate([
            'notes' => 'required|string|max:1000',
        ]);

        $pending = PendingRegistration::findOrFail($id);

        $pending->update([
            'status' => 'rejected',
            'approved_by' => auth()->user()?->id,
            'approved_at' => now(),
            'notes' => $request->notes,
        ]);

        return to_route('admin.pending-registrations.index')
            ->with('success', 'Registration rejected');
    }

    public function destroy(int $id): RedirectResponse
    {
        $pending = PendingRegistration::findOrFail($id);
        $pending->delete();

        return to_route('admin.pending-registrations.index')
            ->with('success', 'Pending registration deleted');
    }
}
