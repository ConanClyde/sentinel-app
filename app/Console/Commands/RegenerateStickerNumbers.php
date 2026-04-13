<?php

namespace App\Console\Commands;

use App\Models\StickerColor;
use App\Models\StickerCounter;
use App\Models\Vehicle;
use App\Services\StickerService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class RegenerateStickerNumbers extends Command
{
    protected $signature = 'stickers:regenerate-numbers {--dry-run : Show what would happen without making changes}';

    protected $description = 'Regenerate all sticker numbers to new format (COLOR-0001)';

    public function handle(StickerService $service): int
    {
        $vehicles = Vehicle::with(['user', 'stickerColor'])
            ->whereNotNull('sticker_number')
            ->orderBy('id')
            ->get();

        if ($vehicles->isEmpty()) {
            $this->info('No vehicles found.');

            return self::SUCCESS;
        }

        $this->info("Found {$vehicles->count()} vehicles to process.");

        // Group by color to assign sequential numbers
        $byColor = $vehicles->groupBy('sticker_color_id');

        $dryRun = $this->option('dry-run');

        if ($dryRun) {
            $this->info("\nDRY RUN - No changes will be made\n");
        }

        $bar = $this->output->createProgressBar($vehicles->count());
        $bar->start();

        $results = [];

        foreach ($byColor as $colorId => $colorVehicles) {
            $color = StickerColor::find($colorId);
            if (! $color) {
                continue;
            }

            $counter = 1;
            foreach ($colorVehicles as $vehicle) {
                $oldNumber = $vehicle->sticker_number;
                $newNumber = strtoupper($color->name).'-'.str_pad($counter, 4, '0', STR_PAD_LEFT);

                $results[] = [
                    'id' => $vehicle->id,
                    'old' => $oldNumber,
                    'new' => $newNumber,
                    'color' => $color->name,
                ];

                if (! $dryRun) {
                    DB::transaction(function () use ($vehicle, $newNumber, $service) {
                        $vehicle->sticker_number = $newNumber;

                        // Regenerate sticker SVG
                        if ($vehicle->user) {
                            $vehicle->qr_code_path = $service->generateSticker($vehicle, $vehicle->user);
                        }

                        $vehicle->save();
                    });
                }

                $counter++;
            }

            // Update counter for this color
            if (! $dryRun) {
                StickerCounter::updateOrCreate(
                    ['color' => $color->name],
                    ['count' => $counter - 1]
                );
            }
        }

        $bar->finish();
        $this->newLine(2);

        // Show sample results
        $this->info('Sample changes:');
        $sample = array_slice($results, 0, 10);
        foreach ($sample as $r) {
            $this->line("  ID {$r['id']}: {$r['old']} -> {$r['new']} ({$r['color']})");
        }

        if (count($results) > 10) {
            $this->info('  ... and '.(count($results) - 10).' more');
        }

        if ($dryRun) {
            $this->newLine();
            $this->info('Run without --dry-run to apply changes.');
        } else {
            $this->newLine();
            $this->info("Regenerated {$vehicles->count()} sticker numbers.");
        }

        return self::SUCCESS;
    }
}
