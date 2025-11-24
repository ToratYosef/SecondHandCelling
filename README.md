# SecondHandCell - Full-Stack Application

SecondHandCell is a complete B2B e-commerce platform for buying and selling second-hand devices.

## 🚀 Features

- 🗄️ **PostgreSQL Database** with Drizzle ORM
- 📧 **Email Service** via Nodemailer (Gmail SMTP)
- 💳 **Stripe Integration** for payment processing
- 📦 **Shipping Services**: ShipStation & ShipEngine APIs
- 📱 **IMEI/ESN Validation** via PhoneCheck API
- 🔐 **Session Management** with express-session
- ⚛️ **React Frontend** with Vite, TailwindCSS, and shadcn/ui
- 🎨 **Modern TypeScript** setup throughout

## 📚 Documentation

- **[CONNECTION_COMPLETE.md](./CONNECTION_COMPLETE.md)** - ✅ Frontend-Backend connection guide
- **[FRONTEND_BACKEND_CONNECTION.md](./FRONTEND_BACKEND_CONNECTION.md)** - Detailed API integration guide
- **[RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)** - Complete deployment instructions
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - General deployment guide

## 🏃 Quick Start

### Backend API

The backend is already deployed at: **https://shc-api.onrender.com**

### Frontend Development

1. **Clone and Install**:
   ```bash
   git clone https://github.com/ToratYosef/SecondHandCelling.git
   cd SecondHandCelling
   npm install
   ```

2. **Configure Environment**:
   ```bash
   cp .env.example .env
   # The API URL is already configured in .env.local
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```
   
   The frontend will be available at http://localhost:5173

4. **Test the Connection**:
   ```bash
   node test-connection.js
   ```

## 🔧 Development Scripts

```bash
npm run dev          # Start development server (frontend + backend)
npm run build        # Build both frontend and backend
npm run build:client # Build frontend only
npm run build:api    # Build API server only
npm run start        # Start production server
npm run db:push      # Push database schema
npm run seed         # Seed development database
```

## 🌐 API Endpoints

### Public Routes
- `GET /api/health` - Health check endpoint
- `GET /api/public/categories` - List all device categories
- `GET /api/public/catalog` - Get public device catalog

### Authentication
- `POST /api/auth/register` - Register new user and company
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `DATABASE_URL` - Neon PostgreSQL connection string
- `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM` - Email configuration
- `SHIPENGINE_KEY` - ShipEngine API key
- `PHONECHECK_API_KEY` - PhoneCheck API key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `SESSION_SECRET` - Session encryption secret
- `CORS_ORIGINS` - Allowed CORS origins

## Scripts

```bash
npm run dev          # Development with Vite
npm run build        # Build for production
npm run build:api    # Build API only
npm run start        # Start production server
npm run start:api    # Start API server only
npm run seed         # Seed database
npm run db:push      # Push schema to database
npm run check        # TypeScript type checking
```

## Tech Stack

- **Runtime**: Node.js 22+
- **Framework**: Express.js
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle ORM
- **Language**: TypeScript
- **Build**: Vite + esbuild
- **Email**: Nodemailer
- **Payments**: Stripe
- **Shipping**: ShipStation, ShipEngine
- **Device Validation**: PhoneCheck

## Project Structure

```
SHC-API/
├── server/
│   ├── routes/          # API route handlers
│   ├── services/        # External API integrations
│   ├── helpers/         # Email templates, utilities
│   ├── db.ts           # Database connection
│   ├── storage.ts      # Data access layer
│   └── index.ts        # Server entry point
├── shared/
│   └── schema.ts       # Drizzle schema definitions
├── dist/               # Built output
└── package.json
```

## License

MIT
