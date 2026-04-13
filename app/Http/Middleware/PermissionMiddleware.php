<?php

namespace App\Http\Middleware;

use App\Enums\Permission;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PermissionMiddleware
{
    public function handle(Request $request, Closure $next, string ...$permissions): Response
    {
        $user = $request->user();

        if (! $user || ! $user->role) {
            return to_route('login');
        }

        foreach ($permissions as $permission) {
            $perm = Permission::tryFrom($permission);
            if (! $perm || ! $user->hasPermission($perm)) {
                abort(403, 'You do not have permission to perform this action.');
            }
        }

        return $next($request);
    }
}
