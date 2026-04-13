<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;


use App\Models\MapLocation;
use App\Models\VehicleViolation;
use App\Observers\MapLocationObserver;
use App\Policies\VehicleViolationPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        MapLocation::observe(MapLocationObserver::class);
        Gate::policy(VehicleViolation::class, VehicleViolationPolicy::class);

        if (str_contains(request()->header('Host'), 'sharedwithexpose.com') || request()->header('X-Forwarded-Proto') === 'https') {
            URL::forceScheme('https');
        }

        $this->configureRateLimiting();

        // Register permissions with Gate
        Gate::before(function ($user, $ability) {
            if ($permission = \App\Enums\Permission::tryFrom($ability)) {
                return $user->hasPermission($permission) ?: null;
            }
            return null;
        });
    }


    /**
     * Configure the rate limiters for the application.
     */
    protected function configureRateLimiting(): void
    {
        RateLimiter::for('uploads', function (Request $request) {
            return Limit::perMinute(30)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('registration', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });

        RateLimiter::for('map_api', function (Request $request) {
            return Limit::perMinute(100)->by($request->ip());
        });

        RateLimiter::for('reports', function (Request $request) {
            return Limit::perMinute(10)->by($request->user()?->id ?: $request->ip());
        });
    }

    
}
