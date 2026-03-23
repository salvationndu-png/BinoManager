// /js/admin-users.js
document.addEventListener('DOMContentLoaded', function () {
  const CSRF = document.querySelector('meta[name="csrf-token"]').content;
  const toastContainer = document.getElementById('toastContainer');
  const usersTableBody = document.getElementById('usersTableBody');
  const createUserModal = document.getElementById('createUserModal');
  const createUserForm = document.getElementById('createUserForm');
  const createUserBtn = document.getElementById('createUserBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelModalBtn = document.getElementById('cancelModalBtn');
  const editUserModal = document.getElementById('editUserModal');
  const editUserForm = document.getElementById('editUserForm');
  const closeEditModalBtn = document.getElementById('closeEditModalBtn');
  const cancelEditModalBtn = document.getElementById('cancelEditModalBtn');
  const searchInput = document.getElementById('searchInput');
  const roleFilter = document.getElementById('roleFilter');
  const statusFilter = document.getElementById('statusFilter');

  // Toast notification
  function showToast(message, type = 'success') {
    if (!toastContainer) return;
    const bg = type === 'success' ? 'bg-emerald-600' : 'bg-red-600';
    const el = document.createElement('div');
    el.className = `px-3 py-2 rounded-md text-white ${bg} shadow-lg flex items-center justify-between`;
    
    const messageSpan = document.createElement('span');
    messageSpan.textContent = message;
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'ml-2 text-white font-bold';
    closeBtn.textContent = '×';
    closeBtn.onclick = () => el.remove();
    
    el.appendChild(messageSpan);
    el.appendChild(closeBtn);
    toastContainer.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }

  // Load stats
  async function loadStats() {
    try {
      const res = await fetch('/admin/users/stats');
      const data = await res.json();
      if (data.success) {
        document.getElementById('totalUsers').textContent = data.stats.total;
        document.getElementById('activeSales').textContent = data.stats.activeSales;
        document.getElementById('inactiveUsers').textContent = data.stats.inactive;
        document.getElementById('thisMonth').textContent = data.stats.thisMonth;
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  }

  // Load users
  async function loadUsers() {
    const search = searchInput.value;
    const role = roleFilter.value;
    const status = statusFilter.value;

    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (role) params.append('role', role);
    if (status) params.append('status', status);

    try {
      const res = await fetch(`/admin/users/list?${params}`);
      const data = await res.json();

      if (data.success) {
        renderUsers(data.users);
      }
    } catch (err) {
      console.error('Error loading users:', err);
      usersTableBody.innerHTML = '<tr><td colspan="6" class="px-4 py-8 text-center text-rose-500">Error loading users</td></tr>';
    }
  }

  // Render users table
  function renderUsers(users) {
    if (users.length === 0) {
      usersTableBody.innerHTML = `
        <div class="text-center py-12">
          <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
          <p class="text-gray-500 font-medium">No users found</p>
          <p class="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
        </div>
      `;
      return;
    }

    usersTableBody.innerHTML = '';
    users.forEach(user => {
      const card = document.createElement('div');
      card.className = 'bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all';
      
      card.innerHTML = `
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4 flex-1">
            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
              ${user.name.charAt(0).toUpperCase()}
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <h4 class="font-semibold text-gray-900">${user.name}</h4>
                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  user.usertype === 1 ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                }">
                  ${user.usertype === 1 ? 'Admin' : 'Sales'}
                </span>
              </div>
              <div class="flex items-center gap-2 mb-2">
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                  user.status ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }">
                  ${user.status ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div class="flex items-center gap-4 text-sm text-gray-500">
                <span class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  ${user.email}
                </span>
                <span class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  ${user.created_at}
                </span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2"></div>
        </div>
      `;
      
      const actionsDiv = card.querySelector('.flex.items-center.gap-2:last-child');
      
      const editBtn = document.createElement('button');
      editBtn.className = 'p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all';
      editBtn.title = 'Edit';
      editBtn.onclick = () => editUser(user.id);
      editBtn.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>';
      actionsDiv.appendChild(editBtn);
      
      if (user.id !== 1) {
        const statusBtn = document.createElement('button');
        statusBtn.className = `p-2 rounded-lg transition-all ${user.status ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`;
        statusBtn.title = user.status ? 'Deactivate' : 'Activate';
        statusBtn.onclick = () => toggleStatus(user.id, user.name, user.status);
        statusBtn.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">${user.status ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>' : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>'}</svg>`;
        actionsDiv.appendChild(statusBtn);
      }
      
      const resetBtn = document.createElement('button');
      resetBtn.className = 'p-2 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-all';
      resetBtn.title = 'Reset password';
      resetBtn.onclick = () => resetPassword(user.id, user.name);
      resetBtn.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>';
      actionsDiv.appendChild(resetBtn);
      
      if (user.id !== 1) {
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all';
        deleteBtn.title = 'Delete';
        deleteBtn.onclick = () => deleteUser(user.id, user.name);
        deleteBtn.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>';
        actionsDiv.appendChild(deleteBtn);
      }
      
      usersTableBody.appendChild(card);
    });
  }

  // Toggle user status
  window.toggleStatus = async function(userId, userName, currentStatus) {
    const action = currentStatus ? 'deactivate' : 'activate';
    const btn = document.getElementById('confirmActionBtn');
    
    document.getElementById('confirmActionTitle').textContent = `${action.charAt(0).toUpperCase() + action.slice(1)} User`;
    document.getElementById('confirmActionMessage').textContent = `Are you sure you want to ${action} ${userName}?`;
    btn.textContent = action.charAt(0).toUpperCase() + action.slice(1);
    btn.className = `flex-1 px-4 py-2 rounded-lg font-medium transition-all ${currentStatus ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`;
    
    btn.onclick = async () => {
      try {
        const res = await fetch(`/admin/users/${userId}/toggle-status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': CSRF }
        });
        const data = await res.json();
        if (data.success) {
          showToast(data.message);
          loadUsers();
          loadStats();
        } else {
          showToast(data.message, 'error');
        }
      } catch (err) {
        showToast('Error updating status', 'error');
      }
      document.getElementById('confirmActionModal').classList.add('hidden');
    };
    
    document.getElementById('confirmActionModal').classList.remove('hidden');
  };

  // Reset password
  window.resetPassword = async function(userId, userName) {
    const btn = document.getElementById('confirmActionBtn');
    
    document.getElementById('confirmActionTitle').textContent = 'Generate Reset Link';
    document.getElementById('confirmActionMessage').textContent = `Generate password reset link for ${userName}?`;
    btn.textContent = 'Generate Link';
    btn.className = 'flex-1 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 font-medium transition-all text-white';
    
    btn.onclick = async () => {
      try {
        const res = await fetch(`/admin/users/${userId}/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': CSRF }
        });
        const data = await res.json();
        if (data.success && data.reset_link) {
          document.getElementById('resetLinkInput').value = data.reset_link;
          document.getElementById('resetLinkModal').classList.remove('hidden');
        } else if (data.success) {
          showToast(data.message);
        } else {
          showToast(data.message, 'error');
        }
      } catch (err) {
        showToast('Error resetting password', 'error');
      }
      document.getElementById('confirmActionModal').classList.add('hidden');
    };
    
    document.getElementById('confirmActionModal').classList.remove('hidden');
  };

  window.copyResetLink = function() {
    const input = document.getElementById('resetLinkInput');
    input.select();
    document.execCommand('copy');
    showToast('Link copied to clipboard!');
  };

  // Delete user
  window.deleteUser = async function(userId, userName) {
    const btn = document.getElementById('confirmActionBtn');
    
    document.getElementById('confirmActionTitle').textContent = 'Delete User';
    document.getElementById('confirmActionMessage').textContent = `Are you sure you want to delete ${userName}? This action cannot be undone.`;
    btn.textContent = 'Delete';
    btn.className = 'flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 font-medium transition-all text-white';
    
    btn.onclick = async () => {
      try {
        const res = await fetch(`/admin/users/${userId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': CSRF }
        });
        const data = await res.json();
        if (data.success) {
          showToast(data.message);
          loadUsers();
          loadStats();
        } else {
          showToast(data.message, 'error');
        }
      } catch (err) {
        showToast('Error deleting user', 'error');
      }
      document.getElementById('confirmActionModal').classList.add('hidden');
    };
    
    document.getElementById('confirmActionModal').classList.remove('hidden');
  };

  // Create user modal
  createUserBtn?.addEventListener('click', () => {
    createUserModal.classList.remove('hidden');
  });

  closeModalBtn?.addEventListener('click', () => {
    createUserModal.classList.add('hidden');
    createUserForm.reset();
  });

  cancelModalBtn?.addEventListener('click', () => {
    createUserModal.classList.add('hidden');
    createUserForm.reset();
  });

  // Edit user modal
  window.editUser = async function(userId) {
    try {
      const res = await fetch('/admin/users/list');
      const data = await res.json();
      const user = data.users.find(u => u.id === userId);

      if (user) {
        document.getElementById('editUserId').value = user.id;
        document.getElementById('editName').value = user.name;
        document.getElementById('editEmail').value = user.email;
        document.getElementById('editUsertype').value = user.usertype;
        document.getElementById('editStatus').value = user.status ? 1 : 0;
        document.getElementById('editPassword').value = '';
        editUserModal.classList.remove('hidden');
      }
    } catch (err) {
      console.error('Error loading user:', err);
      showToast('Error loading user details', 'error');
    }
  };

  closeEditModalBtn?.addEventListener('click', () => {
    editUserModal.classList.add('hidden');
    editUserForm.reset();
  });

  cancelEditModalBtn?.addEventListener('click', () => {
    editUserModal.classList.add('hidden');
    editUserForm.reset();
  });

  // Edit user form submit
  editUserForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const userId = document.getElementById('editUserId').value;
    const formData = new FormData(editUserForm);
    const data = Object.fromEntries(formData);
    delete data.userId;

    // Remove password if empty
    if (!data.password) {
      delete data.password;
    }

    try {
      const res = await fetch(`/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': CSRF
        },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (result.success) {
        showToast(result.message);
        editUserModal.classList.add('hidden');
        editUserForm.reset();
        loadUsers();
        loadStats();
      } else {
        if (result.errors) {
          const errorMessages = Object.values(result.errors).flat().join(', ');
          showToast(errorMessages, 'error');
        } else {
          showToast(result.message || 'Error updating user', 'error');
        }
      }
    } catch (err) {
      console.error('Error updating user:', err);
      showToast('Error updating user. Check console for details.', 'error');
    }
  });

  // Create user form submit
  createUserForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(createUserForm);
    const data = Object.fromEntries(formData);

    try {
      const res = await fetch('/admin/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': CSRF
        },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (result.success) {
        showToast(result.message);
        createUserModal.classList.add('hidden');
        createUserForm.reset();
        loadUsers();
        loadStats();
      } else {
        // Handle validation errors
        if (result.errors) {
          const errorMessages = Object.values(result.errors).flat().join(', ');
          showToast(errorMessages, 'error');
        } else {
          showToast(result.message || 'Error creating user', 'error');
        }
      }
    } catch (err) {
      console.error('Error creating user:', err);
      showToast('Error creating user. Check console for details.', 'error');
    }
  });

  // Search and filters
  searchInput?.addEventListener('input', () => {
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(loadUsers, 300);
  });

  roleFilter?.addEventListener('change', loadUsers);
  statusFilter?.addEventListener('change', loadUsers);

  // Initial load
  loadStats();
  loadUsers();
});
