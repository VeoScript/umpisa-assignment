import { beforeEach, describe, expect, it, vi } from "vitest";
import { GraphQLError } from "graphql";

vi.mock("../lib/mealdb.js", () => ({
  getMealById: vi.fn(async (id: string) => {
    if (id === "missing") return null;
    return {
      idMeal: id,
      strMeal: "Fake Meal",
      strCategory: "Dessert",
      strArea: "American",
      strMealThumb: "https://example.com/thumb.jpg",
    };
  }),
  searchMeals: vi.fn(),
  getMealsByCategory: vi.fn(),
  getRandomMeal: vi.fn(),
  listCategories: vi.fn(),
  extractIngredients: vi.fn(() => []),
}));

const { resolvers } = await import("../graphql/resolvers.js");

interface FakeDb {
  users: Map<string, any>;
  savedRecipes: Map<string, any>;
  mealPlanEntries: Map<string, any>;
}

function makeFakePrisma(db: FakeDb) {
  return {
    user: {
      findUnique: vi.fn(async ({ where }: any) => {
        if (where.id) return db.users.get(where.id) ?? null;
        if (where.email) {
          return (
            [...db.users.values()].find((u) => u.email === where.email) ??
            null
          );
        }
        return null;
      }),
      create: vi.fn(async ({ data }: any) => {
        const user = { id: `user-${db.users.size + 1}`, createdAt: new Date(), ...data };
        db.users.set(user.id, user);
        return user;
      }),
    },
    savedRecipe: {
      findUnique: vi.fn(async ({ where }: any) => {
        const key = `${where.userId_mealId.userId}:${where.userId_mealId.mealId}`;
        return db.savedRecipes.get(key) ?? null;
      }),
      findMany: vi.fn(async ({ where }: any) =>
        [...db.savedRecipes.values()].filter((r) => r.userId === where.userId),
      ),
      upsert: vi.fn(async ({ where, create }: any) => {
        const key = `${where.userId_mealId.userId}:${where.userId_mealId.mealId}`;
        const existing = db.savedRecipes.get(key);
        if (existing) return existing;
        const record = { id: `saved-${db.savedRecipes.size + 1}`, createdAt: new Date(), ...create };
        db.savedRecipes.set(key, record);
        return record;
      }),
      delete: vi.fn(async ({ where }: any) => {
        const key = `${where.userId_mealId.userId}:${where.userId_mealId.mealId}`;
        if (!db.savedRecipes.has(key)) throw new Error("not found");
        db.savedRecipes.delete(key);
      }),
      count: vi.fn(async ({ where }: any) =>
        [...db.savedRecipes.values()].filter((r) => r.userId === where.userId).length,
      ),
    },
    mealPlanEntry: {
      findMany: vi.fn(async () => []),
      count: vi.fn(async () => 0),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
  };
}

let db: FakeDb;
let prisma: ReturnType<typeof makeFakePrisma>;

beforeEach(() => {
  db = { users: new Map(), savedRecipes: new Map(), mealPlanEntries: new Map() };
  prisma = makeFakePrisma(db);
});

describe("Mutation.register", () => {
  it("creates a user and returns a token", async () => {
    const result = await resolvers.Mutation.register(
      null,
      { email: "Test@Example.com", password: "password123", name: "Test User" },
      { prisma: prisma as any, user: null },
    );
    expect(result.token).toBeTruthy();
    expect(result.user.email).toBe("test@example.com");
  });

  it("rejects passwords under 8 characters", async () => {
    await expect(
      resolvers.Mutation.register(
        null,
        { email: "a@b.com", password: "short", name: "A" },
        { prisma: prisma as any, user: null },
      ),
    ).rejects.toThrow(GraphQLError);
  });

  it("rejects a duplicate email", async () => {
    await resolvers.Mutation.register(
      null,
      { email: "dupe@example.com", password: "password123", name: "One" },
      { prisma: prisma as any, user: null },
    );
    await expect(
      resolvers.Mutation.register(
        null,
        { email: "dupe@example.com", password: "password123", name: "Two" },
        { prisma: prisma as any, user: null },
      ),
    ).rejects.toThrow(GraphQLError);
  });
});

describe("Mutation.login", () => {
  it("logs in with correct credentials", async () => {
    await resolvers.Mutation.register(
      null,
      { email: "login@example.com", password: "password123", name: "Login" },
      { prisma: prisma as any, user: null },
    );
    const result = await resolvers.Mutation.login(
      null,
      { email: "login@example.com", password: "password123" },
      { prisma: prisma as any, user: null },
    );
    expect(result.token).toBeTruthy();
  });

  it("rejects a wrong password", async () => {
    await resolvers.Mutation.register(
      null,
      { email: "login2@example.com", password: "password123", name: "Login" },
      { prisma: prisma as any, user: null },
    );
    await expect(
      resolvers.Mutation.login(
        null,
        { email: "login2@example.com", password: "wrongpass" },
        { prisma: prisma as any, user: null },
      ),
    ).rejects.toThrow(GraphQLError);
  });

  it("rejects an unknown email", async () => {
    await expect(
      resolvers.Mutation.login(
        null,
        { email: "nobody@example.com", password: "password123" },
        { prisma: prisma as any, user: null },
      ),
    ).rejects.toThrow(GraphQLError);
  });
});

describe("saveRecipe / unsaveRecipe", () => {
  const ctx = { prisma: undefined as any, user: { userId: "user-1", email: "a@b.com" } };
  beforeEach(() => {
    ctx.prisma = prisma;
  });

  it("throws when not authenticated", async () => {
    await expect(
      resolvers.Mutation.saveRecipe(null, { mealId: "1" }, {
        prisma: prisma as any,
        user: null,
      }),
    ).rejects.toThrow(GraphQLError);
  });

  it("saves a recipe for the current user", async () => {
    const result = await resolvers.Mutation.saveRecipe(
      null,
      { mealId: "52772" },
      ctx as any,
    );
    expect(result.mealName).toBe("Fake Meal");
    expect(result.userId).toBe("user-1");
  });

  it("throws when the meal does not exist upstream", async () => {
    await expect(
      resolvers.Mutation.saveRecipe(null, { mealId: "missing" }, ctx as any),
    ).rejects.toThrow(GraphQLError);
  });

  it("unsaves a previously saved recipe", async () => {
    await resolvers.Mutation.saveRecipe(null, { mealId: "52772" }, ctx as any);
    const result = await resolvers.Mutation.unsaveRecipe(
      null,
      { mealId: "52772" },
      ctx as any,
    );
    expect(result).toBe(true);
    expect(db.savedRecipes.size).toBe(0);
  });
});

describe("Query.savedRecipes", () => {
  it("requires authentication", async () => {
    await expect(
      resolvers.Query.savedRecipes(null, {}, { prisma: prisma as any, user: null }),
    ).rejects.toThrow(GraphQLError);
  });

  it("returns only the current user's saved recipes", async () => {
    const ctx = { prisma, user: { userId: "user-1", email: "a@b.com" } };
    await resolvers.Mutation.saveRecipe(null, { mealId: "1" }, ctx as any);
    const list = await resolvers.Query.savedRecipes(null, {}, ctx as any);
    expect(list).toHaveLength(1);
  });
});
