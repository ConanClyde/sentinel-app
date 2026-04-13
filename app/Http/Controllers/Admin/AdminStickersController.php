<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use Inertia\Inertia;
use Inertia\Response;

class AdminStickersController extends Controller
{
    public function index(): Response
    {
        $paginated = Vehicle::with(['user', 'stickerColor', 'vehicleType'])
            ->whereNotNull('sticker_number')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('admin/stickers/index', [
            'vehicles' => $paginated->items(),
            'canManage' => false,
            'stickersPagination' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'total' => $paginated->total(),
            ],
        ]);
    }
}
