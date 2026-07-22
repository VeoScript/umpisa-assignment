import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:fquery/fquery.dart';
import '../api/api.dart';
import '../theme/app_theme.dart';
import 'register_screen.dart';

class LoginScreen extends HookWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final emailCtrl = useTextEditingController();
    final passCtrl = useTextEditingController();

    // useMutation ~= TanStack's useMutation: gives you isPending/error/data
    // and a .mutate() you call from a button handler.
    final login = useMutation<void, Exception, Map<String, String>, void>(
      (vars) => Api.login(email: vars['email']!, password: vars['password']!),
    );

    // React to the mutation's error state, same idea as a `useEffect` on
    // `mutation.error` in the TanStack version.
    useEffect(() {
      if (login.error != null) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (context.mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(login.error.toString())),
            );
          }
        });
      }
      return null;
    }, [login.error]);

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Center(
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    'Meal Planner',
                    textAlign: TextAlign.center,
                    style: AppTheme.display(
                      Theme.of(context).textTheme.displaySmall!,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Log in to plan your week',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: AppColors.inkSoft),
                  ),
                  const SizedBox(height: 32),
                  TextField(
                    controller: emailCtrl,
                    keyboardType: TextInputType.emailAddress,
                    decoration: const InputDecoration(labelText: 'Email'),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: passCtrl,
                    obscureText: true,
                    decoration: const InputDecoration(labelText: 'Password'),
                  ),
                  const SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: login.isPending
                        ? null
                        : () => login.mutate({
                              'email': emailCtrl.text.trim(),
                              'password': passCtrl.text,
                            }),
                    child: login.isPending
                        ? const SizedBox(
                            height: 18,
                            width: 18,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Text('Log in'),
                  ),
                  const SizedBox(height: 12),
                  TextButton(
                    onPressed: () => Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => const RegisterScreen(),
                      ),
                    ),
                    child: const Text('No account yet? Register'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
