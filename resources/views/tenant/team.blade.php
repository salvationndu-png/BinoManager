@extends('layouts.modern')
@section('title', 'Team — Wholesale Manager')
@section('page-title', 'Team Management')
@section('page-subtitle', 'Invite and manage team members')

@section('content')

{{-- Usage bar --}}
@if(!$usage['users']['unlimited'])
<div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-5">
  <div class="flex-1">
    <div class="flex justify-between text-sm mb-1.5">
      <span class="font-semibold text-gray-700">Team members</span>
      <span class="text-gray-500">{{ $usage['users']['current'] }} / {{ $usage['users']['limit'] }}</span>
    </div>
    <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
      @php $pct = $usage['users']['limit'] > 0 ? min(100, round($usage['users']['current'] / $usage['users']['limit'] * 100)) : 0; @endphp
      <div class="h-full rounded-full transition-all {{ $pct >= 90 ? 'bg-red-500' : 'bg-emerald-500' }}" style="width: {{ $pct }}%"></div>
    </div>
  </div>
  @if($pct >= 100)
  <a href="{{ url('/billing') }}" class="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap">
    Upgrade Plan →
  </a>
  @endif
</div>
@endif

<div class="grid lg:grid-cols-3 gap-6">

  {{-- Invite form --}}
  <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
    <h2 class="text-lg font-bold text-gray-900 mb-5">Invite Team Member</h2>
    <div id="inviteForm">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
          <input type="email" id="inviteEmail" placeholder="colleague@example.com" maxlength="255"
            class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">Role</label>
          <select id="inviteRole" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="salesperson">Salesperson (limited access)</option>
            <option value="admin">Admin (full access)</option>
          </select>
          <p class="text-xs text-gray-400 mt-1.5">Salespersons can record sales but cannot manage products, stock, or see cost prices.</p>
        </div>
        <button onclick="sendInvite()" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
          Send Invitation
        </button>
      </div>
    </div>

    {{-- Pending invitations --}}
    @if($invitations->count())
    <div class="mt-6 border-t border-gray-100 pt-5">
      <h3 class="text-sm font-semibold text-gray-700 mb-3">Pending Invitations</h3>
      <div class="space-y-2" id="pendingList">
        @foreach($invitations as $inv)
        <div class="flex items-center justify-between py-2" id="invite-{{ $inv->id }}">
          <div>
            <div class="text-sm font-medium text-gray-700 truncate max-w-[180px]">{{ $inv->email }}</div>
            <div class="text-xs text-gray-400">{{ ucfirst($inv->role) }} · expires {{ $inv->expires_at->diffForHumans() }}</div>
          </div>
          <button onclick="revokeInvite({{ $inv->id }})" class="text-xs text-red-500 hover:text-red-700 font-medium transition-colors">Revoke</button>
        </div>
        @endforeach
      </div>
    </div>
    @endif
  </div>

  {{-- Members list --}}
  <div class="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
    <h2 class="text-lg font-bold text-gray-900 mb-5">Team Members ({{ $members->count() }})</h2>
    <div class="space-y-3">
      @forelse($members as $member)
      <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl" id="member-{{ $member->id }}">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full grid place-items-center text-white font-bold text-sm shadow-sm" style="background: linear-gradient(135deg, #0b5e57, #10b981);">
            {{ strtoupper(substr($member->name, 0, 1)) }}
          </div>
          <div>
            <div class="font-semibold text-gray-900 text-sm flex items-center gap-2">
              {{ $member->name }}
              @if($member->id === auth()->id()) <span class="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">You</span> @endif
            </div>
            <div class="text-xs text-gray-500">{{ $member->email }}</div>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-xs font-semibold px-2.5 py-1 rounded-full {{ $member->usertype == 1 ? 'bg-purple-100 text-purple-700' : 'bg-gray-200 text-gray-600' }}">
            {{ $member->usertype == 1 ? 'Admin' : 'Salesperson' }}
          </span>
          <span class="text-xs px-2.5 py-1 rounded-full {{ $member->status ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600' }}">
            {{ $member->status ? 'Active' : 'Inactive' }}
          </span>
          @if($member->id !== auth()->id())
          <button onclick="removeMember({{ $member->id }}, '{{ addslashes($member->name) }}')"
            class="text-xs text-red-400 hover:text-red-600 transition-colors font-medium">
            Remove
          </button>
          @endif
        </div>
      </div>
      @empty
      <div class="text-center py-10 text-gray-400">
        <svg class="w-12 h-12 mx-auto mb-2 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"/></svg>
        No team members yet. Invite someone above.
      </div>
      @endforelse
    </div>
  </div>

</div>

{{-- Confirm remove modal --}}
<div id="removeModal" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
  <div class="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
    <h3 class="text-lg font-bold text-gray-900 mb-2">Remove team member?</h3>
    <p class="text-gray-500 text-sm mb-6" id="removeModalText">This person will lose access immediately.</p>
    <div class="flex gap-3">
      <button onclick="closeRemoveModal()" class="flex-1 border border-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">Cancel</button>
      <button id="confirmRemoveBtn" class="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">Remove</button>
    </div>
  </div>
</div>

@endsection

@push('scripts')
<script>
const token = document.querySelector('meta[name="csrf-token"]').content;

async function sendInvite() {
  const email = document.getElementById('inviteEmail').value.trim();
  const role  = document.getElementById('inviteRole').value;
  if (!email) return showToast('Enter an email address.', 'error');

  const res = await fetch('/team/invite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': token },
    body: JSON.stringify({ email, role }),
  });
  const data = await res.json();
  if (data.success) {
    showToast(data.message, 'success');
    document.getElementById('inviteEmail').value = '';
    setTimeout(() => location.reload(), 1500);
  } else {
    showToast(data.message || 'Error sending invite.', 'error');
  }
}

async function revokeInvite(id) {
  const res = await fetch('/team/invitations/' + id, {
    method: 'DELETE',
    headers: { 'X-CSRF-TOKEN': token },
  });
  const data = await res.json();
  if (data.success) {
    document.getElementById('invite-' + id)?.remove();
    showToast('Invitation revoked.', 'success');
  }
}

let pendingRemoveId = null;

function removeMember(id, name) {
  pendingRemoveId = id;
  document.getElementById('removeModalText').textContent = `Remove ${name} from this workspace? They will lose access immediately.`;
  document.getElementById('removeModal').classList.remove('hidden');
}

function closeRemoveModal() {
  pendingRemoveId = null;
  document.getElementById('removeModal').classList.add('hidden');
}

document.getElementById('confirmRemoveBtn').addEventListener('click', async () => {
  if (!pendingRemoveId) return;
  const res = await fetch('/team/members/' + pendingRemoveId, {
    method: 'DELETE',
    headers: { 'X-CSRF-TOKEN': token },
  });
  const data = await res.json();
  if (data.success) {
    document.getElementById('member-' + pendingRemoveId)?.remove();
    closeRemoveModal();
    showToast('Member removed.', 'success');
  } else {
    closeRemoveModal();
    showToast(data.message || 'Error removing member.', 'error');
  }
});

function showToast(msg, type) {
  const el = document.createElement('div');
  el.className = `pointer-events-auto px-5 py-3 rounded-xl text-sm font-medium shadow-lg text-white ${type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`;
  el.textContent = msg;
  document.getElementById('toastContainer').appendChild(el);
  setTimeout(() => el.remove(), 4000);
}
</script>
@endpush
