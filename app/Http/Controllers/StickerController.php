<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

class StickerController extends Controller
{
    /**
     * Serve private sticker files - accessible to administrators only
     */
    public function show(string $userId, string $filename)
    {
        /** @var User|null $user */
        $user = auth()->user();

        // Administrators and Department Officers with view_stickers can access sticker files
        if (! $user) {
            abort(403, 'Unauthorized access.');
        }

        $canView = $user->isAdministrator()
            || ($user->role === UserRole::DEPARTMENT_OFFICER && $user->can('view_stickers'));

        if (! $canView) {
            abort(403, 'Unauthorized access.');
        }

        $path = "stickers/users/{$userId}/{$filename}";

        if (! Storage::disk('private')->exists($path)) {
            abort(404);
        }

        $content = Storage::disk('private')->get($path);

        return response($content, 200, [
            'Content-Type' => 'image/svg+xml',
            'Content-Disposition' => 'inline; filename="'.$filename.'"',
        ]);
    }
}
