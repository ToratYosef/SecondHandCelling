# Render Deployment Configuration

This document describes the deployment setup for the SecondHandCell application on Render.

## Services Overview

### Backend API Service
- **URL**: https://shc-api.onrender.com
- **Type**: Web Service
- **Build Command**: `npm run build:api`
- **Start Command**: `npm run start:api`

## Environment Variables

### Required Backend Environment Variables

Set these in your Render service's Environment tab:

```env
# Database
DATABASE_URL=<your-postgres-url>

# Application
NODE_ENV=production
PORT=5000

# CORS (add your frontend domain)
CORS_ORIGINS=https://your-frontend-domain.com,https://www.your-frontend-domain.com

# Session Secret (generate a random secret)
SESSION_SECRET=<generate-random-secret>

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=sales@secondhandcell.com
EMAIL_PASS=<your-app-password>
EMAIL_FROM=SecondHandCell <sales@secondhandcell.com>

# ShipEngine API
SHIPENGINE_KEY=<your-shipengine-key>
SHIPENGINE_FROM_NAME=SHC
SHIPENGINE_FROM_COMPANY=SecondHandCell
SHIPENGINE_FROM_ADDRESS1=1206 McDonald Ave
SHIPENGINE_FROM_ADDRESS2=Ste Rear
SHIPENGINE_FROM_CITY=Brooklyn
SHIPENGINE_FROM_STATE=NY
SHIPENGINE_FROM_POSTAL=11230
SHIPENGINE_FROM_PHONE=2015551234

# PhoneCheck API
IMEI_API=<your-imei-api-key>
IMEI_USERNAME=<your-imei-username>
IMEI_BASE_URL=https://clientapiv2.phonecheck.com
```

## Deploy Backend to Render

### Option 1: Using render.yaml (Recommended)

1. Update `render.yaml` in your repository root:

```yaml
services:
  - type: web
    name: shc-api
    env: node
    region: oregon
    plan: free
    buildCommand: npm install && npm run build:api
    startCommand: npm run start:api
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: shc-db
          property: connectionString
      - key: SESSION_SECRET
        generateValue: true
      - key: CORS_ORIGINS
        value: https://your-frontend-domain.com
      # Add other environment variables here

databases:
  - name: shc-db
    databaseName: secondhandcell
    user: shc_user
    region: oregon
    plan: free
```

2. Connect your repository to Render
3. Render will automatically deploy using the configuration

### Option 2: Manual Setup

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: shc-api
   - **Environment**: Node
   - **Region**: Oregon (or your preferred region)
   - **Branch**: main
   - **Root Directory**: ./
   - **Build Command**: `npm install && npm run build:api`
   - **Start Command**: `npm run start:api`
4. Add all environment variables listed above
5. Create a PostgreSQL database and link it
6. Deploy

## Deploy Frontend

### Option 1: Deploy to Vercel (Recommended)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Configure `vercel.json`:
   ```json
   {
     "buildCommand": "npm run build:client",
     "outputDirectory": "dist/public",
     "framework": "vite",
     "env": {
       "VITE_API_URL": "https://shc-api.onrender.com"
     }
   }
   ```

3. Deploy:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy to Netlify

1. Create `netlify.toml`:
   ```toml
   [build]
     command = "npm run build:client"
     publish = "dist/public"

   [build.environment]
     VITE_API_URL = "https://shc-api.onrender.com"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. Deploy using Netlify CLI or connect your repository

### Option 3: Deploy Frontend to Render

If you want to host both frontend and backend on Render:

```yaml
services:
  - type: web
    name: shc-frontend
    env: static
    buildCommand: npm install && npm run build:client
    staticPublishPath: dist/public
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
    envVars:
      - key: VITE_API_URL
        value: https://shc-api.onrender.com
```

## Post-Deployment Steps

1. **Update CORS Origins**:
   After deploying the frontend, update the backend's `CORS_ORIGINS` environment variable:
   ```
   CORS_ORIGINS=https://your-frontend-domain.com,https://www.your-frontend-domain.com
   ```

2. **Test the Connection**:
   - Visit your frontend URL
   - Open browser DevTools (F12)
   - Check the Network tab for API requests
   - Verify that requests are going to https://shc-api.onrender.com

3. **Run Database Migrations** (if needed):
   ```bash
   npm run db:push
   ```

4. **Seed the Database** (if needed):
   ```bash
   npm run seed:production
   ```

## Monitoring and Logs

### View Logs on Render

1. Go to your service dashboard
2. Click on the "Logs" tab
3. Monitor for errors or issues

### Health Checks

Add a health check endpoint to your backend (already included in routes):

```typescript
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});
```

Configure in Render:
- **Health Check Path**: `/api/health`

## Troubleshooting

### Build Failures

1. Check that all dependencies are in `package.json`
2. Verify build commands are correct
3. Check Render build logs for specific errors

### Database Connection Issues

1. Verify `DATABASE_URL` is set correctly
2. Check that the database is in the same region as your service
3. Ensure database migrations have run

### CORS Errors

1. Update `CORS_ORIGINS` with your frontend domain
2. Restart the backend service
3. Clear browser cache and try again

### Session/Cookie Issues

1. In production, cookies require HTTPS
2. Make sure `sameSite: "none"` is set for cross-origin requests
3. Verify `secure: true` is set in production

## Scaling

### Free Tier Limitations
- Backend spins down after 15 minutes of inactivity
- First request after spin-down will be slow (cold start)
- 750 hours/month free

### Upgrading
Consider upgrading to a paid plan for:
- Always-on service (no cold starts)
- Better performance
- More resources
- Custom domains

## Backup and Recovery

### Database Backups
1. Render automatically backs up PostgreSQL databases
2. You can restore from backups in the Render dashboard

### Manual Backup
```bash
pg_dump $DATABASE_URL > backup.sql
```

### Restore
```bash
psql $DATABASE_URL < backup.sql
```

## Additional Resources

- [Render Docs](https://render.com/docs)
- [Node.js on Render](https://render.com/docs/deploy-node-express-app)
- [PostgreSQL on Render](https://render.com/docs/databases)
