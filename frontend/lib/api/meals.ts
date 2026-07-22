import { gqlRequest } from "@/lib/graphql/client";
import {
  CATEGORIES_QUERY,
  MEAL_BY_ID_QUERY,
  MEALS_BY_CATEGORY_QUERY,
  RANDOM_MEAL_QUERY,
  SEARCH_MEALS_QUERY,
} from "@/lib/graphql/queries";
import {
  SAVE_RECIPE_MUTATION,
  UNSAVE_RECIPE_MUTATION,
} from "@/lib/graphql/mutations";
import type { Meal, SavedRecipe } from "@/types";

export async function searchMeals(query: string): Promise<Meal[]> {
  const data = await gqlRequest<{ searchMeals: Meal[] }>(SEARCH_MEALS_QUERY, {
    query,
  });
  return data.searchMeals;
}

export async function fetchMealById(id: string): Promise<Meal | null> {
  const data = await gqlRequest<{ mealById: Meal | null }>(MEAL_BY_ID_QUERY, {
    id,
  });
  return data.mealById;
}

export async function fetchMealsByCategory(category: string): Promise<Meal[]> {
  const data = await gqlRequest<{ mealsByCategory: Meal[] }>(
    MEALS_BY_CATEGORY_QUERY,
    { category }
  );
  return data.mealsByCategory;
}

export async function fetchRandomMeal(): Promise<Meal | null> {
  const data = await gqlRequest<{ randomMeal: Meal | null }>(
    RANDOM_MEAL_QUERY
  );
  return data.randomMeal;
}

export async function fetchCategories(): Promise<string[]> {
  const data = await gqlRequest<{ categories: string[] }>(CATEGORIES_QUERY);
  return data.categories;
}

export async function saveRecipe(mealId: string): Promise<SavedRecipe> {
  const data = await gqlRequest<{ saveRecipe: SavedRecipe }>(
    SAVE_RECIPE_MUTATION,
    { mealId }
  );
  return data.saveRecipe;
}

export async function unsaveRecipe(mealId: string): Promise<boolean> {
  const data = await gqlRequest<{ unsaveRecipe: boolean }>(
    UNSAVE_RECIPE_MUTATION,
    { mealId }
  );
  return data.unsaveRecipe;
}
