# 🎯 Deployment & Testing Checklist

## ✅ What's Already Done

- [x] Frontend configured to connect to https://shc-api.onrender.com
- [x] API configuration updated in `client/src/lib/api.ts`
- [x] Vite proxy configured for development
- [x] Environment variables set up
- [x] CORS configuration added to backend
- [x] Health check endpoint added to backend
- [x] Documentation created
- [x] Connection test script created
- [x] Backend verified as accessible

## 🚀 Next Steps

### 1. Test Locally

```bash
# Install dependencies (if not done)
npm install

# Start the development server
npm run dev

# In another terminal, test the connection
node test-connection.js
```

**Expected Result**: 
- Frontend opens at http://localhost:5173
- You can browse the catalog
- API requests work in the browser console

### 2. Deploy Backend Updates (Optional)

If you want the health check endpoint active:

```bash
# Commit the changes
git add .
git commit -m "Add health check endpoint and update configuration"
git push origin main
```

Render will automatically redeploy the backend.

### 3. Deploy Frontend to Production

#### Option A: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# When prompted, use these settings:
# - Build Command: npm run build:client
# - Output Directory: dist/public
# - Framework Preset: Vite

# After deployment, add environment variable in Vercel dashboard:
# VITE_API_URL=https://shc-api.onrender.com
```

#### Option B: Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod

# When prompted:
# - Build Command: npm run build:client
# - Publish Directory: dist/public

# After deployment, add environment variable in Netlify dashboard:
# VITE_API_URL=https://shc-api.onrender.com
```

#### Option C: Manual Deployment

```bash
# Build the frontend
npm run build:client

# Upload the dist/public folder to your hosting service
# Make sure to set VITE_API_URL=https://shc-api.onrender.com
```

### 4. Update Backend CORS

After deploying the frontend, update the backend's CORS settings:

1. Go to Render Dashboard → Your Service → Environment
2. Update `CORS_ORIGINS` to include your frontend URL:
   ```
   CORS_ORIGINS=https://your-frontend-domain.com,https://www.your-frontend-domain.com
   ```
3. Save and redeploy

### 5. Test Production Deployment

1. Visit your frontend URL
2. Open Browser DevTools (F12) → Network tab
3. Test these features:
   - ✅ View catalog
   - ✅ Register a new account
   - ✅ Login
   - ✅ Create a quote
   - ✅ Add items to cart
   - ✅ Create an order

Check that:
- API requests go to https://shc-api.onrender.com
- Responses are successful (200 status)
- Sessions persist (cookies are set)
- No CORS errors in console

## 🐛 Troubleshooting Guide

### Problem: CORS Errors

**Solution**:
1. Update `CORS_ORIGINS` on Render with your frontend domain
2. Restart backend service
3. Clear browser cache
4. Try again

### Problem: 401 Unauthorized

**Solution**:
1. Check that cookies are enabled in browser
2. Verify `credentials: "include"` is in fetch requests
3. Make sure both frontend and backend use HTTPS in production
4. Check session configuration in `server/routes.ts`

### Problem: API Requests Fail

**Solution**:
1. Test backend directly: https://shc-api.onrender.com/api/public/categories
2. Check Render logs for errors
3. Verify environment variables are set
4. Check backend service status on Render

### Problem: Session Not Persisting

**Solution**:
1. Verify cookies are being set (check Application tab in DevTools)
2. Make sure `sameSite: "none"` and `secure: true` in production
3. Check that frontend and backend both use HTTPS
4. Verify `SESSION_SECRET` is set on backend

## 📊 Monitoring

### Backend Logs
- Go to Render Dashboard → Your Service → Logs
- Monitor for errors or unusual activity

### Frontend Errors
- Check browser console for errors
- Monitor Network tab for failed requests

### Health Check
```bash
# Test backend is running
curl https://shc-api.onrender.com/api/health

# Expected response:
# {"status":"ok","timestamp":"...","service":"SecondHandCell API","version":"1.0.0"}
```

## 📝 Configuration Summary

### Frontend
- **API URL**: https://shc-api.onrender.com
- **Environment Variable**: `VITE_API_URL=https://shc-api.onrender.com`
- **Session**: Cookies with `credentials: "include"`

### Backend
- **URL**: https://shc-api.onrender.com
- **CORS**: Set `CORS_ORIGINS` with frontend domain
- **Session**: Configured for cross-origin cookies
- **Database**: PostgreSQL on Render

## 🎉 Success Criteria

Your deployment is successful when:

- ✅ Frontend loads without errors
- ✅ You can view the device catalog
- ✅ Registration works
- ✅ Login works and sessions persist
- ✅ Cart functionality works
- ✅ Orders can be created
- ✅ No CORS errors in console
- ✅ API requests show 200 status codes
- ✅ Sessions persist across page refreshes

## 📚 Additional Resources

- [Frontend-Backend Connection Guide](./FRONTEND_BACKEND_CONNECTION.md)
- [Render Deployment Guide](./RENDER_DEPLOYMENT.md)
- [Connection Complete Guide](./CONNECTION_COMPLETE.md)
- [API Documentation](./README.md)

## 🆘 Need Help?

1. Check the documentation files above
2. Run the connection test: `node test-connection.js`
3. Check browser console for errors
4. Check Render logs for backend errors
5. Review environment variables on both platforms

---

**Status**: Ready for deployment! 🚀

**Current Backend**: https://shc-api.onrender.com ✅

**Next Action**: Run `npm run dev` and test locally, then deploy frontend to production!
