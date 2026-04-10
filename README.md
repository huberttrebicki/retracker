# retracker

retracker is a hobby project for tracking subscriptions and recurring payments. I built it to have a simple way to see when payments are due and how much I'm spending on various services.

The project is structured as a **monorepo using Bun workspaces**, providing a shared type-safe environment across the API and web apps.

### What it does
- **Subscription Tracking:** List and manage recurring payments.
- **Payment Calendar:** A simple grid view to see upcoming due dates.
- **Provider Management:** Organize subscriptions by service (Netflix, Spotify, etc.).
- **Dashboard:** Basic stats on monthly spending and upcoming bills.
- **Currencies:** Support for tracking payments in different currencies.

### Technologies
- **Runtime:** Bun (using Bun Workspaces)
- **Frontend:** React + Vite + TanStack(Router, Query, Form)
- **Backend:** Hono with RPC
- **Database:** PostgreSQL + Drizzle ORM
- **Authentication:** Better Auth
- **Validation:** Zod
