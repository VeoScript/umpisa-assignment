const BASE_URL = "https://www.themealdb.com/api/json/v1/1";

export interface MealDbMeal {
  idMeal: string;
  strMeal: string;
  strCategory: string | null;
  strArea: string | null;
  strInstructions: string | null;
  strMealThumb: string | null;
  strTags: string | null;
  strYoutube: string | null;
  [key: string]: string | null; // strIngredient1..20, strMeasure1..20
}

interface MealDbResponse {
  meals: MealDbMeal[] | null;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`TheMealDB request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function searchMeals(query: string): Promise<MealDbMeal[]> {
  const data = await fetchJson<MealDbResponse>(
    `${BASE_URL}/search.php?s=${encodeURIComponent(query)}`,
  );
  return data.meals ?? [];
}

export async function getMealById(id: string): Promise<MealDbMeal | null> {
  const data = await fetchJson<MealDbResponse>(
    `${BASE_URL}/lookup.php?i=${encodeURIComponent(id)}`,
  );
  return data.meals?.[0] ?? null;
}

export async function getMealsByCategory(
  category: string,
): Promise<MealDbMeal[]> {
  const data = await fetchJson<MealDbResponse>(
    `${BASE_URL}/filter.php?c=${encodeURIComponent(category)}`,
  );
  return data.meals ?? [];
}

export async function getRandomMeal(): Promise<MealDbMeal | null> {
  const data = await fetchJson<MealDbResponse>(`${BASE_URL}/random.php`);
  return data.meals?.[0] ?? null;
}

export async function listCategories(): Promise<string[]> {
  const data = await fetchJson<{
    meals: { strCategory: string }[] | null;
  }>(`${BASE_URL}/list.php?c=list`);
  return (data.meals ?? []).map((m) => m.strCategory);
}

export function extractIngredients(
  meal: MealDbMeal,
): { ingredient: string; measure: string }[] {
  const ingredients: { ingredient: string; measure: string }[] = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient && ingredient.trim()) {
      ingredients.push({
        ingredient: ingredient.trim(),
        measure: (measure ?? "").trim(),
      });
    }
  }
  return ingredients;
}
