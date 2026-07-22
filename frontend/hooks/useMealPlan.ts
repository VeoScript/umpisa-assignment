"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchMealPlan,
  removeMealPlanEntry,
  setMealPlanEntry,
} from "@/lib/api/mealPlan";

export function useMealPlan(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ["mealPlan", startDate, endDate],
    queryFn: () => fetchMealPlan(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
}

export function useSetMealPlanEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: setMealPlanEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mealPlan"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useRemoveMealPlanEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeMealPlanEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mealPlan"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}
