<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * Get all notifications for the authenticated user.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        $query = Notification::where('user_id', $user->id)
            ->orderBy('is_read', 'asc')
            ->orderBy('created_at', 'desc');

        if ($request->boolean('unread_only')) {
            $query->where('is_read', false);
        }

        $notifications = $query->limit(50)->get()->map(function ($notification) {
            return [
                'id' => $notification->id,
                'title' => $notification->title,
                'description' => $notification->description,
                'link' => $notification->link,
                'type' => $notification->type,
                'icon' => $notification->icon,
                'color' => $notification->color,
                'is_read' => $notification->is_read,
                'created_at' => $notification->created_at->diffForHumans(),
                'created_at_full' => $notification->created_at->format('M d, Y g:i A'),
            ];
        });

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => Notification::where('user_id', $user->id)->where('is_read', false)->count(),
        ]);
    }

    /**
     * Mark a notification as read.
     */
    public function markAsRead(Notification $notification)
    {
        $user = Auth::user();

        if ($notification->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        NotificationService::markAsRead($notification->id, $user->id);

        return response()->json(['success' => true]);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead()
    {
        $user = Auth::user();
        $count = NotificationService::markAllAsRead($user->id);

        return response()->json([
            'success' => true,
            'marked_count' => $count,
        ]);
    }

    /**
     * Delete a notification.
     */
    public function delete(Notification $notification)
    {
        $user = Auth::user();

        if ($notification->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        NotificationService::delete($notification->id, $user->id);

        return response()->json(['success' => true]);
    }
}
