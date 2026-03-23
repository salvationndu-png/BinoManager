<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Central Domain
    |--------------------------------------------------------------------------
    | The domain your landing page, signup, and super-admin live on.
    | Tenants are accessed via path-based URLs: {central_domain}/{slug}/...
    |
    */
    'central_domain' => env('APP_DOMAIN', 'wholesalemanager.com'),

    /*
    |--------------------------------------------------------------------------
    | Trial Duration
    |--------------------------------------------------------------------------
    */
    'trial_days' => env('TRIAL_DAYS', 14),

    /*
    |--------------------------------------------------------------------------
    | Grace Period (days after failed payment before hard suspension)
    |--------------------------------------------------------------------------
    */
    'grace_days' => env('GRACE_DAYS', 7),

    /*
    |--------------------------------------------------------------------------
    | Invitation Expiry (hours)
    |--------------------------------------------------------------------------
    */
    'invitation_expiry_hours' => 48,

    /*
    |--------------------------------------------------------------------------
    | Paystack
    |--------------------------------------------------------------------------
    */
    'paystack' => [
        'secret_key'    => env('PAYSTACK_SECRET_KEY'),
        'public_key'    => env('PAYSTACK_PUBLIC_KEY'),
        'webhook_secret' => env('PAYSTACK_WEBHOOK_SECRET'), // for HMAC verification
    ],

    /*
    |--------------------------------------------------------------------------
    | Reserved slugs (cannot be used as tenant paths)
    |--------------------------------------------------------------------------
    */
    'reserved_slugs' => [
        'www', 'admin', 'api', 'mail', 'ftp', 'smtp',
        'ns1', 'ns2', 'app', 'dashboard', 'billing',
        'support', 'help', 'status', 'blog', 'docs',
        'superadmin', 'login', 'register', 'logout',
        'webhooks', 'assets', 'storage', 'public',
        'test', 'staging', 'dev', 'demo', 'cdn',
        'static', 'media', 'images', 'files',
        'register-workspace', 'pricing', 'invitation',
        'reset-password', 'email', 'two-factor-challenge',
        'password', 'user',
    ],
];
