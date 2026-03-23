<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BinoManager | Login</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes growBar { from { height: 0; } to { height: var(--bar-height); } }
        .animate-fade-in { animation: fadeIn 0.6s ease-out; }
        .animate-slide-up { animation: slideUp 0.8s ease-out; }
        .animate-grow-bar { animation: growBar 1s ease-out forwards; }
    </style>
</head>
<body class="min-h-screen flex bg-white font-sans">
    
    <!-- Left Side: Form -->
    <div class="flex-1 flex flex-col justify-center px-8 md:px-24 lg:px-32 relative animate-fade-in">
        <a href="{{ url('/') }}" class="absolute top-12 left-8 md:left-24 lg:left-32 flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors font-bold text-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            Back to Home
        </a>

        <div class="max-w-md w-full mx-auto animate-slide-up">
            <div class="mb-12">
                <svg class="w-12 h-12 text-blue-600 mb-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <h2 class="text-4xl font-black text-slate-900 tracking-tight mb-4">Welcome back</h2>
                <p class="text-slate-500 font-medium">Enter your email and password to access your workspace.</p>
            </div>

            <!-- Validation Errors -->
            @if ($errors->any())
                <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
                    <div class="flex items-start gap-3">
                        <svg class="w-5 h-5 text-red-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                        </svg>
                        <div class="flex-1">
                            <p class="text-sm font-bold text-red-800 mb-1">Whoops! Something went wrong.</p>
                            <ul class="text-sm text-red-600 space-y-1">
                                @foreach ($errors->all() as $error)
                                    <li>{{ $error }}</li>
                                @endforeach
                            </ul>
                        </div>
                    </div>
                </div>
            @endif

            @if (session('status'))
                <div class="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                    <p class="text-sm font-medium text-emerald-800">{{ session('status') }}</p>
                </div>
            @endif

            <form method="POST" action="{{ route('login') }}{{ request()->has('tenant') ? '?tenant=' . request('tenant') : '' }}" class="space-y-6">
                @csrf
                
                @if(request()->has('tenant'))
                    <input type="hidden" name="tenant" value="{{ request('tenant') }}">
                @endif

                <div class="space-y-2">
                    <label for="email" class="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                    <div class="relative group">
                        <div class="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-0 group-focus-within:opacity-100 blur transition-opacity"></div>
                        <div class="relative">
                            <svg class="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
                            </svg>
                            <input 
                                type="email" 
                                id="email"
                                name="email"
                                required
                                autofocus
                                autocomplete="email"
                                placeholder="Enter your email"
                                class="relative w-full pl-14 pr-5 py-5 bg-white border-2 border-slate-200 rounded-2xl outline-none focus:border-blue-600 transition-all font-semibold text-slate-900 placeholder:text-slate-400 shadow-sm hover:shadow-md focus:shadow-lg"
                            />
                        </div>
                    </div>
                </div>

                <div class="space-y-2">
                    <label for="password" class="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
                    <div class="relative group">
                        <div class="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-0 group-focus-within:opacity-100 blur transition-opacity"></div>
                        <div class="relative">
                            <svg class="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                            </svg>
                            <input 
                                type="password" 
                                id="password"
                                name="password"
                                required
                                autocomplete="current-password"
                                placeholder="Enter your password"
                                class="relative w-full pl-14 pr-5 py-5 bg-white border-2 border-slate-200 rounded-2xl outline-none focus:border-blue-600 transition-all font-semibold text-slate-900 placeholder:text-slate-400 shadow-sm hover:shadow-md focus:shadow-lg"
                            />
                        </div>
                    </div>
                    <p class="text-xs text-slate-500 ml-1 mt-2">Enter your account password</p>
                </div>

                <div class="flex items-center gap-3 px-1">
                    <input type="checkbox" name="remember" id="remember" class="w-5 h-5 rounded-lg border-2 border-slate-300 text-blue-600 focus:ring-4 focus:ring-blue-500/20 transition-all cursor-pointer">
                    <label for="remember" class="text-sm text-slate-700 font-bold cursor-pointer select-none">Keep me logged in</label>
                </div>

                <button 
                    type="submit"
                    class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-5 rounded-2xl font-black text-base tracking-wide hover:from-blue-700 hover:to-indigo-700 transition-all shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60 hover:scale-[1.02] active:scale-[0.98] mt-8"
                >
                    Log In to Dashboard
                </button>
            </form>

            <div class="mt-12 pt-8 border-t border-slate-100 text-center">
                <p class="text-slate-500 font-medium">
                    Don't have an account? 
                    <a href="{{ route('tenant.register') }}" class="text-blue-600 font-black hover:underline">Create one for free</a>
                </p>
            </div>
        </div>
    </div>

    <!-- Right Side: Visual -->
    <div class="hidden lg:block flex-1 bg-slate-900 relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent"></div>
        <div class="absolute top-0 left-0 w-full h-full opacity-30">
            <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[120px]"></div>
            <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-[120px]"></div>
        </div>
        
        <div class="relative h-full flex flex-col items-center justify-center p-20 text-center animate-fade-in">
            <div class="max-w-md">
                <div class="mb-12 inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
                    <div class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span class="text-xs font-black text-white uppercase tracking-widest">Trusted by 2,000+ businesses</span>
                </div>
                <h3 class="text-5xl font-black text-white mb-8 tracking-tight leading-tight">
                    Manage your business <br />
                    <span class="text-blue-400">from anywhere.</span>
                </h3>
                <p class="text-slate-400 text-xl font-medium leading-relaxed mb-12">
                    Join thousands of entrepreneurs who have simplified their operations with BinoManager.
                </p>
                
                <div class="relative">
                    <div class="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
                    <div class="relative bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
                        <div class="flex items-center gap-4 mb-6">
                            <div class="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                                </svg>
                            </div>
                            <div class="text-left">
                                <p class="text-xs font-bold text-slate-400 uppercase">Monthly Growth</p>
                                <p class="text-2xl font-black text-white">+24.8%</p>
                            </div>
                        </div>
                        <div class="h-24 w-full bg-white/5 rounded-2xl border border-white/5 flex items-end p-4 gap-2">
                            <div class="flex-1 bg-blue-500 rounded-t-lg animate-grow-bar" style="--bar-height: 40%;"></div>
                            <div class="flex-1 bg-blue-500 rounded-t-lg animate-grow-bar" style="--bar-height: 70%; animation-delay: 0.1s;"></div>
                            <div class="flex-1 bg-blue-500 rounded-t-lg animate-grow-bar" style="--bar-height: 45%; animation-delay: 0.2s;"></div>
                            <div class="flex-1 bg-blue-500 rounded-t-lg animate-grow-bar" style="--bar-height: 90%; animation-delay: 0.3s;"></div>
                            <div class="flex-1 bg-blue-500 rounded-t-lg animate-grow-bar" style="--bar-height: 65%; animation-delay: 0.4s;"></div>
                            <div class="flex-1 bg-blue-500 rounded-t-lg animate-grow-bar" style="--bar-height: 80%; animation-delay: 0.5s;"></div>
                            <div class="flex-1 bg-blue-500 rounded-t-lg animate-grow-bar" style="--bar-height: 100%; animation-delay: 0.6s;"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

</body>
</html>
