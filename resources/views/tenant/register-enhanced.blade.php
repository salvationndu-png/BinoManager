<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BinoManager | Create Workspace</title>
  @vite(['resources/css/app.css', 'resources/js/app.js'])
  <style>
    @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes float { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-20px) rotate(3deg); } }
    .animate-slide-up { animation: slideUp 0.6s ease-out forwards; opacity: 0; }
    .animate-float { animation: float 6s ease-in-out infinite; }
  </style>
</head>
<body class="min-h-screen w-screen font-sans flex items-center justify-center py-12 overflow-x-hidden">

  {{-- Animated Background --}}
  <div class="fixed inset-0 -z-10 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
    <div class="absolute top-0 left-0 w-96 h-96 bg-indigo-300/30 rounded-full blur-[120px] animate-float"></div>
    <div class="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-300/30 rounded-full blur-[150px] animate-float" style="animation-delay: 2s;"></div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-300/20 rounded-full blur-[180px] animate-float" style="animation-delay: 4s;"></div>
  </div>

  {{-- Registration Card --}}
  <div class="w-full max-w-2xl mx-4 animate-slide-up">
    {{-- Glass Card --}}
    <div class="bg-white/70 backdrop-blur-2xl border border-white/40 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] p-10">
      
      {{-- Logo --}}
      <div class="text-center mb-8">
        <a href="{{ url('/') }}" class="inline-flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 p-4 rounded-2xl mb-6 shadow-lg shadow-indigo-500/50 hover:scale-105 transition-transform">
          <svg class="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z"/>
            <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21"/>
          </svg>
        </a>
        <h2 class="text-3xl font-black text-slate-900">Start your journey</h2>
        <p class="text-slate-600 mt-2 font-medium">Create your business management hub today</p>
      </div>

      {{-- Validation Errors --}}
      @if ($errors->any())
        <div class="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
            <div class="flex-1">
              <h3 class="text-sm font-bold text-red-800 mb-1">Please fix the following errors:</h3>
              <ul class="text-sm text-red-600 space-y-1">
                @foreach ($errors->all() as $error)
                  <li>{{ $error }}</li>
                @endforeach
              </ul>
            </div>
          </div>
        </div>
      @endif

      {{-- Registration Form --}}
      <form method="POST" action="{{ route('tenant.register.store') }}" class="space-y-5">
        @csrf

        <div class="grid md:grid-cols-2 gap-5">
          {{-- Business Name --}}
          <div class="md:col-span-2">
            <label for="name" class="block text-sm font-bold text-slate-700 mb-2">Business Name</label>
            <input
              id="name"
              type="text"
              name="name"
              value="{{ old('name') }}"
              required
              autofocus
              placeholder="Sarah's Bakery"
              class="w-full px-5 py-4 rounded-xl bg-white/50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all backdrop-blur-sm"
            >
          </div>

          {{-- Email --}}
          <div>
            <label for="email" class="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              value="{{ old('email') }}"
              required
              placeholder="sarah@bakery.com"
              class="w-full px-5 py-4 rounded-xl bg-white/50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all backdrop-blur-sm"
            >
          </div>

          {{-- Phone --}}
          <div>
            <label for="phone" class="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value="{{ old('phone') }}"
              placeholder="08012345678"
              class="w-full px-5 py-4 rounded-xl bg-white/50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all backdrop-blur-sm"
            >
          </div>

          {{-- Subdomain --}}
          <div class="md:col-span-2">
            <label for="slug" class="block text-sm font-bold text-slate-700 mb-2">Choose Your Subdomain</label>
            <div class="relative">
              <input
                id="slug"
                type="text"
                name="slug"
                value="{{ old('slug') }}"
                required
                placeholder="sarah-bakery"
                pattern="[a-z0-9][a-z0-9\-]{0,61}[a-z0-9]"
                class="w-full px-5 py-4 rounded-xl bg-white/50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all backdrop-blur-sm pr-48"
              >
              <span class="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">.binomanager.com</span>
            </div>
            <p class="mt-2 text-xs text-slate-500">Only lowercase letters, numbers, and hyphens. This will be your workspace URL.</p>
          </div>

          {{-- Password --}}
          <div>
            <label for="password" class="block text-sm font-bold text-slate-700 mb-2">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              required
              placeholder="••••••••"
              class="w-full px-5 py-4 rounded-xl bg-white/50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all backdrop-blur-sm"
            >
          </div>

          {{-- Confirm Password --}}
          <div>
            <label for="password_confirmation" class="block text-sm font-bold text-slate-700 mb-2">Confirm Password</label>
            <input
              id="password_confirmation"
              type="password"
              name="password_confirmation"
              required
              placeholder="••••••••"
              class="w-full px-5 py-4 rounded-xl bg-white/50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all backdrop-blur-sm"
            >
          </div>
        </div>

        {{-- Terms Checkbox --}}
        <div class="flex items-start gap-3 pt-2">
          <input type="checkbox" name="terms" id="terms" required class="w-4 h-4 mt-1 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/50">
          <label for="terms" class="text-sm text-slate-600 font-medium cursor-pointer">
            I agree to the <a href="#" class="text-indigo-600 font-bold hover:underline">Terms of Service</a> and <a href="#" class="text-indigo-600 font-bold hover:underline">Privacy Policy</a>
          </label>
        </div>

        {{-- Submit Button --}}
        <button
          type="submit"
          class="w-full py-4 rounded-xl font-bold text-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/60 hover:scale-[1.02] active:scale-[0.98]"
        >
          Create Workspace
        </button>
      </form>

      {{-- Login Link --}}
      <div class="mt-8 pt-6 border-t border-slate-200/50 text-center">
        <p class="text-slate-600 text-sm">
          Already have an account? 
          <a href="{{ url('/login') }}" class="text-indigo-600 font-bold hover:text-indigo-700 hover:underline">Sign in</a>
        </p>
      </div>

      {{-- Footer --}}
      <p class="text-center text-xs text-slate-400 mt-6">
        Powered by <span class="text-slate-600 font-semibold">404Softwares</span>
      </p>
    </div>

    {{-- Features Preview --}}
    <div class="mt-8 grid grid-cols-3 gap-4 text-center">
      <div class="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white/40">
        <div class="text-2xl mb-2">🚀</div>
        <p class="text-xs font-bold text-slate-700">14-Day Free Trial</p>
      </div>
      <div class="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white/40">
        <div class="text-2xl mb-2">💳</div>
        <p class="text-xs font-bold text-slate-700">No Credit Card</p>
      </div>
      <div class="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white/40">
        <div class="text-2xl mb-2">⚡</div>
        <p class="text-xs font-bold text-slate-700">Setup in 5 mins</p>
      </div>
    </div>
  </div>

</body>
</html>
