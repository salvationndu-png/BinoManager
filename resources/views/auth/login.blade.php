<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BinoManager | Login</title>
  @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="h-screen w-screen font-sans flex items-center justify-center">

  <!-- Background -->
  <div class="absolute inset-0 -z-10">
    <img src="/main.jpg" alt="" class="w-full h-full object-cover">
    <div class="absolute inset-0 bg-black/60"></div>
  </div>

  <!-- Split layout -->
  <div class="w-full h-full flex flex-col md:flex-row">

    <!-- Left: branding panel (desktop only) -->
    <div class="hidden md:flex flex-1 flex-col justify-center items-center text-center px-12 text-white">
      <svg class="w-16 h-16 text-white mb-6 drop-shadow-2xl" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <h1 class="text-4xl lg:text-5xl font-bold tracking-tight drop-shadow-lg">BinoManager</h1>
      <p class="mt-4 text-lg text-gray-300 max-w-md leading-relaxed">
        Manage your inventory, track sales, and grow your business — all in one place.
      </p>
      <div class="mt-8 flex gap-6 text-sm text-gray-400">
        <span>✓ FIFO Stock Tracking</span>
        <span>✓ Credit Management</span>
        <span>✓ Profit Analytics</span>
      </div>
    </div>

    <!-- Right: login form -->
    <div class="flex-1 flex justify-center items-center relative px-6 py-12">
      <span class="absolute top-6 left-6 flex items-center gap-2 text-white/70 tracking-widest text-sm font-semibold md:hidden">
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        BinoManager
      </span>

      <div class="w-full max-w-sm">
        <!-- Glass card -->
        <div class="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8"
             style="animation: slideUp 0.6s ease-out forwards; opacity: 0; transform: translateY(16px);">

          <div class="text-center mb-8">
            <svg class="w-12 h-12 text-white mx-auto mb-4 drop-shadow-lg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h2 class="text-2xl font-semibold text-white">Welcome back</h2>
            <p class="text-sm text-gray-400 mt-1">Sign in to your account</p>
          </div>

          <!-- Validation errors -->
          <x-validation-errors class="mb-4 text-red-400 text-sm bg-red-900/20 rounded-xl p-3" />

          @if (session('status'))
            <div class="mb-4 text-sm text-green-400 bg-green-900/20 rounded-xl p-3">
              {{ session('status') }}
            </div>
          @endif

          <form method="POST" action="{{ route('login') }}" class="space-y-4">
            @csrf

            <!-- Email -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-300 mb-1.5">Email address</label>
              <input
                id="email"
                type="email"
                name="email"
                value="{{ old('email') }}"
                required
                autofocus
                autocomplete="username"
                placeholder="you@company.com"
                class="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/20 text-white placeholder-gray-500
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
            </div>

            <!-- Password -->
            <div>
              <label for="password" class="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                required
                autocomplete="current-password"
                placeholder="••••••••"
                class="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/20 text-white placeholder-gray-500
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
            </div>

            <!-- Remember me -->
            <div class="flex items-center justify-between">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="remember" class="rounded border-white/30 bg-black/40 text-blue-600 focus:ring-blue-500">
                <span class="text-sm text-gray-400">Remember me</span>
              </label>
            </div>

            <!-- Submit -->
            <button
              type="submit"
              class="w-full py-3 rounded-xl font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              Sign in
            </button>
          </form>

          <p class="text-center text-xs text-gray-500 mt-6">
            Powered by <span class="text-gray-400 font-medium">404Softwares</span>
          </p>
        </div>
      </div>
    </div>
  </div>

  <style>
    @keyframes slideUp {
      to { transform: translateY(0); opacity: 1; }
    }
  </style>

</body>
</html>
