<?php

if (! function_exists('tenant_url')) {
    function tenant_url($path = '') {
        $tenant = app()->bound('current.tenant') ? app()->make('current.tenant') : null;
        $url = url($path);
        
        // Debug: Log tenant status
        \Log::info('tenant_url called', [
            'path' => $path,
            'tenant_bound' => app()->bound('current.tenant'),
            'tenant_value' => $tenant ? $tenant->slug : 'null',
            'host' => request()->getHost(),
            'has_tenant_param' => request()->has('tenant'),
        ]);
        
        // On localhost, append ?tenant=slug
        if ($tenant && config('app.env') === 'local' && request()->getHost() === 'localhost') {
            $separator = str_contains($url, '?') ? '&' : '?';
            return $url . $separator . 'tenant=' . $tenant->slug;
        }
        
        return $url;
    }
}
