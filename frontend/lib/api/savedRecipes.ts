import { gqlRequest } from "@/lib/graphql/client";
import { SAVED_RECIPES_QUERY } from "@/lib/graphql/queries";
import type { SavedRecipe } from "@/types";

export async function fetchSavedRecipes(): Promise<SavedRecipe[]> {
  const data = await gqlRequest<{ savedRecipes: SavedRecipe[] }>(
    SAVED_RECIPES_QUERY
  );
  return data.savedRecipes;
}
