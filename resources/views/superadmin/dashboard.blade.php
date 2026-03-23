@extends('superadmin.layout')
@section('title', 'Dashboard')
@section('page-title', 'Platform Dashboard')
@section('page-subtitle', 'Revenue, tenants, and health metrics')

@section('content')

{{-- ── KPI Row ─────────────────────────────────────────────────────────── --}}
<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
  <div class="kpi">
    <div class="kpi-label">Monthly Recurring Revenue</div>
    <div class="kpi-value text-emerald-400">₦{{ number_format($mrr, 0) }}</div>
    <div class="text-xs mt-1 {{ $mrrGrowth >= 0 ? 'text-emerald-500' : 'text-red-400' }}">
      {{ $mrrGrowth >= 0 ? '↑' : '↓' }} {{ abs($mrrGrowth) }}% vs last month
    </div>
  </div>
  <div class="kpi">
    <div class="kpi-label">Active Tenants</div>
    <div class="kpi-value">{{ $activeTenants }}</div>
    <div class="text-xs text-zinc-500 mt-1">{{ $trialingTenants }} on trial</div>
  </div>
  <div class="kpi">
    <div class="kpi-label">New Signups (30d)</div>
    <div class="kpi-value">{{ $newSignupsThisMonth }}</div>
    <div class="text-xs text-zinc-500 mt-1">{{ $totalTenants }} total workspaces</div>
  </div>
  <div class="kpi">
    <div class="kpi-label">Churn Rate (month)</div>
    <div class="kpi-value {{ $churnRate > 5 ? 'text-red-400' : 'text-zinc-200' }}">{{ $churnRate }}%</div>
    <div class="text-xs text-zinc-500 mt-1">{{ $churnedThisMonth }} cancelled this month</div>
  </div>
</div>

{{-- ── Status breakdown ────────────────────────────────────────────────── --}}
<div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
  @foreach([
    ['label'=>'Active',    'val'=>$activeTenants,   'cls'=>'badge-active'],
    ['label'=>'Trialing',  'val'=>$trialingTenants, 'cls'=>'badge-trial'],
    ['label'=>'Grace',     'val'=>$graceTenants,    'cls'=>'badge-grace'],
    ['label'=>'Suspended', 'val'=>$suspendedTenants,'cls'=>'badge-suspended'],
  ] as $s)
  <div class="sa-card p-4 flex items-center justify-between">
    <span class="text-sm text-zinc-400">{{ $s['label'] }}</span>
    <span class="badge {{ $s['cls'] }} text-base font-bold">{{ $s['val'] }}</span>
  </div>
  @endforeach
</div>

{{-- ── Charts row ──────────────────────────────────────────────────────── --}}
<div class="grid lg:grid-cols-3 gap-4">

  {{-- Revenue chart --}}
  <div class="sa-card p-5 lg:col-span-2">
    <div class="text-sm font-semibold text-zinc-300 mb-4">Revenue — Last 12 Months (₦)</div>
    <canvas id="revenueChart" height="100"></canvas>
  </div>

  {{-- Plan distribution --}}
  <div class="sa-card p-5">
    <div class="text-sm font-semibold text-zinc-300 mb-4">Active Subscribers by Plan</div>
    @if($planDistribution->isEmpty())
      <div class="text-zinc-600 text-sm text-center py-8">No active subscribers yet</div>
    @else
      <canvas id="planChart" height="160"></canvas>
      <div class="mt-4 space-y-2">
        @foreach($planDistribution as $p)
        <div class="flex justify-between text-xs text-zinc-400">
          <span>{{ $p['plan'] }}</span>
          <span class="font-semibold text-zinc-200">{{ $p['count'] }}</span>
        </div>
        @endforeach
      </div>
    @endif
  </div>
</div>

{{-- ── Signups chart ───────────────────────────────────────────────────── --}}
<div class="sa-card p-5">
  <div class="text-sm font-semibold text-zinc-300 mb-4">New Signups — Last 12 Months</div>
  <canvas id="signupsChart" height="60"></canvas>
</div>

