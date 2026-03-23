@extends('layouts.modern')
@section('title', 'Settings — Wholesale Manager')
@section('page-title', 'Settings')
@section('page-subtitle', 'Branding, preferences, and notifications')

@section('content')

@if(session('success'))
<div class="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 text-emerald-700 text-sm font-medium flex items-center gap-2 mb-2">
  <svg class="w-5 h-5 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
  {{ session('success') }}
</div>
@endif

{{-- Tabs --}}
<div class="flex gap-1 border-b border-gray-200 mb-6" id="tabs">
  <button onclick="switchTab('branding')" id="tab-branding" class="tab-btn px-4 py-2.5 text-sm font-semibold border-b-2 border-emerald-500 text-emerald-600 -mb-px">Branding</button>
  <button onclick="switchTab('preferences')" id="tab-preferences" class="tab-btn px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent -mb-px transition-colors">Preferences</button>
</div>

{{-- Branding tab --}}
<div id="panel-branding" class="grid lg:grid-cols-2 gap-6">
  <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
    <h2 class="text-lg font-bold text-gray-900 mb-5">Business Branding</h2>
    <form method="POST" action="{{ route('settings.branding') }}" enctype="multipart/form-data" class="space-y-4">
      @csrf

      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-1.5">Business Name</label>
        <input type="text" name="business_name" value="{{ old('business_name', $settings->business_name ?? $tenant->name) }}"
          class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          maxlength="100" required>
      </div>

      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-1.5">Logo</label>
        @if($settings?->logo_path)
        <div class="mb-3 flex items-center gap-3">
          <img src="{{ Storage::url($settings->logo_path) }}" class="w-16 h-16 object-cover rounded-xl border border-gray-200" alt="Current logo">
          <span class="text-sm text-gray-500">Current logo</span>
        </div>
        @endif
        <input type="file" name="logo" accept="image/jpeg,image/png,image/webp"
          class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
        <p class="text-xs text-gray-400 mt-1">JPG, PNG or WebP · Max 2MB. Shown in sidebar and print receipts.</p>
        @error('logo') <p class="text-xs text-red-600 mt-1">{{ $message }}</p> @enderror
      </div>

      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-1.5">Business Address</label>
        <input type="text" name="address" value="{{ old('address', $settings?->address) }}"
          placeholder="12 Commercial Road, Aba, Abia State"
          class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          maxlength="255">
      </div>

      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
        <input type="tel" name="phone" value="{{ old('phone', $settings?->phone) }}"
          placeholder="+234 803 000 0000"
          class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          maxlength="20">
      </div>

      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-1.5">Receipt Footer Text</label>
        <input type="text" name="receipt_footer" value="{{ old('receipt_footer', $settings?->receipt_footer) }}"
          placeholder="Thank you for your business!"
          class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          maxlength="200">
        <p class="text-xs text-gray-400 mt-1">Printed at the bottom of every sales receipt.</p>
      </div>

      <button type="submit" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors mt-2">
        Save Branding
      </button>
    </form>
  </div>

  {{-- Receipt preview --}}
  <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
    <h2 class="text-lg font-bold text-gray-900 mb-5">Receipt Preview</h2>
    <div class="border-2 border-dashed border-gray-200 rounded-xl p-6 font-mono text-xs text-gray-700">
      <div class="text-center mb-4">
        <div class="font-bold text-base text-gray-900">{{ $settings?->business_name ?? $tenant->name }}</div>
        @if($settings?->address) <div class="text-gray-500">{{ $settings->address }}</div> @endif
        @if($settings?->phone) <div class="text-gray-500">Tel: {{ $settings->phone }}</div> @endif
      </div>
      <div class="border-t border-dashed border-gray-300 my-3"></div>
      <div class="space-y-1">
        <div class="flex justify-between"><span>Product A × 10</span><span>₦50,000</span></div>
        <div class="flex justify-between"><span>Product B × 5</span><span>₦25,000</span></div>
      </div>
      <div class="border-t border-dashed border-gray-300 my-3"></div>
      <div class="flex justify-between font-bold"><span>Total</span><span>₦75,000</span></div>
      @if($settings?->receipt_footer)
      <div class="border-t border-dashed border-gray-300 mt-3 pt-3 text-center text-gray-500">{{ $settings->receipt_footer }}</div>
      @endif
    </div>
  </div>
</div>

{{-- Preferences tab --}}
<div id="panel-preferences" class="hidden">
  <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-xl">
    <h2 class="text-lg font-bold text-gray-900 mb-5">Preferences</h2>
    <form method="POST" action="{{ route('settings.preferences') }}" class="space-y-5">
      @csrf

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Timezone</label>
          <select name="timezone" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
            @foreach(timezone_identifiers_list() as $tz)
            <option value="{{ $tz }}" {{ old('timezone', $settings?->timezone ?? 'Africa/Lagos') === $tz ? 'selected' : '' }}>{{ $tz }}</option>
            @endforeach
          </select>
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Currency Symbol</label>
          <input type="text" name="currency_symbol" value="{{ old('currency_symbol', $settings?->currency_symbol ?? '₦') }}"
            class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            maxlength="5">
        </div>
      </div>

      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-1.5">Low Stock Alert Threshold</label>
        <input type="number" name="low_stock_threshold" value="{{ old('low_stock_threshold', $settings?->low_stock_threshold ?? 10) }}"
          min="1" max="9999"
          class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
        <p class="text-xs text-gray-400 mt-1">You'll see a warning when any product stock falls below this number.</p>
      </div>

      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-3">Email Notifications</label>
        <div class="space-y-3">
          @foreach([
            ['key' => 'notify_low_stock', 'label' => 'Low stock alerts', 'desc' => 'Email when a product falls below threshold'],
            ['key' => 'notify_daily_summary', 'label' => 'Daily sales summary', 'desc' => "Today's totals sent every evening"],
            ['key' => 'notify_credit_reminder', 'label' => 'Credit payment reminders', 'desc' => 'Weekly list of outstanding customer balances'],
          ] as $notif)
          <label class="flex items-center justify-between p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
            <div>
              <div class="text-sm font-semibold text-gray-700">{{ $notif['label'] }}</div>
              <div class="text-xs text-gray-400">{{ $notif['desc'] }}</div>
            </div>
            <input type="checkbox" name="{{ $notif['key'] }}" value="1"
              {{ old($notif['key'], $settings?->{$notif['key']} ?? true) ? 'checked' : '' }}
              class="w-5 h-5 rounded text-emerald-600 border-gray-300 focus:ring-emerald-500">
          </label>
          @endforeach
        </div>
      </div>

      <button type="submit" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
        Save Preferences
      </button>
    </form>
  </div>
</div>

@endsection

@push('scripts')
<script>
function switchTab(tab) {
  document.querySelectorAll('[id^="panel-"]').forEach(p => p.classList.add('hidden'));
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.remove('border-emerald-500', 'text-emerald-600');
    b.classList.add('border-transparent', 'text-gray-500');
  });
  document.getElementById('panel-' + tab).classList.remove('hidden');
  const btn = document.getElementById('tab-' + tab);
  btn.classList.add('border-emerald-500', 'text-emerald-600');
  btn.classList.remove('border-transparent', 'text-gray-500');
}
// Open on correct tab if there was an error
@if(session()->has('_old_input'))
  @if(request()->routeIs('settings.preferences'))
    switchTab('preferences');
  @endif
@endif
</script>
@endpush
