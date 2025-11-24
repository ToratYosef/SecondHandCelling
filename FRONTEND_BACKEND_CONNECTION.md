# Frontend-Backend Connection Guide

This document explains how the frontend connects to the backend API.

## Backend API URL

The backend is hosted at: **https://shc-api.onrender.com**

## Configuration

### Environment Variables

The frontend uses the `VITE_API_URL` environment variable to determine the backend API URL:

- **Development**: Set in `.env` or `.env.local`
- **Production**: Set in your deployment environment (e.g., Render, Vercel, Netlify)

```env
VITE_API_URL=https://shc-api.onrender.com
```

### API Configuration File

The main API configuration is in `client/src/lib/api.ts`:

```typescript
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://shc-api.onrender.com';

export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${API_BASE_URL}/${cleanPath}`;
}
```

### Vite Proxy Configuration

For development, Vite is configured to proxy `/api` requests to the backend. This is configured in `vite.config.ts`:

```typescript
server: {
  proxy: {
    '/api': {
      target: process.env.VITE_API_URL || 'https://shc-api.onrender.com',
      changeOrigin: true,
      secure: true,
      credentials: 'include',
    },
  },
}
```

This allows the frontend to make requests to `/api/...` paths, which are automatically forwarded to the backend.

## Making API Requests

### Using the apiRequest helper (Recommended)

The preferred way to make API requests is using the `apiRequest` helper from `@/lib/queryClient`:

```typescript
import { apiRequest } from "@/lib/queryClient";

// Example: Login
const response = await apiRequest("POST", "/api/auth/login", {
  email: "user@example.com",
  password: "password123"
});

const data = await response.json();
```

### Using React Query

For data fetching with caching, use React Query:

```typescript
import { useQuery } from "@tanstack/react-query";

const { data, isLoading } = useQuery({
  queryKey: ["/api/catalog/models"],
  // The query function is automatically configured to use getApiUrl
});
```

### Direct fetch calls

If you need to make a direct fetch call, use relative paths (they will be proxied in development):

```typescript
const response = await fetch("/api/auth/me", {
  credentials: "include", // Important for cookies/sessions
});
```

## CORS Configuration

### Backend CORS Settings

The backend (`server/index.ts`) has CORS configured to allow requests from specified origins.

Set the `CORS_ORIGINS` environment variable on your backend server:

```env
# Backend .env
CORS_ORIGINS=http://localhost:5173,http://localhost:5000,https://your-frontend-domain.com
```

If `CORS_ORIGINS` is empty, the backend will allow all origins (useful for development but not recommended for production).

### Session/Cookie Configuration

Sessions are configured with these settings in the backend:

```typescript
cookie: {
  secure: isProduction,           // true in production (requires HTTPS)
  httpOnly: true,                 // prevents JavaScript access
  sameSite: isProduction ? "none" : "lax",  // "none" for cross-origin in production
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
}
```

Make sure to include `credentials: "include"` in all API requests to send cookies.

## Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env.local` file in the root:
   ```env
   VITE_API_URL=https://shc-api.onrender.com
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173` (or the port shown in the terminal).

4. **Test the connection:**
   - Open the browser console (F12)
   - Navigate to the app
   - Check the Network tab to see API requests going to the backend

## Production Deployment

### Frontend Deployment (e.g., Vercel, Netlify)

1. Set the environment variable in your deployment platform:
   ```
   VITE_API_URL=https://shc-api.onrender.com
   ```

2. Build the frontend:
   ```bash
   npm run build:client
   ```

3. Deploy the `dist/public` folder.

### Backend Deployment (Render)

1. Make sure the backend is configured with CORS origins that include your frontend domain:
   ```env
   CORS_ORIGINS=https://your-frontend-domain.com
   ```

2. Deploy to Render using the existing configuration.

## Troubleshooting

### CORS Errors

If you see CORS errors in the console:

1. Check that `CORS_ORIGINS` is set correctly on the backend
2. Make sure the frontend domain is included in the allowed origins
3. Verify that `credentials: "include"` is set in fetch requests

### 401 Unauthorized Errors

If you're getting 401 errors:

1. Check that cookies are being sent with requests (`credentials: "include"`)
2. Verify that the session is being created on login
3. Check the browser's Application/Storage tab to see if cookies are being set

### Session Not Persisting

If sessions are not persisting across requests:

1. In production, make sure the backend has `secure: true` for cookies (requires HTTPS)
2. Check that `sameSite` is set to `"none"` for cross-origin requests in production
3. Verify that the frontend and backend are using HTTPS in production

## API Endpoints

The backend exposes these main API routes:

- `/api/auth/*` - Authentication (login, register, logout)
- `/api/catalog/*` - Device catalog and models
- `/api/cart/*` - Shopping cart management
- `/api/orders/*` - Order management
- `/api/quotes/*` - Quote management
- `/api/admin/*` - Admin endpoints (requires admin role)

See `server/routes.ts` for the complete list of available endpoints.
