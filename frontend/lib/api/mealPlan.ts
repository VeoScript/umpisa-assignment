import { gqlRequest } from "@/lib/graphql/client";
import { MEAL_PLAN_QUERY } from "@/lib/graphql/queries";
import {
  REMOVE_MEAL_PLAN_ENTRY_MUTATION,
  SET_MEAL_PLAN_ENTRY_MUTATION,
} from "@/lib/graphql/mutations";
import type { MealPlanEntry, MealType } from "@/types";

export async function fetchMealPlan(
  startDate: string,
  endDate: string
): Promise<MealPlanEntry[]> {
  const data = await gqlRequest<{ mealPlan: MealPlanEntry[] }>(
    MEAL_PLAN_QUERY,
    { startDate, endDate }
  );
  return data.mealPlan;
}

export async function setMealPlanEntry(input: {
  date: string;
  mealType: MealType;
  mealId: string;
  mealName: string;
  thumbnail?: string | null;
}): Promise<MealPlanEntry> {
  const data = await gqlRequest<{ setMealPlanEntry: MealPlanEntry }>(
    SET_MEAL_PLAN_ENTRY_MUTATION,
    input
  );
  return data.setMealPlanEntry;
}

export async function removeMealPlanEntry(input: {
  date: string;
  mealType: MealType;
}): Promise<boolean> {
  const data = await gqlRequest<{ removeMealPlanEntry: boolean }>(
    REMOVE_MEAL_PLAN_ENTRY_MUTATION,
    input
  );
  return data.removeMealPlanEntry;
}
