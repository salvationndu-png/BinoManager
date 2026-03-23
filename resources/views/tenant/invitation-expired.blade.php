<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Invitation Expired — BinoManager</title>
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
  <div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
    <div class="text-5xl mb-4">⏰</div>
    <h1 class="text-2xl font-extrabold text-gray-900 mb-2">Invitation expired</h1>
    <p class="text-gray-500 text-sm mb-6">This invitation link has expired or has already been used. Please ask the workspace admin to send you a new invitation.</p>
    <a href="{{ url('/') }}" class="inline-block bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
      Go to homepage
    </a>
  </div>
</div>
</body>
</html>
