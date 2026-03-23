<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BinoManager | Select Workspace</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
</head>
<body class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 font-sans flex items-center justify-center p-4">
    
    <div class="max-w-md w-full">
        <a href="{{ url('/') }}" class="flex items-center justify-center gap-2 mb-8">
            <div class="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                </svg>
            </div>
            <span class="text-2xl font-black text-slate-900">BinoManager</span>
        </a>

        <div class="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
            <h2 class="text-3xl font-black text-slate-900 mb-2">Select Your Workspace</h2>
            <p class="text-slate-500 font-medium mb-8">Choose which business you want to access</p>

            @php
                $tenants = \App\Models\Tenant::where('status', '!=', 'deleted')->orderBy('name')->get();
            @endphp

            @if($tenants->count() > 0)
                <div class="space-y-3">
                    @foreach($tenants as $tenant)
                        <a href="http://localhost:8000/login?tenant={{ $tenant->slug }}" 
                           class="block p-4 rounded-2xl border-2 border-slate-200 hover:border-indigo-600 hover:bg-indigo-50 transition-all group">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold text-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                                    {{ strtoupper(substr($tenant->name, 0, 2)) }}
                                </div>
                                <div class="flex-1">
                                    <div class="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                        {{ $tenant->settings->business_name ?? $tenant->name }}
                                    </div>
                                    <div class="text-sm text-slate-500">{{ $tenant->slug }}.localhost</div>
                                </div>
                                <svg class="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                                </svg>
                            </div>
                        </a>
                    @endforeach
                </div>
            @else
                <div class="text-center py-12">
                    <svg class="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                    </svg>
                    <p class="text-slate-600 font-medium mb-4">No workspaces found</p>
                    <a href="{{ route('tenant.register') }}" class="inline-block px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                        Create Your First Workspace
                    </a>
                </div>
            @endif

            <div class="mt-8 pt-6 border-t border-slate-100 text-center">
                <p class="text-slate-500 text-sm font-medium">
                    Don't have a workspace? 
                    <a href="{{ route('tenant.register') }}" class="text-indigo-600 font-black hover:underline">Create one</a>
                </p>
            </div>
        </div>

        <div class="mt-6 text-center">
            <a href="{{ url('/') }}" class="text-sm text-slate-500 hover:text-slate-700 font-medium">
                ← Back to Home
            </a>
        </div>
    </div>

</body>
</html>
