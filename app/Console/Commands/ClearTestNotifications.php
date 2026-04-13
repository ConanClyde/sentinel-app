<?php

namespace App\Console\Commands;

use App\Models\Notification;
use Illuminate\Console\Command;

class ClearTestNotifications extends Command
{
    protected $signature = 'notifications:clear';
    protected $description = 'Delete all test notifications';

    public function handle()
    {
        $count = Notification::count();
        Notification::truncate();
        
        $this->info("Deleted {$count} notifications from the database.");
        return 0;
    }
}
