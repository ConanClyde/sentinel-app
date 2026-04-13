<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Mail\RegistrationApproved;
use App\Mail\RegistrationRejected;
use App\Models\Invoice;
use App\Models\PendingRegistration;
use App\Models\StickerFee;
use App\Models\User;
use App\Models\Vehicle;
use App\Services\NotificationService;
use App\Services\StickerService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
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
        \Illuminate\Support\Facades\Gate::authorize('view_registrations');

        $paginated = PendingRegistration::with(['roleType', 'college', 'program', 'vehicles.vehicleType'])
            ->where('status', 'pending')
            ->where('email_verified', true)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('admin/pending-approvals/index', [
            'pendingApprovals' => $paginated->items(),
            'pendingApprovalsPagination' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'total' => $paginated->total(),
            ],
        ]);
    }

    public function show(int $id): Response
    {
        \Illuminate\Support\Facades\Gate::authorize('view_registrations');

        $pending = PendingRegistration::with(['roleType', 'college', 'program', 'vehicles.vehicleType'])->findOrFail($id);

        return Inertia::render('admin/pending-approvals/show', [
            'pendingRegistration' => $pending,
        ]);
    }

    public function approve(Request $request, int $id): RedirectResponse
    {
        \Illuminate\Support\Facades\Gate::authorize('approve_registration');

        $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        return DB::transaction(function () use ($request, $id) {
            $pending = PendingRegistration::with(['roleType', 'vehicles.vehicleType', 'college', 'program'])->findOrFail($id);

            // Check if email is verified
            if (! $pending->email_verified) {
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
                'license_number' => $pending->license_number,
                'license_image' => $pending->license_image,
                'face_scan_data' => $pending->face_scan_data,
                'name' => $pending->first_name.' '.($pending->middle_name ? $pending->middle_name.' ' : '').$pending->surname,
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
                if ($pending->staff_id_image) {
                    $userData['staff_id_image'] = $pending->staff_id_image;
                }
            }
            if ($pending->stakeholder_type) {
                $userData['stakeholder_type'] = $pending->stakeholder_type;
            }
            if ($pending->student_school_id_image) {
                $userData['student_id_image'] = $pending->student_school_id_image;
            }

            if ($pending->role === UserRole::DEPARTMENT_OFFICER->value && $pending->role_type_id) {
                $userData['department_id'] = $pending->role_type_id;
            }

            $user = User::create($userData);

            // Set user expiration date based on role
            $user->expiration_date = $this->stickerService->calculateExpirationDate($pending);
            $user->save();

            // Check for duplicate plate numbers before creating any vehicles
            $pendingPlates = $pending->vehicles
                ->pluck('plate_number')
                ->filter(fn ($p) => ! empty(trim((string) $p)))
                ->map(fn ($p) => strtoupper(trim($p)));

            if ($pendingPlates->isNotEmpty()) {
                $existingVehicle = Vehicle::whereIn('plate_number', $pendingPlates)->first();
                if ($existingVehicle) {
                    return back()->with(
                        'error',
                        "Cannot approve: plate number \"{$existingVehicle->plate_number}\" is already registered in the system."
                    );
                }
            }

            // Create vehicles and activate them
            foreach ($pending->vehicles as $pendingVehicle) {
                $stickerColor = $this->stickerService->calculateStickerColor($pending);

                $vehicle = Vehicle::create([
                    'user_id' => $user->id,
                    'vehicle_type_id' => $pendingVehicle->vehicle_type_id,
                    'plate_number' => $pendingVehicle->plate_number,
                    'sticker_number' => $this->stickerService->generateStickerNumber($stickerColor),
                    'sticker_color_id' => $stickerColor->id,
                    'expires_at' => $this->stickerService->calculateExpirationDate($pending),
                    'qr_code_path' => null,
                    'is_active' => true,
                ]);

                // Generate advanced SVG sticker with QR code in background
                \App\Jobs\GenerateVehicleStickerJob::dispatch($vehicle, $user);

                // Create invoice for the sticker
                $fee = StickerFee::getByType('new_registration');
                if ($fee && $fee->amount > 0) {
                    Invoice::createForRegistration(
                        $user,
                        $vehicle,
                        'new_registration',
                        $fee->amount,
                        auth()->id()
                    );
                }
            }

            // Move registration files to user-specific storage
            $fileFields = ['license_image', 'face_scan_data', 'student_id_image', 'staff_id_image', 'student_school_id_image'];
            $movedFiles = [];

            foreach ($fileFields as $field) {
                $oldPath = $pending->$field;
                if ($oldPath && Storage::disk('private')->exists($oldPath)) {
                    $filename = basename($oldPath);
                    $newPath = "users/{$user->id}/{$filename}";

                    try {
                        Storage::disk('private')->move($oldPath, $newPath);
                        $movedFiles[$field] = $newPath;
                    } catch (\Exception $e) {
                        $movedFiles[$field] = $oldPath;
                    }
                }
            }

            // Update User and PendingRegistration with new paths
            if (! empty($movedFiles)) {
                $userUpdateData = [];
                if (isset($movedFiles['license_image'])) {
                    $userUpdateData['license_image'] = $movedFiles['license_image'];
                }
                if (isset($movedFiles['face_scan_data'])) {
                    $userUpdateData['face_scan_data'] = $movedFiles['face_scan_data'];
                }

                if (isset($movedFiles['student_id_image'])) {
                    $userUpdateData['student_id_image'] = $movedFiles['student_id_image'];
                } elseif (isset($movedFiles['student_school_id_image'])) {
                    $userUpdateData['student_id_image'] = $movedFiles['student_school_id_image'];
                }

                if (isset($movedFiles['staff_id_image'])) {
                    $userUpdateData['staff_id_image'] = $movedFiles['staff_id_image'];
                }

                $user->update($userUpdateData);
                $pending->update($movedFiles);
            }

            // Update pending registration status
            $pending->update([
                'status' => 'approved',
                'approved_by' => Auth::id(),
                'approved_at' => now(),
                'notes' => $request->notes,
            ]);

            // Send approval email
            Mail::to($pending->email)->send(new RegistrationApproved($pending));

            // Create notification for user
            NotificationService::notifyRegistrationApproved($user);

            Log::info('Registration approved', [
                'pending_id' => $id,
                'user_id' => $user->id,
                'approved_by' => Auth::id(),
                'vehicle_count' => count($pending->vehicles)
            ]);

            return to_route('admin.pending-approvals.index')
                ->with('success', "Registration approved for {$user->full_name}");
        });

    }

    public function reject(Request $request, int $id): RedirectResponse
    {
        \Illuminate\Support\Facades\Gate::authorize('reject_registration');

        $request->validate([
            'notes' => 'required|string|max:1000',
        ]);

        $pending = PendingRegistration::findOrFail($id);

        // Delete associated files to save storage (only if they are still in the registrations/ directory)
        $fileFields = ['license_image', 'face_scan_data', 'student_id_image', 'staff_id_image', 'student_school_id_image'];
        foreach ($fileFields as $field) {
            if ($pending->$field && str_contains($pending->$field, 'registrations/')) {
                Storage::disk('private')->delete($pending->$field);
            }
        }

        $pending->update([
            'status' => 'rejected',
            'approved_by' => Auth::id(),
            'approved_at' => now(),
            'notes' => $request->notes,
        ]);

        // Send rejection email
        Mail::to($pending->email)->send(new RegistrationRejected($pending));

        // Create notification for user
        NotificationService::notifyRegistrationRejected($pending, $request->notes);

        Log::info('Registration rejected', [
            'pending_id' => $id,
            'rejected_by' => Auth::id(),
            'reason' => $request->notes
        ]);

        return to_route('admin.pending-approvals.index')
            ->with('success', 'Registration rejected');

    }

    public function destroy(int $id): RedirectResponse
    {
        \Illuminate\Support\Facades\Gate::authorize('reject_registration');

        $pending = PendingRegistration::findOrFail($id);

        // Delete associated files to save storage (only if they are still in the registrations/ directory)
        $fileFields = ['license_image', 'face_scan_data', 'student_id_image', 'staff_id_image', 'student_school_id_image'];
        foreach ($fileFields as $field) {
            if ($pending->$field && str_contains($pending->$field, 'registrations/')) {
                Storage::disk('private')->delete($pending->$field);
            }
        }

        $pending->delete();

        return to_route('admin.pending-approvals.index')
            ->with('success', 'Approval request deleted');
    }
}
