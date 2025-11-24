// API Configuration - Always use Render backend
export const API_BASE_URL = 'https://secondhandcelling.onrender.com';

export function getApiUrl(path: string): string {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${API_BASE_URL}/${cleanPath}`;
}
