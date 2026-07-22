export const REGISTER_MUTATION = /* GraphQL */ `
  mutation Register($email: String!, $password: String!, $name: String!) {
    register(email: $email, password: $password, name: $name) {
      token
      user {
        id
        email
        name
        createdAt
      }
    }
  }
`;

export const LOGIN_MUTATION = /* GraphQL */ `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
        name
        createdAt
      }
    }
  }
`;

export const SAVE_RECIPE_MUTATION = /* GraphQL */ `
  mutation SaveRecipe($mealId: String!) {
    saveRecipe(mealId: $mealId) {
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

export const UNSAVE_RECIPE_MUTATION = /* GraphQL */ `
  mutation UnsaveRecipe($mealId: String!) {
    unsaveRecipe(mealId: $mealId)
  }
`;

export const SET_MEAL_PLAN_ENTRY_MUTATION = /* GraphQL */ `
  mutation SetMealPlanEntry(
    $date: String!
    $mealType: MealType!
    $mealId: String!
    $mealName: String!
    $thumbnail: String
  ) {
    setMealPlanEntry(
      date: $date
      mealType: $mealType
      mealId: $mealId
      mealName: $mealName
      thumbnail: $thumbnail
    ) {
      id
      date
      mealType
      mealId
      mealName
      thumbnail
    }
  }
`;

export const REMOVE_MEAL_PLAN_ENTRY_MUTATION = /* GraphQL */ `
  mutation RemoveMealPlanEntry($date: String!, $mealType: MealType!) {
    removeMealPlanEntry(date: $date, mealType: $mealType)
  }
`;
