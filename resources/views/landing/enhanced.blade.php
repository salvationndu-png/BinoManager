<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>BinoManager - Modern Business Management</title>
  @vite(['resources/css/app.css', 'resources/js/app.js'])
  <style>
    @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse-glow { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    .animate-float { animation: float 6s ease-in-out infinite; }
    .animate-slide-up { animation: slideUp 0.8s ease-out forwards; }
    .glass { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2); }
    .glass-dark { background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); }
  </style>
</head>
<body class="bg-slate-50 text-slate-900 antialiased overflow-x-hidden">

{{-- Navbar --}}
<nav class="fixed top-0 left-0 right-0 z-50 transition-all duration-300" x-data="{ scrolled: false }" @scroll.window="scrolled = window.pageYOffset > 20" :class="scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'">
  <div class="max-w-7xl mx-auto px-6 flex justify-between items-center">
    <div class="flex items-center gap-2 cursor-pointer group">
      <div class="bg-indigo-600 p-2 rounded-xl group-hover:rotate-6 transition-transform">
        <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z"/>
          <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21"/>
        </svg>
      </div>
      <span class="text-2xl font-black tracking-tight">BinoManager</span>
    </div>
    
    <div class="hidden md:flex items-center gap-1">
      <a href="#features" class="px-4 py-2 text-sm font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">Features</a>
      <a href="#pricing" class="px-4 py-2 text-sm font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">Pricing</a>
      <a href="#testimonials" class="px-4 py-2 text-sm font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">Testimonials</a>
    </div>

    <div class="flex items-center gap-4">
      <a href="{{ url('/login') }}" class="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors px-4 py-2">Login</a>
      <a href="{{ route('tenant.register') }}" class="bg-slate-900 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-indigo-600 transition-all shadow-lg">Get Started</a>
    </div>
  </div>
</nav>

