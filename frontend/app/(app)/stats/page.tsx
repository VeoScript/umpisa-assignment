"use client";

import { useStats } from "@/hooks/useStats";
import { EmptyState, Spinner } from "@/components/ui";

export default function StatsPage() {
  const { data, isLoading, isError, error } = useStats();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Stats</h1>
        <p className="text-sm text-ink-soft">A quick look at your kitchen habits.</p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}

      {isError && <EmptyState title="Couldn't load stats" description={(error as Error).message} />}

      {data && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Recipes saved" value={data.totalSaved} />
          <StatCard label="Meals planned" value={data.totalPlanned} />
          <StatCard label="Favorite category" value={data.favoriteCategory ?? "—"} />
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-line bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold text-plum">{value}</p>
    </div>
  );
}
