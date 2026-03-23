@extends('layouts.modern')

@section('title', 'Upgrade to Annual - BinoManager')
@section('page-title', 'Upgrade to Annual Billing')
@section('page-subtitle', 'Save more with annual billing')

@section('content')
<div class="max-w-4xl mx-auto">
  
  @if(session('error'))
  <div class="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
    {{ session('error') }}
  </div>
  @endif

  @if(session('info'))
  <div class="mb-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl">
    {{ session('info') }}
  </div>
  @endif

  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
    
    <!-- Current Plan -->
    <div class="card p-6">
      <div class="flex items-center gap-2 mb-4">
        <div class="w-10 h-10 rounded-lg bg-gray-100 grid place-items-center">
          <svg class="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"/></svg>
        </div>
        <div>
          <h3 class="font-semibold text-gray-900">Current Plan</h3>
          <p class="text-xs text-gray-500">Monthly billing</p>
        </div>
      </div>
      <div class="mb-4">
        <div class="text-3xl font-bold text-gray-900">{{ $currentPlan->price_naira }}</div>
        <div class="text-sm text-gray-600">per month</div>
      </div>
      <div class="text-sm text-gray-600">
        <strong>{{ $currentPlan->name }}</strong> Plan
      </div>
    </div>

    <!-- Annual Plan -->
    <div class="card p-6 ring-2 ring-gray-900">
      <div class="flex items-center gap-2 mb-4">
        <div class="w-10 h-10 rounded-lg bg-gray-900 grid place-items-center">
          <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
        </div>
        <div>
          <h3 class="font-semibold text-gray-900">Upgrade to Annual</h3>
          <p class="text-xs text-gray-500">Save 17% (2 free months)</p>
        </div>
      </div>
      <div class="mb-4">
        <div class="text-3xl font-bold text-gray-900">{{ $annualPlan->monthly_equivalent }}</div>
        <div class="text-sm text-gray-600">per month, billed {{ $annualPlan->price_naira }} annually</div>
      </div>
      <div class="inline-flex items-center gap-2 bg-green-50 text-green-700 text-sm font-medium px-3 py-1 rounded-full">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
        Save ₦{{ number_format($annualPlan->annual_savings) }} per year
      </div>
    </div>
  </div>

  <!-- Upgrade Details Card -->
  <div class="card p-6 mb-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Upgrade Details</h3>
    
    <div id="upgradeCalculation" class="space-y-3">
      <div class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    </div>

    <div id="upgradeActions" class="hidden mt-6">
      <button id="confirmUpgradeBtn" class="w-full py-3 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 transition-all">
        Confirm Upgrade
      </button>
      <p class="text-xs text-gray-500 text-center mt-3">You'll be redirected to secure payment</p>
    </div>
  </div>

  <!-- Benefits -->
  <div class="card p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Why Upgrade to Annual?</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="flex items-start gap-3">
        <svg class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
        <div>
          <div class="font-medium text-gray-900">Save 17%</div>
          <div class="text-sm text-gray-600">Equivalent to 2 free months</div>
        </div>
      </div>
      <div class="flex items-start gap-3">
        <svg class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
        <div>
          <div class="font-medium text-gray-900">Prorated Credit</div>
          <div class="text-sm text-gray-600">Get credit for unused monthly time</div>
        </div>
      </div>
      <div class="flex items-start gap-3">
        <svg class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
        <div>
          <div class="font-medium text-gray-900">Lock in Price</div>
          <div class="text-sm text-gray-600">Protect against future price increases</div>
        </div>
      </div>
      <div class="flex items-start gap-3">
        <svg class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
        <div>
          <div class="font-medium text-gray-900">One Payment</div>
          <div class="text-sm text-gray-600">No monthly billing hassle</div>
        </div>
      </div>
    </div>
  </div>

</div>

<div id="toastContainer" class="fixed bottom-6 right-6 z-50 space-y-3"></div>
@endsection

@push('scripts')
<script>
const CSRF = document.querySelector('meta[name="csrf-token"]').content;

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const bg = type === 'success' ? 'bg-emerald-600' : 'bg-red-600';
  const el = document.createElement('div');
  el.className = `px-5 py-3 rounded-xl text-white text-sm font-medium shadow-xl ${bg}`;
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

// Load upgrade calculation
async function loadUpgradeCalculation() {
  try {
    const res = await fetch('/subscription/upgrade/calculate');
    const data = await res.json();
    
    if (!data.success) {
      showToast(data.message, 'error');
      return;
    }

    const details = data.upgrade_details;
    const calculationDiv = document.getElementById('upgradeCalculation');
    
    calculationDiv.innerHTML = `
      <div class="space-y-3">
        <div class="flex justify-between py-2 border-b border-gray-200">
          <span class="text-gray-600">Days remaining in current cycle</span>
          <span class="font-medium text-gray-900">${details.days_remaining} days</span>
        </div>
        <div class="flex justify-between py-2 border-b border-gray-200">
          <span class="text-gray-600">Prorated credit (unused time)</span>
          <span class="font-medium text-green-600">-${details.prorated_credit}</span>
        </div>
        <div class="flex justify-between py-2 border-b border-gray-200">
          <span class="text-gray-600">Annual plan price</span>
          <span class="font-medium text-gray-900">${data.annual_plan.price}</span>
        </div>
        <div class="flex justify-between py-3 bg-gray-50 rounded-lg px-4">
          <span class="font-semibold text-gray-900">Amount to pay today</span>
          <span class="text-2xl font-bold text-gray-900">${details.amount_to_pay}</span>
        </div>
        <div class="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
            <div>
              <div class="font-semibold text-green-900">Total Savings: ${details.total_savings}</div>
              <div class="text-sm text-green-700 mt-1">
                Annual discount (${details.annual_savings}) + Prorated credit (${details.additional_savings})
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.getElementById('upgradeActions').classList.remove('hidden');
    
  } catch (err) {
    console.error(err);
    showToast('Failed to load upgrade details', 'error');
  }
}

// Confirm upgrade
document.getElementById('confirmUpgradeBtn')?.addEventListener('click', async () => {
  const btn = document.getElementById('confirmUpgradeBtn');
  btn.disabled = true;
  btn.textContent = 'Processing...';
  
  try {
    const res = await fetch('/subscription/upgrade/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': CSRF
      },
      body: JSON.stringify({
        annual_plan_id: {{ $annualPlan->id }}
      })
    });
    
    const data = await res.json();
    
    if (data.success && data.redirect_to_checkout) {
      showToast('Redirecting to payment...', 'success');
      window.location.href = `/billing/checkout?plan_id=${data.plan_id}&amount=${data.amount_kobo}&upgrade=true`;
    } else {
      showToast(data.message || 'Upgrade failed', 'error');
      btn.disabled = false;
      btn.textContent = 'Confirm Upgrade';
    }
  } catch (err) {
    console.error(err);
    showToast('An error occurred', 'error');
    btn.disabled = false;
    btn.textContent = 'Confirm Upgrade';
  }
});

document.addEventListener('DOMContentLoaded', loadUpgradeCalculation);
</script>
@endpush
