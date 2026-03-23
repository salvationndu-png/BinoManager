<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="csrf-token" content="{{ csrf_token() }}">
  <title>Pricing - BinoManager</title>
  @vite(['resources/css/app.css', 'resources/js/app.js'])
  <link rel="stylesheet" href="/css/design-system.css">
</head>
<body class="bg-gray-50 antialiased">

<div class="min-h-screen py-12 px-4">
  <div class="max-w-7xl mx-auto">
    
    <!-- Header -->
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h1>
      <p class="text-lg text-gray-600 mb-8">Choose the plan that fits your business needs</p>
      
      <!-- Billing Toggle -->
      <div class="inline-flex items-center bg-white rounded-full p-1 shadow-sm border border-gray-200">
        <button id="monthlyBtn" class="px-6 py-2 rounded-full text-sm font-medium transition-all text-gray-600">
          Monthly
        </button>
        <button id="annualBtn" class="px-6 py-2 rounded-full text-sm font-medium transition-all bg-gray-900 text-white">
          Annual
          <span class="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">Save 17%</span>
        </button>
      </div>
    </div>

    <!-- Annual Plans (Default) -->
    <div id="annualPlans" class="grid grid-cols-1 md:grid-cols-3 gap-8">
      @foreach($annualPlans as $plan)
      <div class="relative bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-lg transition-all {{ $plan->is_popular ? 'ring-2 ring-gray-900' : '' }}">
        
        @if($plan->is_popular)
        <div class="absolute -top-4 left-1/2 -translate-x-1/2">
          <span class="bg-gray-900 text-white text-xs font-semibold px-4 py-1 rounded-full">Most Popular</span>
        </div>
        @endif

        <div class="mb-6">
          <h3 class="text-2xl font-bold text-gray-900 mb-2">{{ $plan->name }}</h3>
          <div class="flex items-baseline gap-2">
            <span class="text-4xl font-bold text-gray-900">{{ $plan->monthly_equivalent }}</span>
            <span class="text-gray-600">/month</span>
          </div>
          <p class="text-sm text-gray-500 mt-1">Billed {{ $plan->price_naira }} annually</p>
          
          @if($plan->annual_savings > 0)
          <div class="mt-3 inline-flex items-center gap-2 bg-green-50 text-green-700 text-sm font-medium px-3 py-1 rounded-full">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
            Save ₦{{ number_format($plan->annual_savings) }} per year
          </div>
          @endif
        </div>

        <ul class="space-y-3 mb-8">
          @foreach($plan->features as $feature)
          <li class="flex items-start gap-3">
            <svg class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
            <span class="text-gray-700 text-sm">{{ $feature }}</span>
          </li>
          @endforeach
        </ul>

        <button onclick="selectPlan({{ $plan->id }}, '{{ $plan->name }}', {{ $plan->price_kobo }})" class="w-full py-3 rounded-lg font-medium transition-all {{ $plan->is_popular ? 'bg-gray-900 text-white hover:bg-gray-800' : 'bg-gray-100 text-gray-900 hover:bg-gray-200' }}">
          Get Started
        </button>
      </div>
      @endforeach
    </div>

    <!-- Monthly Plans (Hidden by default) -->
    <div id="monthlyPlans" class="hidden grid grid-cols-1 md:grid-cols-3 gap-8">
      @foreach($monthlyPlans as $plan)
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-lg transition-all">
        <div class="mb-6">
          <h3 class="text-2xl font-bold text-gray-900 mb-2">{{ $plan->name }}</h3>
          <div class="flex items-baseline gap-2">
            <span class="text-4xl font-bold text-gray-900">{{ $plan->price_naira }}</span>
            <span class="text-gray-600">/month</span>
          </div>
          <p class="text-sm text-gray-500 mt-1">Billed monthly</p>
        </div>

        <ul class="space-y-3 mb-8">
          @foreach($plan->features as $feature)
          <li class="flex items-start gap-3">
            <svg class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
            <span class="text-gray-700 text-sm">{{ $feature }}</span>
          </li>
          @endforeach
        </ul>

        <button onclick="selectPlan({{ $plan->id }}, '{{ $plan->name }}', {{ $plan->price_kobo }})" class="w-full py-3 rounded-lg font-medium bg-gray-100 text-gray-900 hover:bg-gray-200 transition-all">
          Get Started
        </button>
      </div>
      @endforeach
    </div>

    <!-- FAQ Section -->
    <div class="mt-20 max-w-3xl mx-auto">
      <h2 class="text-3xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h2>
      <div class="space-y-4">
        <div class="bg-white rounded-xl p-6 border border-gray-200">
          <h3 class="font-semibold text-gray-900 mb-2">Can I switch from monthly to annual?</h3>
          <p class="text-gray-600 text-sm">Yes! You can upgrade to annual billing anytime and get a prorated discount on your remaining monthly subscription.</p>
        </div>
        <div class="bg-white rounded-xl p-6 border border-gray-200">
          <h3 class="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
          <p class="text-gray-600 text-sm">We accept all major payment methods through Paystack including cards, bank transfers, and mobile money.</p>
        </div>
        <div class="bg-white rounded-xl p-6 border border-gray-200">
          <h3 class="font-semibold text-gray-900 mb-2">Is there a free trial?</h3>
          <p class="text-gray-600 text-sm">Yes! Start with a monthly plan to test BinoManager, then upgrade to annual for maximum savings.</p>
        </div>
      </div>
    </div>

  </div>
