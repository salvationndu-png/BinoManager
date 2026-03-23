import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get the tenant-scoped URL path
 * Prepends /{tenant_slug} to all tenant routes
 */
export function tenantUrl(path: string): string {
  const basePath = window.BinoManager?.basePath ?? '';
  // Remove leading slash from path if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return basePath ? `${basePath}/${cleanPath}` : `/${cleanPath}`;
}
