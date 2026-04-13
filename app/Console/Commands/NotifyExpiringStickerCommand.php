<?php

namespace App\Console\Commands;

use App\Mail\StickerExpiringMail;
use App\Models\Vehicle;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class NotifyExpiringStickerCommand extends Command
{
    protected $signature   = 'stickers:notify-expiring';
    protected $description = 'Send email notifications to users whose stickers expire in exactly 14 days';

    public function handle(): int
    {
        $targetDate = now()->addDays(14)->toDateString();

        $vehicles = Vehicle::whereDate('expires_at', $targetDate)
            ->where('is_active', true)
            ->with('user')
            ->get();

        $count = 0;
        foreach ($vehicles as $vehicle) {
            if ($vehicle->user?->email) {
                Mail::to($vehicle->user->email)->send(new StickerExpiringMail($vehicle));
                $count++;
            }
        }

        $this->info("Sent {$count} expiry notification(s) for {$targetDate}.");

        return self::SUCCESS;
    }
}
