<!DOCTYPE html>
<html lang="en" class="">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta name="csrf-token" content="{{ csrf_token() }}">
  <title>BinoManager — Super Admin</title>

  {{-- Prevent dark-mode flash before React hydrates --}}
  <script>
    (function(){
      var t = localStorage.getItem('sa-theme');
      document.documentElement.classList.add(t === 'light' ? 'light' : 'dark');
    })();
  </script>

  @vite(['resources/css/app.css', 'resources/js/superadmin-app/main.tsx'])
</head>
<body class="bg-zinc-950 text-zinc-100">

{{-- window.SuperAdmin is the PHP→React bridge.
     Injected here so the SPA never needs an extra auth API call on boot. --}}
<script>
  window.SuperAdmin = {
    csrf:            {{ Js::from(csrf_token()) }},
    logoutUrl:       {{ Js::from(route('superadmin.logout')) }},
    loginUrl:        {{ Js::from(route('superadmin.login')) }},
    isAuthenticated: true,
    admin: {
      id:          {{ Js::from(auth('super_admin')->id()) }},
      name:        {{ Js::from(auth('super_admin')->user()?->name ?? '') }},
      email:       {{ Js::from(auth('super_admin')->user()?->email ?? '') }},
      lastLogin:   {{ Js::from(auth('super_admin')->user()?->last_login_at?->toISOString() ?? null) }},
      lastLoginIp: {{ Js::from(auth('super_admin')->user()?->last_login_ip ?? null) }},
    },
  };
</script>

{{-- Loading indicator shown while React bundle downloads --}}
<div id="sa-loading" style="
  position:fixed;inset:0;display:flex;flex-direction:column;
  align-items:center;justify-content:center;gap:16px;
  background:#09090b;z-index:9999;
">
  <div style="
    width:40px;height:40px;border-radius:50%;
    border:3px solid #10b981;border-top-color:transparent;
    animation:spin 0.8s linear infinite;
  "></div>
  <p style="color:#71717a;font-size:13px;font-family:system-ui,sans-serif;">
    Loading BinoManager Admin…
  </p>
</div>
<style>@keyframes spin{to{transform:rotate(360deg)}}</style>
<script>
  // Hide the loader as soon as React takes over
  document.addEventListener('DOMContentLoaded', function() {
    requestAnimationFrame(function() {
      setTimeout(function() {
        var loader = document.getElementById('sa-loading');
        if (loader) loader.style.display = 'none';
      }, 200);
    });
  });
</script>

{{-- React mounts here --}}
<div id="superadmin-root"></div>

</body>
</html>
