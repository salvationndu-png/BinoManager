<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password - Wholesale Manager</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-slate-800 mb-2">Reset Password</h1>
            <p class="text-slate-600">Enter your new password for <strong>{{ $user->name }}</strong></p>
        </div>

        @if ($errors->any())
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                @foreach ($errors->all() as $error)
                    <p class="text-sm">{{ $error }}</p>
                @endforeach
            </div>
        @endif

        <form method="POST" action="{{ route('password.update', ['id' => $user->id, 'token' => $token]) }}">
            @csrf
            
            <div class="mb-6">
                <label class="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                <input type="password" name="password" required
                    class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <p class="text-xs text-slate-500 mt-1">Must contain uppercase, lowercase, and number</p>
            </div>

            <div class="mb-6">
                <label class="block text-sm font-medium text-slate-700 mb-2">Confirm Password</label>
                <input type="password" name="password_confirmation" required
                    class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            </div>

            <button type="submit" 
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors">
                Reset Password
            </button>
        </form>

        <div class="mt-6 text-center">
            <a href="/" class="text-sm text-blue-600 hover:text-blue-700">Back to Login</a>
        </div>
    </div>
</body>
</html>
