"use client";

import Image from "next/image";
import Link from "next/link";
import { useSavedRecipes } from "@/hooks/useSavedRecipes";
import { useUnsaveRecipe } from "@/hooks/useMeals";
import { Button, EmptyState, Spinner } from "@/components/ui";

export default function SavedPage() {
  const { data, isLoading, isError, error } = useSavedRecipes();
  const unsaveRecipe = useUnsaveRecipe();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Saved recipes</h1>
        <p className="text-sm text-ink-soft">Everything you've starred, in one place.</p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}

      {isError && <EmptyState title="Couldn't load saved recipes" description={(error as Error).message} />}

      {data && data.length === 0 && (
        <EmptyState
          title="No saved recipes yet"
          description="Browse the Discover tab and tap the star on any recipe to save it here."
          action={
            <Link href="/dashboard">
              <Button variant="secondary" className="mt-2">
                Go to Discover
              </Button>
            </Link>
          }
        />
      )}

      {data && data.length > 0 && (
        <div className="flex flex-col gap-3">
          {data.map((recipe) => (
            <div
              key={recipe.id}
              className="flex items-center gap-4 rounded-lg border border-line bg-white p-3"
            >
              <Link
                href={`/recipes/${recipe.mealId}`}
                className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-cream-dim"
              >
                {recipe.thumbnail && (
                  <Image src={recipe.thumbnail} alt={recipe.mealName} fill className="object-cover" />
                )}
              </Link>
              <Link href={`/recipes/${recipe.mealId}`} className="flex-1">
                <p className="font-display font-semibold text-ink">{recipe.mealName}</p>
                <p className="text-xs uppercase tracking-wide text-ink-soft">
                  {[recipe.category, recipe.area].filter(Boolean).join(" · ")}
                </p>
              </Link>
              <Button
                variant="ghost"
                onClick={() => unsaveRecipe.mutate(recipe.mealId)}
                disabled={unsaveRecipe.isPending}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
