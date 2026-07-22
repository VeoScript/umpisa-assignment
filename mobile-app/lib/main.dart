import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:fquery/fquery.dart';
import 'package:fquery_core/fquery_core.dart';

import 'core/store.dart';
import 'stores/auth_store.dart';
import 'theme/app_theme.dart';
import 'screens/login_screen.dart';
import 'screens/root_shell.dart';

final queryCache = QueryCache();

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await AuthActions.bootstrap();

  runApp(const MealPlannerApp());
}

class MealPlannerApp extends StatelessWidget {
  const MealPlannerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return CacheProvider(
      cache: queryCache,
      child: MaterialApp(
        title: 'Meal Planner',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.light(),
        home: const AuthGate(),
      ),
    );
  }
}

class AuthGate extends HookWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context) {
    final isBootstrapping = useStoreValue(authStore, (s) => s.isBootstrapping);
    final isLoggedIn = useStoreValue(authStore, (s) => s.isLoggedIn);

    if (isBootstrapping) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    return isLoggedIn ? const RootShell() : const LoginScreen();
  }
}
