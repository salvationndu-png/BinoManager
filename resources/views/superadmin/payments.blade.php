@extends('superadmin.layout')

@section('title', 'Payment Gateways')
@section('page-title', 'Payment Gateways')
@section('page-subtitle', 'Configure payment providers for tenant subscriptions')

@section('content')
<div class="max-w-5xl">
    <div class="space-y-6">
        @foreach($gateways as $gateway)
        <div class="sa-card">
            <div class="p-6">
                <div class="flex items-start justify-between mb-6">
                    <div class="flex items-center gap-4">
                        <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                            {{ strtoupper(substr($gateway->name, 0, 2)) }}
                        </div>
                        <div>
                            <h3 class="text-xl font-bold text-white">{{ $gateway->name }}</h3>
                            <p class="text-sm text-zinc-400">Currency: {{ $gateway->currency }}</p>
                        </div>
                    </div>
                    <form action="{{ route('superadmin.payments.toggle', $gateway->id) }}" method="POST">
                        @csrf
                        @method('PATCH')
                        <button type="submit" class="px-4 py-2 rounded-lg font-semibold text-sm transition-all {{ $gateway->is_active ? 'bg-emerald-900 text-emerald-300 hover:bg-emerald-800' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700' }}">
                            {{ $gateway->is_active ? '✓ Active' : 'Inactive' }}
                        </button>
                    </form>
                </div>

                <form action="{{ route('superadmin.payments.update', $gateway->id) }}" method="POST" class="space-y-4">
                    @csrf
                    @method('PUT')

                    <div class="grid md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Public Key</label>
                            @if($gateway->public_key)
                                <div class="flex gap-2">
                                    <input type="text" name="public_key" 
                                        value="" 
                                        placeholder="{{ $gateway->getMaskedPublicKey() }} (leave empty to keep current)" 
                                        class="flex-1 px-4 py-2.5 bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent font-mono text-sm">
                                    <span class="px-3 py-2.5 bg-emerald-900 text-emerald-300 rounded-lg text-xs font-bold flex items-center">SET</span>
                                </div>
                                <p class="text-xs text-zinc-500 mt-1">Current: {{ $gateway->getMaskedPublicKey() }}</p>
                            @else
                                <input type="text" name="public_key" value="" 
                                    placeholder="pk_test_..." 
                                    class="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent font-mono text-sm">
                            @endif
                        </div>

                        <div>
                            <label class="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Secret Key</label>
                            @if($gateway->secret_key)
                                <div class="flex gap-2">
                                    <input type="password" name="secret_key" 
                                        value="" 
                                        placeholder="{{ $gateway->getMaskedSecretKey() }} (leave empty to keep current)" 
                                        class="flex-1 px-4 py-2.5 bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent font-mono text-sm">
                                    <span class="px-3 py-2.5 bg-emerald-900 text-emerald-300 rounded-lg text-xs font-bold flex items-center">SET</span>
                                </div>
                                <p class="text-xs text-zinc-500 mt-1">Current: {{ $gateway->getMaskedSecretKey() }}</p>
                            @else
                                <input type="password" name="secret_key" value="" 
                                    placeholder="sk_test_..." 
                                    class="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent font-mono text-sm">
                            @endif
                        </div>
                    </div>

                    <div class="grid md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Webhook Secret</label>
                            @if($gateway->webhook_secret)
                                <div class="flex gap-2">
                                    <input type="password" name="webhook_secret" 
                                        value="" 
                                        placeholder="{{ $gateway->getMaskedWebhookSecret() }} (leave empty to keep current)" 
                                        class="flex-1 px-4 py-2.5 bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent font-mono text-sm">
                                    <span class="px-3 py-2.5 bg-emerald-900 text-emerald-300 rounded-lg text-xs font-bold flex items-center">SET</span>
                                </div>
                                <p class="text-xs text-zinc-500 mt-1">Current: {{ $gateway->getMaskedWebhookSecret() }}</p>
                            @else
                                <input type="password" name="webhook_secret" value="" 
                                    placeholder="whsec_..." 
                                    class="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent font-mono text-sm">
                            @endif
                        </div>

                        <div>
                            <label class="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Currency</label>
                            <select name="currency" class="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent">
                                <option value="NGN" {{ $gateway->currency === 'NGN' ? 'selected' : '' }}>NGN - Nigerian Naira</option>
                                <option value="USD" {{ $gateway->currency === 'USD' ? 'selected' : '' }}>USD - US Dollar</option>
                                <option value="GBP" {{ $gateway->currency === 'GBP' ? 'selected' : '' }}>GBP - British Pound</option>
                                <option value="EUR" {{ $gateway->currency === 'EUR' ? 'selected' : '' }}>EUR - Euro</option>
                            </select>
                        </div>
                    </div>

                    <div class="flex items-center gap-3 pt-2">
                        <input type="checkbox" name="is_active" value="1" id="active_{{ $gateway->id }}" 
                            {{ $gateway->is_active ? 'checked' : '' }}
                            class="w-5 h-5 rounded border-zinc-600 bg-zinc-800 text-emerald-600 focus:ring-2 focus:ring-emerald-600">
                        <label for="active_{{ $gateway->id }}" class="text-sm font-semibold text-zinc-300">
                            Set as active payment gateway (will deactivate others)
                        </label>
                    </div>

                    <div class="flex justify-end pt-4 border-t border-zinc-800">
                        <button type="submit" class="btn-primary">
                            Save Configuration
                        </button>
                    </div>
                </form>

                @if($gateway->slug === 'paystack')
                <div class="mt-4 p-4 bg-blue-950 border border-blue-900 rounded-lg">
                    <p class="text-sm text-blue-300">
                        <strong class="text-blue-200">Webhook URL:</strong> <code class="bg-zinc-900 px-2 py-1 rounded text-blue-400 font-mono text-xs">{{ url('/webhooks/paystack') }}</code>
                    </p>
                </div>
                @endif
            </div>
        </div>
        @endforeach
    </div>

    <div class="mt-6 p-6 bg-amber-950 border border-amber-900 rounded-xl">
        <h4 class="font-bold text-amber-300 mb-3 flex items-center gap-2">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/></svg>
            Security Notes
        </h4>
        <ul class="text-sm text-amber-200 space-y-2">
            <li class="flex items-start gap-2">
                <span class="text-amber-400 mt-0.5">•</span>
                <span>All API keys are encrypted in the database using Laravel's encryption</span>
            </li>
            <li class="flex items-start gap-2">
                <span class="text-amber-400 mt-0.5">•</span>
                <span>Only one gateway can be active at a time</span>
            </li>
            <li class="flex items-start gap-2">
                <span class="text-amber-400 mt-0.5">•</span>
                <span>Test your configuration before going live</span>
            </li>
            <li class="flex items-start gap-2">
                <span class="text-amber-400 mt-0.5">•</span>
                <span>Use test keys for development, live keys for production</span>
            </li>
        </ul>
    </div>
</div>
@endsection
