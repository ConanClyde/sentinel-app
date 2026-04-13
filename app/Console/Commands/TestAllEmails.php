<?php

namespace App\Console\Commands;

use App\Mail\AdminRegistrationCreated;
use App\Mail\RegistrationApproved;
use App\Mail\RegistrationRejected;
use App\Mail\RegistrationVerificationCode;
use App\Mail\StickerExpiringMail;
use App\Mail\StickerRequestApproved;
use App\Mail\StickerRequestRejected;
use App\Mail\VehicleRequestApproved;
use App\Mail\VehicleRequestRejected;
use App\Mail\ViolationReported;
use App\Mail\ViolationStatusUpdated;
use App\Models\PendingRegistration;
use App\Models\StickerRequest;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleRequest;
use App\Models\VehicleViolation;
use App\Models\VehicleType;
use App\Models\StickerColor;
use App\Models\ViolationType;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestAllEmails extends Command
{
    protected $signature = 'test:emails {email=neev.d3v@gmail.com}';
    protected $description = 'Send all 13 email types to test address';

    private int $emailsSent = 0;
    private array $errors = [];

    public function handle()
    {
        $email = $this->argument('email');
        
        $this->info("\n📧 SENTINEL APP - COMPREHENSIVE EMAIL TEST");
        $this->line("==========================================");
        $this->info("Sending all 13 email types to: {$email}");
        $this->line("");

        // Get or create test user
        $user = User::where('email', $email)->first();
        if (!$user) {
            $this->warn("⚠️  User not found. Creating test user...");
            $user = User::create([
                'first_name' => 'Test',
                'surname' => 'User',
                'email' => $email,
                'password' => bcrypt('test123'),
                'role' => 'Student',
            ]);
            $this->info("✅ User created: {$user->full_name}\n");
        }

        // Get required data
        $vehicleType = VehicleType::first();
        $stickerColor = StickerColor::first();
        $violationType = ViolationType::first();

        if (!$vehicleType || !$stickerColor || !$violationType) {
            $this->error("❌ Missing required data. Run database seeders first!");
            return 1;
        }

        $this->line("==========================================\n");

        // 1. Registration Verification Code
        $this->info("1️⃣  Registration Emails:");
        $verificationCode = rand(100000, 999999);
        $this->sendEmail(
            "Registration Verification Code ({$verificationCode})",
            new RegistrationVerificationCode($verificationCode, $email)
        );

        // 2. Sticker Expiring
        $this->info("\n2️⃣  Sticker Expiration Email:");
        $expiringVehicle = Vehicle::firstOrCreate(
            ['plate_number' => 'TEST-EXPIRE'],
            [
                'user_id' => $user->id,
                'vehicle_type_id' => $vehicleType->id,
                'sticker_number' => 'TEST-EXPIRE-2026',
                'sticker_color_id' => $stickerColor->id,
                'is_active' => true,
                'expires_at' => now()->addDays(14),
            ]
        );
        $this->sendEmail(
            "Sticker Expiring (expires: {$expiringVehicle->expires_at->format('M d, Y')})",
            new StickerExpiringMail($expiringVehicle)
        );

        // 3-5. Registration Workflow
        $this->info("3️⃣  Registration Workflow Emails:");
        
        // Clean up previous test data
        PendingRegistration::where('email', $email)->delete();
        
        $pendingApproved = PendingRegistration::create([
            'first_name' => 'Approved',
            'surname' => 'User',
            'email' => $email,
            'contact_number' => '+639123456789',
            'role' => 'Student',
            'student_id' => '2026-00001',
            'password' => bcrypt('test123'),
            'verified_at' => now(),
        ]);
        $this->sendEmail(
            "Registration Approved",
            new RegistrationApproved($pendingApproved)
        );
        
        // Delete the first one before creating the second
        $pendingApproved->delete();
        
        $pendingRejected = PendingRegistration::create([
            'first_name' => 'Rejected',
            'surname' => 'User',
            'email' => $email,
            'contact_number' => '+639123456789',
            'role' => 'Student',
            'student_id' => '2026-00002',
            'password' => bcrypt('test123'),
            'verified_at' => now(),
            'rejection_reason' => 'Invalid documentation provided. Please resubmit with complete requirements.',
        ]);
        $this->sendEmail(
            "Registration Rejected",
            new RegistrationRejected($pendingRejected)
        );

        $this->sendEmail(
            "Admin Account Created",
            new AdminRegistrationCreated($user, 'TempPass123!')
        );

        // 6-7. Vehicle Request Emails
        $this->info("\n4️⃣  Vehicle Request Emails:");
        
        // Clean up previous test data (order matters due to foreign keys)
        $testVehicleIds = Vehicle::where('plate_number', 'like', 'TEST-%')
            ->where('user_id', $user->id)
            ->pluck('id');
        
        StickerRequest::whereIn('vehicle_id', $testVehicleIds)->delete();
        VehicleViolation::whereIn('violator_vehicle_id', $testVehicleIds)->delete();
        VehicleRequest::where('plate_number', 'like', 'TEST-%')->where('user_id', $user->id)->delete();
        Vehicle::where('plate_number', 'like', 'TEST-%')->where('user_id', $user->id)->delete();
        
        $approvedVehicle = Vehicle::create([
            'user_id' => $user->id,
            'vehicle_type_id' => $vehicleType->id,
            'plate_number' => 'TEST-APPROVED',
            'sticker_number' => 'APR-2026-001',
            'sticker_color_id' => $stickerColor->id,
            'is_active' => true,
            'expires_at' => now()->addYear(),
        ]);

        $approvedVehicleRequest = VehicleRequest::create([
            'user_id' => $user->id,
            'vehicle_type_id' => $vehicleType->id,
            'plate_number' => 'TEST-APPROVED',
            'status' => 'approved',
            'vehicle_id' => $approvedVehicle->id,
        ]);
        $this->sendEmail(
            "Vehicle Request Approved ({$approvedVehicleRequest->plate_number})",
            new VehicleRequestApproved($approvedVehicleRequest)
        );

        $rejectedVehicleRequest = VehicleRequest::create([
            'user_id' => $user->id,
            'vehicle_type_id' => $vehicleType->id,
            'plate_number' => 'TEST-REJECTED',
            'status' => 'rejected',
            'notes' => 'Unable to approve. Please provide complete vehicle registration documents.',
        ]);
        $this->sendEmail(
            "Vehicle Request Rejected",
            new VehicleRequestRejected($rejectedVehicleRequest)
        );

        // 8-9. Sticker Request Emails
        $this->info("\n5️⃣  Sticker Request Emails:");
        
        // Recreate expiring vehicle if it was deleted
        $expiringVehicle = Vehicle::firstOrCreate(
            ['plate_number' => 'TEST-EXPIRE'],
            [
                'user_id' => $user->id,
                'vehicle_type_id' => $vehicleType->id,
                'sticker_number' => 'TEST-EXPIRE-2026',
                'sticker_color_id' => $stickerColor->id,
                'is_active' => true,
                'expires_at' => now()->addDays(14),
            ]
        );
        
        $approvedStickerRequest = StickerRequest::create([
            'user_id' => $user->id,
            'vehicle_id' => $expiringVehicle->id,
            'type' => 'renewal',
            'status' => 'approved',
        ]);
        $this->sendEmail(
            "Sticker Request Approved (Renewal)",
            new StickerRequestApproved($approvedStickerRequest)
        );

        $rejectedStickerRequest = StickerRequest::create([
            'user_id' => $user->id,
            'vehicle_id' => $expiringVehicle->id,
            'type' => 'replacement',
            'status' => 'rejected',
            'notes' => 'Please visit the administration office with your damaged sticker.',
        ]);
        $this->sendEmail(
            "Sticker Request Rejected (Replacement)",
            new StickerRequestRejected($rejectedStickerRequest)
        );

        // 10-13. Violation Emails
        $this->info("\n6️⃣  Violation Workflow Emails:");
        
        // No need to delete - already cleaned up above
        
        $violation1 = VehicleViolation::create([
            'reported_by' => $user->id,
            'violator_vehicle_id' => $expiringVehicle->id,
            'violator_sticker_number' => $expiringVehicle->sticker_number,
            'violation_type_id' => $violationType->id,
            'description' => 'Vehicle parked in no parking zone near Building A.',
            'location' => 'Building A - North Entrance',
            'status' => 'pending',
            'reported_at' => now(),
        ]);
        $this->sendEmail(
            "Violation Reported (Status: {$violation1->status})",
            new ViolationReported($violation1)
        );

        $violation2 = VehicleViolation::create([
            'reported_by' => $user->id,
            'violator_vehicle_id' => $expiringVehicle->id,
            'violator_sticker_number' => $expiringVehicle->sticker_number,
            'violation_type_id' => $violationType->id,
            'description' => 'Expired sticker displayed on vehicle.',
            'location' => 'Parking Lot B',
            'status' => 'approved',
            'reported_at' => now()->subHours(2),
            'status_updated_at' => now(),
            'remarks' => 'Violation confirmed. Please renew your sticker immediately.',
        ]);
        $this->sendEmail(
            "Violation Status Updated (APPROVED) - To Violator",
            new ViolationStatusUpdated($violation2, 'violator')
        );
        $this->sendEmail(
            "Violation Status Updated (APPROVED) - To Reporter",
            new ViolationStatusUpdated($violation2, 'reporter')
        );

        $violation3 = VehicleViolation::create([
            'reported_by' => $user->id,
            'violator_vehicle_id' => $expiringVehicle->id,
            'violator_sticker_number' => $expiringVehicle->sticker_number,
            'violation_type_id' => $violationType->id,
            'description' => 'This violation was rejected due to insufficient evidence.',
            'location' => 'Main Gate',
            'status' => 'rejected',
            'reported_at' => now()->subHours(5),
            'status_updated_at' => now(),
            'rejection_reason' => 'Insufficient evidence. Please resubmit with clearer documentation.',
        ]);
        $this->sendEmail(
            "Violation Status Updated (REJECTED) - To Violator",
            new ViolationStatusUpdated($violation3, 'violator')
        );

        // Summary
        $this->line("\n==========================================");
        $this->info("📊 TEST SUMMARY");
        $this->line("==========================================");
        $this->info("✅ Emails Queued: {$this->emailsSent}/13");

        if (count($this->errors) > 0) {
            $this->error("\n❌ ERRORS (" . count($this->errors) . "):");
            foreach ($this->errors as $error) {
                $this->error("  - {$error}");
            }
        }

        $this->line("\n🔍 NEXT STEPS:");
        $this->line("  1. Make sure queue worker is running: php artisan queue:work");
        $this->line("  2. Check email inbox: {$email}");
        $this->line("  3. Monitor logs: tail -f storage/logs/laravel.log");
        $this->line("  4. Check failed jobs: php artisan queue:failed");

        $this->info("\n📧 You should receive {$this->emailsSent} emails in your inbox!");
        $this->line("==========================================\n");

        return 0;
    }

    private function sendEmail(string $description, $mailable)
    {
        $email = $this->argument('email');
        
        $this->output->write("📤 {$description}... ");
        try {
            Mail::to($email)->queue($mailable);
            $this->line("✅ QUEUED");
            $this->emailsSent++;
        } catch (\Exception $e) {
            $this->error("❌ FAILED: " . $e->getMessage());
            $this->errors[] = $description . ': ' . $e->getMessage();
        }
    }
}
