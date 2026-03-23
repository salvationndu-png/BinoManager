@extends('superadmin.layout')
@section('title', $tenant->name)
@section('page-title', $tenant->settings?->business_name ?? $tenant->name)
@section('page-subtitle', $tenant->slug . ' · Joined ' . $tenant->created_at->format('M j, Y'))

@section('content')

<div class="flex items-center gap-3 mb-2">
  <a href="{{ route('superadmin.tenants.index') }}" class="text-xs text-zinc-500 hover:text-zinc-300">← All Tenants</a>
  <span class="text-zinc-700">/</span>
  <span class="text-xs text-zinc-400">{{ $tenant->name }}</span>
</div>

{{-- ── Header strip ────────────────────────────────────────────────────── --}}
<div class="sa-card p-5 flex flex-wrap items-center justify-between gap-4">
  <div class="flex items-center gap-4">
    <div class="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg" style="background:linear-gradient(135deg,#047857,#059669)">
      {{ strtoupper(substr($tenant->name, 0, 2)) }}
    </div>
    <div>
      <div class="text-lg font-bold text-zinc-100">{{ $tenant->settings?->business_name ?? $tenant->name }}</div>
      <div class="text-sm text-zinc-500">{{ $tenant->email }}
        @if($tenant->phone) · {{ $tenant->phone }} @endif
      </div>
      <div class="flex items-center gap-2 mt-1">
        @php $cls = match($tenant->status) {'active'=>'badge-active','trialing'=>'badge-trial','grace'=>'badge-grace',default=>'badge-suspended'}; @endphp
        <span class="badge {{ $cls }}">{{ ucfirst($tenant->status) }}</span>
        <span class="text-xs text-zinc-600 font-mono">{{ $tenant->slug }}.yourdomain.com</span>
      </div>
    </div>
  </div>

  {{-- Quick actions --}}
  <div class="flex flex-wrap gap-2">
    {{-- Impersonate --}}
    <form method="POST" action="{{ route('superadmin.impersonate.start', $tenant->id) }}"
      onsubmit="return confirm('Log in as the admin of {{ addslashes($tenant->name) }}? This will be audited.')">
      @csrf
      <button class="btn-ghost" style="border:1px solid #3f3f46">
        👤 Impersonate
      </button>
    </form>

    {{-- Suspend / Unsuspend --}}
    @if(!$tenant->isSuspended())
    <form method="POST" action="{{ route('superadmin.tenants.suspend', $tenant->id) }}"
      onsubmit="return confirm('Suspend this tenant immediately?')">
      @csrf
      <button class="btn-danger">🔒 Suspend</button>
    </form>
    @else
    <form method="POST" action="{{ route('superadmin.tenants.unsuspend', $tenant->id) }}">
      @csrf
      <button class="btn-primary">✅ Reactivate</button>
    </form>
    @endif
  </div>
</div>