{{-- ── Bottom row: expiring trials + audit log ────────────────────────── --}}
<div class="grid lg:grid-cols-2 gap-4">

  {{-- Expiring trials --}}
  <div class="sa-card p-5">
    <div class="text-sm font-semibold text-zinc-300 mb-4">
      ⏰ Trials Expiring in 3 Days
      @if($expiringTrials->count())
        <span class="ml-2 badge badge-trial">{{ $expiringTrials->count() }}</span>
      @endif
    </div>
    @forelse($expiringTrials as $t)
    <div class="flex items-center justify-between py-2.5 border-b border-zinc-800 last:border-0">
      <div>
        <div class="text-sm font-semibold text-zinc-200">{{ $t->settings?->business_name ?? $t->name }}</div>
        <div class="text-xs text-zinc-500">{{ $t->email }} · expires {{ $t->trial_ends_at->diffForHumans() }}</div>
      </div>
      <a href="{{ route('superadmin.tenants.show', $t->id) }}" class="text-xs text-emerald-400 hover:text-emerald-300 font-medium">View →</a>
    </div>
    @empty
    <div class="text-zinc-600 text-sm text-center py-6">No trials expiring soon 🎉</div>
    @endforelse
  </div>

  {{-- Recent audit activity --}}
  <div class="sa-card p-5">
    <div class="text-sm font-semibold text-zinc-300 mb-4">Recent Activity</div>
    <div class="space-y-0">
      @forelse($recentActivity as $log)
      <div class="py-2.5 border-b border-zinc-800 last:border-0">
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1 min-w-0">
            <div class="text-xs font-mono text-emerald-500">{{ $log->action }}</div>
            <div class="text-xs text-zinc-300 mt-0.5 truncate">{{ $log->description }}</div>
          </div>
          <div class="text-xs text-zinc-600 whitespace-nowrap">{{ $log->created_at->diffForHumans(null, true) }}</div>
        </div>
      </div>
      @empty
      <div class="text-zinc-600 text-sm text-center py-6">No activity yet</div>
      @endforelse
    </div>
  </div>

</div>

@endsection

@push('scripts')
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js"></script>
<script>
const chartDefaults = {
  font: { family: 'Plus Jakarta Sans', size: 11 },
  color: '#71717a',
};
Chart.defaults.font = chartDefaults.font;
Chart.defaults.color = chartDefaults.color;

// Revenue chart
const rData = @json($revenueChart);
new Chart(document.getElementById('revenueChart'), {
  type: 'bar',
  data: {
    labels: rData.map(r => r.month),
    datasets: [{
      label: 'Revenue (₦)',
      data: rData.map(r => r.revenue),
      backgroundColor: 'rgba(16,185,129,0.7)',
      borderColor: '#10b981',
      borderWidth: 1,
      borderRadius: 4,
    }]
  },
  options: {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: '#27272a' }, ticks: { maxRotation: 45 } },
      y: { grid: { color: '#27272a' }, ticks: { callback: v => '₦' + (v >= 1000 ? (v/1000).toFixed(0)+'K' : v) } }
    }
  }
});

// Plan distribution donut
@if(!$planDistribution->isEmpty())
new Chart(document.getElementById('planChart'), {
  type: 'doughnut',
  data: {
    labels: @json($planDistribution->pluck('plan')),
    datasets: [{
      data: @json($planDistribution->pluck('count')),
      backgroundColor: ['#059669','#0284c7','#7c3aed','#d97706'],
      borderWidth: 0,
    }]
  },
  options: {
    responsive: true,
    cutout: '65%',
    plugins: { legend: { display: false } }
  }
});
@endif

// Signups chart
const sData = @json($signupsChart);
new Chart(document.getElementById('signupsChart'), {
  type: 'line',
  data: {
    labels: sData.map(r => r.month),
    datasets: [{
      label: 'Signups',
      data: sData.map(r => r.count),
      borderColor: '#06b6d4',
      backgroundColor: 'rgba(6,182,212,0.08)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#06b6d4',
      pointRadius: 3,
    }]
  },
  options: {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: '#27272a' } },
      y: { grid: { color: '#27272a' }, ticks: { stepSize: 1 } }
    }
  }
});
</script>
@endpush
