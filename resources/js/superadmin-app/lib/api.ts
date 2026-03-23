/**
 * api.ts — SuperAdmin fetch wrapper
 * All requests go to /superadmin/api/* endpoints.
 * CSRF token is read from window.SuperAdmin or meta tag.
 *
 * Errors are thrown with full context so components can surface them properly.
 */

function getCsrf(): string {
  return window.SuperAdmin?.csrf
    || (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content
    || '';
}

/** Parses the response and throws a rich error on failure */
async function parseResponse<T>(res: Response, method: string, path: string): Promise<T> {
  if (res.ok) {
    // Handle empty responses (204 No Content)
    const text = await res.text();
    if (!text) return {} as T;
    try { return JSON.parse(text); } catch { return text as unknown as T; }
  }

  // Not OK — try to get error details from body
  let detail = '';
  try {
    const body = await res.json();
    detail = body.message ?? body.error ?? JSON.stringify(body);
  } catch {
    try { detail = await res.text(); } catch { detail = res.statusText; }
  }

  const msg = `${method} ${path} → ${res.status}${detail ? ': ' + detail : ''}`;

  // Log in dev for easier debugging
  if (res.status === 401 || res.status === 403) {
    console.warn('[SA API] Auth error — session may have expired. Redirecting to login.');
    // Only redirect on 401 (unauthenticated), not 403 (forbidden)
    if (res.status === 401) {
      window.location.href = window.SuperAdmin?.loginUrl ?? '/superadmin/login';
      return {} as T;
    }
  }

  const err = new Error(msg) as Error & { status: number; data: any };
  err.status = res.status;
  err.data = detail;
  throw err;
}

export async function saGet<T = any>(path: string): Promise<T> {
  const res = await fetch(path, {
    headers: {
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    credentials: 'same-origin',
  });
  return parseResponse<T>(res, 'GET', path);
}

export async function saPost<T = any>(path: string, data?: any): Promise<T> {
  const isFormData = data instanceof FormData;
  const res = await fetch(path, {
    method: 'POST',
    headers: {
      'X-CSRF-TOKEN': getCsrf(),
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
    },
    credentials: 'same-origin',
    body: data ? (isFormData ? data : JSON.stringify(data)) : undefined,
  });
  return parseResponse<T>(res, 'POST', path);
}

export async function saPatch<T = any>(path: string, data?: any): Promise<T> {
  const res = await fetch(path, {
    method: 'PATCH',
    headers: {
      'X-CSRF-TOKEN': getCsrf(),
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    credentials: 'same-origin',
    body: JSON.stringify(data ?? {}),
  });
  return parseResponse<T>(res, 'PATCH', path);
}

export async function saPut<T = any>(path: string, data?: any): Promise<T> {
  const res = await fetch(path, {
    method: 'PUT',
    headers: {
      'X-CSRF-TOKEN': getCsrf(),
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    credentials: 'same-origin',
    body: JSON.stringify(data ?? {}),
  });
  return parseResponse<T>(res, 'PUT', path);
}

export async function saDelete<T = any>(path: string): Promise<T> {
  const res = await fetch(path, {
    method: 'DELETE',
    headers: {
      'X-CSRF-TOKEN': getCsrf(),
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    credentials: 'same-origin',
  });
  return parseResponse<T>(res, 'DELETE', path);
}
