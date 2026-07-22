import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:fquery/fquery.dart';
import '../api/api.dart';
import '../api/models.dart';
import '../theme/app_theme.dart';

String _fmt(DateTime d) =>
    '${d.year.toString().padLeft(4, '0')}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';

class MealPlanScreen extends HookWidget {
  const MealPlanScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final queryCache = CacheProvider.get(context);

    final today = useMemoized(() => DateTime.now());
    final monday = useMemoized(
      () => today.subtract(Duration(days: today.weekday - 1)),
      [today],
    );
    final weekDays = useMemoized(
      () => List.generate(7, (i) => monday.add(Duration(days: i))),
      [monday],
    );
    final selectedDay = useState(today);

    final startDate = _fmt(weekDays.first);
    final endDate = _fmt(weekDays.last);

    final planQuery = useQuery(['mealPlan', startDate, endDate],
        () => Api.mealPlan(startDate: startDate, endDate: endDate),
        context: context);
    final savedQuery =
        useQuery(['savedRecipes'], Api.savedRecipes, context: context);

    final setEntry = useMutation<void, Exception, Map<String, dynamic>, void>(
      (vars) => Api.setMealPlanEntry(
        date: vars['date'] as String,
        mealType: vars['mealType'] as MealType,
        mealId: vars['mealId'] as String,
        mealName: vars['mealName'] as String,
        thumbnail: vars['thumbnail'] as String?,
      ),
      onSuccess: (_, __, ___) =>
          queryCache.invalidateQueries(['mealPlan', startDate, endDate]),
    );

    final removeEntry = useMutation<void, Exception, MealType, void>(
      (mealType) => Api.removeMealPlanEntry(
        date: _fmt(selectedDay.value),
        mealType: mealType,
      ),
      onSuccess: (_, __, ___) =>
          queryCache.invalidateQueries(['mealPlan', startDate, endDate]),
    );

    MealPlanEntry? entryFor(MealType type) {
      if (planQuery.data == null) return null;
      final dateStr = _fmt(selectedDay.value);
      for (final e in planQuery.data!) {
        if (e.date == dateStr && e.mealType == type) return e;
      }
      return null;
    }

    Future<void> pickRecipeFor(MealType type) async {
      if (savedQuery.data == null || savedQuery.data!.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Save a few recipes first, then assign them here.'),
          ),
        );
        return;
      }
      final picked = await showModalBottomSheet<SavedRecipe>(
        context: context,
        builder: (ctx) => ListView(
          shrinkWrap: true,
          children: savedQuery.data!
              .map(
                (r) => ListTile(
                  leading: r.thumbnail != null
                      ? Image.network(r.thumbnail!, width: 44, height: 44)
                      : null,
                  title: Text(r.mealName),
                  onTap: () => Navigator.of(ctx).pop(r),
                ),
              )
              .toList(),
        ),
      );
      if (picked != null) {
        setEntry.mutate({
          'date': _fmt(selectedDay.value),
          'mealType': type,
          'mealId': picked.mealId,
          'mealName': picked.mealName,
          'thumbnail': picked.thumbnail,
        });
      }
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Weekly meal plan')),
      body: Column(
        children: [
          SizedBox(
            height: 72,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              children: weekDays.map((d) {
                final isSelected = _fmt(d) == _fmt(selectedDay.value);
                const weekdayLabels = [
                  'Mon',
                  'Tue',
                  'Wed',
                  'Thu',
                  'Fri',
                  'Sat',
                  'Sun',
                ];
                return GestureDetector(
                  onTap: () => selectedDay.value = d,
                  child: Container(
                    width: 52,
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    decoration: BoxDecoration(
                      color:
                          isSelected ? AppColors.saffron : AppColors.creamDim,
                      borderRadius: BorderRadius.circular(14),
                    ),
                    alignment: Alignment.center,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          weekdayLabels[d.weekday - 1],
                          style: TextStyle(
                            fontSize: 12,
                            color:
                                isSelected ? Colors.white : AppColors.inkSoft,
                          ),
                        ),
                        Text(
                          '${d.day}',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: isSelected ? Colors.white : AppColors.ink,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
          const Divider(height: 1),
          Expanded(
            child: planQuery.isLoading
                ? const Center(child: CircularProgressIndicator())
                : ListView(
                    padding: const EdgeInsets.all(16),
                    children: MealType.values.map((type) {
                      final entry = entryFor(type);
                      return Card(
                        child: ListTile(
                          title: Text(
                            type.label,
                            style: AppTheme.display(
                              Theme.of(context).textTheme.titleSmall!,
                            ),
                          ),
                          subtitle:
                              Text(entry?.mealName ?? 'Tap to add a recipe'),
                          leading: entry?.thumbnail != null
                              ? Image.network(
                                  entry!.thumbnail!,
                                  width: 40,
                                  height: 40,
                                  fit: BoxFit.cover,
                                )
                              : const Icon(Icons.add_circle_outline,
                                  color: AppColors.sage),
                          trailing: entry != null
                              ? IconButton(
                                  icon: const Icon(Icons.close,
                                      color: AppColors.danger),
                                  onPressed: () => removeEntry.mutate(type),
                                )
                              : null,
                          onTap: () => pickRecipeFor(type),
                        ),
                      );
                    }).toList(),
                  ),
          ),
        ],
      ),
    );
  }
}
