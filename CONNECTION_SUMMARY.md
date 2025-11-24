# Frontend-Backend Connection Summary

## Overview
The frontend has been successfully configured to connect to the backend API at **https://shc-api.onrender.com**.

## Changes Made

### 1. API Configuration (`client/src/lib/api.ts`)
- Updated `API_BASE_URL` to use `https://shc-api.onrender.com`
- Added support for `VITE_API_URL` environment variable
- Maintains the `getApiUrl()` helper function for consistent URL construction

### 2. Vite Configuration (`vite.config.ts`)
- Added proxy configuration for `/api` routes in development
- Proxies requests to the backend API URL
- Includes proper CORS and credentials settings

### 3. Environment Variables
- Created `.env.local` with `VITE_API_URL=https://shc-api.onrender.com`
- Updated `.env` with CORS configuration
- Updated `.env.example` with new environment variable documentation

### 4. Backend Updates
- Added CORS origins configuration support
- Added health check endpoint at `/api/health`
- Configured session cookies for cross-origin requests

### 5. Documentation
- Created `FRONTEND_BACKEND_CONNECTION.md` - Complete guide for API connection
- Created `RENDER_DEPLOYMENT.md` - Deployment guide for Render
- Updated `CONNECTION_SUMMARY.md` - This summary document

## Quick Start

### Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Access the app:**
   - Frontend: http://localhost:5173
   - API requests will be proxied to https://shc-api.onrender.com

### Production

1. **Build the frontend:**
   ```bash
   npm run build:client
   ```

2. **Deploy the `dist/public` folder** to your hosting service (Vercel, Netlify, etc.)

3. **Set environment variable:**
   ```
   VITE_API_URL=https://shc-api.onrender.com
   ```

## Testing the Connection

### Test Health Endpoint
```bash
curl https://shc-api.onrender.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-11-24T...",
  "service": "SecondHandCell API",
  "version": "1.0.0"
}
```

### Test API from Frontend
1. Open the frontend in your browser
2. Open Developer Tools (F12)
3. Go to the Network tab
4. Navigate through the app (login, view catalog, etc.)
5. Verify that API requests are going to `https://shc-api.onrender.com`

## Important Notes

### CORS Configuration
Make sure the backend has your frontend domain in the `CORS_ORIGINS` environment variable:
```env
CORS_ORIGINS=http://localhost:5173,https://your-frontend-domain.com
```

### Session/Cookies
- All API requests must include `credentials: "include"` to send cookies
- In production, cookies require HTTPS
- Cross-origin cookies require `sameSite: "none"` and `secure: true`

### API Request Methods

1. **Using apiRequest helper (Recommended):**
   ```typescript
   import { apiRequest } from "@/lib/queryClient";
   
   const response = await apiRequest("POST", "/api/auth/login", {
     email: "user@example.com",
     password: "password"
   });
   ```

2. **Using React Query:**
   ```typescript
   import { useQuery } from "@tanstack/react-query";
   
   const { data } = useQuery({
     queryKey: ["/api/catalog/models"]
   });
   ```

3. **Direct fetch (works in both dev and prod):**
   ```typescript
   const response = await fetch("/api/auth/me", {
     credentials: "include"
   });
   ```

## File Structure

```
SecondHandCelling/
├── client/
│   └── src/
│       └── lib/
│           ├── api.ts           # API configuration
│           └── queryClient.ts   # React Query setup with API helpers
├── server/
│   ├── index.ts                 # Server entry point
│   └── routes.ts                # API routes
├── .env                         # Local environment variables
├── .env.local                   # Local overrides (gitignored)
├── .env.example                 # Example environment variables
├── vite.config.ts               # Vite configuration with proxy
├── FRONTEND_BACKEND_CONNECTION.md  # Detailed connection guide
├── RENDER_DEPLOYMENT.md         # Deployment guide
└── CONNECTION_SUMMARY.md        # This file
```

## Troubleshooting

### CORS Errors
- Check `CORS_ORIGINS` on the backend
- Ensure your frontend domain is included
- Verify `credentials: "include"` in requests

### 401 Unauthorized
- Check cookies are being sent
- Verify session is created on login
- Check browser Application/Storage tab for cookies

### Connection Refused
- Verify the backend is running at https://shc-api.onrender.com
- Test the health endpoint: `curl https://shc-api.onrender.com/api/health`
- Check Render dashboard for service status

## Next Steps

1. **Deploy the backend** to Render (if not already done)
2. **Deploy the frontend** to Vercel, Netlify, or Render
3. **Update CORS_ORIGINS** on the backend with your frontend domain
4. **Test the full flow** - register, login, browse catalog, create order

## Support

For issues or questions:
1. Check the documentation in `FRONTEND_BACKEND_CONNECTION.md`
2. Review the deployment guide in `RENDER_DEPLOYMENT.md`
3. Check the Render logs for backend errors
4. Review browser console for frontend errors
