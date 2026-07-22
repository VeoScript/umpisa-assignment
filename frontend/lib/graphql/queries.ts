const MEAL_FIELDS = /* GraphQL */ `
  id
  name
  category
  area
  instructions
  thumbnail
  tags
  youtube
  ingredients {
    ingredient
    measure
  }
  isSaved
`;

export const ME_QUERY = /* GraphQL */ `
  query Me {
    me {
      id
      email
      name
      createdAt
    }
  }
`;

export const SEARCH_MEALS_QUERY = /* GraphQL */ `
  query SearchMeals($query: String!) {
    searchMeals(query: $query) {
      ${MEAL_FIELDS}
    }
  }
`;

export const MEAL_BY_ID_QUERY = /* GraphQL */ `
  query MealById($id: ID!) {
    mealById(id: $id) {
      ${MEAL_FIELDS}
    }
  }
`;

export const MEALS_BY_CATEGORY_QUERY = /* GraphQL */ `
  query MealsByCategory($category: String!) {
    mealsByCategory(category: $category) {
      ${MEAL_FIELDS}
    }
  }
`;

export const RANDOM_MEAL_QUERY = /* GraphQL */ `
  query RandomMeal {
    randomMeal {
      ${MEAL_FIELDS}
    }
  }
`;

export const CATEGORIES_QUERY = /* GraphQL */ `
  query Categories {
    categories
  }
`;

export const SAVED_RECIPES_QUERY = /* GraphQL */ `
  query SavedRecipes {
    savedRecipes {
      id
      mealId
      mealName
      thumbnail
      category
      area
      createdAt
    }
  }
`;

export const MEAL_PLAN_QUERY = /* GraphQL */ `
  query MealPlan($startDate: String!, $endDate: String!) {
    mealPlan(startDate: $startDate, endDate: $endDate) {
      id
      date
      mealType
      mealId
      mealName
      thumbnail
    }
  }
`;

export const STATS_QUERY = /* GraphQL */ `
  query Stats {
    stats {
      totalSaved
      totalPlanned
      favoriteCategory
    }
  }
`;
