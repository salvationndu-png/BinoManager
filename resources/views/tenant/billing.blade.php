@extends('layouts.modern')
@section('title', 'Billing — Wholesale Manager')
@section('page-title', 'Billing & Subscription')
@section('page-subtitle', 'Manage your plan and payment history')

@section('content')
@php
  $settings = $tenant->settings;
@endphp

{{-- Flash messages --}}
@if(session('success'))
<div class="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 text-emerald-700 text-sm font-medium flex items-center gap-2">
  <svg class="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
  {{ session('success') }}
</div>
@endif
@if(session('error'))
<div class="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-red-700 text-sm font-medium">{{ session('error') }}</div>
@endif

{{-- Current plan status --}}
<div class="grid md:grid-cols-3 gap-6">
  <div class="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
    <h2 class="text-lg font-bold text-gray-900 mb-5">Current Plan</h2>

    @if($activeSubscription)
    <div class="flex items-start justify-between mb-6">
      <div>
        <div class="text-2xl font-extrabold text-gray-900">{{ $activeSubscription->plan->name }}</div>
        <div class="text-emerald-600 font-semibold text-sm mt-1">Active</div>
        @if($activeSubscription->next_payment_date)
        <div class="text-sm text-gray-500 mt-1">Next payment: {{ $activeSubscription->next_payment_date->format('M j, Y') }} — {{ $activeSubscription->plan->price_naira }}</div>
        @endif
      </div>
      <div class="text-3xl font-extrabold text-gray-900">{{ $activeSubscription->plan->price_naira }}<span class="text-base text-gray-400 font-normal">/mo</span></div>
    </div>

    {{-- Feature list --}}
    <ul class="space-y-2 mb-6">
      @foreach($activeSubscription->plan->features as $feature)
      <li class="flex items-center gap-2 text-sm text-gray-600">
        <svg class="w-4 h-4 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
        {{ $feature }}
      </li>
      @endforeach
    </ul>

    @elseif($tenant->isOnTrial())
    <div class="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
      <div class="text-2xl font-extrabold text-gray-900 mb-1">Free Trial</div>
      <div class="text-amber-700 font-semibold text-sm">{{ $tenant->trialDaysLeft() }} day{{ $tenant->trialDaysLeft() != 1 ? 's' : '' }} remaining</div>
      <div class="text-sm text-amber-600 mt-2">Subscribe below before your trial ends to keep all your data.</div>
    </div>
    @else
    <div class="text-gray-500 mb-6">No active subscription.</div>
    @endif

    {{-- Upgrade / switch plan --}}
    <div>
      <h3 class="text-sm font-semibold text-gray-700 mb-3">{{ $activeSubscription ? 'Switch plan' : 'Choose a plan' }}</h3>
      <div class="space-y-3">
        @foreach($plans as $plan)
        <form method="POST" action="{{ route('billing.checkout') }}">
          @csrf
          <input type="hidden" name="plan_id" value="{{ $plan->id }}">
          <button type="submit" class="w-full flex items-center justify-between p-4 border-2 rounded-xl transition-all hover:border-emerald-500 hover:bg-emerald-50 {{ ($activeSubscription && $activeSubscription->plan_id == $plan->id) ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200' }}">
            <div class="text-left">
              <div class="font-bold text-gray-900 text-sm flex items-center gap-2">
                {{ $plan->name }}
                @if($plan->slug === 'business') <span class="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">Popular</span> @endif
                @if($activeSubscription && $activeSubscription->plan_id == $plan->id) <span class="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Current</span> @endif
              </div>
              <div class="text-xs text-gray-500 mt-0.5">
                {{ $plan->max_users === 0 ? 'Unlimited' : $plan->max_users }} user{{ $plan->max_users !== 1 ? 's' : '' }} ·
                {{ $plan->max_products === 0 ? 'Unlimited products' : $plan->max_products . ' products' }}
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
    </div>
  </div>

  {{-- Sidebar: payment history --}}
  <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
    <h2 class="text-lg font-bold text-gray-900 mb-5">Payment History</h2>
    @if($paymentEvents->count())
    <div class="space-y-3">
      @foreach($paymentEvents as $event)
      @php $payload = $event->payload['data'] ?? []; @endphp
      <div class="border-b border-gray-50 pb-3 last:border-0">
        <div class="flex justify-between items-start">
          <div class="text-sm font-semibold text-gray-900">
            ₦{{ number_format(($payload['amount'] ?? 0) / 100, 0) }}
          </div>
          <span class="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Paid</span>
        </div>
        <div class="text-xs text-gray-400 mt-0.5">{{ $event->processed_at->format('M j, Y') }}</div>
      </div>
      @endforeach
    </div>
    @else
    <div class="text-sm text-gray-400 text-center py-8">No payments yet.</div>
    @endif
  </div>
</div>
@endsection
