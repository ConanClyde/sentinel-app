<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use Inertia\Inertia;
use Inertia\Response;

class AdminVehicleController extends Controller
{
    public function index(): Response
    {
        $vehicles = Vehicle::with(['user', 'vehicleType', 'stickerColor'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('admin/vehicles/index', [
            'vehicles' => $vehicles,
        ]);
    }
}
