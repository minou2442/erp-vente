# TREXBYTE ERP

Enterprise Resource Planning System for Alimentation & Retail Management.

TREXBYTE ERP is a multilingual, multi-tenant ERP for alimentations, supermarkets, wholesalers, and retail chains.

## What Is Implemented
- Multi-tenant architecture: each alimentation has its own organization scope (`organizationId`) and isolated dashboard data.
- Authentication and authorization: JWT auth, role-based access (`ADMIN`, `MANAGER`, `CASHIER`, `STOREKEEPER`).
- Admin dashboard modules: Dashboard, Products, Categories, Stock, Suppliers, Purchases, Sales, Invoices, Reports, Settings.
- POS interface: product scan/search, cart, payment, sales creation, receipt workflow, offline queue fallback.
- Printing and invoicing: modern PDF invoice generation with organization branding, QR code, and barcode.
- Organization settings: name, code, address, city, phone, email, logo URL, currency, invoice footer.
- Scanner support: USB keyboard-style barcode scanner and camera-based barcode/QR scanner.
- Language-ready UI foundation: Arabic/French/English support hooks and locale-aware session preference.

## Stack
- Admin frontend: Next.js (App Router)
- POS frontend: Next.js (PWA-ready structure)
- Backend API: Node.js + Express + TypeScript
- Database: PostgreSQL + Prisma
- Realtime: Socket.IO
- Cache: Redis

## Monorepo
- `apps/admin-web`
- `apps/pos-web`
- `apps/mobile-app` (placeholder)
- `backend`
- `database`
- `packages`
- `infra`

## Run Everything (Local)
1. Install dependencies:
```bash
npm install
```
2. Start PostgreSQL + Redis (Docker):
```bash
npm run dev:infra
```
3. Prepare database (generate + push + seed):
```bash
npm run setup:db
```
4. Start backend + admin + POS together:
```bash
npm run dev
```

## URLs
- Backend health: `http://localhost:4000/health`
- Admin web: `http://localhost:3000`
- POS web: `http://localhost:3001/pos`

## First Login (Seeded)
- Admin: `admin@trexbyte.local` / `Admin@123456`
- Manager: `manager@trexbyte.local` / `Manager@123456`
- Cashier: `cashier@trexbyte.local` / `Cashier@123456`
- Seeded organization code: `demo-store`

You can also register a new alimentation from the Admin login page (`/login` -> organization registration form).

## Environment
- Root template: `.env` / `.env.example`
- Backend runtime env: `backend/.env`
- Key variables:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `REDIS_URL`
  - `FRONTEND_URLS`
  - `NEXT_PUBLIC_API_URL`

## Build Verification
```bash
npm run build
```

## Notes
- `setup:db` uses `prisma db push --accept-data-loss` for fast dev synchronization.
- For production, use controlled migrations (`prisma migrate`) and backup policy.
