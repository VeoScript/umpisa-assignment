import 'package:flutter/material.dart';
import '../api/models.dart';
import '../theme/app_theme.dart';

class RecipeCard extends StatelessWidget {
  const RecipeCard({super.key, required this.meal, required this.onTap});

  final Meal meal;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Row(
          children: [
            if (meal.thumbnail != null)
              Image.network(
                meal.thumbnail!,
                width: 88,
                height: 88,
                fit: BoxFit.cover,
              )
            else
              Container(
                width: 88,
                height: 88,
                color: AppColors.creamDim,
                child: const Icon(Icons.restaurant, color: AppColors.sage),
              ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 10,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      meal.name,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: AppTheme.display(
                        Theme.of(context).textTheme.titleMedium!,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      [meal.category, meal.area]
                          .whereType<String>()
                          .join(' · '),
                      style: const TextStyle(
                          color: AppColors.inkSoft, fontSize: 13),
                    ),
                  ],
                ),
              ),
            ),
            if (meal.isSaved)
              const Padding(
                padding: EdgeInsets.only(right: 12),
                child: Icon(Icons.favorite, color: AppColors.plum, size: 20),
              ),
          ],
        ),
      ),
    );
  }
}
