class Ingredient {
  Ingredient({required this.ingredient, required this.measure});
  final String ingredient;
  final String measure;

  factory Ingredient.fromJson(Map<String, dynamic> j) => Ingredient(
        ingredient: j['ingredient'] as String,
        measure: j['measure'] as String,
      );
}

class Meal {
  Meal({
    required this.id,
    required this.name,
    this.category,
    this.area,
    this.instructions,
    this.thumbnail,
    this.tags = const [],
    this.youtube,
    this.ingredients = const [],
    required this.isSaved,
  });

  final String id;
  final String name;
  final String? category;
  final String? area;
  final String? instructions;
  final String? thumbnail;
  final List<String> tags;
  final String? youtube;
  final List<Ingredient> ingredients;
  final bool isSaved;

  factory Meal.fromJson(Map<String, dynamic> j) => Meal(
        id: j['id'] as String,
        name: j['name'] as String,
        category: j['category'] as String?,
        area: j['area'] as String?,
        instructions: j['instructions'] as String?,
        thumbnail: j['thumbnail'] as String?,
        tags: (j['tags'] as List?)?.cast<String>() ?? const [],
        youtube: j['youtube'] as String?,
        ingredients: (j['ingredients'] as List? ?? [])
            .map((e) => Ingredient.fromJson(e as Map<String, dynamic>))
            .toList(),
        isSaved: j['isSaved'] as bool? ?? false,
      );
}

class SavedRecipe {
  SavedRecipe({
    required this.id,
    required this.mealId,
    required this.mealName,
    this.thumbnail,
    this.category,
    this.area,
  });

  final String id;
  final String mealId;
  final String mealName;
  final String? thumbnail;
  final String? category;
  final String? area;

  factory SavedRecipe.fromJson(Map<String, dynamic> j) => SavedRecipe(
        id: j['id'] as String,
        mealId: j['mealId'] as String,
        mealName: j['mealName'] as String,
        thumbnail: j['thumbnail'] as String?,
        category: j['category'] as String?,
        area: j['area'] as String?,
      );
}

enum MealType { breakfast, lunch, dinner, snack }

extension MealTypeX on MealType {
  String get graphqlValue => name.toUpperCase();
  String get label {
    switch (this) {
      case MealType.breakfast:
        return 'Breakfast';
      case MealType.lunch:
        return 'Lunch';
      case MealType.dinner:
        return 'Dinner';
      case MealType.snack:
        return 'Snack';
    }
  }

  static MealType fromGraphql(String v) =>
      MealType.values.firstWhere((e) => e.graphqlValue == v);
}

class MealPlanEntry {
  MealPlanEntry({
    required this.id,
    required this.date,
    required this.mealType,
    required this.mealId,
    required this.mealName,
    this.thumbnail,
  });

  final String id;
  final String date; // yyyy-MM-dd
  final MealType mealType;
  final String mealId;
  final String mealName;
  final String? thumbnail;

  factory MealPlanEntry.fromJson(Map<String, dynamic> j) => MealPlanEntry(
        id: j['id'] as String,
        date: j['date'] as String,
        mealType: MealTypeX.fromGraphql(j['mealType'] as String),
        mealId: j['mealId'] as String,
        mealName: j['mealName'] as String,
        thumbnail: j['thumbnail'] as String?,
      );
}

class Stats {
  Stats({required this.totalSaved, required this.totalPlanned, this.favoriteCategory});
  final int totalSaved;
  final int totalPlanned;
  final String? favoriteCategory;

  factory Stats.fromJson(Map<String, dynamic> j) => Stats(
        totalSaved: j['totalSaved'] as int,
        totalPlanned: j['totalPlanned'] as int,
        favoriteCategory: j['favoriteCategory'] as String?,
      );
}
