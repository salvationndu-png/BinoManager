<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\RequiresTenant;
use Illuminate\Support\Facades\Auth;
use App\Models\Products;
use App\Models\Stocks;

class HomeController extends Controller
{
    use RequiresTenant;

    /**
     * Main entry — serve the React SPA shell.
     * All data loading happens via JS → /api/dashboard and other JSON endpoints.
     */
    public function redirect()
    {
        if (! Auth::check()) {
            return redirect('/');
        }
        return view('layouts.tenant-app');
    }

    // These Blade views are still used by non-SPA flows (kept for compatibility)
    public function login()     { return view('auth.login'); }

    /**
     * The SPA handles stock, sales, products etc. via its own routing.
     * These methods redirect back to the SPA home so direct URL hits work.
     */
    public function stock()     { return redirect('/home'); }
    public function sales()     { return redirect('/home'); }
    public function track()     { return redirect('/home'); }
    public function analytics() { return redirect('/home'); }
    public function product()   { return redirect('/home'); }

    /**
     * Build notifications for the layout bell icon.
     * Still used by the Blade layout composer (team/billing/settings pages
     * that are not yet in the SPA).
     */
    public static function buildNotifications(?int $tid = null): array
    {
        $tid = $tid ?? app('current.tenant.id');
        if (! $tid) return [];

        $notifications = [];

        $lowStock = Products::where('quantity', '<', 10)->where('quantity', '>', 0)->get();
        if ($lowStock->count() > 0) {
            $notifications[] = [
                'type'    => 'warning',
                'title'   => 'Low Stock Alert',
                'message' => $lowStock->count() . ' product(s) need restocking',
                'time'    => 'Now',
            ];
        }

        $recentSales = \App\Models\Sales::with('product')->orderBy('created_at', 'desc')->take(3)->get();
        foreach ($recentSales as $sale) {
            $notifications[] = [
                'type'    => 'success',
                'title'   => 'New Sale',
                'message' => ($sale->product ? $sale->product->name : 'Product') . ' — ₦' . number_format($sale->total),
                'time'    => $sale->created_at->diffForHumans(),
            ];
        }

        return $notifications;
    }
}
