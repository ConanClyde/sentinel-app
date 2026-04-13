<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Enums\ViolationStatus;
use App\Mail\ViolationReported;
use App\Mail\ViolationStatusUpdated;
use App\Models\RoleType;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleViolation;
use App\Models\ViolationSetting;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ViolationController extends Controller
{
    /**
     * Store a newly created incident report.
     */
    public function store(Request $request)
    {
        $request->validate([
            'plate_number' => 'required|string',
            'violation_type_id' => 'required|exists:violation_types,id',
            'location' => 'required|string',
            'description' => 'required|string',
            'evidence_image' => 'nullable|image|max:10240', // 10MB max
            'pin_x' => 'nullable|numeric',
            'pin_y' => 'nullable|numeric',
        ]);

        // 1. Identify the Vehicle
        $vehicle = Vehicle::query()
            ->with('user')
            ->where('plate_number', $request->plate_number)
            ->orWhere('sticker_number', $request->plate_number)
            ->first();

        // 2. Role-based reporting restriction:
        // SBO reporters can only report student vehicle owners
        $reporter = auth()->user();
        if ($reporter) {
            $reporterTypeName = $reporter->roleType?->name ?? '';
            $isSBO = stripos($reporterTypeName, 'SBO') !== false;

            if ($isSBO) {
                if (!$vehicle || !$vehicle->user || $vehicle->user->role !== UserRole::STUDENT) {
                    return back()->withErrors([
                        'plate_number' => 'As an SBO reporter, you can only report violations for student vehicle owners.',
                    ])->withInput();
                }
            }
        }

        // 2. Auto-assignment from configuration (ViolationSetting) with fallback
        $settings = ViolationSetting::getSingleton();
        $targetDepartmentId = null;

        if ($vehicle && $vehicle->user) {
            $owner = $vehicle->user;
            if ($owner->role === UserRole::STUDENT) {
                $targetDepartmentId = $settings->student_department_id;
            } else {
                $targetDepartmentId = $settings->default_department_id;
            }
        } else {
            $targetDepartmentId = $settings->default_department_id;
        }

        $department = null;
        if ($targetDepartmentId) {
            $department = RoleType::query()
                ->where('main_role', 'Department')
                ->where('id', $targetDepartmentId)
                ->first();
        }

        if (! $department) {
            $department = RoleType::query()
                ->where('main_role', 'Department')
                ->orderBy('id')
                ->first();
        }

        $assigneeId = null;
        if ($department) {
            $officer = User::where('department_id', $department->id)
                ->where('role', UserRole::DEPARTMENT_OFFICER->value)
                ->first();

            $assigneeId = $officer?->id;
        }

        // 4. Handle evidence image
        $imagePath = null;
        if ($request->hasFile('evidence_image')) {
            $imagePath = $request->file('evidence_image')->store('violations/evidence', 'private');
        }

        // 5. Create the violation
        $violation = VehicleViolation::create([
            'reported_by' => auth()->id() ?? null,
            'violator_vehicle_id' => $vehicle?->id,
            'violator_sticker_number' => $vehicle?->sticker_number ?? $request->plate_number,
            'violation_type_id' => $request->violation_type_id,
            'description' => $request->description,
            'location' => $request->location,
            'pin_x' => $request->pin_x,
            'pin_y' => $request->pin_y,
            'assigned_to' => $assigneeId,
            'status' => 'pending',
            'reported_at' => now(),
            'evidence_image' => $imagePath,
        ]);

        Log::info('Vehicle violation reported', [
            'violation_id' => $violation->id,
            'reporter_id' => auth()->id(),
            'vehicle_id' => $vehicle?->id,
            'plate_number' => $request->plate_number,
            'location' => $request->location,
            'assigned_to' => $assigneeId
        ]);

        // Notify department officers about new violation
        if ($department) {
            $violationType = $violation->violationType?->name ?? 'Unknown';
            NotificationService::notifyNewViolation(
                $department->id,
                $request->plate_number,
                $violationType
            );
        }

        // 6. Send email notification to violator (vehicle owner)
        if ($vehicle && $vehicle->user && $vehicle->user->email) {
            try {
                Mail::to($vehicle->user->email)
                    ->queue(new ViolationReported($violation));
                
                Log::info('Violation reported email queued for violator', [
                    'violation_id' => $violation->id,
                    'violator_email' => $vehicle->user->email,
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to queue violation reported email', [
                    'violation_id' => $violation->id,
                    'violator_email' => $vehicle->user->email,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $deptLabel = $department?->name ?? 'appropriate office';

        return back()->with('success', 'Report submitted successfully and routed to '.$deptLabel.'.');
    }

    /**
     * Update the status of a violation (Admin/Officer only).
     */
    public function updateStatus(Request $request, VehicleViolation $violation)
    {
        $this->authorize('updateStatus', $violation);

        $request->validate([
            'status' => 'required|in:'.implode(',', array_column(ViolationStatus::cases(), 'value')),
            'remarks' => 'nullable|string',
            'rejection_reason' => 'nullable|string|required_if:status,rejected',
        ]);

        $oldStatus = $violation->status;
        
        $violation->update([
            'status' => $request->status,
            'remarks' => $request->remarks,
            'rejection_reason' => $request->status === 'rejected' ? $request->rejection_reason : null,
            'updated_by' => auth()->id() ?? null,
            'status_updated_at' => now(),
        ]);

        Log::info('Violation status updated', [
            'violation_id' => $violation->id,
            'old_status' => $oldStatus,
            'new_status' => $request->status,
            'updated_by' => auth()->id(),
            'remarks' => $request->remarks
        ]);


        // Load relationships for email notifications
        $violation->load(['vehicle.user', 'reporter']);

        // Send notification to violator (vehicle owner)
        if ($violation->vehicle && $violation->vehicle->user) {
            NotificationService::notifyViolationStatusUpdated(
                $violation->vehicle->user,
                $violation->violator_sticker_number,
                $oldStatus,
                $request->status
            );
        }

        // Send email to VIOLATOR (vehicle owner)
        if ($violation->vehicle && $violation->vehicle->user && $violation->vehicle->user->email) {
            try {
                Mail::to($violation->vehicle->user->email)
                    ->queue(new ViolationStatusUpdated($violation, 'violator'));
                
                Log::info('Violation status update email queued for violator', [
                    'violation_id' => $violation->id,
                    'violator_email' => $violation->vehicle->user->email,
                    'old_status' => $oldStatus,
                    'new_status' => $request->status,
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to queue violation status email for violator', [
                    'violation_id' => $violation->id,
                    'violator_email' => $violation->vehicle->user->email,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        // Send email to REPORTER (if different from violator)
        if ($violation->reporter && $violation->reporter->email) {
            try {
                Mail::to($violation->reporter->email)
                    ->queue(new ViolationStatusUpdated($violation, 'reporter'));
                
                Log::info('Violation status update email queued for reporter', [
                    'violation_id' => $violation->id,
                    'reporter_email' => $violation->reporter->email,
                    'old_status' => $oldStatus,
                    'new_status' => $request->status,
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to queue violation status email for reporter', [
                    'violation_id' => $violation->id,
                    'reporter_email' => $violation->reporter->email,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return back()->with('success', 'Violation status updated.');
    }
}
