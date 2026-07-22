"use client";

import { useState } from "react";
import { useCategories, useMealsByCategory, useRandomMeal, useSearchMeals } from "@/hooks/useMeals";
import { MealCard } from "@/components/MealCard";
import { Button, EmptyState, Spinner } from "@/components/ui";

export default function DashboardPage() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const categories = useCategories();
  const search = useSearchMeals(query);
  const byCategory = useMealsByCategory(category ?? "");
  const random = useRandomMeal();

  const activeQuery = category ? byCategory : query ? search : null;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setCategory(null);
    setQuery(input.trim());
  }

  function pickCategory(cat: string) {
    setQuery("");
    setInput("");
    setCategory(cat === category ? null : cat);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Discover</h1>
        <p className="text-sm text-ink-soft">Search recipes or browse by category.</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search recipes, e.g. adobo, pasta..."
          className="flex-1 rounded-md border border-line bg-white px-3 py-2 text-sm outline-none focus:border-plum"
        />
        <Button type="submit">Search</Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => random.refetch()}
          disabled={random.isFetching}
        >
          Surprise me
        </Button>
      </form>

      {categories.data && (
        <div className="flex flex-wrap gap-2">
          {categories.data.map((cat) => (
            <button
              key={cat}
              onClick={() => pickCategory(cat)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                category === cat
                  ? "border-saffron bg-saffron text-ink"
                  : "border-line bg-white text-ink-soft hover:border-saffron-dark"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {random.data && !activeQuery?.data && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-soft">
            Random pick
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            <MealCard meal={random.data} />
          </div>
        </div>
      )}

      {activeQuery?.isLoading && (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      )}

      {activeQuery?.isError && (
        <EmptyState
          title="Couldn't load recipes"
          description={(activeQuery.error as Error).message}
        />
      )}

      {activeQuery?.data && activeQuery.data.length === 0 && (
        <EmptyState
          title="No recipes found"
          description="Try a different search term or category."
        />
      )}

      {activeQuery?.data && activeQuery.data.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {activeQuery.data.map((meal) => (
            <MealCard key={meal.id} meal={meal} />
          ))}
        </div>
      )}

      {!activeQuery && !random.data && (
        <EmptyState
          title="Start exploring"
          description="Search for a dish, pick a category, or hit Surprise me for a random recipe."
        />
      )}
    </div>
  );
}
