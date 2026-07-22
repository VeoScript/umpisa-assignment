import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'home_screen.dart';
import 'saved_screen.dart';
import 'meal_plan_screen.dart';
import 'profile_screen.dart';
import '../theme/app_theme.dart';

class RootShell extends HookWidget {
  const RootShell({super.key});

  @override
  Widget build(BuildContext context) {
    final index = useState(0);
    const screens = [
      HomeScreen(),
      MealPlanScreen(),
      SavedScreen(),
      ProfileScreen(),
    ];

    return Scaffold(
      body: IndexedStack(index: index.value, children: screens),
      bottomNavigationBar: NavigationBar(
        selectedIndex: index.value,
        onDestinationSelected: (i) => index.value = i,
        backgroundColor: AppColors.cream,
        indicatorColor: AppColors.saffron.withValues(alpha: 0.18),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.search), label: 'Recipes'),
          NavigationDestination(
            icon: Icon(Icons.calendar_today),
            label: 'Plan',
          ),
          NavigationDestination(icon: Icon(Icons.favorite), label: 'Saved'),
          NavigationDestination(icon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }
}