<div class="grid lg:grid-cols-3 gap-4">

  {{-- ── Left: billing + plan + trial ──────────────────────────────────── --}}
  <div class="space-y-4">

    {{-- Plan change --}}
    <div class="sa-card p-5">
      <div class="text-sm font-semibold text-zinc-300 mb-4">Plan & Billing</div>

      <div class="mb-3">
        <div class="text-xs text-zinc-500">Current plan</div>
        <div class="text-base font-bold text-zinc-100 mt-0.5">{{ $tenant->plan?->name ?? 'None' }}</div>
        @if($tenant->activeSubscription)
        <div class="text-xs text-zinc-500 mt-0.5">{{ $tenant->plan->price_naira }}/month</div>
        @if($tenant->activeSubscription->next_payment_date)
        <div class="text-xs text-zinc-500">Next payment: {{ $tenant->activeSubscription->next_payment_date->format('M j, Y') }}</div>
        @endif
        @endif
      </div>

      <form method="POST" action="{{ route('superadmin.tenants.changePlan', $tenant->id) }}" class="space-y-2">
        @csrf
        <select name="plan_id" class="">
          @foreach($plans as $plan)
          <option value="{{ $plan->id }}" {{ $tenant->plan_id == $plan->id ? 'selected' : '' }}>
            {{ $plan->name }} — {{ $plan->price_naira }}/mo
          </option>
          @endforeach
        </select>
        <button type="submit" class="btn-ghost w-full text-sm">Change Plan</button>
      </form>
    </div>

    {{-- Extend trial --}}
    <div class="sa-card p-5">
      <div class="text-sm font-semibold text-zinc-300 mb-3">Trial</div>
      <div class="text-xs text-zinc-500 mb-3">
        @if($tenant->trial_ends_at)
          Current end: <strong class="{{ $tenant->trial_ends_at->isPast() ? 'text-red-400' : 'text-zinc-300' }}">{{ $tenant->trial_ends_at->format('M j, Y') }}</strong>
          @if($tenant->isOnTrial()) ({{ $tenant->trialDaysLeft() }} days left) @else (expired) @endif
        @else
          No trial window set
        @endif
      </div>
      <form method="POST" action="{{ route('superadmin.tenants.extendTrial', $tenant->id) }}" class="flex gap-2">
        @csrf
        <input type="number" name="days" value="14" min="1" max="90" style="width:80px;" placeholder="Days">
        <button type="submit" class="btn-primary flex-1 text-sm">Extend Trial</button>
      </form>
    </div>

    {{-- Subscription history --}}
    <div class="sa-card p-5">
      <div class="text-sm font-semibold text-zinc-300 mb-3">Subscription History</div>
      @forelse($tenant->subscriptions->sortByDesc('starts_at') as $sub)
      <div class="py-2 border-b border-zinc-800 last:border-0">
        <div class="flex justify-between text-xs">
          <span class="font-medium text-zinc-200">{{ $sub->plan?->name }}</span>
          <span class="badge {{ $sub->status === 'active' ? 'badge-active' : 'badge-suspended' }}">{{ $sub->status }}</span>
        </div>
        <div class="text-xs text-zinc-600 mt-0.5">{{ $sub->starts_at?->format('M j, Y') }} → {{ $sub->ends_at?->format('M j, Y') ?? 'ongoing' }}</div>
      </div>
      @empty
      <div class="text-xs text-zinc-600">No subscription history</div>
      @endforelse
    </div>
  </div>

  {{-- ── Middle: users + payment events ─────────────────────────────── --}}
  <div class="space-y-4">

    {{-- Users --}}
    <div class="sa-card p-5">
      <div class="text-sm font-semibold text-zinc-300 mb-3">Team Members ({{ $users->count() }})</div>
      @forelse($users as $user)
      <div class="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
        <div>
          <div class="text-xs font-semibold text-zinc-200">{{ $user->name }}</div>
          <div class="text-xs text-zinc-600">{{ $user->email }}</div>
        </div>
        <div class="flex items-center gap-2">
          <span class="badge {{ $user->usertype == 1 ? 'badge-active' : 'badge-suspended' }}">{{ $user->usertype == 1 ? 'Admin' : 'Sales' }}</span>
          <span class="{{ $user->status ? 'text-emerald-500' : 'text-red-500' }} text-xs">{{ $user->status ? '●' : '○' }}</span>
        </div>
      </div>
      @empty
      <div class="text-xs text-zinc-600">No users</div>
      @endforelse
    </div>

    {{-- Recent payment events --}}
    <div class="sa-card p-5">
      <div class="text-sm font-semibold text-zinc-300 mb-3">Payment Events</div>
      @forelse($recentEvents as $event)
      <div class="py-2 border-b border-zinc-800 last:border-0">
        <div class="flex justify-between">
          <span class="text-xs font-mono text-emerald-500">{{ $event->event_type }}</span>
          <span class="badge {{ $event->status === 'processed' ? 'badge-active' : 'badge-suspended' }}">{{ $event->status }}</span>
        </div>
        @php $amount = $event->payload['data']['amount'] ?? null; @endphp
        @if($amount)
        <div class="text-xs text-zinc-300 mt-0.5">₦{{ number_format($amount / 100, 0) }}</div>
        @endif
        <div class="text-xs text-zinc-600">{{ $event->processed_at?->format('M j, Y g:ia') }}</div>
      </div>
      @empty
      <div class="text-xs text-zinc-600">No payment events</div>
      @endforelse
    </div>
  </div>

  {{-- ── Right: notes + audit log ───────────────────────────────────── --}}
  <div class="space-y-4">

    {{-- Internal notes --}}
    <div class="sa-card p-5">
      <div class="text-sm font-semibold text-zinc-300 mb-3">Internal Notes</div>
      <form method="POST" action="{{ route('superadmin.tenants.saveNotes', $tenant->id) }}" class="space-y-2">
        @csrf
        <textarea name="notes" rows="6" placeholder="Support notes, flags, anything relevant…" class="text-sm resize-none">{{ $tenant->internal_notes }}</textarea>
        <button type="submit" class="btn-ghost w-full text-sm">Save Notes</button>
      </form>
    </div>

    {{-- Audit log --}}
    <div class="sa-card p-5">
      <div class="text-sm font-semibold text-zinc-300 mb-3">Audit Log</div>
      @forelse($auditLogs as $log)
      <div class="py-2 border-b border-zinc-800 last:border-0">
        <div class="text-xs font-mono text-emerald-500">{{ $log->action }}</div>
        <div class="text-xs text-zinc-400 mt-0.5">{{ $log->description }}</div>
        <div class="flex justify-between text-xs text-zinc-600 mt-1">
          <span>{{ $log->superAdmin?->name ?? 'System' }}</span>
          <span>{{ $log->created_at->format('M j g:ia') }}</span>
        </div>
      </div>
      @empty
      <div class="text-xs text-zinc-600">No audit events for this tenant</div>
      @endforelse
    </div>
  </div>

</div>
@endsection
