# BoostFlow - Free Social Media Growth Platform

A production-grade, rewarded-ad free social media growth platform built with Next.js 14+, TypeScript, MongoDB Atlas, and Vercel Serverless.

## Features

- 🚀 **100% Free** - Users watch ads to earn rewards for social media engagement
- 🔒 **Secure** - AES-256-GCM encrypted provider credentials, JWT sessions, rate limiting
- 📱 **Mobile-First** - Responsive dark/light theme with premium SaaS aesthetic
- 🎯 **Multi-Platform** - Instagram, TikTok, YouTube, Twitter/X, Facebook support
- ⚡ **Provider Engine** - Automatic fallback chain with retry logic
- 👑 **Full Admin Panel** - Orders, users, services, providers, analytics, fraud logs
- 🛡️ **Anti-Abuse** - Rate limiting, reward token replay prevention, fraud detection

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: MongoDB Atlas with Mongoose
- **Auth**: NextAuth.js with JWT sessions
- **Styling**: Tailwind CSS + shadcn/ui
- **Validation**: Zod
- **Deployment**: Vercel Serverless

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier works)
- npm or yarn

### 1. Clone & Install

```bash
cd boostflow
npm install
```

### 2. Environment Setup

Copy the example env file and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:
- `MONGODB_URI` - Your MongoDB Atlas connection string
- `AUTH_SECRET` - Random string (min 32 chars) for JWT signing
- `ENCRYPTION_KEY` - 64 hex characters (32 bytes) for encrypting provider credentials

### 3. Seed Database

```bash
npm run seed
```

This creates:
- Admin user: `admin@boostflow.com` / `Admin123!`
- Demo user: `demo@boostflow.com` / `Demo123!`
- 5 platforms (Instagram, TikTok, YouTube, Twitter/X, Facebook)
- 9 services (followers, likes, views for each platform)
- 3 demo providers with service mappings

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

```
boostflow/
├── src/
│   ├── app/
│   │   ├── (admin)/          # Admin panel pages
│   │   ├── (auth)/           # Login & register
│   │   ├── (dashboard)/      # User dashboard
│   │   ├── (public)/         # Public pages (services, FAQ, etc.)
│   │   ├── api/              # API routes
│   │   └── globals.css       # Global styles
│   ├── components/
│   │   ├── admin/            # Admin components
│   │   ├── layout/           # Header, footer
│   │   ├── order/            # Order form
│   │   └── ui/               # shadcn/ui components
│   ├── hooks/                # Custom hooks
│   ├── lib/
│   │   ├── models/           # Mongoose models
│   │   ├── admin-auth.ts     # Admin auth middleware
│   │   ├── auth.ts           # NextAuth config
│   │   ├── crypto.ts         # Encryption utilities
│   │   ├── db.ts             # MongoDB connection
│   │   ├── provider-engine.ts # Provider dispatch logic
│   │   ├── rate-limit.ts     # Rate limiting
│   │   ├── utils.ts          # Utility functions
│   │   └── validations.ts    # Zod schemas
│   ├── providers/            # React context providers
│   ├── types/                # TypeScript types
│   └── middleware.ts         # Security headers
├── scripts/
│   └── seed.ts               # Database seed script
└── .env.example              # Environment template
```

## User Flow (State Machine)

```
IDLE → CONFIGURING(platform, service, url, qty) → AD_LOCKED
     → AD_WATCHING → AD_VERIFYING(server) → AD_VERIFIED
     → ORDER_SUBMITTABLE → ORDER_SUBMITTING → ORDER_QUEUED
     → PROVIDER_DISPATCHED → DELIVERED | FAILED | FALLBACK_RETRY
```

Key security features:
- Server-side reward token verification (2-min TTL, single-use)
- Token bound to {userId, serviceId, ip, requestId}
- Idempotent order submission via requestId UUID

## API Routes

### Public
- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth endpoints
- `GET /api/services` - List active services
- `GET /api/platforms` - List active platforms
- `GET /api/health` - Health check

### User (authenticated)
- `POST /api/rewards` - Claim ad reward token
- `POST /api/orders` - Submit order
- `GET /api/orders` - List user orders
- `GET /api/orders/[id]` - Get order details

### Admin
- `GET /api/admin/stats` - Dashboard stats
- `GET /api/admin/orders` - All orders
- `GET /api/admin/users` - All users
- `PATCH /api/admin/users` - Update user
- `GET/POST/PUT /api/admin/services` - Manage services
- `GET/POST/PUT /api/admin/providers` - Manage providers
- `GET /api/admin/platforms` - Manage platforms
- `GET /api/admin/fraud-logs` - Fraud logs
- `GET /api/admin/system-logs` - System logs
- `GET /api/admin/ad-rewards` - Ad reward tokens
- `GET /api/admin/provider-services` - Provider-service mappings

## Database Schema

### Collections & Indexes

| Collection | Key Indexes |
|-----------|-------------|
| Users | unique: email, username |
| Platforms | unique: slug |
| Services | compound: platformId + isActive |
| Providers | compound: isActive + priority |
| ProviderServices | compound: serviceId + isActive + priority |
| Orders | unique: requestId; compound: userId + createdAt; on: status |
| AdRewards | unique: rewardToken; TTL: expiresAt |
| RateLimits | TTL: windowEnd |
| FraudLogs | on: ip, userId, severity, createdAt |
| SystemLogs | on: level, category, createdAt |

## Security Features

1. **Rate Limiting** - Sliding window per IP/user/endpoint
2. **Reward Token Security** - Single-use, 2-min TTL, bound to user+service+IP
3. **Fraud Detection** - Logs suspicious activity (duplicate claims, token mismatch)
4. **Credential Encryption** - AES-256-GCM for provider API keys
5. **Input Validation** - Zod schemas on all routes
6. **Security Headers** - HSTS, XSS protection, frame options
7. **URL Validation** - Platform-specific regex patterns
8. **Daily Limits** - Per-user, per-service caps

## Deployment

### Vercel

1. Push to GitHub
2. Connect repo to Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

```env
MONGODB_URI=mongodb+srv://...
AUTH_SECRET=<random-32-chars>
ENCRYPTION_KEY=<64-hex-chars>
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Admin Access

After seeding, login with:
- Email: `admin@boostflow.com`
- Password: `Admin123!`

Navigate to `/admin` for the admin panel.

## QA Checklist

- [ ] Registration with validation
- [ ] Login with correct/incorrect credentials
- [ ] Browse services by platform
- [ ] Complete order flow (service → URL → ad → submit)
- [ ] Order appears in dashboard
- [ ] Admin can view all orders
- [ ] Admin can manage services/providers
- [ ] Rate limiting works on repeated requests
- [ ] Duplicate requestId returns existing order
- [ ] Expired reward token rejected
- [ ] Mobile responsive layout
- [ ] Dark/light theme toggle

## License

MIT
