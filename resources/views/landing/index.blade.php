<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>BinoManager - Inventory & Sales Management for Wholesale Businesses</title>
  <meta name="description" content="Manage your wholesale business from anywhere. Track stock, record sales, manage credit customers, and see your profits in real-time. 14-day free trial.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  @vite(['resources/css/app.css', 'resources/js/app.js'])
  <style>
    * { font-family: 'Plus Jakarta Sans', sans-serif; }
    :root {
      --blue: #2563eb;
      --indigo: #4f46e5;
      --dark: #0a0d14;
    }
    .gradient-text {
      background: linear-gradient(135deg, #2563eb, #4f46e5);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .hero-glow {
      background: radial-gradient(ellipse 80% 50% at 50% -10%, rgba(37,99,235,0.15), transparent);
    }
    .feature-card:hover { transform: translateY(-4px); }
    .feature-card { transition: transform 0.2s; }
    .plan-card { transition: transform 0.2s, box-shadow 0.2s; }
    .plan-card:hover { transform: translateY(-4px); box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
    .plan-popular { box-shadow: 0 0 0 2px #2563eb, 0 20px 60px rgba(37,99,235,0.2); }
  </style>
</head>
<body class="bg-white text-gray-900 antialiased">

{{-- ── Navbar ───────────────────────────────────────────────────────────── --}}
<nav class="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100">
  <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
    <div class="flex items-center gap-2">
      <svg class="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="font-bold text-gray-900 text-lg">BinoManager</span>
    </div>
    <div class="hidden md:flex items-center gap-8 text-sm text-gray-600">
      <a href="#features" class="hover:text-gray-900 transition-colors">Features</a>
      <a href="#pricing" class="hover:text-gray-900 transition-colors">Pricing</a>
      <a href="#faq" class="hover:text-gray-900 transition-colors">FAQ</a>
    </div>
    <div class="flex items-center gap-3">
      <a href="{{ url('/login') }}" class="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">Sign in</a>
      <a href="{{ route('tenant.register') }}" class="text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm">
        Start free trial
      </a>
    </div>
  </div>
</nav>

{{-- ── Hero ─────────────────────────────────────────────────────────────── --}}
<section class="relative overflow-hidden hero-glow pt-20 pb-28">
  <div class="max-w-4xl mx-auto px-6 text-center">
    <div class="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2 text-sm text-blue-700 font-medium mb-8">
      <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
      14-day free trial · No credit card required
    </div>
    <h1 class="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
      Run your wholesale business<br>
      <span class="gradient-text">with total clarity</span>
    </h1>
    <p class="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
      Stock tracking, sales recording, customer credit management, and real-time profit analytics — built specifically for Nigerian wholesale traders.
    </p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a href="{{ route('tenant.register') }}" class="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors shadow-lg shadow-blue-600/20">
        Start your free 14-day trial →
      </a>
      <a href="#features" class="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-8 py-4 rounded-xl text-lg transition-colors">
        See how it works
      </a>
    </div>
    <p class="mt-5 text-sm text-gray-400">Trusted by wholesalers in Lagos, Port Harcourt, Onitsha & Aba</p>
  </div>

  {{-- Screenshot mockup --}}
  <div class="max-w-5xl mx-auto px-6 mt-16">
    <div class="bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-800">
      <div class="h-8 bg-gray-800 flex items-center px-4 gap-2">
        <div class="w-3 h-3 rounded-full bg-red-500"></div>
        <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
        <div class="w-3 h-3 rounded-full bg-green-500"></div>
        <div class="flex-1 mx-4 h-5 bg-gray-700 rounded-full"></div>
      </div>
      <div class="bg-gray-950 p-6 grid grid-cols-4 gap-4">
        <div class="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <div class="text-xs text-gray-500 mb-1">Today's Sales</div>
          <div class="text-2xl font-bold text-blue-400">₦847,500</div>
          <div class="text-xs text-blue-500 mt-1">↑ 12% vs yesterday</div>
        </div>
        <div class="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <div class="text-xs text-gray-500 mb-1">Total Stock</div>
          <div class="text-2xl font-bold text-blue-400">2,847</div>
          <div class="text-xs text-gray-500 mt-1">units across 38 products</div>
        </div>
        <div class="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <div class="text-xs text-gray-500 mb-1">Outstanding Credit</div>
          <div class="text-2xl font-bold text-amber-400">₦1.2M</div>
          <div class="text-xs text-gray-500 mt-1">from 14 customers</div>
        </div>
        <div class="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <div class="text-xs text-gray-500 mb-1">Gross Profit</div>
          <div class="text-2xl font-bold text-purple-400">₦214,000</div>
          <div class="text-xs text-blue-500 mt-1">this month</div>
        </div>
      </div>
    </div>
  </div>
</section>

{{-- ── Features ─────────────────────────────────────────────────────────── --}}
<section id="features" class="py-24 bg-gray-50">
  <div class="max-w-6xl mx-auto px-6">
    <div class="text-center mb-16">
      <h2 class="text-4xl font-extrabold text-gray-900 mb-4">Everything your business needs</h2>
      <p class="text-lg text-gray-500 max-w-2xl mx-auto">One platform. No spreadsheets. No confusion.</p>
    </div>
    <div class="grid md:grid-cols-3 gap-8">
      @foreach([
        ['icon' => '📦', 'title' => 'Stock Management', 'desc' => 'Add purchases, track FIFO inventory, get low-stock alerts. Never run out of a product unexpectedly again.'],
        ['icon' => '💰', 'title' => 'Sales Recording', 'desc' => 'Record cash and credit sales in seconds. Assign to customers, attach quantities and prices.'],
        ['icon' => '👥', 'title' => 'Customer Credit', 'desc' => 'Set credit limits, track outstanding balances, record payments. Know exactly who owes you and how much.'],
        ['icon' => '📊', 'title' => 'Profit Analytics', 'desc' => 'Real-time profit/loss, inventory valuation, and top-selling products. See your business clearly.'],
        ['icon' => '🖨️', 'title' => 'Print Reports', 'desc' => 'Print sales reports with your business name and address. Professional receipts for every transaction.'],
        ['icon' => '👤', 'title' => 'Multi-user Access', 'desc' => 'Add salespeople with restricted access. Admins see everything; sales staff only see what they need.'],
      ] as $f)
      <div class="feature-card bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div class="text-4xl mb-4">{{ $f['icon'] }}</div>
        <h3 class="text-lg font-bold text-gray-900 mb-2">{{ $f['title'] }}</h3>
        <p class="text-gray-500 leading-relaxed">{{ $f['desc'] }}</p>
      </div>
      @endforeach
    </div>
  </div>
</section>

{{-- ── Pricing ──────────────────────────────────────────────────────────── --}}
<section id="pricing" class="py-24 bg-white">
  <div class="max-w-5xl mx-auto px-6">
    <div class="text-center mb-16">
      <h2 class="text-4xl font-extrabold text-gray-900 mb-4">Simple, honest pricing</h2>
      <p class="text-lg text-gray-500">Cancel anytime. No hidden fees. Billed in Naira.</p>
    </div>
    <div class="grid md:grid-cols-3 gap-8">
      @foreach([
        ['name'=>'Starter','price'=>'₦5,000','period'=>'/month','users'=>'1 user','products'=>'50 products','features'=>['Sales & stock tracking','Basic analytics','CSV export','Email support'],'popular'=>false,'slug'=>'starter'],
        ['name'=>'Business','price'=>'₦15,000','period'=>'/month','users'=>'5 users','products'=>'Unlimited products','features'=>['Everything in Starter','Customer credit tracking','Full profit analytics','Print reports','Low stock alerts'],'popular'=>true,'slug'=>'business'],
        ['name'=>'Enterprise','price'=>'₦35,000','period'=>'/month','users'=>'Unlimited users','products'=>'Unlimited products','features'=>['Everything in Business','Custom branding & logo','Team invitations','Priority support','Advanced analytics'],'popular'=>false,'slug'=>'enterprise'],
      ] as $plan)
      <div class="plan-card rounded-2xl p-8 border {{ $plan['popular'] ? 'plan-popular bg-white' : 'border-gray-200 bg-white' }} relative">
        @if($plan['popular'])
        <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">Most Popular</div>
        @endif
        <div class="text-sm font-semibold text-gray-500 mb-2">{{ $plan['name'] }}</div>
        <div class="flex items-end gap-1 mb-1">
          <span class="text-4xl font-extrabold text-gray-900">{{ $plan['price'] }}</span>
          <span class="text-gray-400 mb-1">{{ $plan['period'] }}</span>
        </div>
        <div class="text-sm text-gray-500 mb-6">{{ $plan['users'] }} · {{ $plan['products'] }}</div>
        <ul class="space-y-3 mb-8">
          @foreach($plan['features'] as $feature)
          <li class="flex items-center gap-2 text-sm text-gray-600">
            <svg class="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
            {{ $feature }}
          </li>
          @endforeach
        </ul>
        <a href="{{ route('tenant.register') }}?plan={{ $plan['slug'] }}" class="block text-center font-bold py-3 rounded-xl transition-colors {{ $plan['popular'] ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20' : 'bg-gray-100 hover:bg-gray-200 text-gray-700' }}">
          Start free trial
        </a>
      </div>
      @endforeach
    </div>
    <p class="text-center text-sm text-gray-400 mt-8">All plans include a 14-day free trial. No credit card required to start.</p>
  </div>
</section>

{{-- ── FAQ ───────────────────────────────────────────────────────────────── --}}
<section id="faq" class="py-24 bg-gray-50">
  <div class="max-w-3xl mx-auto px-6">
    <h2 class="text-4xl font-extrabold text-gray-900 text-center mb-16">Questions & answers</h2>
    <div class="space-y-4">
      @foreach([
        ['q'=>'Does my data expire after the trial?','a'=>'No. When your trial ends, your data is still there — you just cannot record new sales or add stock until you subscribe. Everything is preserved.'],
        ['q'=>'Can I use this offline?','a'=>'Wholesale Manager is a web application. It requires an internet connection, but works on any phone, tablet, or computer — no app download needed.'],
        ['q'=>'What payment methods are supported for subscriptions?','a'=>'We use Paystack for billing. You can pay with any Nigerian debit/credit card, bank transfer, or USSD.'],
        ['q'=>'Can I add my staff as users?','a'=>'Yes. Admins can create staff accounts. Sales staff can record sales but cannot see cost prices, analytics, or manage stock.'],
        ['q'=>'Is my business data private from other businesses?','a'=>'Completely. Every workspace is isolated. No other business can see your products, customers, or sales — ever.'],
        ['q'=>'What happens if I cancel?','a'=>'You can export all your data as CSV any time. If you cancel, access is suspended but data is retained for 30 days in case you return.'],
      ] as $item)
      <details class="bg-white rounded-xl border border-gray-200 group" x-data="{ open: false }">
        <summary class="flex items-center justify-between p-5 cursor-pointer list-none font-semibold text-gray-900">
          {{ $item['q'] }}
          <svg class="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
        </summary>
        <div class="px-5 pb-5 text-gray-500 leading-relaxed">{{ $item['a'] }}</div>
      </details>
      @endforeach
    </div>
  </div>
</section>

{{-- ── CTA ───────────────────────────────────────────────────────────────── --}}
<section class="py-24 bg-white">
  <div class="max-w-3xl mx-auto px-6 text-center">
    <h2 class="text-4xl font-extrabold text-gray-900 mb-4">Start managing your business today</h2>
    <p class="text-lg text-gray-500 mb-10">Set up your workspace in under 5 minutes. Free for 14 days.</p>
    <a href="{{ route('tenant.register') }}" class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 py-5 rounded-xl text-xl transition-colors shadow-xl shadow-blue-600/25">
      Create your workspace →
    </a>
    <p class="mt-5 text-sm text-gray-400">No credit card required · Cancel anytime · Data is yours forever</p>
  </div>
</section>

<footer class="bg-gray-900 text-gray-400 py-12">
  <div class="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
    <div class="flex items-center gap-2">
      <svg class="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="text-white font-semibold">BinoManager</span>
    </div>
    <div class="text-sm">Built by <span class="text-white font-medium">404Softwares</span> · Lagos, Nigeria</div>
    <div class="flex gap-6 text-sm">
      <a href="{{ url('/login') }}" class="hover:text-white transition-colors">Sign in</a>
      <a href="{{ route('tenant.register') }}" class="hover:text-white transition-colors">Register</a>
    </div>
  </div>
</footer>

</body>
</html>
