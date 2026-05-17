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
- Firebase project with Firestore, Authentication, and Storage enabled

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

3. Create `.env.local` from the example:
```bash
cp .env.local.example .env.local
```

4. Add your Firebase configuration values to `.env.local`

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

### Firebase Setup

1. Create a new Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Email/Password** authentication
3. Create a **Firestore** database
4. Enable **Storage** for file uploads
5. Copy your Firebase config values to `.env.local`

### Firestore Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

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
