<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Illuminate\Support\Facades\Auth;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request)
    {
        $user = Auth::user();
        
        \Log::info('LoginResponse triggered', [
            'user_id' => $user?->id,
            'tenant_id' => $user?->tenant_id,
        ]);
        
        if ($user && $user->tenant_id) {
            $tenant = \App\Models\Tenant::find($user->tenant_id);
            
            if ($tenant && !$tenant->trashed()) {
                // Store tenant slug in session
                session(['_bino_tenant' => $tenant->slug]);
                
                $redirectUrl = '/' . $tenant->slug . '/home';
                \Log::info('Redirecting after login', ['url' => $redirectUrl]);
                
                // Redirect to tenant dashboard
                return redirect($redirectUrl);
            }
        }
        
        \Log::info('Fallback redirect to /home');
        // Fallback to default home
        return redirect('/home');
    }
}
