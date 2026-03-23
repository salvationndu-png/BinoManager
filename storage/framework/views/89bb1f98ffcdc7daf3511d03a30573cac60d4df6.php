<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta name="csrf-token" content="<?php echo e(csrf_token()); ?>">
  <title><?php echo e($currentTenant?->settings?->business_name ?? $currentTenant?->name ?? 'BinoManager'); ?> - Dashboard</title>

  
  <script>
    (function(){
      try {
        var t = localStorage.getItem('theme');
        if (t === 'dark') document.documentElement.classList.add('dark');
        else if (t === 'light') document.documentElement.classList.remove('dark');
      } catch(e) {}
    })();
  </script>

  
  <style>
    :root {
      <?php $isEnt = str_starts_with($currentTenant?->plan?->slug ?? '', 'enterprise'); ?>
      --color-primary: <?php echo e($isEnt ? ($currentTenant?->settings?->primary_color ?? '#2563eb') : '#2563eb'); ?>;
      --color-secondary: <?php echo e($isEnt ? ($currentTenant?->settings?->secondary_color ?? '#1e40af') : '#1e40af'); ?>;
    }
  </style>

  <?php echo app('Illuminate\Foundation\Vite')(['resources/css/app.css', 'resources/js/tenant-app/main.tsx']); ?>
</head>
<body class="bg-zinc-50 dark:bg-zinc-950 transition-colors duration-200">


<script>
  window.BinoManager = {
    csrf:        <?php echo e(Js::from(csrf_token())); ?>,
    tenantSlug:  <?php echo e(Js::from($currentTenant?->slug ?? '')); ?>,
    basePath:    <?php echo e(Js::from($currentTenant ? '/' . $currentTenant->slug : '')); ?>,
    isLocal:     <?php echo e(Js::from(config('app.env') === 'local')); ?>,
    logoutUrl:   <?php echo e(Js::from(route('logout'))); ?>,

    user: {
      name:    <?php echo e(Js::from(Auth::user()?->name ?? '')); ?>,
      email:   <?php echo e(Js::from(Auth::user()?->email ?? '')); ?>,
      isAdmin: <?php echo e(Js::from((Auth::user()?->usertype ?? 0) == 1)); ?>,
    },

    tenant: {
      name:         <?php echo e(Js::from($currentTenant?->settings?->business_name ?? $currentTenant?->name ?? 'BinoManager')); ?>,
      slug:         <?php echo e(Js::from($currentTenant?->slug ?? '')); ?>,
      plan:         <?php echo e(Js::from($currentTenant?->plan?->name ?? 'Starter')); ?>,
      planSlug:     <?php echo e(Js::from($currentTenant?->plan?->slug ?? 'starter')); ?>,
      status:       <?php echo e(Js::from($currentTenant?->status ?? 'trialing')); ?>,
      trialDaysLeft:<?php echo e($currentTenant?->trialDaysLeft() ?? 0); ?>,
      trialEndsAt:  <?php echo e(Js::from($currentTenant?->trial_ends_at?->toIso8601String() ?? null)); ?>,
      <?php
        $isEnterprise = str_starts_with($currentTenant?->plan?->slug ?? '', 'enterprise');
        $hasLogo = $isEnterprise && $currentTenant?->settings?->logo_path;
      ?>
      <?php if($hasLogo): ?>
      logoUrl:      <?php echo e(Js::from(Storage::url($currentTenant->settings->logo_path))); ?>,
      <?php endif; ?>
    },

    settings: {
      business_name:  <?php echo e(Js::from($currentTenant?->settings?->business_name ?? $currentTenant?->name ?? '')); ?>,
      phone:          <?php echo e(Js::from($currentTenant?->settings?->phone ?? '')); ?>,
      address:        <?php echo e(Js::from($currentTenant?->settings?->address ?? '')); ?>,
      receipt_footer: <?php echo e(Js::from($currentTenant?->settings?->receipt_footer ?? '')); ?>,
      timezone:       <?php echo e(Js::from($currentTenant?->settings?->timezone ?? 'Africa/Lagos')); ?>,
      logo_path:      <?php echo e(Js::from($isEnterprise ? ($currentTenant?->settings?->logo_path ?? '') : '')); ?>,
      primary_color:  <?php echo e(Js::from($isEnterprise ? ($currentTenant?->settings?->primary_color ?? '#2563eb') : '#2563eb')); ?>,
      secondary_color:<?php echo e(Js::from($isEnterprise ? ($currentTenant?->settings?->secondary_color ?? '#1e40af') : '#1e40af')); ?>,
    },

    billing: {
      plans:          <?php echo e(Js::from($plans ?? [])); ?>,
      activePlan:     <?php echo e(Js::from($activeSubscription ?? null)); ?>,
      paymentHistory: <?php echo e(Js::from($paymentEvents ?? [])); ?>,
    },

    planFeatures: <?php echo e(Js::from($planFeatures ?? [])); ?>,
  };
</script>


<?php if(Session::has('impersonating_as_super_admin_id')): ?>
<div style="position:fixed;top:0;left:0;right:0;z-index:9999;background:#f59e0b;color:#000;font-size:12px;font-weight:700;padding:8px 16px;display:flex;align-items:center;justify-content:space-between;">
  <span>⚠️ IMPERSONATION MODE — You are viewing this workspace as the tenant admin</span>
  <form method="POST" action="<?php echo e(route('impersonate.stop')); ?>" style="margin:0">
    <?php echo csrf_field(); ?>
    <button type="submit" style="background:#000;color:#fbbf24;border:none;padding:4px 12px;border-radius:6px;cursor:pointer;font-weight:700;">Exit</button>
  </form>
</div>
<div style="height:36px;"></div>
<?php endif; ?>


<div id="root"></div>

</body>
</html>
<?php /**PATH C:\lovehills\404 manager 1\resources\views/tenant-app.blade.php ENDPATH**/ ?>