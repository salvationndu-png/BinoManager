@extends('superadmin.layout')
@section('title', 'Tenants')
@section('page-title', 'All Tenants')
@section('page-subtitle', 'Search, filter and manage every workspace')

@section('content')

{{-- ── Summary strip ───────────────────────────────────────────────────── --}}
<div class="flex flex-wrap gap-3 text-xs">
  @foreach([
    ['Total',     $stats->total,     'text-zinc-300', null],
    ['Active',    $stats->active,    'text-emerald-400', 'active'],
    ['Trialing',  $stats->trialing,  'text-amber-400', 'trialing'],
    ['Grace',     $stats->grace,     'text-red-400', 'grace'],
    ['Suspended', $stats->suspended, 'text-zinc-500', 'suspended'],
  ] as [$label, $count, $cls, $filter])
  <a href="{{ $filter ? route('superadmin.tenants.index', ['status' => $filter]) : route('superadmin.tenants.index') }}"
     class="sa-card px-3 py-2 flex items-center gap-2 hover:border-zinc-600 transition-colors">
    <span class="text-zinc-500">{{ $label }}</span>
    <span class="font-bold {{ $cls }}">{{ $count }}</span>
  </a>
  @endforeach
</div>

{{-- ── Filters ─────────────────────────────────────────────────────────── --}}
<form method="GET" action="{{ route('superadmin.tenants.index') }}" class="flex flex-wrap gap-3">
  <input type="text" name="search" value="{{ request('search') }}" placeholder="Search name, email, slug…"
    class="flex-1 min-w-[220px]" style="max-width:320px;">

  <select name="status" class="" style="width:auto;min-width:130px;">
    <option value="">All statuses</option>
    @foreach(['trialing','active','grace','suspended','cancelled'] as $s)
    <option value="{{ $s }}" {{ request('status') === $s ? 'selected' : '' }}>{{ ucfirst($s) }}</option>
    @endforeach
  </select>

  <select name="plan" style="width:auto;min-width:130px;">
    <option value="">All plans</option>
    @foreach($plans as $plan)
    <option value="{{ $plan->id }}" {{ request('plan') == $plan->id ? 'selected' : '' }}>{{ $plan->name }}</option>
    @endforeach
  </select>

  <button type="submit" class="btn-primary">Filter</button>
  @if(request()->hasAny(['search','status','plan']))
  <a href="{{ route('superadmin.tenants.index') }}" class="btn-ghost">Clear</a>
  @endif
</form>

{{-- ── Table ───────────────────────────────────────────────────────────── --}}
<div class="sa-card overflow-hidden">
  <div class="overflow-x-auto">
    <table>
      <thead>
        <tr>
          <th>Tenant</th>
          <th>Plan</th>
          <th>Status</th>
          <th>Users</th>
          <th>Joined</th>
          <th>Trial Ends</th>
          <th style="text-align:right">Actions</th>
        </tr>
      </thead>
      <tbody>
        @forelse($tenants as $tenant)
        <tr>
          <td>
            <div class="font-semibold text-zinc-100">{{ $tenant->settings?->business_name ?? $tenant->name }}</div>
            <div class="text-xs text-zinc-500 mt-0.5">{{ $tenant->slug }}.yourdomain.com</div>
            <div class="text-xs text-zinc-600">{{ $tenant->email }}</div>
            @if($tenant->trashed())
            <span class="badge" style="background:#450a0a;color:#f87171;margin-top:2px;display:inline-block">DELETED</span>
            @endif
          </td>
          <td>{{ $tenant->plan?->name ?? '—' }}</td>
          <td>
            @php
              $cls = match($tenant->status) {
                'active'    => 'badge-active',
                'trialing'  => 'badge-trial',
                'grace'     => 'badge-grace',
                default     => 'badge-suspended',
              };
            @endphp
            <span class="badge {{ $cls }}">{{ ucfirst($tenant->status) }}</span>
          </td>
          <td>{{ $tenant->users_count }}</td>
          <td>{{ $tenant->created_at->format('M j, Y') }}</td>
          <td class="{{ $tenant->trial_ends_at && $tenant->trial_ends_at->isPast() ? 'text-red-400' : '' }}">
            {{ $tenant->trial_ends_at ? $tenant->trial_ends_at->format('M j, Y') : '—' }}
          </td>
          <td style="text-align:right">
            <div class="flex justify-end gap-2">
              <a href="{{ route('superadmin.tenants.show', $tenant->id) }}" class="btn-ghost" style="padding:5px 10px;font-size:12px;">View</a>

              @if(!$tenant->isSuspended())
              <form method="POST" action="{{ route('superadmin.tenants.suspend', $tenant->id) }}" onsubmit="return confirm('Suspend {{ addslashes($tenant->name) }}?')">
                @csrf
                <button class="btn-danger" style="padding:5px 10px;font-size:12px;">Suspend</button>
              </form>
              @else
              <form method="POST" action="{{ route('superadmin.tenants.unsuspend', $tenant->id) }}">
                @csrf
                <button class="btn-primary" style="padding:5px 10px;font-size:12px;">Reactivate</button>
              </form>
              @endif
            </div>
          </td>
        </tr>
        @empty
        <tr>
          <td colspan="7" style="text-align:center;padding:40px;color:#52525b;">No tenants found.</td>
        </tr>
        @endforelse
      </tbody>
    </table>
  </div>

  {{-- Pagination --}}
  @if($tenants->hasPages())
  <div class="p-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
    <span>Showing {{ $tenants->firstItem() }}–{{ $tenants->lastItem() }} of {{ $tenants->total() }}</span>
    <div class="flex gap-2">
      @if($tenants->onFirstPage())
      <span class="btn-ghost opacity-40 cursor-not-allowed" style="padding:5px 10px;">← Prev</span>
      @else
      <a href="{{ $tenants->previousPageUrl() }}" class="btn-ghost" style="padding:5px 10px;">← Prev</a>
      @endif
      @if($tenants->hasMorePages())
      <a href="{{ $tenants->nextPageUrl() }}" class="btn-ghost" style="padding:5px 10px;">Next →</a>
      @else
      <span class="btn-ghost opacity-40 cursor-not-allowed" style="padding:5px 10px;">Next →</span>
      @endif
    </div>
  </div>
  @endif
</div>

@endsection
