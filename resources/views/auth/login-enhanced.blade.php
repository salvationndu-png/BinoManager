<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BinoManager | Login</title>
  @vite(['resources/css/app.css', 'resources/js/app.js'])
  <style>
    @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes float { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-20px) rotate(3deg); } }
    .animate-slide-up { animation: slideUp 0.6s ease-out forwards; opacity: 0; }
    .animate-float { animation: float 6s ease-in-out infinite; }
  </style>
</head>
<body class="h-screen w-screen font-sans flex items-center justify-center overflow-hidden">

  {{-- Animated Background --}}
  <div class="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
    <div class="absolute top-0 left-0 w-96 h-96 bg-indigo-300/30 rounded-full blur-[120px] animate-float"></div>
    <div class="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-300/30 rounded-full blur-[150px] animate-float" style="animation-delay: 2s;"></div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-300/20 rounded-full blur-[180px] animate-float" style="animation-delay: 4s;"></div>
  </div>

  {{-- Login Card --}}
  <div class="w-full max-w-md mx-4 animate-slide-up">
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
        <h2 class="text-3xl font-black text-slate-900">Welcome back</h2>
        <p class="text-slate-600 mt-2 font-medium">Sign in to your account</p>
      </div>

      {{-- Validation Errors --}}
      <x-validation-errors class="mb-4 text-red-600 text-sm bg-red-50 rounded-xl p-3 border border-red-200" />

      @if (session('status'))
        <div class="mb-4 text-sm text-emerald-600 bg-emerald-50 rounded-xl p-3 border border-emerald-200">
          {{ session('status') }}
        </div>
      @endif

      {{-- Login Form --}}
      <form method="POST" action="{{ route('login') }}" class="space-y-5">
        @csrf

        {{-- Email --}}
        <div>
          <label for="email" class="block text-sm font-bold text-slate-700 mb-2">Email address</label>
          <input
            id="email"
            type="email"
            name="email"
            value="{{ old('email') }}"
            required
            autofocus
            autocomplete="username"
            placeholder="you@company.com"
            class="w-full px-5 py-4 rounded-xl bg-white/50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all backdrop-blur-sm"
          >
        </div>

        {{-- Password --}}
        <div>
          <div class="flex justify-between items-center mb-2">
            <label for="password" class="text-sm font-bold text-slate-700">Password</label>
            @if (Route::has('password.request'))
              <a href="{{ route('password.request') }}" class="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline">Forgot password?</a>
            @endif
          </div>
          <input
            id="password"
            type="password"
            name="password"
            required
            autocomplete="current-password"
            placeholder="••••••••"
            class="w-full px-5 py-4 rounded-xl bg-white/50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all backdrop-blur-sm"
          >
        </div>

        {{-- Remember Me --}}
        <div class="flex items-center">
          <input type="checkbox" name="remember" id="remember" class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/50">
          <label for="remember" class="ml-2 text-sm text-slate-600 font-medium cursor-pointer">Remember me</label>
        </div>

        {{-- Submit Button --}}
        <button
          type="submit"
          class="w-full py-4 rounded-xl font-bold text-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/60 hover:scale-[1.02] active:scale-[0.98]"
        >
          Sign in
        </button>
      </form>

      {{-- Register Link --}}
      <div class="mt-8 pt-6 border-t border-slate-200/50 text-center">
        <p class="text-slate-600 text-sm">
          Don't have an account? 
          <a href="{{ route('tenant.register') }}" class="text-indigo-600 font-bold hover:text-indigo-700 hover:underline">Create one</a>
        </p>
      </div>

      {{-- Footer --}}
      <p class="text-center text-xs text-slate-400 mt-6">
        Powered by <span class="text-slate-600 font-semibold">404Softwares</span>
      </p>
    </div>
  </div>

</body>
</html>
