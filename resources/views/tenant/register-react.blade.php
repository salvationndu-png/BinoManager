<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BinoManager | Create Workspace</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.6s ease-out; }
        .animate-slide-up { animation: slideUp 0.8s ease-out; }
    </style>
</head>
<body class="min-h-screen flex bg-white font-sans">
    
    <!-- Left Side: Visual -->
    <div class="hidden lg:block flex-1 bg-slate-900 relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-tr from-indigo-600/20 to-transparent"></div>
        <div class="absolute top-0 left-0 w-full h-full opacity-30">
            <div class="absolute top-1/3 left-1/3 w-96 h-96 bg-purple-500 rounded-full blur-[120px]"></div>
            <div class="absolute bottom-1/3 right-1/3 w-96 h-96 bg-indigo-500 rounded-full blur-[120px]"></div>
        </div>
        
        <div class="relative h-full flex flex-col items-center justify-center p-20 text-center animate-fade-in">
            <div class="max-w-md">
                <div class="mb-12 inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
                    <span class="text-xs font-black text-white uppercase tracking-widest">14-day free trial</span>
                </div>
                <h3 class="text-5xl font-black text-white mb-8 tracking-tight leading-tight">
                    Start your journey <br />
                    <span class="text-indigo-400">today.</span>
                </h3>
                <p class="text-slate-400 text-xl font-medium leading-relaxed mb-12">
                    Everything you need to manage stock, track expenses, and grow your business.
                </p>
                
                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl text-left">
                        <div class="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-4">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                            </svg>
                        </div>
                        <p class="font-black text-white">Inventory</p>
                    </div>
                    <div class="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl text-left">
                        <div class="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-4">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                            </svg>
                        </div>
                        <p class="font-black text-white">Expenses</p>
                    </div>
                    <div class="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl text-left">
                        <div class="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-4">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                            </svg>
                        </div>
                        <p class="font-black text-white">Clients</p>
                    </div>
                    <div class="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl text-left">
                        <div class="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-4">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                            </svg>
                        </div>
                        <p class="font-black text-white">Reports</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Right Side: Form -->
    <div class="flex-1 flex flex-col justify-center px-8 md:px-24 lg:px-32 relative py-20 animate-fade-in">
        <a href="{{ url('/') }}" class="absolute top-12 left-8 md:left-24 lg:left-32 flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors font-bold text-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            Back to Home
        </a>

        <div class="max-w-xl w-full mx-auto animate-slide-up">
            <div class="mb-12">
                <div class="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-indigo-200">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                    </svg>
                </div>
                <h2 class="text-4xl font-black text-slate-900 tracking-tight mb-4">Create your account</h2>
                <p class="text-slate-500 font-medium">Join 2,000+ businesses scaling with BinoManager.</p>
            </div>

            <!-- Validation Errors -->
            @if ($errors->any())
                <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
                    <div class="flex items-start gap-3">
                        <svg class="w-5 h-5 text-red-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                        </svg>
                        <div class="flex-1">
                            <p class="text-sm font-bold text-red-800 mb-1">Please fix the following errors:</p>
                            <ul class="text-sm text-red-600 space-y-1">
                                @foreach ($errors->all() as $error)
                                    <li>{{ $error }}</li>
                                @endforeach
                            </ul>
                        </div>
                    </div>
                </div>
            @endif

            <form method="POST" action="{{ route('tenant.register.store') }}" class="space-y-6">
                @csrf

                <!-- Hidden plan_id field -->
                @if(request()->has('plan'))
                    <input type="hidden" name="plan_id" value="{{ request()->get('plan') }}" />
                @endif

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-2">
                        <label for="owner_name" class="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                        <div class="relative group">
                            <div class="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-0 group-focus-within:opacity-100 blur transition-opacity"></div>
                            <input 
                                type="text" 
                                id="owner_name"
                                name="owner_name"
                                value="{{ old('owner_name') }}"
                                required
                                autofocus
                                placeholder="Sarah Jenkins"
                                class="relative w-full px-5 py-5 bg-white border-2 border-slate-200 rounded-2xl outline-none focus:border-indigo-600 transition-all font-semibold text-slate-900 placeholder:text-slate-400 shadow-sm hover:shadow-md focus:shadow-lg"
                            />
                        </div>
                    </div>

                    <div class="space-y-2">
                        <label for="email" class="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                        <div class="relative group">
                            <div class="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-0 group-focus-within:opacity-100 blur transition-opacity"></div>
                            <input 
                                type="email" 
                                id="email"
                                name="email"
                                value="{{ old('email') }}"
                                required
                                autocomplete="username"
                                placeholder="sarah@bakery.com"
                                class="relative w-full px-5 py-5 bg-white border-2 border-slate-200 rounded-2xl outline-none focus:border-indigo-600 transition-all font-semibold text-slate-900 placeholder:text-slate-400 shadow-sm hover:shadow-md focus:shadow-lg"
                            />
                        </div>
                    </div>

                    <div class="space-y-2">
                        <label for="business_name" class="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Business Name</label>
                        <div class="relative group">
                            <div class="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-0 group-focus-within:opacity-100 blur transition-opacity"></div>
                            <input 
                                type="text" 
                                id="business_name"
                                name="business_name"
                                value="{{ old('business_name') }}"
                                required
                                placeholder="Sarah's Bakery"
                                class="relative w-full px-5 py-5 bg-white border-2 border-slate-200 rounded-2xl outline-none focus:border-indigo-600 transition-all font-semibold text-slate-900 placeholder:text-slate-400 shadow-sm hover:shadow-md focus:shadow-lg"
                            />
                        </div>
                    </div>

                    <div class="space-y-2">
                        <label for="phone" class="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number <span class="text-slate-400 normal-case">(Optional)</span></label>
                        <div class="relative group">
                            <div class="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-0 group-focus-within:opacity-100 blur transition-opacity"></div>
                            <input 
                                type="tel" 
                                id="phone"
                                name="phone"
                                value="{{ old('phone') }}"
                                placeholder="08012345678"
                                class="relative w-full px-5 py-5 bg-white border-2 border-slate-200 rounded-2xl outline-none focus:border-indigo-600 transition-all font-semibold text-slate-900 placeholder:text-slate-400 shadow-sm hover:shadow-md focus:shadow-lg"
                            />
                        </div>
                    </div>
                </div>

                <div class="space-y-2">
                    <label for="password" class="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
                    <div class="relative group">
                        <div class="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-0 group-focus-within:opacity-100 blur transition-opacity"></div>
                        <input 
                            type="password" 
                            id="password"
                            name="password"
                            required
                            autocomplete="new-password"
                            placeholder="••••••••"
                            class="relative w-full px-5 py-5 bg-white border-2 border-slate-200 rounded-2xl outline-none focus:border-indigo-600 transition-all font-semibold text-slate-900 placeholder:text-slate-400 shadow-sm hover:shadow-md focus:shadow-lg"
                        />
                    </div>
                </div>

                <div class="space-y-2">
                    <label for="password_confirmation" class="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Confirm Password</label>
                    <div class="relative group">
                        <div class="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-0 group-focus-within:opacity-100 blur transition-opacity"></div>
                        <input 
                            type="password" 
                            id="password_confirmation"
                            name="password_confirmation"
                            required
                            autocomplete="new-password"
                            placeholder="••••••••"
                            class="relative w-full px-5 py-5 bg-white border-2 border-slate-200 rounded-2xl outline-none focus:border-indigo-600 transition-all font-semibold text-slate-900 placeholder:text-slate-400 shadow-sm hover:shadow-md focus:shadow-lg"
                        />
                    </div>
                </div>

                <div class="flex items-start gap-3 px-1 pt-2">
                    <input type="checkbox" name="terms" id="terms" required class="w-5 h-5 mt-0.5 rounded-lg border-2 border-slate-300 text-indigo-600 focus:ring-4 focus:ring-indigo-500/20 transition-all cursor-pointer">
                    <label for="terms" class="text-sm text-slate-700 font-semibold cursor-pointer select-none leading-relaxed">
                        I agree to the <a href="#" class="text-indigo-600 font-black hover:text-indigo-700 transition-colors">Terms of Service</a> and <a href="#" class="text-indigo-600 font-black hover:text-indigo-700 transition-colors">Privacy Policy</a>
                    </label>
                </div>

                <button 
                    type="submit"
                    class="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-base tracking-wide hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-500/40 hover:shadow-indigo-500/60 hover:scale-[1.02] active:scale-[0.98] mt-8"
                >
                    Create My Account
                </button>
            </form>

            <div class="mt-12 pt-8 border-t border-slate-100 text-center">
                <p class="text-slate-500 font-medium">
                    Already have an account? 
                    <a href="{{ url('/login') }}" class="text-indigo-600 font-black hover:underline">Log in</a>
                </p>
            </div>
        </div>
    </div>

</body>
</html>
