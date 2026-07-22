# Meal Planner Application

A full-stack meal planning platform that enables users to discover recipes, save their favorite meals, organize weekly meal plans, and monitor meal planning statistics. Recipe data is sourced from **TheMealDB**, while user accounts, saved recipes, meal plans, and authentication are managed through a custom GraphQL backend.

The project consists of three main components:

- **Web Frontend** — Built with Next.js and React
- **Mobile Application** — Built with Flutter
- **GraphQL Backend** — Built with Hono, GraphQL Yoga, and Prisma

## Project Structure

```
.
├── backend/      # GraphQL API
├── frontend/     # Next.js web application
└── mobile-app/   # Flutter mobile application
```

## Tech Stack

### Web Frontend

- Next.js 16
- React
- TypeScript
- Zustand
- TanStack Query
- Axios
- GraphQL

For complete documentation, see:

- 📄 [Frontend README](./frontend/README.md)

---

### Mobile Application

- Flutter
- Dart
- GraphQL
- fquery (TanStack Query-inspired data fetching)
- Custom Zustand-inspired `Store<T>` state management
- flutter_secure_storage

For complete documentation, see:

- 📄 [Mobile App README](./mobile-app/README.md)

---

### Backend

- Node.js
- TypeScript
- Hono
- GraphQL Yoga
- Prisma ORM
- PostgreSQL
- JWT Authentication
- bcryptjs
- Vitest
- Docker & Docker Compose

For complete documentation, see:

- 📄 [Backend README](./backend/README.md)
