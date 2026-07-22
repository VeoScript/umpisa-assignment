import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:fquery/fquery.dart';
import '../api/api.dart';
import '../stores/auth_store.dart';
import '../core/store.dart';
import '../theme/app_theme.dart';

class ProfileScreen extends HookWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final statsQuery = useQuery(['stats'], Api.stats, context: context);

    final user = useStoreValue(authStore, (s) => s.user);

    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Text(
            user?.name ?? '',
            style: AppTheme.display(Theme.of(context).textTheme.titleLarge!),
          ),
          Text(user?.email ?? '',
              style: const TextStyle(color: AppColors.inkSoft)),
          const SizedBox(height: 24),
          if (statsQuery.isLoading)
            const Center(child: CircularProgressIndicator())
          else if (statsQuery.data != null)
            Row(
              children: [
                _StatCard(
                    label: 'Saved', value: '${statsQuery.data!.totalSaved}'),
                const SizedBox(width: 12),
                _StatCard(
                  label: 'Planned',
                  value: '${statsQuery.data!.totalPlanned}',
                ),
                const SizedBox(width: 12),
                _StatCard(
                  label: 'Top category',
                  value: statsQuery.data!.favoriteCategory ?? '—',
                ),
              ],
            ),
          const SizedBox(height: 32),
          const OutlinedButton(
            onPressed: AuthActions.logout,
            child: Text('Log out'),
          ),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Card(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
          child: Column(
            children: [
              Text(
                value,
                style: AppTheme.mono(
                  const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                label,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 12, color: AppColors.inkSoft),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