{{-- Hero Section --}}
<section class="relative pt-40 pb-24 px-4 overflow-hidden">
  {{-- Background Glow --}}
  <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
    <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-[120px]"></div>
    <div class="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-purple-200/20 rounded-full blur-[120px]"></div>
  </div>

  <div class="max-w-7xl mx-auto text-center relative z-10">
    <div class="animate-slide-up">
      <span class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest mb-8 shadow-sm">
        <span class="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
        Trusted by 2,000+ businesses
      </span>
      <h1 class="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.95] mb-8">
        Manage your business <br>
        like a <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Pro.</span>
      </h1>
      <p class="text-xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
        The all-in-one platform to track inventory, manage clients, and monitor finances. Built for modern entrepreneurs who value their time.
      </p>
      <div class="flex flex-col sm:flex-row items-center justify-center gap-6">
        <a href="{{ route('tenant.register') }}" class="w-full sm:w-auto bg-indigo-600 text-white px-10 py-5 rounded-2xl text-lg font-black hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 flex items-center justify-center gap-3 group">
          Start Free Trial 
          <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
        </a>
        <button class="w-full sm:w-auto bg-white text-slate-900 border border-slate-200 px-10 py-5 rounded-2xl text-lg font-black hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-sm">
          <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
            <svg class="w-4 h-4 fill-slate-900" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </div>
          Watch demo
        </button>
      </div>
    </div>

    {{-- iPhone Frame Mockup --}}
    <div class="mt-24 relative animate-slide-up" style="animation-delay: 0.3s; opacity: 0;">
      {{-- Main iPhone Frame --}}
      <div class="relative mx-auto max-w-sm md:max-w-md lg:max-w-2xl">
        <div class="relative rounded-[3rem] border-[14px] border-slate-900 bg-slate-900 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
          {{-- Notch --}}
          <div class="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-slate-900 rounded-b-3xl z-10"></div>
          
          {{-- Screen Content --}}
          <div class="bg-white rounded-[2.2rem] overflow-hidden aspect-[9/19.5]">
            {{-- Status Bar --}}
            <div class="h-12 bg-gradient-to-b from-indigo-600 to-indigo-700 flex items-center justify-between px-8 pt-2">
              <span class="text-white text-xs font-bold">9:41</span>
              <div class="flex gap-1">
                <div class="w-4 h-4 bg-white/30 rounded-sm"></div>
                <div class="w-4 h-4 bg-white/30 rounded-sm"></div>
                <div class="w-4 h-4 bg-white/30 rounded-sm"></div>
              </div>
            </div>

            {{-- Dashboard Content --}}
            <div class="bg-slate-50 p-4 space-y-4 h-full">
              <div class="flex justify-between items-center">
                <div>
                  <h2 class="text-lg font-black text-slate-900">Dashboard</h2>
                  <p class="text-xs text-slate-500">Welcome back, Sarah</p>
                </div>
                <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">SJ</div>
              </div>

              {{-- Stats Cards --}}
              <div class="grid grid-cols-2 gap-3">
                <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                  <div class="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center mb-2">
                    <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                  </div>
                  <p class="text-[10px] font-bold text-slate-400 uppercase">Revenue</p>
                  <p class="text-xl font-black text-slate-900">₦847K</p>
                </div>
                <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                  <div class="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center mb-2">
                    <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                  </div>
                  <p class="text-[10px] font-bold text-slate-400 uppercase">Stock</p>
                  <p class="text-xl font-black text-slate-900">2,847</p>
                </div>
              </div>

              {{-- Chart Area --}}
              <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <p class="text-xs font-bold text-slate-900 mb-3">Sales Trend</p>
                <div class="h-32 flex items-end justify-between gap-1">
                  <div class="w-full bg-indigo-100 rounded-t" style="height: 40%"></div>
                  <div class="w-full bg-indigo-200 rounded-t" style="height: 60%"></div>
                  <div class="w-full bg-indigo-300 rounded-t" style="height: 45%"></div>
                  <div class="w-full bg-indigo-400 rounded-t" style="height: 80%"></div>
                  <div class="w-full bg-indigo-500 rounded-t" style="height: 70%"></div>
                  <div class="w-full bg-indigo-600 rounded-t" style="height: 100%"></div>
                </div>
              </div>

              {{-- Recent Activity --}}
              <div class="space-y-2">
                <p class="text-xs font-bold text-slate-900">Recent Sales</p>
                <div class="bg-white rounded-xl p-3 shadow-sm border border-slate-100 flex justify-between items-center">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-emerald-100"></div>
                    <div>
                      <p class="text-xs font-bold text-slate-900">Rice 50kg</p>
                      <p class="text-[10px] text-slate-500">2 mins ago</p>
                    </div>
                  </div>
                  <p class="text-sm font-black text-emerald-600">+₦45K</p>
                </div>
                <div class="bg-white rounded-xl p-3 shadow-sm border border-slate-100 flex justify-between items-center">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-blue-100"></div>
                    <div>
                      <p class="text-xs font-bold text-slate-900">Vegetable Oil</p>
                      <p class="text-[10px] text-slate-500">15 mins ago</p>
                    </div>
                  </div>
                  <p class="text-sm font-black text-emerald-600">+₦28K</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {{-- Floating Stats Cards --}}
      <div class="hidden lg:block absolute -top-12 -right-12 bg-white p-4 rounded-2xl shadow-2xl border border-slate-100 animate-float">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
            <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
          </div>
          <div>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Revenue</p>
            <p class="text-lg font-black text-slate-900">+₦12,450</p>
          </div>
        </div>
      </div>

      <div class="hidden lg:block absolute bottom-12 -left-12 bg-white p-4 rounded-2xl shadow-2xl border border-slate-100 animate-float" style="animation-delay: 1s;">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
          </div>
          <div>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">New Clients</p>
            <p class="text-lg font-black text-slate-900">+48</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

