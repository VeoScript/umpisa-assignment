# Meal Planner API

GraphQL backend for a Recipe/Meal Planner app. Built with **Hono** (HTTP layer),
**GraphQL Yoga** (GraphQL server), **Prisma** + **PostgreSQL** (persistence), and
JWT auth. Recipe data is proxied from the public [TheMealDB](https://www.themealdb.com/api.php)
API; the database stores users, their saved/favorited recipes, and their weekly
meal plan entries.

## Stack

- Node.js + TypeScript
- [Hono](https://hono.dev/) — lightweight HTTP router
- [GraphQL Yoga](https://the-guild.dev/graphql/yoga-server) — GraphQL server, mounted at `/graphql`
- [Prisma](https://www.prisma.io/) ORM + PostgreSQL
- JWT (`jsonwebtoken`) + `bcryptjs` for auth
- [Vitest](https://vitest.dev/) for unit tests
- Docker / Docker Compose

## Run it — Docker (recommended, out of the box)

Requires Docker + Docker Compose.

```bash
cd backend
docker compose up --build
```

This starts a Postgres 16 container and the API container, runs pending Prisma
migrations automatically, and exposes the API at:

```
http://localhost:4000/graphql
```

## Run it — locally without Docker

Requires Node.js 20+ and a running PostgreSQL instance.

```bash
cd backend
npm install
cp .env.example .env        # edit DATABASE_URL if your Postgres differs
npx prisma migrate dev      # creates tables
npm run dev                 # starts the API on http://localhost:4000/graphql
```

## Tests

```bash
npm test
```

Unit tests cover auth (password hashing, JWT sign/verify), the TheMealDB
client wrapper (mocked `fetch`), and the GraphQL resolvers (using an
in-memory fake Prisma client, so no database is required to run them).

## API overview

All requests go to `POST /graphql`. Authenticated operations require:

```
Authorization: Bearer <token>
```

(token is returned by `register` / `login`).

### Auth

```graphql
mutation {
  register(email: "you@example.com", password: "password123", name: "Your Name") {
    token
    user { id email name }
  }
}

mutation {
  login(email: "you@example.com", password: "password123") {
    token
    user { id email name }
  }
}
```

### Browsing recipes (public, TheMealDB-backed)

```graphql
query { searchMeals(query: "chicken") { id name thumbnail category } }
query { mealById(id: "52772") { id name instructions ingredients { ingredient measure } } }
query { mealsByCategory(category: "Dessert") { id name thumbnail } }
query { categories }
query { randomMeal { id name thumbnail } }
```

### Favorites (auth required)

```graphql
mutation { saveRecipe(mealId: "52772") { id mealName thumbnail } }
mutation { unsaveRecipe(mealId: "52772") }
query { savedRecipes { id mealId mealName thumbnail } }
```

### Weekly meal plan (auth required)

```graphql
mutation {
  setMealPlanEntry(
    date: "2026-07-27"
    mealType: DINNER
    mealId: "52772"
    mealName: "Teriyaki Chicken Casserole"
    thumbnail: "https://www.themealdb.com/images/media/meals/xxrxux1503070723.jpg"
  ) { id date mealType mealName }
}

query {
  mealPlan(startDate: "2026-07-27", endDate: "2026-08-02") {
    id date mealType mealName thumbnail
  }
}

mutation { removeMealPlanEntry(date: "2026-07-27", mealType: DINNER) }
```

### Stats

```graphql
query { stats { totalSaved totalPlanned favoriteCategory } }
```

## Project structure

```
backend/
├── prisma/
│   └── schema.prisma        # User, SavedRecipe, MealPlanEntry models
├── src/
│   ├── graphql/
│   │   ├── typeDefs.ts       # GraphQL SDL schema
│   │   ├── resolvers.ts      # Query/Mutation resolvers
│   │   └── context.ts        # per-request context (prisma + auth user)
│   ├── lib/
│   │   ├── auth.ts           # password hashing, JWT sign/verify
│   │   ├── prisma.ts         # Prisma client singleton
│   │   └── mealdb.ts         # TheMealDB API client
│   ├── __tests__/            # unit tests (vitest)
│   └── index.ts              # Hono app + GraphQL Yoga mount
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## Notes

- Passwords are hashed with bcrypt; never stored in plaintext.
- `MealPlanEntry` has a unique constraint on `(userId, date, mealType)`, so
  assigning a new recipe to an already-filled slot overwrites it (upsert).
- `SavedRecipe` has a unique constraint on `(userId, mealId)` to prevent
  duplicate favorites.
