<?php

namespace App\Services;

use App\Events\NotificationCreated;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * Create a notification for a user.
     */
    public static function create(
        int $userId,
        string $type,
        string $title,
        string $description,
        ?string $link = null,
        array $data = []
    ): ?Notification {
        try {
            $notification = Notification::create([
                'user_id' => $userId,
                'type' => $type,
                'title' => $title,
                'description' => $description,
                'link' => $link,
                'data' => $data,
            ]);

            // Broadcast the notification in real-time
            event(new NotificationCreated($notification));

            return $notification;
        } catch (\Exception $e) {
            Log::error('Failed to create notification', [
                'user_id' => $userId,
                'type' => $type,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Notify admins about new registration.
     */
    public static function notifyNewRegistration($registrant): void
    {
        // Notify all users with view_registrations permission
        $admins = User::whereHas('roleType.privileges', function($query) {
            $query->where('name', 'view_registrations');
        })->get();

        // Get full name based on registrant type
        $fullName = $registrant instanceof User ? $registrant->full_name : $registrant->full_name;

        foreach ($admins as $admin) {
            self::create(
                $admin->id,
                'registration',
                'New Registration Pending',
                "{$fullName} has submitted a registration request.",
                route('admin.pending-approvals.index'),
                ['registrant_id' => $registrant->id, 'role' => $registrant->role]
            );
        }
    }

    /**
     * Notify user about registration approval.
     */
    public static function notifyRegistrationApproved(User $user): void
    {
        self::create(
            $user->id,
            'success',
            'Registration Approved',
            'Your registration has been approved. You can now access the system.',
            route('dashboard')
        );
    }

    /**
     * Notify user about registration rejection.
     */
    public static function notifyRegistrationRejected(User $user, string $reason): void
    {
        self::create(
            $user->id,
            'alert',
            'Registration Rejected',
            "Your registration was rejected. Reason: {$reason}",
            route('register')
        );
    }

    /**
     * Notify admins about new vehicle request.
     */
    public static function notifyNewVehicleRequest(User $user, string $plateNumber): void
    {
        $admins = User::whereHas('roleType.privileges', function($query) {
            $query->where('name', 'view_vehicles');
        })->get();

        foreach ($admins as $admin) {
            self::create(
                $admin->id,
                'approval',
                'New Vehicle Request',
                "{$user->full_name} submitted a vehicle request (Plate: {$plateNumber}).",
                route('admin.pending-vehicles.index'),
                ['user_id' => $user->id, 'plate_number' => $plateNumber]
            );
        }
    }

    /**
     * Notify user about vehicle request approval.
     */
    public static function notifyVehicleRequestApproved(User $user, string $plateNumber): void
    {
        self::create(
            $user->id,
            'success',
            'Vehicle Request Approved',
            "Your vehicle ({$plateNumber}) has been approved. Your sticker is ready.",
            route('shared.vehicles')
        );
    }

    /**
     * Notify user about vehicle request rejection.
     */
    public static function notifyVehicleRequestRejected(User $user, string $plateNumber, string $reason): void
    {
        self::create(
            $user->id,
            'alert',
            'Vehicle Request Rejected',
            "Your vehicle request ({$plateNumber}) was rejected. Reason: {$reason}",
            route('shared.vehicles')
        );
    }

    /**
     * Notify admins about new sticker request.
     */
    public static function notifyNewStickerRequest(User $user, string $type, string $plateNumber): void
    {
        $admins = User::whereHas('roleType.privileges', function($query) {
            $query->where('name', 'view_stickers');
        })->get();

        foreach ($admins as $admin) {
            self::create(
                $admin->id,
                'sticker',
                'New Sticker Request',
                "{$user->full_name} requested a sticker {$type} for {$plateNumber}.",
                route('admin.sticker-requests.index'),
                ['user_id' => $user->id, 'type' => $type, 'plate_number' => $plateNumber]
            );
        }
    }

    /**
     * Notify user about sticker request approval.
     */
    public static function notifyStickerRequestApproved(User $user, string $type): void
    {
        self::create(
            $user->id,
            'success',
            'Sticker Request Approved',
            "Your sticker {$type} request has been approved. Download your new sticker.",
            route('shared.sticker-requests')
        );
    }

    /**
     * Notify user about sticker request rejection.
     */
    public static function notifyStickerRequestRejected(User $user, string $type, string $reason): void
    {
        self::create(
            $user->id,
            'alert',
            'Sticker Request Rejected',
            "Your sticker {$type} request was rejected. Reason: {$reason}",
            route('shared.sticker-requests')
        );
    }

    /**
     * Notify department officers about new violation.
     */
    public static function notifyNewViolation(int $departmentId, string $plateNumber, string $violationType): void
    {
        $officers = User::where('department_id', $departmentId)
            ->where('role', 'Department Officer')
            ->get();

        foreach ($officers as $officer) {
            self::create(
                $officer->id,
                'violation',
                'New Violation Reported',
                "A violation ({$violationType}) was reported for vehicle {$plateNumber}.",
                route('admin.reports.index'),
                ['plate_number' => $plateNumber, 'violation_type' => $violationType]
            );
        }
    }

    /**
     * Notify user about violation status update.
     */
    public static function notifyViolationStatusUpdated(User $user, string $plateNumber, string $oldStatus, string $newStatus): void
    {
        $type = $newStatus === 'approved' ? 'success' : ($newStatus === 'rejected' ? 'alert' : 'violation');
        
        self::create(
            $user->id,
            $type,
            "Violation Status Updated to " . ucfirst($newStatus),
            "The violation for vehicle {$plateNumber} has been {$newStatus}.",
            route('shared.report-history'),
            ['plate_number' => $plateNumber, 'old_status' => $oldStatus, 'new_status' => $newStatus]
        );
    }

    /**
     * Mark notification as read.
     */
    public static function markAsRead(int $notificationId, int $userId): bool
    {
        $notification = Notification::where('id', $notificationId)
            ->where('user_id', $userId)
            ->first();

        if ($notification) {
            $notification->markAsRead();
            return true;
        }

        return false;
    }

    /**
     * Mark all notifications as read for a user.
     */
    public static function markAllAsRead(int $userId): int
    {
        return Notification::where('user_id', $userId)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
    }

    /**
     * Delete notification for a user.
     */
    public static function delete(int $notificationId, int $userId): bool
    {
        return Notification::where('id', $notificationId)
            ->where('user_id', $userId)
            ->delete() > 0;
    }
}
