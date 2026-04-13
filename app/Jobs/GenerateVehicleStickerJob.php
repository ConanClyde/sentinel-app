<?php

namespace App\Jobs;

use App\Models\User;
use App\Models\Vehicle;
use App\Services\StickerService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class GenerateVehicleStickerJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 3;

    /**
     * The number of seconds the job can run before timing out.
     *
     * @var int
     */
    public $timeout = 120;

    /**
     * Create a new job instance.
     */
    public function __construct(
        protected Vehicle $vehicle,
        protected User $user
    ) {}

    /**
     * Execute the job.
     */
    public function handle(StickerService $stickerService): void
    {
        try {
            Log::info('Starting background sticker generation', [
                'vehicle_id' => $this->vehicle->id,
                'user_id' => $this->user->id,
                'sticker_number' => $this->vehicle->sticker_number
            ]);

            $path = $stickerService->generateSticker($this->vehicle, $this->user);
            
            $this->vehicle->update([
                'qr_code_path' => $path
            ]);

            Log::info('Sticker generated successfully in background', [
                'vehicle_id' => $this->vehicle->id,
                'path' => $path
            ]);
        } catch (\Exception $e) {
            Log::error('Sticker generation job failed', [
                'vehicle_id' => $this->vehicle->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            throw $e;
        }
    }
}
