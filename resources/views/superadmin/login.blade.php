<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Super Admin Login — Wholesale Manager</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  @vite(['resources/css/app.css'])
  <style>
    * { font-family: 'Plus Jakarta Sans', sans-serif; }
    body { background: #09090b; color: #e4e4e7; }
    input { background: #18181b; border: 1px solid #3f3f46; color: #e4e4e7; border-radius: 8px; padding: 10px 14px; font-size: 14px; width: 100%; font-family: inherit; }
    input:focus { outline: none; border-color: #059669; box-shadow: 0 0 0 2px rgba(5,150,105,0.2); }
  </style>
</head>
<body class="min-h-screen flex items-center justify-center p-6 antialiased">

<div class="max-w-sm w-full">
  <div class="text-center mb-8">
    <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4" style="background: linear-gradient(135deg, #047857, #059669)">
      <span class="text-white font-black text-base">SA</span>
    </div>
    <h1 class="text-xl font-bold text-white">Platform Admin</h1>
    <p class="text-zinc-500 text-sm mt-1">Wholesale Manager · 404Softwares</p>
  </div>

  @if($errors->any())
  <div class="bg-red-950 border border-red-800 text-red-300 text-sm rounded-xl px-4 py-3 mb-5">
    @foreach($errors->all() as $e) <p>{{ $e }}</p> @endforeach
  </div>
  @endif

  @if(session('error'))
  <div class="bg-red-950 border border-red-800 text-red-300 text-sm rounded-xl px-4 py-3 mb-5">{{ session('error') }}</div>
  @endif

  <div class="sa-card p-6" style="background: #111113; border: 1px solid #27272a; border-radius: 12px;">
    <form method="POST" action="{{ route('superadmin.login.submit') }}" class="space-y-4">
      @csrf

      <div>
        <label class="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide">Email</label>
        <input type="email" name="email" value="{{ old('email') }}" required autofocus placeholder="admin@wholesalemanager.com">
      </div>

      <div>
        <label class="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide">Password</label>
        <div class="relative">
          <input type="password" id="password" name="password" required placeholder="••••••••••">
          <button type="button" onclick="togglePassword()" class="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
            <svg id="eye-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <svg id="eye-slash-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 hidden">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
            </svg>
          </button>
        </div>
      </div>

      <script>
        function togglePassword() {
          const input = document.getElementById('password');
          const eyeIcon = document.getElementById('eye-icon');
          const eyeSlashIcon = document.getElementById('eye-slash-icon');
          
          if (input.type === 'password') {
            input.type = 'text';
            eyeIcon.classList.add('hidden');
            eyeSlashIcon.classList.remove('hidden');
          } else {
            input.type = 'password';
            eyeIcon.classList.remove('hidden');
            eyeSlashIcon.classList.add('hidden');
          }
        }
      </script>

      <div class="flex items-center gap-2">
        <input type="checkbox" name="remember" id="remember" class="w-4 h-4 rounded text-emerald-600" style="width:16px;padding:0;">
        <label for="remember" class="text-xs text-zinc-400">Remember me</label>
      </div>

      <button type="submit" class="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-lg text-sm transition-colors mt-1">
        Sign in to Platform →
      </button>
    </form>
  </div>

  <p class="text-center text-xs text-zinc-600 mt-6">
    This portal is restricted to 404Softwares staff only.
  </p>
</div>

</body>
</html>
