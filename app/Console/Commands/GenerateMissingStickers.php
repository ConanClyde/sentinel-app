<?php

namespace App\Console\Commands;

use App\Models\Vehicle;
use App\Services\StickerService;
use Illuminate\Console\Command;

class GenerateMissingStickers extends Command
{
    protected $signature = 'stickers:generate-missing {--force : Regenerate all stickers}';

    protected $description = 'Generate stickers for vehicles without QR codes';

    public function handle(StickerService $service): int
    {
        $query = Vehicle::with(['user', 'stickerColor'])
            ->whereNotNull('sticker_number');

        if (! $this->option('force')) {
            $query->whereNull('qr_code_path');
        }

        $vehicles = $query->get();

        if ($vehicles->isEmpty()) {
            $this->info('No vehicles need sticker generation.');

            return self::SUCCESS;
        }

        $this->info("Found {$vehicles->count()} vehicles to process...");

        $bar = $this->output->createProgressBar($vehicles->count());
        $bar->start();

        $generated = 0;
        $skipped = 0;

        foreach ($vehicles as $vehicle) {
            if (! $vehicle->user) {
                $this->warn("\nVehicle {$vehicle->id} has no user, skipping.");
                $skipped++;
                $bar->advance();

                continue;
            }

            if (! $vehicle->stickerColor) {
                $this->warn("\nVehicle {$vehicle->id} has no sticker color, skipping.");
                $skipped++;
                $bar->advance();

                continue;
            }

            try {
                $vehicle->qr_code_path = $service->generateSticker($vehicle, $vehicle->user);
                $vehicle->save();
                $generated++;
            } catch (\Exception $e) {
                $this->error("\nFailed to generate sticker for vehicle {$vehicle->id}: {$e->getMessage()}");
                $skipped++;
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);
        $this->info("Generated: {$generated}");
        if ($skipped > 0) {
            $this->warn("Skipped: {$skipped}");
        }

        return self::SUCCESS;
    }
}
