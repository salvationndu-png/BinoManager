<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta name="csrf-token" content="{{ csrf_token() }}">
  <title>{{ $currentTenant?->settings?->business_name ?? $currentTenant?->name ?? 'BinoManager' }} - Dashboard</title>

  {{-- Prevent dark-mode flash: read localStorage before React hydrates --}}
  <script>
    (function(){
      try {
        var t = localStorage.getItem('theme');
        if (t === 'dark') document.documentElement.classList.add('dark');
        else if (t === 'light') document.documentElement.classList.remove('dark');
      } catch(e) {}
    })();
  </script>

  {{-- Apply tenant color scheme (enterprise only) --}}
  <style>
    :root {
      @php $isEnt = str_starts_with($currentTenant?->plan?->slug ?? '', 'enterprise'); @endphp
      --color-primary: {{ $isEnt ? ($currentTenant?->settings?->primary_color ?? '#2563eb') : '#2563eb' }};
      --color-secondary: {{ $isEnt ? ($currentTenant?->settings?->secondary_color ?? '#1e40af') : '#1e40af' }};
    }
  </style>

  @vite(['resources/css/app.css', 'resources/js/tenant-app/main.tsx'])
</head>
<body class="bg-zinc-50 dark:bg-zinc-950 transition-colors duration-200">

{{-- ── window.BinoManager ────────────────────────────────────────────────────
     Single source of truth bridging PHP/Laravel to the React SPA.
     $currentTenant is set by InitializeTenancy middleware via view()->share().
     $plans / $activeSubscription / $paymentEvents come from TenantAppController.
──────────────────────────────────────────────────────────────────────────── --}}
<script>
  window.BinoManager = {
    csrf:        {{ Js::from(csrf_token()) }},
    tenantSlug:  {{ Js::from($currentTenant?->slug ?? '') }},
    basePath:    {{ Js::from($currentTenant ? '/' . $currentTenant->slug : '') }},
    isLocal:     {{ Js::from(config('app.env') === 'local') }},
    logoutUrl:   {{ Js::from(route('logout')) }},

    user: {
      name:    {{ Js::from(Auth::user()?->name ?? '') }},
      email:   {{ Js::from(Auth::user()?->email ?? '') }},
      isAdmin: {{ Js::from((Auth::user()?->usertype ?? 0) == 1) }},
    },

    tenant: {
      name:         {{ Js::from($currentTenant?->settings?->business_name ?? $currentTenant?->name ?? 'BinoManager') }},
      slug:         {{ Js::from($currentTenant?->slug ?? '') }},
      plan:         {{ Js::from($currentTenant?->plan?->name ?? 'Starter') }},
      planSlug:     {{ Js::from($currentTenant?->plan?->slug ?? 'starter') }},
      status:       {{ Js::from($currentTenant?->status ?? 'trialing') }},
      trialDaysLeft:{{ $currentTenant?->trialDaysLeft() ?? 0 }},
      trialEndsAt:  {{ Js::from($currentTenant?->trial_ends_at?->toIso8601String() ?? null) }},
      @php
        $isEnterprise = str_starts_with($currentTenant?->plan?->slug ?? '', 'enterprise');
        $hasLogo = $isEnterprise && $currentTenant?->settings?->logo_path;
      @endphp
      @if($hasLogo)
      logoUrl:      {{ Js::from(Storage::url($currentTenant->settings->logo_path)) }},
      @endif
    },

    settings: {
      business_name:  {{ Js::from($currentTenant?->settings?->business_name ?? $currentTenant?->name ?? '') }},
      phone:          {{ Js::from($currentTenant?->settings?->phone ?? '') }},
      address:        {{ Js::from($currentTenant?->settings?->address ?? '') }},
      receipt_footer: {{ Js::from($currentTenant?->settings?->receipt_footer ?? '') }},
      timezone:       {{ Js::from($currentTenant?->settings?->timezone ?? 'Africa/Lagos') }},
      logo_path:      {{ Js::from($isEnterprise ? ($currentTenant?->settings?->logo_path ?? '') : '') }},
      primary_color:  {{ Js::from($isEnterprise ? ($currentTenant?->settings?->primary_color ?? '#2563eb') : '#2563eb') }},
      secondary_color:{{ Js::from($isEnterprise ? ($currentTenant?->settings?->secondary_color ?? '#1e40af') : '#1e40af') }},
    },

    billing: {
      plans:          {{ Js::from($plans ?? []) }},
      activePlan:     {{ Js::from($activeSubscription ?? null) }},
      paymentHistory: {{ Js::from($paymentEvents ?? []) }},
    },

    planFeatures: {{ Js::from($planFeatures ?? []) }},
  };
</script>

{{-- Super-admin impersonation warning bar --}}
@if(Session::has('impersonating_as_super_admin_id'))
<div style="position:fixed;top:0;left:0;right:0;z-index:9999;background:#f59e0b;color:#000;font-size:12px;font-weight:700;padding:8px 16px;display:flex;align-items:center;justify-content:space-between;">
  <span>⚠️ IMPERSONATION MODE — You are viewing this workspace as the tenant admin</span>
  <form method="POST" action="{{ route('impersonate.stop') }}" style="margin:0">
    @csrf
    <button type="submit" style="background:#000;color:#fbbf24;border:none;padding:4px 12px;border-radius:6px;cursor:pointer;font-weight:700;">Exit</button>
  </form>
</div>
<div style="height:36px;"></div>
@endif

{{-- React SPA mounts here --}}
<div id="root"></div>

</body>
</html>
