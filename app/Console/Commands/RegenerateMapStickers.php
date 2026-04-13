<?php

namespace App\Console\Commands;

use App\Models\MapLocation;
use App\Services\MapStickerService;
use Illuminate\Console\Command;

class RegenerateMapStickers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'map:regenerate-stickers {--id= : Optional specific location ID to regenerate}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Regenerate printable SVG stickers for map locations';

    /**
     * Execute the console command.
     */
    public function handle(MapStickerService $stickerService)
    {
        $id = $this->option('id');

        $query = MapLocation::query();
        if ($id) {
            $query->where('id', $id);
        }

        $locations = $query->get();

        if ($locations->isEmpty()) {
            $this->error('No locations found to regenerate.');
            return 1;
        }

        $this->info("Regenerating stickers for {$locations->count()} locations...");
        $bar = $this->output->createProgressBar($locations->count());

        $bar->start();

        foreach ($locations as $location) {
            try {
                // Delete old one if exists
                $stickerService->delete($location);
                
                // Generate new one
                $path = $stickerService->generate($location);
                
                // Update the path in DB
                $location->updateQuietly(['sticker_path' => $path]);
                
                $bar->advance();
            } catch (\Exception $e) {
                $this->error("\nFailed to regenerate sticker for location {$location->id}: {$e->getMessage()}");
            }
        }

        $bar->finish();
        $this->info("\nDone!");

        return 0;
    }
}
