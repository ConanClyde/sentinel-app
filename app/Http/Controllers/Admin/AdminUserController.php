<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class AdminUserController extends Controller
{
    public function index(): Response
    {
        $users = User::with(['roleType'])
            ->orderBy('surname')
            ->get();

        return Inertia::render('admin/users/index', [
            'users' => $users,
        ]);
    }

    public function show(int $id): Response
    {
        $user = User::with(['roleType', 'vehicles.vehicleType', 'vehicles.stickerColor'])->findOrFail($id);

        return Inertia::render('admin/users/show', [
            'user' => $user,
        ]);
    }
}
