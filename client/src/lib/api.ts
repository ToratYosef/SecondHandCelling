// API Configuration - Always use Render backend
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.new.secondhandcell.com';

export function getApiUrl(path: string): string {
  // Ensure base URL doesn't have trailing slash and path has leading slash
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}
