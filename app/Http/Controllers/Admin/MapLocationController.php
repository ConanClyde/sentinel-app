<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MapLocation;
use App\Models\MapLocationType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MapLocationController extends Controller
{
    /**
     * API: Get all active locations with type info.
     */
    public function getLocations()
    {
        return response()->json(
            MapLocation::where('is_active', true)->with('type')->get()
        );
    }

    /**
     * API: Get all location types.
     */
    public function getTypes()
    {
        return response()->json(MapLocationType::all());
    }

    /**
     * Store a new map location.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'short_code' => 'required|string|max:5|unique:map_locations,short_code',
            'type_id' => 'required|exists:map_location_types,id',
            'vertices' => 'required|array|min:3',
            'vertices.*.x' => 'required|numeric|min:0|max:100',
            'vertices.*.y' => 'required|numeric|min:0|max:100',
            'center_x' => 'required|numeric|min:0|max:100',
            'center_y' => 'required|numeric|min:0|max:100',
            'color' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ]);

        $location = MapLocation::create([
            ...$validated,
            'created_by' => auth()->id(),
            'is_active' => true,
        ]);

        return redirect()->back()->with('success', 'Location created successfully.');
    }

    /**
     * Update an existing map location.
     */
    public function update(Request $request, MapLocation $location)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'short_code' => "required|string|max:5|unique:map_locations,short_code,{$location->id}",
            'type_id' => 'required|exists:map_location_types,id',
            'vertices' => 'required|array|min:3',
            'vertices.*.x' => 'required|numeric|min:0|max:100',
            'vertices.*.y' => 'required|numeric|min:0|max:100',
            'center_x' => 'required|numeric|min:0|max:100',
            'center_y' => 'required|numeric|min:0|max:100',
            'color' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'is_active' => 'boolean',
        ]);

        $location->update($validated);

        return redirect()->back()->with('success', 'Location updated successfully.');
    }

    /**
     * Toggle the active status of a location.
     */
    public function toggleActive(MapLocation $location)
    {
        $location->update(['is_active' => ! $location->is_active]);

        return redirect()->back();
    }

    /**
     * Remove the specified map location.
     */
    /**
     * Remove the specified map location.
     */
    public function destroy(MapLocation $location)
    {
        $location->delete();

        return redirect()->back()->with('success', 'Location deleted successfully.');
    }

    /**
     * Download the printable sticker for a location.
     */
    public function downloadSticker(MapLocation $location)
    {
        if (! $location->sticker_path || ! Storage::disk('public')->exists($location->sticker_path)) {
            return redirect()->back()->with('error', 'Sticker file not found.');
        }

        return Storage::disk('public')->download(
            $location->sticker_path,
            "patrol_sticker_{$location->short_code}.svg"
        );
    }
}
