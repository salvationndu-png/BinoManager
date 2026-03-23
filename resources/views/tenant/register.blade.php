<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Create Your Workspace — BinoManager</title>
  @vite(['resources/css/app.css', 'resources/js/app.js'])
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    * { font-family: 'Inter', sans-serif; }
    
    .glass {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .gradient-mesh {
      background: 
        radial-gradient(at 0% 0%, rgba(37, 99, 235, 0.3) 0px, transparent 50%),
        radial-gradient(at 100% 0%, rgba(79, 70, 229, 0.3) 0px, transparent 50%),
        radial-gradient(at 100% 100%, rgba(59, 130, 246, 0.3) 0px, transparent 50%),
        radial-gradient(at 0% 100%, rgba(99, 102, 241, 0.3) 0px, transparent 50%),
        #0f172a;
    }
    
    .animate-float {
      animation: float 6s ease-in-out infinite;
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }
    
    .input-modern {
      @apply w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-200;
    }
    
    .input-modern:focus {
      @apply outline-none bg-white border-blue-500 ring-4 ring-blue-500/10;
    }
  </style>
</head>
<body class="bg-white antialiased overflow-x-hidden">

<div class="min-h-screen flex flex-col lg:flex-row">

  {{-- Left Panel - Form --}}
  <div class="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
    
    {{-- Floating shapes background --}}
    <div class="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
      <div class="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
      <div class="absolute bottom-20 right-10 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-float" style="animation-delay: 2s;"></div>
    </div>

    <div class="w-full max-w-lg relative z-10">
      
      {{-- Logo --}}
      <a href="{{ url('/') }}" class="inline-flex items-center gap-3 mb-16 group">
        <div class="relative">
          <div class="absolute inset-0 bg-blue-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
          <svg class="w-10 h-10 text-blue-600 relative" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="font-black text-2xl text-gray-900 tracking-tight">BinoManager</span>
      </a>

      {{-- Header --}}
      <div class="mb-10">
        <div class="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-2 mb-6">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <span class="text-sm font-semibold text-blue-700">14-day free trial • No credit card</span>
        </div>
        
        <h1 class="text-5xl font-black text-gray-900 mb-4 leading-tight tracking-tight">
          Create your<br>
          <span class="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">workspace</span>
        </h1>
        <p class="text-lg text-gray-600">Join 500+ businesses managing inventory smarter</p>
      </div>

      {{-- Errors --}}
      @if ($errors->any())
      <div class="bg-red-50 border-l-4 border-red-500 rounded-r-xl p-4 mb-6">
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
          <div>
            <p class="font-semibold text-red-800 text-sm mb-1">Please fix these errors:</p>
            <ul class="text-sm text-red-700 space-y-1">
              @foreach ($errors->all() as $error)
              <li>• {{ $error }}</li>
              @endforeach
            </ul>
          </div>
        </div>
      </div>
      @endif

      {{-- Form --}}
      <form method="POST" action="{{ route('tenant.register.store') }}" class="space-y-4">
        @csrf

        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <label class="block text-sm font-bold text-gray-900 mb-2">Business Name *</label>
            <input type="text" name="business_name" value="{{ old('business_name') }}"
              placeholder="Acme Trading Ltd"
              class="input-modern @error('business_name') border-red-300 @enderror"
              maxlength="100" required>
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-900 mb-2">Your Name *</label>
            <input type="text" name="owner_name" value="{{ old('owner_name') }}"
              placeholder="John Doe"
              class="input-modern @error('owner_name') border-red-300 @enderror"
              maxlength="100" required>
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-900 mb-2">Phone</label>
            <input type="tel" name="phone" value="{{ old('phone') }}"
              placeholder="+234 803 000 0000"
              class="input-modern"
              maxlength="20">
          </div>

          <div class="col-span-2">
            <label class="block text-sm font-bold text-gray-900 mb-2">Email Address *</label>
            <input type="email" name="email" value="{{ old('email') }}"
              placeholder="you@company.com"
              class="input-modern @error('email') border-red-300 @enderror"
              maxlength="255" required>
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-900 mb-2">Password *</label>
            <input type="password" name="password"
              placeholder="Min. 8 characters"
              class="input-modern @error('password') border-red-300 @enderror"
              required>
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-900 mb-2">Confirm Password *</label>
            <input type="password" name="password_confirmation"
              placeholder="Repeat password"
              class="input-modern"
              required>
          </div>

          @if(isset($plans) && $plans->count() > 1)
          <div class="col-span-2">
            <label class="block text-sm font-bold text-gray-900 mb-2">Choose Plan</label>
            <select name="plan_id" class="input-modern">
              @foreach($plans as $plan)
              <option value="{{ $plan->id }}" {{ old('plan_id', request('plan') == $plan->slug ? $plan->id : null) == $plan->id ? 'selected' : '' }}>
                {{ $plan->name }} — {{ $plan->price_naira }}/month
              </option>
              @endforeach
            </select>
          </div>
          @endif
        </div>

        <button type="submit" class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] mt-6">
          Create workspace →
        </button>

        <p class="text-center text-sm text-gray-600 pt-2">
          Already have an account? <a href="{{ url('/login') }}" class="text-blue-600 hover:text-blue-700 font-semibold">Sign in</a>
        </p>
      </form>

    </div>
  </div>

  {{-- Right Panel - Dark Hero --}}
  <div class="hidden lg:flex lg:w-[600px] gradient-mesh relative overflow-hidden">
    
    {{-- Animated grid --}}
    <div class="absolute inset-0 opacity-20">
      <div class="absolute inset-0" style="background-image: linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px); background-size: 50px 50px;"></div>
    </div>

    <div class="relative z-10 flex flex-col justify-center p-16 text-white">
      
      {{-- Stats Cards --}}
      <div class="grid grid-cols-2 gap-4 mb-12">
        <div class="glass rounded-2xl p-6">
          <div class="text-3xl font-black mb-1">500+</div>
          <div class="text-sm text-blue-200">Active businesses</div>
        </div>
        <div class="glass rounded-2xl p-6">
          <div class="text-3xl font-black mb-1">99.9%</div>
          <div class="text-sm text-blue-200">Uptime SLA</div>
        </div>
      </div>

      {{-- Main Content --}}
      <div class="mb-12">
        <h2 class="text-4xl font-black mb-6 leading-tight">
          Everything you need to<br>
          <span class="text-blue-400">manage inventory</span>
        </h2>
        <p class="text-xl text-blue-100 leading-relaxed">
          Professional tools built for modern wholesale businesses
        </p>
      </div>

      {{-- Features --}}
      <div class="space-y-4">
        @foreach([
          ['icon' => '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>', 'title' => 'Lightning Fast', 'desc' => 'Optimized for speed and performance'],
          ['icon' => '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>', 'title' => 'Bank-Level Security', 'desc' => 'Your data is encrypted and protected'],
          ['icon' => '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>', 'title' => 'Real-Time Analytics', 'desc' => 'Track profits and inventory live'],
          ['icon' => '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>', 'title' => 'Team Collaboration', 'desc' => 'Unlimited users with role permissions'],
        ] as $feature)
        <div class="glass rounded-xl p-5 hover:bg-white/10 transition-all duration-200 group cursor-pointer">
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {!! $feature['icon'] !!}
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="font-bold text-lg mb-1">{{ $feature['title'] }}</h3>
              <p class="text-sm text-blue-200">{{ $feature['desc'] }}</p>
            </div>
          </div>
        </div>
        @endforeach
      </div>

      {{-- Trust Badge --}}
      <div class="mt-12 pt-8 border-t border-white/10">
        <div class="flex items-center gap-3">
          <div class="flex -space-x-2">
            @for($i = 0; $i < 4; $i++)
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 border-2 border-slate-900 flex items-center justify-center text-xs font-bold">
              {{ chr(65 + $i) }}
            </div>
            @endfor
          </div>
          <div>
            <div class="font-semibold">Join 500+ businesses</div>
            <div class="text-sm text-blue-200">Already managing smarter</div>
          </div>
        </div>
      </div>

    </div>
  </div>

</div>

</body>
</html>
