<?php

namespace App\Console\Commands;

use App\Mail\AdminRegistrationCreated;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendTestEmail extends Command
{
    protected $signature = 'app:send-test-email {email}';

    protected $description = 'Send test email to specified address';

    public function handle()
    {
        $email = $this->argument('email');

        $user = new User([
            'first_name' => 'Test',
            'surname' => 'User',
            'email' => $email,
        ]);

        Mail::to($email)->send(new AdminRegistrationCreated($user));

        $this->info("Test email sent to {$email}");
    }
}
