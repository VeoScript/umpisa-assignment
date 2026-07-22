"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { useMealById, useSaveRecipe, useUnsaveRecipe } from "@/hooks/useMeals";
import { useSetMealPlanEntry } from "@/hooks/useMealPlan";
import { MEAL_TYPES, type MealType } from "@/types";
import { Button, EmptyState, Spinner } from "@/components/ui";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function RecipeDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: meal, isLoading, isError, error } = useMealById(params.id);

  const saveRecipe = useSaveRecipe();
  const unsaveRecipe = useUnsaveRecipe();
  const setMealPlanEntry = useSetMealPlanEntry();

  const [planDate, setPlanDate] = useState(todayISO());
  const [planMealType, setPlanMealType] = useState<MealType>("BREAKFAST");
  const [planned, setPlanned] = useState(false);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (isError || !meal) {
    return (
      <EmptyState
        title="Recipe not found"
        description={isError ? (error as Error).message : "This recipe doesn't exist."}
      />
    );
  }

  function toggleSave() {
    if (meal!.isSaved) {
      unsaveRecipe.mutate(meal!.id);
    } else {
      saveRecipe.mutate(meal!.id);
    }
  }

  function handleAddToPlan(e: React.FormEvent) {
    e.preventDefault();
    setMealPlanEntry.mutate(
      {
        date: planDate,
        mealType: planMealType,
        mealId: meal!.id,
        mealName: meal!.name,
        thumbnail: meal!.thumbnail,
      },
      {
        onSuccess: () => {
          setPlanned(true);
          setTimeout(() => setPlanned(false), 2000);
        },
      }
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 sm:grid-cols-[280px_1fr]">
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-cream-dim sm:aspect-auto sm:h-full">
          {meal.thumbnail && (
            <Image src={meal.thumbnail} alt={meal.name} fill className="object-cover" />
          )}
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink">{meal.name}</h1>
            <p className="text-sm uppercase tracking-wide text-ink-soft">
              {[meal.category, meal.area].filter(Boolean).join(" · ")}
            </p>
          </div>

          {meal.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {meal.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-cream-dim px-2 py-0.5 text-xs text-ink-soft"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              variant={meal.isSaved ? "secondary" : "primary"}
              onClick={toggleSave}
              disabled={saveRecipe.isPending || unsaveRecipe.isPending}
            >
              {meal.isSaved ? "★ Saved" : "☆ Save recipe"}
            </Button>
            {meal.youtube && (
              <a
                href={meal.youtube}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-md border border-line px-4 py-2 text-sm font-medium text-ink-soft hover:text-ink"
              >
                Watch video
              </a>
            )}
          </div>

          <form
            onSubmit={handleAddToPlan}
            className="mt-2 flex flex-wrap items-end gap-2 rounded-md border border-line bg-white p-3"
          >
            <label className="flex flex-col gap-1 text-xs font-medium text-ink-soft">
              Date
              <input
                type="date"
                value={planDate}
                onChange={(e) => setPlanDate(e.target.value)}
                className="rounded-md border border-line px-2 py-1.5 text-sm outline-none focus:border-plum"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-ink-soft">
              Meal
              <select
                value={planMealType}
                onChange={(e) => setPlanMealType(e.target.value as MealType)}
                className="rounded-md border border-line px-2 py-1.5 text-sm outline-none focus:border-plum"
              >
                {MEAL_TYPES.map((mt) => (
                  <option key={mt} value={mt}>
                    {mt}
                  </option>
                ))}
              </select>
            </label>
            <Button type="submit" variant="secondary" disabled={setMealPlanEntry.isPending}>
              {planned ? "Added ✓" : "Add to meal plan"}
            </Button>
          </form>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-[220px_1fr]">
        <div>
          <h2 className="mb-2 font-display text-lg font-semibold text-ink">Ingredients</h2>
          <ul className="flex flex-col gap-1.5 text-sm text-ink-soft">
            {meal.ingredients.map((ing, i) => (
              <li key={i} className="flex justify-between gap-2 border-b border-line/60 pb-1">
                <span>{ing.ingredient}</span>
                <span className="font-mono text-xs text-ink-soft/80">{ing.measure}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-2 font-display text-lg font-semibold text-ink">Instructions</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-ink-soft">
            {meal.instructions}
          </p>
        </div>
      </div>
    </div>
  );
}
