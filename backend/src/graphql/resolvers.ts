import { GraphQLError } from "graphql";
import {
  extractIngredients,
  getMealById,
  getMealsByCategory,
  getRandomMeal,
  listCategories,
  searchMeals,
  type MealDbMeal,
} from "../lib/mealdb.js";
import { hashPassword, signToken, verifyPassword } from "../lib/auth.js";
import type { GraphQLContext } from "./context.js";

function requireUser(ctx: GraphQLContext) {
  if (!ctx.user) {
    throw new GraphQLError("Not authenticated", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
  return ctx.user;
}

async function mapMeal(
  meal: MealDbMeal,
  ctx: GraphQLContext,
): Promise<Record<string, unknown>> {
  let isSaved = false;
  if (ctx.user) {
    const existing = await ctx.prisma.savedRecipe.findUnique({
      where: {
        userId_mealId: { userId: ctx.user.userId, mealId: meal.idMeal },
      },
    });
    isSaved = !!existing;
  }
  return {
    id: meal.idMeal,
    name: meal.strMeal,
    category: meal.strCategory,
    area: meal.strArea,
    instructions: meal.strInstructions,
    thumbnail: meal.strMealThumb,
    tags: meal.strTags
      ? meal.strTags.split(",").map((t) => t.trim())
      : [],
    youtube: meal.strYoutube,
    ingredients: extractIngredients(meal),
    isSaved,
  };
}

function dayStart(dateStr: string): Date {
  const d = new Date(dateStr);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export const resolvers = {
  Query: {
    me: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const authUser = requireUser(ctx);
      const user = await ctx.prisma.user.findUnique({
        where: { id: authUser.userId },
      });
      if (!user) {
        throw new GraphQLError("User not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }
      return user;
    },

    searchMeals: async (
      _: unknown,
      { query }: { query: string },
      ctx: GraphQLContext,
    ) => {
      const meals = await searchMeals(query);
      return Promise.all(meals.map((m) => mapMeal(m, ctx)));
    },

    mealById: async (
      _: unknown,
      { id }: { id: string },
      ctx: GraphQLContext,
    ) => {
      const meal = await getMealById(id);
      if (!meal) return null;
      return mapMeal(meal, ctx);
    },

    mealsByCategory: async (
      _: unknown,
      { category }: { category: string },
      ctx: GraphQLContext,
    ) => {
      // filter.php returns partial meal objects (no ingredients/instructions),
      // so we resolve each full meal for consistent shape.
      const partials = await getMealsByCategory(category);
      const full = await Promise.all(
        partials.slice(0, 20).map((p) => getMealById(p.idMeal)),
      );
      const meals = full.filter((m): m is MealDbMeal => !!m);
      return Promise.all(meals.map((m) => mapMeal(m, ctx)));
    },

    randomMeal: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const meal = await getRandomMeal();
      if (!meal) return null;
      return mapMeal(meal, ctx);
    },

    categories: async () => listCategories(),

    savedRecipes: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const authUser = requireUser(ctx);
      return ctx.prisma.savedRecipe.findMany({
        where: { userId: authUser.userId },
        orderBy: { createdAt: "desc" },
      });
    },

    mealPlan: async (
      _: unknown,
      { startDate, endDate }: { startDate: string; endDate: string },
      ctx: GraphQLContext,
    ) => {
      const authUser = requireUser(ctx);
      return ctx.prisma.mealPlanEntry.findMany({
        where: {
          userId: authUser.userId,
          date: { gte: dayStart(startDate), lte: dayStart(endDate) },
        },
        orderBy: { date: "asc" },
      });
    },

    stats: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const authUser = requireUser(ctx);
      const [totalSaved, totalPlanned, saved] = await Promise.all([
        ctx.prisma.savedRecipe.count({ where: { userId: authUser.userId } }),
        ctx.prisma.mealPlanEntry.count({
          where: { userId: authUser.userId },
        }),
        ctx.prisma.savedRecipe.findMany({
          where: { userId: authUser.userId },
          select: { category: true },
        }),
      ]);
      const counts = new Map<string, number>();
      for (const s of saved) {
        if (!s.category) continue;
        counts.set(s.category, (counts.get(s.category) ?? 0) + 1);
      }
      let favoriteCategory: string | null = null;
      let max = 0;
      for (const [cat, count] of counts) {
        if (count > max) {
          max = count;
          favoriteCategory = cat;
        }
      }
      return { totalSaved, totalPlanned, favoriteCategory };
    },
  },

  Mutation: {
    register: async (
      _: unknown,
      args: { email: string; password: string; name: string },
      ctx: GraphQLContext,
    ) => {
      const email = args.email.trim().toLowerCase();
      if (args.password.length < 8) {
        throw new GraphQLError("Password must be at least 8 characters", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
      const existing = await ctx.prisma.user.findUnique({ where: { email } });
      if (existing) {
        throw new GraphQLError("Email already registered", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
      const passwordHash = await hashPassword(args.password);
      const user = await ctx.prisma.user.create({
        data: { email, passwordHash, name: args.name.trim() },
      });
      const token = signToken({ userId: user.id, email: user.email });
      return { token, user };
    },

    login: async (
      _: unknown,
      args: { email: string; password: string },
      ctx: GraphQLContext,
    ) => {
      const email = args.email.trim().toLowerCase();
      const user = await ctx.prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new GraphQLError("Invalid credentials", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }
      const valid = await verifyPassword(args.password, user.passwordHash);
      if (!valid) {
        throw new GraphQLError("Invalid credentials", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }
      const token = signToken({ userId: user.id, email: user.email });
      return { token, user };
    },

    saveRecipe: async (
      _: unknown,
      { mealId }: { mealId: string },
      ctx: GraphQLContext,
    ) => {
      const authUser = requireUser(ctx);
      const meal = await getMealById(mealId);
      if (!meal) {
        throw new GraphQLError("Meal not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }
      return ctx.prisma.savedRecipe.upsert({
        where: {
          userId_mealId: { userId: authUser.userId, mealId },
        },
        create: {
          userId: authUser.userId,
          mealId,
          mealName: meal.strMeal,
          thumbnail: meal.strMealThumb,
          category: meal.strCategory,
          area: meal.strArea,
        },
        update: {},
      });
    },

    unsaveRecipe: async (
      _: unknown,
      { mealId }: { mealId: string },
      ctx: GraphQLContext,
    ) => {
      const authUser = requireUser(ctx);
      await ctx.prisma.savedRecipe
        .delete({
          where: {
            userId_mealId: { userId: authUser.userId, mealId },
          },
        })
        .catch(() => null);
      return true;
    },

    setMealPlanEntry: async (
      _: unknown,
      args: {
        date: string;
        mealType: "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";
        mealId: string;
        mealName: string;
        thumbnail?: string | null;
      },
      ctx: GraphQLContext,
    ) => {
      const authUser = requireUser(ctx);
      const date = dayStart(args.date);
      return ctx.prisma.mealPlanEntry.upsert({
        where: {
          userId_date_mealType: {
            userId: authUser.userId,
            date,
            mealType: args.mealType,
          },
        },
        create: {
          userId: authUser.userId,
          date,
          mealType: args.mealType,
          mealId: args.mealId,
          mealName: args.mealName,
          thumbnail: args.thumbnail ?? null,
        },
        update: {
          mealId: args.mealId,
          mealName: args.mealName,
          thumbnail: args.thumbnail ?? null,
        },
      });
    },

    removeMealPlanEntry: async (
      _: unknown,
      args: { date: string; mealType: "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK" },
      ctx: GraphQLContext,
    ) => {
      const authUser = requireUser(ctx);
      const date = dayStart(args.date);
      await ctx.prisma.mealPlanEntry
        .delete({
          where: {
            userId_date_mealType: {
              userId: authUser.userId,
              date,
              mealType: args.mealType,
            },
          },
        })
        .catch(() => null);
      return true;
    },
  },

  User: {
    createdAt: (user: { createdAt: Date }) => user.createdAt.toISOString(),
  },

  SavedRecipe: {
    createdAt: (r: { createdAt: Date }) => r.createdAt.toISOString(),
  },

  MealPlanEntry: {
    date: (e: { date: Date }) => e.date.toISOString().slice(0, 10),
  },
};
