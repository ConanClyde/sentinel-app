<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'title',
        'description',
        'link',
        'is_read',
        'data',
        'read_at',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'data' => 'array',
        'read_at' => 'datetime',
    ];

    /**
     * Get the user that owns the notification.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Mark notification as read.
     */
    public function markAsRead(): void
    {
        $this->update([
            'is_read' => true,
            'read_at' => now(),
        ]);
    }

    /**
     * Scope for unread notifications.
     */
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    /**
     * Scope for read notifications.
     */
    public function scopeRead($query)
    {
        return $query->where('is_read', true);
    }

    /**
     * Get icon for notification type.
     */
    public function getIconAttribute(): string
    {
        return match($this->type) {
            'registration' => 'UserPlus',
            'approval' => 'ClipboardCheck',
            'violation' => 'ShieldAlert',
            'sticker' => 'Tag',
            'system' => 'Settings',
            'success' => 'CheckCircle2',
            'alert' => 'AlertTriangle',
            default => 'Bell',
        };
    }

    /**
     * Get color for notification type.
     */
    public function getColorAttribute(): string
    {
        return match($this->type) {
            'registration' => 'text-blue-500',
            'approval' => 'text-amber-500',
            'violation' => 'text-red-500',
            'sticker' => 'text-purple-500',
            'system' => 'text-emerald-500',
            'success' => 'text-emerald-500',
            'alert' => 'text-red-500',
            default => 'text-muted-foreground',
        };
    }
}
