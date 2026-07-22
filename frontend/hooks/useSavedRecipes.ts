"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchSavedRecipes } from "@/lib/api/savedRecipes";

export function useSavedRecipes() {
  return useQuery({
    queryKey: ["savedRecipes"],
    queryFn: fetchSavedRecipes,
  });
}
