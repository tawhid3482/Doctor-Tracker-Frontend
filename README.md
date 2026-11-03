# Doctor Tracker Frontend

Standalone Next.js frontend for Doctor Tracker. This folder is its own repository root and can be cloned, installed, developed, built, and deployed without the backend source being present.

## Requirements

- Node.js 20 or newer
- The independently running Doctor Tracker API

## Local setup

```sh
npm install
```

Copy `.env.example` to `.env.local` and set the API's base URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

Start the development app with `npm run dev`, then open `http://localhost:3000`.

## Scripts

| Command | Action |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run Next.js lint checks |

## API connection and deployment

The UI calls the URL in `NEXT_PUBLIC_API_URL` and sends cookies with requests. Set that variable in the frontend deployment environment. Configure the backend's `CLIENT_ORIGIN` to the exact deployed frontend origin and enable HTTPS so secure authentication cookies work.

## Features

- Admin sign-in and session refresh through HTTP-only cookies.
- Dashboard totals, recent records, condition chart, doctor patient counts, and date-filterable patient trend chart.
- Doctor search, specialization/hospital/date filters, sort controls, pagination, create/edit/delete, and doctor profiles.
- Patient search, doctor/gender/condition/date filters, sort controls, pagination, create/edit/delete, and doctor pre-assignment.
- Responsive navigation, loading/error/empty states, and in-app delete confirmation dialogs.

## Main routes

- `/login` — administrator sign-in
- `/` — dashboard and registration analytics
- `/doctors` — doctor search and management
- `/doctors/[id]` — doctor profile and assigned patients
- `/patients` — patient search and management

Patient and doctor records are provided by the API; this app does not contain a local database or mock production data.

## Visual evidence

Add real desktop and mobile screenshots to `docs/screenshots/` after connecting this client to a development API with sample records. Capture the dashboard, doctor list/profile, patient list, and narrow mobile navigation. Screenshots should show the running application rather than placeholder or fabricated dashboard records.

## System architecture

The frontend and API are independent applications and can live in separate repositories. A browser page uses TanStack Query to call the Express REST API with credentialed requests. Express applies security headers, rate limits, origin checks, JSON limits, and cookie parsing before it mounts feature routers. Authentication uses short-lived access and refresh JWTs in HTTP-only cookies. Feature routers call validated controllers and services; services query MongoDB through Prisma. On server startup Prisma connects first, then the one-time administrator bootstrap runs before the API starts accepting requests.

```text
Browser (Next.js + TanStack Query)
  └─ REST + HTTP-only cookies → Express API (/api/v1)
       ├─ Auth / Doctors / Patients / Dashboard modules
       ├─ validation → controllers → services
       └─ Prisma → MongoDB
```

## Technical decisions

1. **Separate client and server repositories.** The UI and API have independent package manifests, lockfiles, environment files, and setup guides. This lets teams deploy them independently and keeps frontend builds from depending on backend source. The tradeoff is that CORS, cookie settings, and API URLs must agree across deployments.
2. **Prisma with MongoDB and HTTP-only JWT cookies.** Prisma provides typed data access and the schema declares indexes for doctor, condition, gender, and creation-date queries. Dashboard summaries use grouped/aggregate queries instead of loading every record. JWTs stay out of browser storage; the API validates cookies and checks the configured origin on writes. MongoDB must be reachable and Prisma Client generated before the API can run.

## Visual evidence

Desktop and mobile screenshots are not checked in yet. Capture the real dashboard, doctor list/profile, and patient list at desktop and narrow viewport sizes after starting both apps with a development MongoDB database containing sample records. Do not use fabricated production statistics.
