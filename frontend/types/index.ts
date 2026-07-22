export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthPayload {
  token: string;
  user: User;
}

export interface Ingredient {
  ingredient: string;
  measure: string;
}

export interface Meal {
  id: string;
  name: string;
  category: string | null;
  area: string | null;
  instructions: string | null;
  thumbnail: string | null;
  tags: string[];
  youtube: string | null;
  ingredients: Ingredient[];
  isSaved: boolean;
}

export interface SavedRecipe {
  id: string;
  mealId: string;
  mealName: string;
  thumbnail: string | null;
  category: string | null;
  area: string | null;
  createdAt: string;
}

export type MealType = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";

export const MEAL_TYPES: MealType[] = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"];

export interface MealPlanEntry {
  id: string;
  date: string;
  mealType: MealType;
  mealId: string;
  mealName: string;
  thumbnail: string | null;
}

export interface Stats {
  totalSaved: number;
  totalPlanned: number;
  favoriteCategory: string | null;
}

export interface GraphQLErrorShape {
  message: string;
  extensions?: { code?: string };
}
