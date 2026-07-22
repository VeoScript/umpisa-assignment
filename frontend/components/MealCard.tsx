"use client";

import Image from "next/image";
import Link from "next/link";
import type { Meal } from "@/types";
import { useSaveRecipe, useUnsaveRecipe } from "@/hooks/useMeals";

export function MealCard({ meal }: { meal: Meal }) {
  const saveRecipe = useSaveRecipe();
  const unsaveRecipe = useUnsaveRecipe();

  const pending = saveRecipe.isPending || unsaveRecipe.isPending;

  function toggleSave(e: React.MouseEvent) {
    e.preventDefault();
    if (pending) return;
    if (meal.isSaved) {
      unsaveRecipe.mutate(meal.id);
    } else {
      saveRecipe.mutate(meal.id);
    }
  }

  return (
    <Link
      href={`/recipes/${meal.id}`}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-line bg-white transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-4/3 w-full bg-cream-dim">
        {meal.thumbnail && (
          <Image
            src={meal.thumbnail}
            alt={meal.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        )}
        <button
          onClick={toggleSave}
          aria-label={meal.isSaved ? "Unsave recipe" : "Save recipe"}
          disabled={pending}
          className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full text-lg shadow-sm transition-colors ${
            meal.isSaved
              ? "bg-saffron text-ink"
              : "bg-white/90 text-ink-soft hover:text-saffron-dark"
          }`}
        >
          {meal.isSaved ? "★" : "☆"}
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="font-display font-semibold leading-tight text-ink">
          {meal.name}
        </p>
        <p className="text-xs uppercase tracking-wide text-ink-soft">
          {[meal.category, meal.area].filter(Boolean).join(" · ")}
        </p>
      </div>
    </Link>
  );
}
