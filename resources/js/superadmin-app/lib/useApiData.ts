import { useState, useEffect, useCallback } from 'react';
import { saGet } from './api';

/**
 * Generic data-fetching hook for SA components.
 * Surfaces errors instead of swallowing them.
 *
 * Usage:
 *   const { data, loading, error, reload } = useApiData<DashboardData>('/superadmin/api/dashboard');
 */
export function useApiData<T = any>(path: string, deps: any[] = []) {
  const [data, setData]     = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await saGet<T>(path);
      setData(result);
    } catch (e: any) {
      setError(e.message ?? 'Request failed');
      console.error(`[useApiData] ${path}:`, e);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, ...deps]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, reload: load };
}
