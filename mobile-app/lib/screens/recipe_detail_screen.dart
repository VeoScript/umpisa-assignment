import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:fquery/fquery.dart';
import '../api/api.dart';
import '../theme/app_theme.dart';

class RecipeDetailScreen extends HookWidget {
  const RecipeDetailScreen({super.key, required this.mealId});
  final String mealId;

  @override
  Widget build(BuildContext context) {
    final queryCache = CacheProvider.get(context);

    final mealQuery = useQuery(['meal', mealId], () => Api.mealById(mealId),
        context: context);

    final toggleSave = useMutation<void, Exception, bool, void>(
      (isCurrentlySaved) =>
          isCurrentlySaved ? Api.unsaveRecipe(mealId) : Api.saveRecipe(mealId),
      onSuccess: (_, __, ___) {
        // "invalidateQueries" ~= TanStack: mark related cache entries stale
        // so every screen showing this data refetches automatically.
        queryCache.invalidateQueries(['meal', mealId]);
        queryCache.invalidateQueries(['savedRecipes']);
        queryCache.invalidateQueries(['meals']);
      },
    );

    return Scaffold(
      body: mealQuery.isLoading
          ? const Center(child: CircularProgressIndicator())
          : mealQuery.data == null
              ? const Center(child: Text('Recipe not found'))
              : CustomScrollView(
                  slivers: [
                    SliverAppBar(
                      expandedHeight: 220,
                      pinned: true,
                      backgroundColor: AppColors.cream,
                      foregroundColor: AppColors.ink,
                      flexibleSpace: FlexibleSpaceBar(
                        background: mealQuery.data!.thumbnail != null
                            ? Image.network(
                                mealQuery.data!.thumbnail!,
                                fit: BoxFit.cover,
                              )
                            : Container(color: AppColors.creamDim),
                      ),
                      actions: [
                        IconButton(
                          icon: Icon(
                            mealQuery.data!.isSaved
                                ? Icons.favorite
                                : Icons.favorite_border,
                            color: AppColors.plum,
                          ),
                          onPressed: toggleSave.isPending
                              ? null
                              : () =>
                                  toggleSave.mutate(mealQuery.data!.isSaved),
                        ),
                      ],
                    ),
                    SliverPadding(
                      padding: const EdgeInsets.all(20),
                      sliver: SliverList(
                        delegate: SliverChildListDelegate([
                          Text(
                            mealQuery.data!.name,
                            style: AppTheme.display(
                              Theme.of(context).textTheme.headlineSmall!,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            [mealQuery.data!.category, mealQuery.data!.area]
                                .whereType<String>()
                                .join(' · '),
                            style: const TextStyle(color: AppColors.inkSoft),
                          ),
                          const SizedBox(height: 20),
                          Text(
                            'Ingredients',
                            style: AppTheme.display(
                              Theme.of(context).textTheme.titleMedium!,
                            ),
                          ),
                          const SizedBox(height: 8),
                          ...mealQuery.data!.ingredients.map(
                            (i) => Padding(
                              padding: const EdgeInsets.symmetric(vertical: 3),
                              child: Row(
                                children: [
                                  const Icon(
                                    Icons.circle,
                                    size: 6,
                                    color: AppColors.sage,
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(child: Text(i.ingredient)),
                                  Text(
                                    i.measure,
                                    style: AppTheme.mono(
                                      const TextStyle(
                                        fontSize: 12,
                                        color: AppColors.inkSoft,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(height: 20),
                          Text(
                            'Instructions',
                            style: AppTheme.display(
                              Theme.of(context).textTheme.titleMedium!,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(mealQuery.data!.instructions ?? '—'),
                          const SizedBox(height: 40),
                        ]),
                      ),
                    ),
                  ],
                ),
    );
  }
}
