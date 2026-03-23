<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Tenant;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * InitializeTenancy
 *
 * Resolves the current tenant and binds it into the app container.
 *
 * Resolution order:
 *   1. Path segment — /{slug}/... (e.g., /zenoil/dashboard)
 *   2. Query param — dev only:  ?tenant=slug  (persists to session)
 *   3. Session     — tenant_slug stored after login/register
 *   4. Auth user   — derived from Auth::user()->tenant_id
 *
 * Security:
 *   - Path segment is validated against database
 *   - All Eloquent models use BelongsToTenant global scope (reads current.tenant.id)
 *   - Cross-tenant data access is structurally impossible
 */
class InitializeTenancy
{
    public function handle(Request $request, Closure $next): Response
    {
        $isLocal = config('app.env') === 'local';

        // ── 1. Path segment (/{slug}/...) ──────────────────────────────────
        $slug = $this->extractSlugFromPath($request->path());

        // ── 2. Dev: ?tenant= query param (also writes to session) ─────────
        if ($slug === null && $isLocal && $request->has('tenant')) {
            $slug = trim($request->get('tenant'));
            if ($slug) {
                session(['_bino_tenant' => $slug]);
            }
        }

        // ── 3. Session fallback ────────────────────────────────────────────
        if ($slug === null) {
            $slug = session('_bino_tenant');
        }

        // ── 4. Logged-in user fallback (no slug yet) ───────────────────────
        if ($slug === null && Auth::check()) {
            $user = Auth::user();
            if ($user && $user->tenant_id) {
                $tenant = Tenant::find($user->tenant_id);
                if ($tenant && ! $tenant->trashed()) {
                    session(['_bino_tenant' => $tenant->slug]);
                    $this->bind($tenant);
                    return $next($request);
                }
            }
        }

        // ── No tenant context ──────────────────────────────────────────────
        if ($slug === null) {
            app()->instance('current.tenant', null);
            app()->instance('current.tenant.id', null);
            return $next($request);
        }

        // Validate slug format
        if (! preg_match('/^[a-z0-9][a-z0-9\-]{0,61}[a-z0-9]$/', $slug)) {
            abort(404, 'Invalid workspace identifier.');
        }

        $tenant = Tenant::where('slug', $slug)->first();

        if (! $tenant) {
            if ($isLocal) session()->forget('_bino_tenant');
            abort(404, 'Workspace not found.');
        }

        if ($tenant->trashed()) {
            if ($isLocal) session()->forget('_bino_tenant');
            abort(410, 'This workspace has been removed.');
        }

        $this->bind($tenant);
        return $next($request);
    }

    private function bind(Tenant $tenant): void
    {
        app()->instance('current.tenant', $tenant);
        app()->instance('current.tenant.id', $tenant->id);
        view()->share('currentTenant', $tenant);
    }

    /**
     * Extract tenant slug from path: /{slug}/dashboard → "slug"
     */
    private function extractSlugFromPath(string $path): ?string
    {
        // Remove leading/trailing slashes
        $path = trim($path, '/');
        
        // Get first segment
        $segments = explode('/', $path);
        $firstSegment = $segments[0] ?? null;
        
        if (!$firstSegment) {
            return null;
        }
        
        // Check if it's a reserved path (central domain routes)
        $reserved = config('tenancy.reserved_slugs', [
            'register-workspace', 'pricing', 'invitation', 'reset-password',
            'webhooks', 'superadmin', 'login', 'register', 'logout',
            'password', 'email', 'two-factor-challenge', 'api',
        ]);
        
        if (in_array($firstSegment, $reserved, true)) {
            return null;
        }
        
        // Validate slug format
        if (preg_match('/^[a-z0-9][a-z0-9\-]{0,61}[a-z0-9]$/', $firstSegment)) {
            return $firstSegment;
        }
        
        return null;
    }
}
