import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, Trash2, Mail, Users, X, Clock, Edit2, Key, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiGet, apiPost, apiDelete, apiPut, apiPatch } from '../lib/api';
import { cn } from '../lib/utils';

interface Member { id: number; name: string; email: string; usertype: number; status: number; created_at?: string; }
interface Invite  { id: number; email: string; role: string; expires_at: string; inviter?: { name: string }; }

function Toast({ msg, type, onClose }: { msg: string; type: 'success'|'error'; onClose: () => void }) {
  return (
    <div className={cn(
      "fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-white text-sm font-medium max-w-sm",
      type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
    )}>
      {type === 'success' ? <CheckCircle2 size={18}/> : <AlertCircle size={18}/>}
      <span className="flex-1">{msg}</span>
      <button onClick={onClose}><X size={15} /></button>
    </div>
  );
}

export default function Team() {
  const [members, setMembers]     = useState<Member[]>([]);
  const [invites, setInvites]     = useState<Invite[]>([]);
  const [usageInfo, setUsageInfo] = useState<any>(null);
  const [loading, setLoading]     = useState(true);
  const [toast, setToast]         = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Invite modal state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole]   = useState<'admin' | 'salesperson'>('salesperson');
  const [inviting, setInviting]   = useState(false);

  // Add user modal state
  const [addUserModal, setAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserType, setNewUserType] = useState<0|1>(0);
  const [submitting, setSubmitting] = useState(false);

  // Edit user modal state
  const [editUserModal, setEditUserModal] = useState<Member|null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editUserType, setEditUserType] = useState<0|1>(0);
  const [editStatus, setEditStatus] = useState<0|1>(1);
  const [editPassword, setEditPassword] = useState('');

  // Reset password modal
  const [resetPasswordModal, setResetPasswordModal] = useState<{id:number;name:string}|null>(null);
  const [resetLink, setResetLink] = useState('');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const load = useCallback(async () => {
    try {
      const [teamRes, usageRes] = await Promise.all([
        apiGet('/api/team'),
        apiGet('/api/team-usage'),
      ]);
      setMembers(teamRes.members ?? []);
      setInvites(teamRes.invitations ?? []);
      setUsageInfo(usageRes);
    } catch {
      showToast('Failed to load team data', 'error');
    }
  }, []);

  useEffect(() => { load().finally(() => setLoading(false)); }, [load]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    try {
      const res = await apiPost('/team/invite', { email: inviteEmail, role: inviteRole });
      if (res.success) {
        showToast(res.message ?? 'Invitation sent!');
        setInviteEmail('');
        await load();
      } else {
        showToast(res.message ?? 'Failed to send invitation', 'error');
      }
    } catch (e: any) {
      showToast(e?.data?.message ?? 'Error sending invitation', 'error');
    } finally {
      setInviting(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) {
      showToast('All fields are required', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiPost('/admin/users/create', {
        name: newUserName.trim(),
        email: newUserEmail.trim(),
        password: newUserPassword,
        usertype: newUserType
      });
      if (res.success) {
        showToast('User created successfully!');
        setAddUserModal(false);
        setNewUserName(''); setNewUserEmail(''); setNewUserPassword(''); setNewUserType(0);
        await load();
      } else {
        showToast(res.message ?? 'Failed to create user', 'error');
      }
    } catch (e: any) {
      const errMsg = e?.data?.message || e?.data?.errors?.email?.[0] || e?.data?.errors?.password?.[0] || 'Error creating user';
      showToast(errMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUserModal) return;
    setSubmitting(true);
    try {
      const payload: any = {
        name: editName.trim(),
        email: editEmail.trim(),
        usertype: editUserType,
        status: editStatus
      };
      if (editPassword.trim()) payload.password = editPassword;

      const res = await apiPut(`/admin/users/${editUserModal.id}`, payload);
      if (res.success) {
        showToast('User updated successfully!');
        setEditUserModal(null);
        setEditPassword('');
        await load();
      } else {
        showToast(res.message ?? 'Failed to update user', 'error');
      }
    } catch (e: any) {
      const errMsg = e?.data?.message || e?.data?.errors?.email?.[0] || e?.data?.errors?.password?.[0] || 'Error updating user';
      showToast(errMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetPasswordModal) return;
    setSubmitting(true);
    try {
      const res = await apiPost(`/admin/users/${resetPasswordModal.id}/reset-password`, {});
      if (res.success) {
        setResetLink(res.reset_link);
        showToast('Reset link generated!');
      } else {
        showToast(res.message ?? 'Failed to generate reset link', 'error');
      }
    } catch (e: any) {
      showToast(e?.data?.message ?? 'Error generating reset link', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleUserStatus = async (id: number) => {
    try {
      const res = await apiPatch(`/admin/users/${id}/toggle-status`, {});
      if (res.success) {
        showToast(res.message ?? 'Status updated');
        await load();
      } else {
        showToast(res.message ?? 'Failed', 'error');
      }
    } catch (e: any) {
      showToast(e?.data?.message ?? 'Error', 'error');
    }
  };

  const revokeInvite = async (id: number) => {
    try {
      const res = await apiDelete(`/team/invitations/${id}`);
      if (res.success) { showToast('Invitation revoked'); await load(); }
      else showToast(res.message ?? 'Failed', 'error');
    } catch { showToast('Error revoking invitation', 'error'); }
  };

  const removeMember = async (id: number) => {
    if (!confirm('Remove this team member? They will lose access immediately.')) return;
    try {
      const res = await apiDelete(`/admin/users/${id}`);
      if (res.success) { showToast('Member removed'); await load(); }
      else showToast(res.message ?? 'Failed', 'error');
    } catch (e: any) { showToast(e?.data?.message ?? 'Error', 'error'); }
  };

  const currentUser = (window as any).BinoManager?.user;
  const usageUsers  = usageInfo?.users;
  const atLimit     = usageUsers && !usageUsers.unlimited && usageUsers.current >= usageUsers.limit;

  return (
    <div className="space-y-6 pb-8">
      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}

      {/* Add User Modal */}
      {addUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setAddUserModal(false)}/>
          <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Add Team Member</h3>
              <button onClick={() => setAddUserModal(false)} className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg"><X size={18}/></button>
            </div>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Full Name *</label>
                <input autoFocus required value={newUserName} onChange={e => setNewUserName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 outline-none dark:text-zinc-100"/>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Email *</label>
                <input type="email" required value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 outline-none dark:text-zinc-100"/>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Password *</label>
                <input type="password" required value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)}
                  placeholder="Min 8 chars, uppercase, lowercase, number"
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 outline-none dark:text-zinc-100"/>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Role *</label>
                <select value={newUserType} onChange={e => setNewUserType(Number(e.target.value) as 0|1)}
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 outline-none dark:text-zinc-100">
                  <option value={0}>Sales Staff</option>
                  <option value={1}>Admin</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setAddUserModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50 transition-all shadow-lg shadow-primary-600/20">
                  {submitting ? 'Creating…' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditUserModal(null)}/>
          <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Edit Team Member</h3>
              <button onClick={() => setEditUserModal(null)} className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg"><X size={18}/></button>
            </div>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Full Name *</label>
                <input autoFocus required value={editName} onChange={e => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 outline-none dark:text-zinc-100"/>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Email *</label>
                <input type="email" required value={editEmail} onChange={e => setEditEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 outline-none dark:text-zinc-100"/>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">New Password (leave blank to keep current)</label>
                <input type="password" value={editPassword} onChange={e => setEditPassword(e.target.value)}
                  placeholder="Min 8 chars, uppercase, lowercase, number"
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 outline-none dark:text-zinc-100"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Role *</label>
                  <select value={editUserType} onChange={e => setEditUserType(Number(e.target.value) as 0|1)}
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 outline-none dark:text-zinc-100">
                    <option value={0}>Sales Staff</option>
                    <option value={1}>Admin</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">Status *</label>
                  <select value={editStatus} onChange={e => setEditStatus(Number(e.target.value) as 0|1)}
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 outline-none dark:text-zinc-100">
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setEditUserModal(null)} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50 transition-all shadow-lg shadow-primary-600/20">
                  {submitting ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setResetPasswordModal(null); setResetLink(''); }}/>
          <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Reset Password</h3>
              <button onClick={() => { setResetPasswordModal(null); setResetLink(''); }} className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg"><X size={18}/></button>
            </div>
            {!resetLink ? (
              <div className="space-y-4">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Generate a password reset link for <strong>{resetPasswordModal.name}</strong>. The link will be valid for 24 hours.</p>
                <div className="flex gap-3">
                  <button onClick={() => { setResetPasswordModal(null); setResetLink(''); }} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">Cancel</button>
                  <button onClick={handleResetPassword} disabled={submitting} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50 transition-all shadow-lg shadow-primary-600/20">
                    {submitting ? 'Generating…' : 'Generate Link'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">✓ Reset link generated successfully!</p>
                <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">Reset Link (valid for 24 hours):</p>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 break-all font-mono">{resetLink}</p>
                </div>
                <button onClick={() => { navigator.clipboard.writeText(resetLink); showToast('Link copied to clipboard!'); }}
                  className="w-full py-2.5 rounded-xl text-sm font-bold bg-primary-600 hover:bg-primary-700 text-white transition-all shadow-lg shadow-primary-600/20">
                  Copy Link
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight dark:text-zinc-100">Team Management</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Manage team members and send invitations</p>
        </div>
        <div className="flex items-center gap-3">
          {usageUsers && !usageUsers.unlimited && (
            <div className="flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-xl">
              <Users size={15} />
              {usageUsers.current} / {usageUsers.limit} members
            </div>
          )}
          <button onClick={() => setAddUserModal(true)} disabled={atLimit}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-primary-600/20">
            <UserPlus size={16}/> Add Member
          </button>
        </div>
      </div>

      {/* Invite form */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
        <h3 className="font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
          <UserPlus size={16} className="text-primary-600" /> Invite Team Member
        </h3>
        {atLimit ? (
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-800 dark:text-amber-300">
            You've reached your team member limit.{' '}
            <button
              onClick={() => document.dispatchEvent(new CustomEvent('bino:nav', { detail: 'billing' }))}
              className="font-bold underline">
              Upgrade your plan
            </button>{' '}to add more.
          </div>
        ) : (
          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              required
              placeholder="colleague@company.com"
              className="flex-1 px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 dark:text-zinc-100 outline-none"
            />
            <select
              value={inviteRole}
              onChange={e => setInviteRole(e.target.value as any)}
              className="px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-600 dark:text-zinc-100 outline-none"
            >
              <option value="salesperson">Sales Staff</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit" disabled={inviting}
              className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 disabled:opacity-50 transition-all shadow-lg shadow-primary-600/20 whitespace-nowrap">
              {inviting ? 'Sending…' : 'Send Invite'}
            </button>
          </form>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Members list */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Members ({members.length})</h3>
            </div>
            {members.length === 0 ? (
              <div className="py-14 text-center">
                <Users size={36} className="mx-auto mb-3 text-zinc-200 dark:text-zinc-700" />
                <p className="text-sm text-zinc-400">No team members yet</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-50 dark:divide-zinc-800">
                {members.map(m => (
                  <div key={m.id} className="flex items-center gap-4 px-6 py-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-primary-600 grid place-items-center text-white font-bold text-sm flex-shrink-0">
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm text-zinc-800 dark:text-zinc-200 truncate">{m.name}</p>
                        {m.email === currentUser?.email && (
                          <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400">(you)</span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 truncate">{m.email}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full hidden sm:inline",
                        m.usertype === 1
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                      )}>
                        {m.usertype === 1 ? 'Admin' : 'Sales Staff'}
                      </span>
                      <button onClick={() => toggleUserStatus(m.id)} disabled={m.email === currentUser?.email}
                        className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors disabled:cursor-not-allowed",
                          Number(m.status) === 1
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                            : 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50'
                        )}>
                        {Number(m.status) === 1 ? 'Active' : 'Inactive'}
                      </button>
                      {m.email !== currentUser?.email && (
                        <>
                          <button onClick={() => { setEditUserModal(m); setEditName(m.name); setEditEmail(m.email); setEditUserType(m.usertype as 0|1); setEditStatus(m.status as 0|1); setEditPassword(''); }}
                            className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Edit">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => setResetPasswordModal({id: m.id, name: m.name})}
                            className="p-2 text-zinc-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors" title="Reset Password">
                            <Key size={14} />
                          </button>
                          <button onClick={() => removeMember(m.id)}
                            className="p-2 text-zinc-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors" title="Remove">
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending invitations */}
          {invites.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Clock size={15} className="text-amber-500" />
                  Pending Invitations ({invites.length})
                </h3>
              </div>
              <div className="divide-y divide-zinc-50 dark:divide-zinc-800">
                {invites.map(inv => (
                  <div key={inv.id} className="flex items-center gap-4 px-6 py-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 grid place-items-center flex-shrink-0">
                      <Mail size={16} className="text-zinc-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-zinc-800 dark:text-zinc-200 truncate">{inv.email}</p>
                      <p className="text-xs text-zinc-400">
                        Invited as {inv.role} · expires {new Date(inv.expires_at).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                    <button onClick={() => revokeInvite(inv.id)}
                      className="p-2 text-zinc-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors flex-shrink-0">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
