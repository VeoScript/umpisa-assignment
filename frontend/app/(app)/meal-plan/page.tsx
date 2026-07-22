"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMealPlan, useRemoveMealPlanEntry } from "@/hooks/useMealPlan";
import { MEAL_TYPES, type MealPlanEntry } from "@/types";
import { Button, Spinner } from "@/components/ui";

function toISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDayLabel(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function MealPlanPage() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return toISO(d);
    });
  }, [weekStart]);

  const { data, isLoading } = useMealPlan(days[0], days[6]);
  const removeMealPlanEntry = useRemoveMealPlanEntry();

  const entryFor = (
    date: string,
    mealType: string,
  ): MealPlanEntry | undefined =>
    data?.find((e) => e.date === date && e.mealType === mealType);

  function shiftWeek(delta: number) {
    setWeekStart((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + delta * 7);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            Meal Plan
          </h1>
          <p className="text-sm text-ink-soft">
            {formatDayLabel(days[0])} – {formatDayLabel(days[6])}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => shiftWeek(-1)}>
            ← Prev week
          </Button>
          <Button
            variant="secondary"
            onClick={() => setWeekStart(startOfWeek(new Date()))}
          >
            This week
          </Button>
          <Button variant="secondary" onClick={() => shiftWeek(1)}>
            Next week →
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-180 border-separate border-spacing-2">
            <thead>
              <tr>
                <th className="w-24 text-left text-xs font-medium uppercase tracking-wide text-ink-soft" />
                {days.map((day) => (
                  <th
                    key={day}
                    className="text-left text-xs font-medium uppercase tracking-wide text-ink-soft"
                  >
                    {formatDayLabel(day)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MEAL_TYPES.map((mealType) => (
                <tr key={mealType}>
                  <td className="text-xs font-semibold uppercase tracking-wide text-plum">
                    {mealType}
                  </td>
                  {days.map((day) => {
                    const entry = entryFor(day, mealType);
                    return (
                      <td key={day} className="align-top">
                        {entry ? (
                          <div className="group relative flex flex-col gap-1 rounded-md border border-line bg-white p-2">
                            <Link
                              href={`/recipes/${entry.mealId}`}
                              className="text-xs font-medium leading-snug text-ink hover:text-plum"
                            >
                              {entry.mealName}
                            </Link>
                            <button
                              onClick={() =>
                                removeMealPlanEntry.mutate({
                                  date: day,
                                  mealType,
                                })
                              }
                              className="self-start text-[11px] text-ink-soft hover:text-danger"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <Link
                            href="/dashboard"
                            className="flex h-16 items-center justify-center rounded-md border border-dashed border-line text-xs text-ink-soft hover:border-saffron-dark hover:text-saffron-dark"
                          >
                            + Add
                          </Link>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
