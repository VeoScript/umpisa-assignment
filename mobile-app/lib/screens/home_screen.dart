import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:fquery/fquery.dart';
import '../api/api.dart';
import '../theme/app_theme.dart';
import '../widgets/recipe_card.dart';
import 'recipe_detail_screen.dart';

class HomeScreen extends HookWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final searchCtrl = useTextEditingController();
    final searchTerm = useState('chicken');

    final mealsQuery = useQuery([
      'meals',
      'search',
      searchTerm.value
    ], () => Api.searchMeals(searchTerm.value), context: context);

    final categoriesQuery =
        useQuery(['categories'], Api.categories, context: context);

    return Scaffold(
      appBar: AppBar(title: const Text('Recipes')),
      body: RefreshIndicator(
        onRefresh: () async => mealsQuery.refetch(),
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            TextField(
              controller: searchCtrl,
              decoration: InputDecoration(
                hintText: 'Search recipes… e.g. "chicken"',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: IconButton(
                  icon: const Icon(Icons.arrow_forward),
                  onPressed: () {
                    if (searchCtrl.text.trim().isNotEmpty) {
                      searchTerm.value = searchCtrl.text.trim();
                    }
                  },
                ),
              ),
              onSubmitted: (v) {
                if (v.trim().isNotEmpty) searchTerm.value = v.trim();
              },
            ),
            const SizedBox(height: 16),
            if (categoriesQuery.data != null)
              SizedBox(
                height: 36,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: categoriesQuery.data!.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 8),
                  itemBuilder: (_, i) {
                    final cat = categoriesQuery.data![i];
                    return ActionChip(
                      label: Text(cat),
                      backgroundColor: AppColors.creamDim,
                      onPressed: () => searchTerm.value = cat,
                    );
                  },
                ),
              ),
            const SizedBox(height: 16),
            if (mealsQuery.isLoading)
              const Padding(
                padding: EdgeInsets.only(top: 40),
                child: Center(child: CircularProgressIndicator()),
              )
            else if (mealsQuery.isError)
              Padding(
                padding: const EdgeInsets.only(top: 40),
                child: Center(
                  child: Text(
                    'Something went wrong: ${mealsQuery.error}',
                    style: const TextStyle(color: AppColors.danger),
                  ),
                ),
              )
            else
              ...mealsQuery.data!.map(
                (meal) => Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: RecipeCard(
                    meal: meal,
                    onTap: () => Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => RecipeDetailScreen(mealId: meal.id),
                      ),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
