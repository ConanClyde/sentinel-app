<?php

namespace App\Observers;

use App\Models\MapLocation;
use App\Services\MapStickerService;

class MapLocationObserver
{
    public function __construct(protected MapStickerService $stickerService) {}

    /**
     * Generate a sticker after a location is created.
     */
    public function created(MapLocation $location): void
    {
        try {
            $path = $this->stickerService->generate($location);
            // Update quietly to avoid retriggering the observer
            $location->updateQuietly(['sticker_path' => $path]);
        } catch (\Throwable $e) {
            logger()->error("MapLocationObserver@created: sticker generation failed for location {$location->id}: {$e->getMessage()}");
        }
    }

    /**
     * Regenerate sticker when name, short_code, or color changes.
     */
    public function updated(MapLocation $location): void
    {
        $watched = ['name', 'short_code', 'color'];

        if (! $location->wasChanged($watched)) {
            return;
        }

        try {
            // Delete old sticker file
            $this->stickerService->delete($location);

            // Generate fresh sticker
            $path = $this->stickerService->generate($location);
            $location->updateQuietly(['sticker_path' => $path]);
        } catch (\Throwable $e) {
            logger()->error("MapLocationObserver@updated: sticker regeneration failed for location {$location->id}: {$e->getMessage()}");
        }
    }

    /**
     * Remove sticker file when a location is deleted.
     */
    public function deleted(MapLocation $location): void
    {
        try {
            $this->stickerService->delete($location);
        } catch (\Throwable $e) {
            logger()->error("MapLocationObserver@deleted: sticker cleanup failed for location {$location->id}: {$e->getMessage()}");
        }
    }
}
