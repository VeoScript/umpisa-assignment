"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchCategories,
  fetchMealById,
  fetchMealsByCategory,
  fetchRandomMeal,
  saveRecipe,
  searchMeals,
  unsaveRecipe,
} from "@/lib/api/meals";

export function useSearchMeals(query: string) {
  return useQuery({
    queryKey: ["meals", "search", query],
    queryFn: () => searchMeals(query),
    enabled: query.trim().length > 0,
  });
}

export function useMealById(id: string) {
  return useQuery({
    queryKey: ["meals", "detail", id],
    queryFn: () => fetchMealById(id),
    enabled: !!id,
  });
}

export function useMealsByCategory(category: string) {
  return useQuery({
    queryKey: ["meals", "category", category],
    queryFn: () => fetchMealsByCategory(category),
    enabled: !!category,
  });
}

export function useRandomMeal() {
  return useQuery({
    queryKey: ["meals", "random"],
    queryFn: fetchRandomMeal,
    staleTime: 0,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["meals", "categories"],
    queryFn: fetchCategories,
    staleTime: 60 * 60 * 1000,
  });
}

export function useSaveRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals"] });
      queryClient.invalidateQueries({ queryKey: ["savedRecipes"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useUnsaveRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unsaveRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals"] });
      queryClient.invalidateQueries({ queryKey: ["savedRecipes"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}