{{-- Features Section --}}
<section id="features" class="py-32 px-4 max-w-7xl mx-auto relative">
  <div class="absolute top-0 right-0 w-64 h-64 bg-indigo-100/50 rounded-full blur-[100px] -z-10"></div>
  
  <div class="text-center mb-24">
    <span class="text-indigo-600 font-black text-sm uppercase tracking-widest mb-4 block">The Solution</span>
    <h2 class="text-5xl md:text-6xl font-black text-slate-900 mb-8 tracking-tight">
      Everything you need <br> to run your business.
    </h2>
    <p class="text-slate-600 max-w-2xl mx-auto text-lg font-medium">
      Stop juggling multiple apps. BinoManager combines the best tools into one seamless experience designed for growth.
    </p>
  </div>

  <div class="grid md:grid-cols-3 gap-10">
    @foreach([
      ['icon' => '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>', 'title' => 'Unified Dashboard', 'desc' => 'Get a 360-degree view of your business performance in real-time. No more guessing.', 'color' => 'bg-indigo-50 text-indigo-600'],
      ['icon' => '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>', 'title' => 'Automated Workflows', 'desc' => 'From invoice reminders to stock alerts, let BinoManager handle the repetitive tasks.', 'color' => 'bg-orange-50 text-orange-600'],
      ['icon' => '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>', 'title' => 'Advanced Analytics', 'desc' => 'Deep dive into your data with professional reports that help you make smarter decisions.', 'color' => 'bg-emerald-50 text-emerald-600']
    ] as $feature)
    <div class="p-10 rounded-[2.5rem] border border-slate-100 bg-white hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 group relative overflow-hidden">
      <div class="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>
      <div class="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110 group-hover:rotate-3 relative z-10 {{ $feature['color'] }}">
        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">{!! $feature['icon'] !!}</svg>
      </div>
      <h3 class="text-2xl font-black text-slate-900 mb-4 leading-tight relative z-10">{{ $feature['title'] }}</h3>
      <p class="text-slate-600 leading-relaxed font-medium relative z-10">{{ $feature['desc'] }}</p>
    </div>
    @endforeach
  </div>
</section>

{{-- CTA Section --}}
<section class="py-40 bg-white overflow-hidden relative px-4">
  <div class="max-w-5xl mx-auto text-center relative z-10">
    <div class="bg-indigo-600 rounded-[4rem] p-16 md:p-24 text-white shadow-[0_50px_100px_-20px_rgba(79,70,229,0.4)] relative overflow-hidden">
      <div class="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div class="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
        <div class="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2"></div>
      </div>
      
      <h2 class="text-5xl md:text-7xl font-black mb-8 tracking-tighter leading-none relative z-10">
        Ready to build your <br> business empire?
      </h2>
      <p class="text-indigo-100 text-xl mb-12 max-w-2xl mx-auto font-medium relative z-10">
        Join 2,000+ entrepreneurs who have already simplified their operations. Start your 14-day free trial today.
      </p>
      <div class="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
        <a href="{{ route('tenant.register') }}" class="w-full sm:w-auto bg-white text-indigo-600 px-12 py-6 rounded-[2rem] text-xl font-black hover:bg-slate-100 transition-all shadow-xl">
          Get Started Now
        </a>
        <a href="#pricing" class="w-full sm:w-auto bg-indigo-500 text-white px-12 py-6 rounded-[2rem] text-xl font-black hover:bg-indigo-400 transition-all border border-indigo-400">
          View Pricing
        </a>
      </div>
    </div>
  </div>
</section>

{{-- Footer --}}
<footer class="py-12 border-t border-slate-100 bg-white">
  <div class="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
    <div class="flex items-center gap-2">
      <div class="bg-indigo-600 p-1.5 rounded-md">
        <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z"/>
          <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21"/>
        </svg>
      </div>
      <span class="text-xl font-bold tracking-tight text-slate-900">BinoManager</span>
    </div>
    <div class="flex gap-8 text-sm font-medium text-slate-500">
      <a href="#" class="hover:text-indigo-600">Privacy Policy</a>
      <a href="#" class="hover:text-indigo-600">Terms of Service</a>
      <a href="#" class="hover:text-indigo-600">Contact Us</a>
    </div>
    <p class="text-sm text-slate-400">© 2026 BinoManager. All rights reserved.</p>
  </div>
</footer>

<script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
</body>
</html>