</div>

<!-- Payment Modal -->
<div id="paymentModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div class="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
    <h3 class="text-2xl font-bold text-gray-900 mb-4">Complete Your Purchase</h3>
    <div id="planDetails" class="mb-6 p-4 bg-gray-50 rounded-lg">
      <p class="text-sm text-gray-600 mb-1">Selected Plan</p>
      <p class="text-xl font-bold text-gray-900" id="selectedPlanName"></p>
      <p class="text-2xl font-bold text-gray-900 mt-2" id="selectedPlanPrice"></p>
    </div>
    <form id="paymentForm">
      <input type="hidden" id="planId" name="plan_id">
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
        <input type="email" id="email" name="email" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent">
      </div>
      <div class="flex gap-3">
        <button type="button" onclick="closeModal()" class="flex-1 py-3 rounded-lg font-medium bg-gray-100 text-gray-900 hover:bg-gray-200 transition-all">
          Cancel
        </button>
        <button type="submit" id="payBtn" class="flex-1 py-3 rounded-lg font-medium bg-gray-900 text-white hover:bg-gray-800 transition-all">
          Proceed to Payment
        </button>
      </div>
    </form>
  </div>
</div>

<script>
  const monthlyBtn = document.getElementById('monthlyBtn');
  const annualBtn = document.getElementById('annualBtn');
  const monthlyPlans = document.getElementById('monthlyPlans');
  const annualPlans = document.getElementById('annualPlans');
  const paymentModal = document.getElementById('paymentModal');
  const paymentForm = document.getElementById('paymentForm');
  const payBtn = document.getElementById('payBtn');

  monthlyBtn.addEventListener('click', () => {
    monthlyPlans.classList.remove('hidden');
    annualPlans.classList.add('hidden');
    monthlyBtn.classList.add('bg-gray-900', 'text-white');
    monthlyBtn.classList.remove('text-gray-600');
    annualBtn.classList.remove('bg-gray-900', 'text-white');
    annualBtn.classList.add('text-gray-600');
  });

  annualBtn.addEventListener('click', () => {
    annualPlans.classList.remove('hidden');
    monthlyPlans.classList.add('hidden');
    annualBtn.classList.add('bg-gray-900', 'text-white');
    annualBtn.classList.remove('text-gray-600');
    monthlyBtn.classList.remove('bg-gray-900', 'text-white');
    monthlyBtn.classList.add('text-gray-600');
  });

  function selectPlan(planId, planName, priceKobo) {
    document.getElementById('planId').value = planId;
    document.getElementById('selectedPlanName').textContent = planName;
    document.getElementById('selectedPlanPrice').textContent = '₦' + (priceKobo / 100).toLocaleString();
    paymentModal.classList.remove('hidden');
  }

  function closeModal() {
    paymentModal.classList.add('hidden');
    paymentForm.reset();
  }

  paymentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    payBtn.disabled = true;
    payBtn.textContent = 'Processing...';

    try {
      const response = await fetch('/pricing/initialize-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
        },
        body: JSON.stringify({
          plan_id: document.getElementById('planId').value,
          email: document.getElementById('email').value
        })
      });

      const data = await response.json();

      if (data.success) {
        window.location.href = data.authorization_url;
      } else {
        alert(data.message || 'Payment initialization failed');
        payBtn.disabled = false;
        payBtn.textContent = 'Proceed to Payment';
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
      payBtn.disabled = false;
      payBtn.textContent = 'Proceed to Payment';
    }
  });
</script>

</body>
</html>
