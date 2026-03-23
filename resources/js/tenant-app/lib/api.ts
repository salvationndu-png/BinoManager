/**
 * api.ts — Tenant-aware fetch wrapper
 *
 * Automatically prepends /{tenant_slug} to all API paths for path-based tenancy.
 * Always includes the Laravel CSRF token in mutation requests.
 */

function getTenantBasePath(): string {
  return window.BinoManager?.basePath ?? '';
}

function prependTenant(path: string): string {
  const basePath = getTenantBasePath();
  if (!basePath) return path;
  
  // Remove leading slash from path if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${basePath}/${cleanPath}`;
}

function getCsrf(): string {
  return window.BinoManager?.csrf
    || (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content
    || '';
}

export async function apiGet<T = any>(path: string): Promise<T> {
  const res = await fetch(prependTenant(path), {
    headers: {
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
  });
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
  return res.json();
}

export async function apiPost<T = any>(path: string, data: any): Promise<T> {
  const isFormData = data instanceof FormData;
  const res = await fetch(prependTenant(path), {
    method: 'POST',
    headers: {
      'X-CSRF-TOKEN': getCsrf(),
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
    },
    body: isFormData ? data : JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw Object.assign(new Error(err.message || `POST ${path} → ${res.status}`), { data: err, response: { data: err, status: res.status } });
  }
  return res.json();
}

export async function apiPatch<T = any>(path: string, data: any): Promise<T> {
  const res = await fetch(prependTenant(path), {
    method: 'PATCH',
    headers: {
      'X-CSRF-TOKEN': getCsrf(),
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw Object.assign(new Error(err.message || `PATCH ${path} → ${res.status}`), { data: err, response: { data: err, status: res.status } });
  }
  return res.json();
}

export async function apiPut<T = any>(path: string, data: any): Promise<T> {
  const res = await fetch(prependTenant(path), {
    method: 'PUT',
    headers: {
      'X-CSRF-TOKEN': getCsrf(),
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw Object.assign(new Error(err.message || `PUT ${path} → ${res.status}`), { data: err, response: { data: err, status: res.status } });
  }
  return res.json();
}

export async function apiDelete<T = any>(path: string, data?: any): Promise<T> {
  const res = await fetch(prependTenant(path), {
    method: 'DELETE',
    headers: {
      'X-CSRF-TOKEN': getCsrf(),
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: data ? JSON.stringify(data) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw Object.assign(new Error(err.message || `DELETE ${path} → ${res.status}`), { data: err, response: { data: err, status: res.status } });
  }
  return res.json();
}
