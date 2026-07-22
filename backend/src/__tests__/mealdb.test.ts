import { afterEach, describe, expect, it, vi } from "vitest";
import {
  extractIngredients,
  getMealById,
  searchMeals,
  type MealDbMeal,
} from "../lib/mealdb.js";

function jsonResponse(body: unknown) {
  return {
    ok: true,
    status: 200,
    json: async () => body,
  } as Response;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("searchMeals", () => {
  it("returns an empty array when the API has no matches", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ meals: null })),
    );
    const result = await searchMeals("zzzznotarealmeal");
    expect(result).toEqual([]);
  });

  it("returns the meals array when matches exist", async () => {
    const fakeMeal = { idMeal: "1", strMeal: "Test Meal" };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ meals: [fakeMeal] })),
    );
    const result = await searchMeals("test");
    expect(result).toHaveLength(1);
    expect(result[0].strMeal).toBe("Test Meal");
  });

  it("throws when the upstream API errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    );
    await expect(searchMeals("test")).rejects.toThrow();
  });
});

describe("getMealById", () => {
  it("returns null when no meal is found", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ meals: null })),
    );
    expect(await getMealById("999999")).toBeNull();
  });
});

describe("extractIngredients", () => {
  it("collects only non-empty ingredient/measure pairs", () => {
    const meal = {
      idMeal: "1",
      strMeal: "Test",
      strIngredient1: "Flour",
      strMeasure1: "2 cups",
      strIngredient2: "",
      strMeasure2: "",
      strIngredient3: "Salt",
      strMeasure3: "1 tsp",
    } as unknown as MealDbMeal;

    const result = extractIngredients(meal);
    expect(result).toEqual([
      { ingredient: "Flour", measure: "2 cups" },
      { ingredient: "Salt", measure: "1 tsp" },
    ]);
  });

  it("returns an empty array when there are no ingredients", () => {
    const meal = { idMeal: "1", strMeal: "Test" } as unknown as MealDbMeal;
    expect(extractIngredients(meal)).toEqual([]);
  });
});
