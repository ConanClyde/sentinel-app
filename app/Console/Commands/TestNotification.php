<?php

namespace App\Console\Commands;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Console\Command;

class TestNotification extends Command
{
    protected $signature = 'test:notification';
    protected $description = 'Create test notifications for the current user';

    public function handle()
    {
        $user = User::first();
        
        if (!$user) {
            $this->error('No users found in the database.');
            return 1;
        }

        $this->info("Creating test notifications for: {$user->full_name} (ID: {$user->id})");

        // Create sample notifications
        $notifications = [
            [
                'user_id' => $user->id,
                'type' => 'registration',
                'title' => 'New Registration Pending',
                'description' => 'John Doe has submitted a registration request.',
                'link' => route('admin.pending-approvals.index'),
            ],
            [
                'user_id' => $user->id,
                'type' => 'approval',
                'title' => 'Vehicle Request Submitted',
                'description' => 'A new vehicle request is pending approval.',
                'link' => route('admin.pending-vehicles.index'),
            ],
            [
                'user_id' => $user->id,
                'type' => 'violation',
                'title' => 'New Violation Reported',
                'description' => 'A violation was reported for vehicle ABC-1234.',
                'link' => route('admin.reports.index'),
            ],
            [
                'user_id' => $user->id,
                'type' => 'sticker',
                'title' => 'Sticker Request Received',
                'description' => 'Your sticker request is being processed.',
                'link' => route('shared.sticker-requests'),
            ],
            [
                'user_id' => $user->id,
                'type' => 'success',
                'title' => 'Registration Approved',
                'description' => 'Your registration has been approved successfully.',
                'link' => route('dashboard'),
            ],
        ];

        foreach ($notifications as $data) {
            Notification::create($data);
            $this->info("✓ Created: {$data['title']}");
        }

        $this->info("\nTotal notifications created: " . count($notifications));
        $this->info("Visit http://127.0.0.1:8000 and check the notification bell!");

        return 0;
    }
}
