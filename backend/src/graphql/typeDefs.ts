export const typeDefs = /* GraphQL */ `
  type User {
    id: ID!
    email: String!
    name: String!
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Ingredient {
    ingredient: String!
    measure: String!
  }

  type Meal {
    id: ID!
    name: String!
    category: String
    area: String
    instructions: String
    thumbnail: String
    tags: [String!]
    youtube: String
    ingredients: [Ingredient!]!
    isSaved: Boolean!
  }

  type SavedRecipe {
    id: ID!
    mealId: String!
    mealName: String!
    thumbnail: String
    category: String
    area: String
    createdAt: String!
  }

  enum MealType {
    BREAKFAST
    LUNCH
    DINNER
    SNACK
  }

  type MealPlanEntry {
    id: ID!
    date: String!
    mealType: MealType!
    mealId: String!
    mealName: String!
    thumbnail: String
  }

  type Stats {
    totalSaved: Int!
    totalPlanned: Int!
    favoriteCategory: String
  }

  type Query {
    me: User!

    searchMeals(query: String!): [Meal!]!
    mealById(id: ID!): Meal
    mealsByCategory(category: String!): [Meal!]!
    randomMeal: Meal
    categories: [String!]!

    savedRecipes: [SavedRecipe!]!

    mealPlan(startDate: String!, endDate: String!): [MealPlanEntry!]!

    stats: Stats!
  }

  type Mutation {
    register(email: String!, password: String!, name: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!

    saveRecipe(mealId: String!): SavedRecipe!
    unsaveRecipe(mealId: String!): Boolean!

    setMealPlanEntry(
      date: String!
      mealType: MealType!
      mealId: String!
      mealName: String!
      thumbnail: String
    ): MealPlanEntry!
    removeMealPlanEntry(date: String!, mealType: MealType!): Boolean!
  }
`;
