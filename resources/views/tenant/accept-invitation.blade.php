<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Join {{ $invitation->tenant->name }} — BinoManager</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  @vite(['resources/css/app.css'])
  <style>* { font-family: 'Plus Jakarta Sans', sans-serif; }</style>
</head>
<body class="bg-gray-50 min-h-screen flex items-center justify-center p-6 antialiased">

<div class="max-w-md w-full">
  <div class="flex justify-center mb-8">
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 rounded-xl grid place-items-center text-white font-bold" style="background: linear-gradient(135deg, #0b5e57, #10b981)">BM</div>
      <span class="font-bold text-gray-900">BinoManager</span>
    </div>
  </div>

  <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
    <div class="text-center mb-8">
      <div class="text-4xl mb-3">👋</div>
      <h1 class="text-2xl font-extrabold text-gray-900 mb-1">You've been invited!</h1>
      <p class="text-gray-500 text-sm">
        <strong class="text-gray-700">{{ $invitation->inviter->name }}</strong> invited you to join
        <strong class="text-gray-700">{{ $invitation->tenant->name }}</strong>
        as a <strong class="text-gray-700">{{ ucfirst($invitation->role) }}</strong>.
      </p>
      <p class="text-xs text-gray-400 mt-2">Invitation expires {{ $invitation->expires_at->diffForHumans() }}</p>
    </div>

    @if ($errors->any())
    <div class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
      @foreach ($errors->all() as $error)
      <p class="text-sm text-red-700">• {{ $error }}</p>
      @endforeach
    </div>
    @endif

    <form method="POST" action="{{ route('invitation.accept', $invitation->token) }}" class="space-y-4">
      @csrf

      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
        <input type="text" value="{{ $invitation->email }}" readonly
          class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-500 cursor-not-allowed">
      </div>

      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-1.5">Your Full Name <span class="text-red-500">*</span></label>
        <input type="text" name="name" value="{{ old('name') }}" required maxlength="100"
          placeholder="Your name"
          class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 @error('name') border-red-400 @enderror">
        @error('name') <p class="text-xs text-red-600 mt-1">{{ $message }}</p> @enderror
      </div>

      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-1.5">Password <span class="text-red-500">*</span></label>
        <input type="password" name="password" required
          placeholder="Minimum 8 characters"
          class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 @error('password') border-red-400 @enderror">
        <p class="text-xs text-gray-400 mt-1">Uppercase, lowercase, and a number required.</p>
        @error('password') <p class="text-xs text-red-600 mt-1">{{ $message }}</p> @enderror
      </div>

      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password <span class="text-red-500">*</span></label>
        <input type="password" name="password_confirmation" required
          class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
      </div>

      <button type="submit" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm transition-colors mt-2">
        Accept Invitation & Create Account
      </button>
    </form>
  </div>
</div>

</body>
</html>
