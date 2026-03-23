<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Subscription Required — Wholesale Manager</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  @vite(['resources/css/app.css'])
  <style>* { font-family: 'Plus Jakarta Sans', sans-serif; }</style>
</head>
<body class="bg-gray-50 min-h-screen flex items-center justify-center p-6 antialiased">

<div class="max-w-md w-full">

  {{-- Logo --}}
  <div class="flex justify-center mb-8">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl grid place-items-center text-white font-bold shadow-lg" style="background: linear-gradient(135deg, #0b5e57, #10b981)">WM</div>
      <span class="font-bold text-gray-900 text-lg">Wholesale Manager</span>
    </div>
  </div>

  <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">

    @if($reason === 'trial_expired')
    <div class="text-5xl mb-4">⏰</div>
    <h1 class="text-2xl font-extrabold text-gray-900 mb-2">Your trial has ended</h1>
    <p class="text-gray-500 mb-6">Your 14-day free trial for <strong class="text-gray-700">{{ $tenant->name }}</strong> has expired. Subscribe to keep your data and continue working.</p>

    @elseif($reason === 'payment_failed')
    <div class="text-5xl mb-4">💳</div>
    <h1 class="text-2xl font-extrabold text-gray-900 mb-2">Payment failed</h1>
    <p class="text-gray-500 mb-6">We could not process your last payment for <strong class="text-gray-700">{{ $tenant->name }}</strong>. Please update your payment method to restore access.</p>

    @elseif($reason === 'suspended')
    <div class="text-5xl mb-4">🔒</div>
    <h1 class="text-2xl font-extrabold text-gray-900 mb-2">Workspace suspended</h1>
    <p class="text-gray-500 mb-6">This workspace has been suspended. Please contact support or subscribe to reactivate.</p>

    @elseif($reason === 'cancelled')
    <div class="text-5xl mb-4">📴</div>
    <h1 class="text-2xl font-extrabold text-gray-900 mb-2">Subscription cancelled</h1>
    <p class="text-gray-500 mb-6">Your subscription for <strong class="text-gray-700">{{ $tenant->name }}</strong> has been cancelled. Re-subscribe to continue.</p>
    @endif

    {{-- Plan options --}}
    @php $plans = \App\Models\Plan::active()->get(); @endphp
    @if($plans->count())
    <div class="space-y-3 mb-6 text-left">
      @foreach($plans as $plan)
      <form method="POST" action="{{ url('/billing/checkout') }}">
        @csrf
        <input type="hidden" name="plan_id" value="{{ $plan->id }}">
        <button type="submit" class="w-full flex items-center justify-between p-4 border-2 rounded-xl transition-all hover:border-emerald-500 hover:bg-emerald-50 {{ $plan->slug === 'business' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white' }}">
          <div class="text-left">
            <div class="font-bold text-gray-900 text-sm flex items-center gap-2">
              {{ $plan->name }}
              @if($plan->slug === 'business') <span class="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">Popular</span> @endif
            </div>
            <div class="text-xs text-gray-500 mt-0.5">
              {{ $plan->max_users === 0 ? 'Unlimited' : $plan->max_users }} user{{ $plan->max_users !== 1 ? 's' : '' }} ·
              {{ $plan->max_products === 0 ? 'Unlimited' : $plan->max_products }} products
            </div>
          </div>
          <div class="text-right">
            <div class="font-extrabold text-gray-900">{{ $plan->price_naira }}</div>
            <div class="text-xs text-gray-400">/month</div>
          </div>
        </button>
      </form>
      @endforeach
    </div>
    @endif

    <div class="border-t border-gray-100 pt-5 flex justify-between items-center">
      <form method="POST" action="{{ route('logout') }}">
        @csrf
        <button class="text-sm text-gray-400 hover:text-gray-600 transition-colors">Sign out</button>
      </form>
      <p class="text-xs text-gray-400">Need help? Email us</p>
    </div>
  </div>

  <p class="text-center text-xs text-gray-400 mt-4">
    Your data is safe and will be restored immediately upon payment.
  </p>
</div>

</body>
</html>
