<!DOCTYPE html>
<html lang="en" class="{{ session('theme', 'light') === 'dark' ? 'dark' : '' }}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="csrf-token" content="{{ csrf_token() }}">
  <title>{{ $currentTenant?->settings?->business_name ?? $currentTenant?->name ?? 'Dashboard' }} — BinoManager</title>

  {{-- Prevent flash of unstyled content for dark mode --}}
  <script>
    (function() {
      try {
        var t = localStorage.getItem('theme');
        if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          document.documentElement.classList.add('dark');
        }
      } catch(e) {}
    })();
  </script>

  @vite(['resources/js/tenant-app/main.tsx'])

  {{--
    window.BinoManager — the single source of truth injected from PHP into React.
    React components read this object instead of making extra API calls for
    user/tenant metadata that Laravel already has server-side.

    Security: only non-sensitive data is exposed here. No passwords, tokens,
    or plan limits that could be exploited client-side.
  --}}
  <script>
    window.BinoManager = {
      csrf:        {{ Js::from(csrf_token()) }},
      logoutUrl:   {{ Js::from(route('logout')) }},
      isLocal:     {{ Js::from(config('app.env') === 'local' && config('tenancy.central_domain') === 'localhost') }},
      tenantSlug:  {{ Js::from(isset($currentTenant) ? $currentTenant->slug : '') }},
      user: {
        name:    {{ Js::from(Auth::user()->name) }},
        email:   {{ Js::from(Auth::user()->email) }},
        isAdmin: {{ Js::from(Auth::user()->usertype == 1) }},
      },
      tenant: {
        name:          {{ Js::from($currentTenant?->settings?->business_name ?? $currentTenant?->name ?? '') }},
        slug:          {{ Js::from($currentTenant?->slug ?? '') }},
        plan:          {{ Js::from($currentTenant?->plan?->name ?? 'Starter') }},
        status:        {{ Js::from($currentTenant?->status ?? 'active') }},
        @if($currentTenant?->settings?->logo_path)
        logoUrl:       {{ Js::from(Storage::url($currentTenant->settings->logo_path)) }},
        @else
        logoUrl:       null,
        @endif
        @if($currentTenant?->isOnTrial())
        trialDaysLeft: {{ Js::from($currentTenant->trialDaysLeft()) }},
        @else
        trialDaysLeft: null,
        @endif
      }
    };
  </script>
</head>
<body class="bg-zinc-50 dark:bg-zinc-950 antialiased">
  {{-- React mounts here --}}
  <div id="tenant-app"></div>

  {{-- Toast container (used by stock.js / sales.js if ever loaded standalone) --}}
  <div id="toastContainer" class="fixed bottom-6 right-6 z-50 space-y-3 pointer-events-none"></div>
</body>
</html>
