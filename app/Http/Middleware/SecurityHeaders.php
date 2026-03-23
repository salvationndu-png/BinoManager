<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

/**
 * Adds security headers to every response.
 * These stop common browser-based attacks and information leaks.
 */
class SecurityHeaders
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        // Prevent MIME-type sniffing (e.g., serving a .jpg that's actually JS)
        $response->headers->set('X-Content-Type-Options', 'nosniff');

        // Block clickjacking — page cannot be loaded in an iframe
        $response->headers->set('X-Frame-Options', 'DENY');

        // Enable browser XSS filter (legacy browsers)
        $response->headers->set('X-XSS-Protection', '1; mode=block');

        // Don't send the referrer header to external sites
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Force HTTPS for 1 year (only enable after SSL is confirmed working)
        // $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

        // Remove server fingerprinting
        $response->headers->remove('X-Powered-By');
        $response->headers->remove('Server');

        return $response;
    }
}
