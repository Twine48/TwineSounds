# LoanPro - Loan Management System

A modern, PWA-ready loan management system built for money lending businesses. Manage borrowers, loans, collections, collateral, staff, and get real-time analytics — all from one platform.

## Features

- **Borrower Management** — Complete profiles with guarantor info, employment details, and loan history
- **Loan Management** — Create loans with flexible repayment schedules (daily, weekly, monthly), auto-calculated interest and installments
- **Payment Tracking** — Record payments, generate receipts, track overdue installments
- **Collateral Management** — Track items held as security with serial numbers, photos, and storage locations
- **Staff Management** — Role-based access (Admin, Manager, Cashier, Loan Officer, Field Collector)
- **Reports & Analytics** — Real-time dashboards with collection trends, portfolio health, and collector performance
- **PWA Ready** — Install on any device, works offline

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: Firebase (Firestore)
- **Auth**: Firebase Authentication
- **Storage**: Firebase Storage
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+

### Setup

1. Clone the repository:
```bash
git clone <repo-url>
cd loanpro
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

### Firebase

The app is pre-configured with Firebase (project: `loanpro-4b6d6`). Make sure the following are enabled in the [Firebase Console](https://console.firebase.google.com):

1. **Authentication** — Enable Email/Password sign-in method
2. **Firestore Database** — Create a database (production mode)
3. **Storage** — Enable Cloud Storage

## Deployment

Deploy to Vercel:

```bash
npm run build
```

Or connect your GitHub repository to [Vercel](https://vercel.com) for automatic deployments.

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Auth (Login/Register)
│   └── dashboard/
│       ├── page.tsx                # Dashboard with stats & charts
│       ├── borrowers/page.tsx      # Borrower management
│       ├── loans/page.tsx          # Loan management
│       ├── payments/page.tsx       # Payment tracking
│       ├── collateral/page.tsx     # Collateral management
│       ├── staff/page.tsx          # Staff management
│       ├── reports/page.tsx        # Reports & analytics
│       └── settings/page.tsx       # System settings
├── components/
│   ├── ui/                         # Reusable UI components
│   └── PWARegister.tsx             # Service worker registration
├── contexts/
│   └── AuthContext.tsx             # Auth state management
├── lib/
│   ├── firebase.ts                 # Firebase initialization
│   └── utils.ts                    # Utility functions
└── types/
    └── index.ts                    # TypeScript types
```

## License

MIT
