# Egina Wells Dashboard

Egina Wells Dashboard is a Next.js application for monitoring oil well performance across three operational views:

- Production KPI View
- Well Health View
- Well Integrity View

It is built for clear, fast operational decisions with responsive cards, rich well overlays, and a demo mode for public showcases.

## Features

- Shared dashboard component used across all three views
- CSV-backed data layer with in-memory server caching
- Color-coded KPI state (Good / Warning / Critical)
- Detailed well overlay with chart visuals and formatted metrics
- One-time session onboarding guide (Notes from Henry)
- Live Demo mode to simulate real-time well fluctuations
- Responsive layout for desktop, tablet, and mobile

## Tech Stack

- Next.js 15
- React 18 + TypeScript
- CSS Modules
- Recharts
- Playwright (e2e)

## Local Development

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Open http://localhost:3000.

## Quality Checks

```bash
npm run lint
npx tsc --noEmit
npm run build
npm run test:e2e
```

## Live Demo Mode

Use the `Enable Demo` button in the dashboard header to simulate live field updates.

- Metrics fluctuate every few seconds using realistic variance bands
- KPI colors recalculate on each update
- Demo mode state persists across view switches

This mode is ideal for public demos when no real-time data stream is connected.

## API Endpoints

- `GET /api/wells`
  - Returns summarized wells with KPI values and status colors
- `GET /api/well-metrics?wellId=<id>`
  - Returns full metrics for a selected well

Both endpoints read from the shared CSV data layer and include cache headers.

## Data Source

- Runtime data source: `data.csv` in project root
- No database is required for deployment

## Deploy (Recommended: Vercel)

1. Push this project to GitHub.
2. Sign in to Vercel with GitHub.
3. Import the repository as a new Vercel project.
4. Deploy with default Next.js settings.

No environment variables are required for the current CSV-based setup.

After deploy, Vercel gives you a public URL like:

`https://your-project-name.vercel.app`

## Project Structure

- `app/` - routes and API handlers
- `components/` - reusable UI building blocks
- `lib/` - constants, telemetry, and data helpers
- `tests/e2e/` - Playwright end-to-end tests

## Notes

- Database packages may exist in dependencies, but current runtime is CSV-driven.
- Telemetry helpers are lightweight and can be connected to providers like Sentry or GA.
# wells-dashboard
