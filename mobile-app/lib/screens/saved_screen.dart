import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:fquery/fquery.dart';
import '../api/api.dart';
import '../theme/app_theme.dart';
import 'recipe_detail_screen.dart';

class SavedScreen extends HookWidget {
  const SavedScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final savedQuery =
        useQuery(['savedRecipes'], Api.savedRecipes, context: context);

    return Scaffold(
      appBar: AppBar(title: const Text('Saved recipes')),
      body: RefreshIndicator(
        onRefresh: () async => savedQuery.refetch(),
        child: savedQuery.isLoading
            ? const Center(child: CircularProgressIndicator())
            : (savedQuery.data == null || savedQuery.data!.isEmpty)
                ? ListView(
                    children: const [
                      Padding(
                        padding: EdgeInsets.only(top: 80),
                        child: Center(
                          child: Text(
                            'No saved recipes yet.\nTap the heart on a recipe to save it.',
                            textAlign: TextAlign.center,
                            style: TextStyle(color: AppColors.inkSoft),
                          ),
                        ),
                      ),
                    ],
                  )
                : ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: savedQuery.data!.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (context, i) {
                      final r = savedQuery.data![i];
                      return Card(
                        clipBehavior: Clip.antiAlias,
                        child: ListTile(
                          leading: r.thumbnail != null
                              ? Image.network(
                                  r.thumbnail!,
                                  width: 56,
                                  height: 56,
                                  fit: BoxFit.cover,
                                )
                              : const Icon(Icons.restaurant),
                          title: Text(r.mealName),
                          subtitle: Text(
                            [r.category, r.area]
                                .whereType<String>()
                                .join(' · '),
                          ),
                          onTap: () => Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (_) =>
                                  RecipeDetailScreen(mealId: r.mealId),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
      ),
    );
  }
}
