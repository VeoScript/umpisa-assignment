import '../core/graphql_client.dart';
import '../stores/auth_store.dart';
import 'models.dart';

/// Every function here is a plain `Future<T>` — that's all fquery needs as a
/// `queryFn`/`mutationFn`. No special wrapper required, same as how you'd
/// pass a plain fetch()/axios call to useQuery in TanStack Query.
class Api {
  // ---------------- Auth ----------------

  static Future<void> register({
    required String email,
    required String password,
    required String name,
  }) async {
    final data = await gqlRequest(
      r'''
        mutation Register($email: String!, $password: String!, $name: String!) {
          register(email: $email, password: $password, name: $name) {
            token
            user { id email name }
          }
        }
      ''',
      variables: {'email': email, 'password': password, 'name': name},
    );
    final payload = data['register'] as Map<String, dynamic>;
    await AuthActions.setSession(
      payload['token'] as String,
      AppUser.fromJson(payload['user'] as Map<String, dynamic>),
    );
  }

  static Future<void> login({
    required String email,
    required String password,
  }) async {
    final data = await gqlRequest(
      r'''
        mutation Login($email: String!, $password: String!) {
          login(email: $email, password: $password) {
            token
            user { id email name }
          }
        }
      ''',
      variables: {'email': email, 'password': password},
    );
    final payload = data['login'] as Map<String, dynamic>;
    await AuthActions.setSession(
      payload['token'] as String,
      AppUser.fromJson(payload['user'] as Map<String, dynamic>),
    );
  }

  // ---------------- Recipes (TheMealDB-backed, public) ----------------

  static const _mealFields = r'''
    id name category area instructions thumbnail tags youtube isSaved
    ingredients { ingredient measure }
  ''';

  static Future<List<Meal>> searchMeals(String query) async {
    final data = await gqlRequest(
      'query SearchMeals(\$q: String!) { searchMeals(query: \$q) { $_mealFields } }',
      variables: {'q': query},
    );
    return (data['searchMeals'] as List)
        .map((e) => Meal.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  static Future<Meal?> mealById(String id) async {
    final data = await gqlRequest(
      'query MealById(\$id: ID!) { mealById(id: \$id) { $_mealFields } }',
      variables: {'id': id},
    );
    final meal = data['mealById'];
    return meal == null ? null : Meal.fromJson(meal as Map<String, dynamic>);
  }

  static Future<List<Meal>> mealsByCategory(String category) async {
    final data = await gqlRequest(
      'query ByCategory(\$c: String!) { mealsByCategory(category: \$c) { $_mealFields } }',
      variables: {'c': category},
    );
    return (data['mealsByCategory'] as List)
        .map((e) => Meal.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  static Future<List<String>> categories() async {
    final data = await gqlRequest('query { categories }');
    return (data['categories'] as List).cast<String>();
  }

  static Future<Meal?> randomMeal() async {
    final data = await gqlRequest('query { randomMeal { $_mealFields } }');
    final meal = data['randomMeal'];
    return meal == null ? null : Meal.fromJson(meal as Map<String, dynamic>);
  }

  // ---------------- Saved recipes (auth required) ----------------

  static Future<List<SavedRecipe>> savedRecipes() async {
    final data = await gqlRequest(r'''
      query {
        savedRecipes { id mealId mealName thumbnail category area }
      }
    ''');
    return (data['savedRecipes'] as List)
        .map((e) => SavedRecipe.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  static Future<void> saveRecipe(String mealId) => gqlRequest(
        r'mutation($mealId: String!) { saveRecipe(mealId: $mealId) { id } }',
        variables: {'mealId': mealId},
      );

  static Future<void> unsaveRecipe(String mealId) => gqlRequest(
        r'mutation($mealId: String!) { unsaveRecipe(mealId: $mealId) }',
        variables: {'mealId': mealId},
      );

  // ---------------- Weekly meal plan (auth required) ----------------

  static Future<List<MealPlanEntry>> mealPlan({
    required String startDate,
    required String endDate,
  }) async {
    final data = await gqlRequest(
      r'''
        query($start: String!, $end: String!) {
          mealPlan(startDate: $start, endDate: $end) {
            id date mealType mealId mealName thumbnail
          }
        }
      ''',
      variables: {'start': startDate, 'end': endDate},
    );
    return (data['mealPlan'] as List)
        .map((e) => MealPlanEntry.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  static Future<void> setMealPlanEntry({
    required String date,
    required MealType mealType,
    required String mealId,
    required String mealName,
    String? thumbnail,
  }) =>
      gqlRequest(
        r'''
          mutation($date: String!, $type: MealType!, $mealId: String!, $mealName: String!, $thumb: String) {
            setMealPlanEntry(date: $date, mealType: $type, mealId: $mealId, mealName: $mealName, thumbnail: $thumb) { id }
          }
        ''',
        variables: {
          'date': date,
          'type': mealType.graphqlValue,
          'mealId': mealId,
          'mealName': mealName,
          'thumb': thumbnail,
        },
      );

  static Future<void> removeMealPlanEntry({
    required String date,
    required MealType mealType,
  }) =>
      gqlRequest(
        r'''
          mutation($date: String!, $type: MealType!) {
            removeMealPlanEntry(date: $date, mealType: $type)
          }
        ''',
        variables: {'date': date, 'type': mealType.graphqlValue},
      );

  // ---------------- Stats ----------------

  static Future<Stats> stats() async {
    final data = await gqlRequest(
      'query { stats { totalSaved totalPlanned favoriteCategory } }',
    );
    return Stats.fromJson(data['stats'] as Map<String, dynamic>);
  }
}
