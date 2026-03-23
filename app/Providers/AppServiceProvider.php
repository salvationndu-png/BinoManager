<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Event;
use App\Http\Controllers\HomeController;
use Laravel\Fortify\Events\UserLogoutRequested;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        // ── On logout: clear the dev tenant session key ────────────────────
        // When running on localhost the tenant is resolved from _bino_tenant
        // stored in the session. Without this clear, the NEXT person to use
        // the same browser would be silently routed into the previous user's
        // workspace context (before they supply credentials).
        //
        // Laravel invalidates the entire session on logout anyway, but we
        // also explicitly forget the key here as a belt-and-suspenders
        // measure in case any custom logout flow skips session invalidation.
        try {
            Event::listen(UserLogoutRequested::class, function () {
                session()->forget('_bino_tenant');
            });
        } catch (\Throwable $e) {
            // Fortify may not always fire this event — safe to swallow
        }

        // ── $notifications injected into the layout for the bell icon ─────
        View::composer('layouts.modern', function ($view) {
            if (! $view->offsetExists('notifications')) {
                $tid           = app()->bound('current.tenant.id') ? app('current.tenant.id') : null;
                $notifications = (Auth::check() && $tid)
                    ? HomeController::buildNotifications($tid)
                    : [];
                $view->with('notifications', $notifications);
            }
        });

        // ── $currentTenant injected into every view ────────────────────────
        View::composer('*', function ($view) {
            if (! $view->offsetExists('currentTenant')) {
                $tenant = app()->bound('current.tenant') ? app()->make('current.tenant') : null;
                $view->with('currentTenant', $tenant);
            }
        });
    }
}
