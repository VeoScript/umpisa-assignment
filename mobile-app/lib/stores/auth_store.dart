import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../core/store.dart';

class AppUser {
  const AppUser({required this.id, required this.email, required this.name});
  final String id;
  final String email;
  final String name;

  factory AppUser.fromJson(Map<String, dynamic> json) => AppUser(
        id: json['id'] as String,
        email: json['email'] as String,
        name: json['name'] as String,
      );
}

class AuthState {
  const AuthState({this.token, this.user, this.isBootstrapping = true});
  final String? token;
  final AppUser? user;
  final bool isBootstrapping;

  bool get isLoggedIn => token != null;

  AuthState copyWith({
    String? token,
    AppUser? user,
    bool? isBootstrapping,
    bool clear = false,
  }) {
    if (clear) return const AuthState(isBootstrapping: false);
    return AuthState(
      token: token ?? this.token,
      user: user ?? this.user,
      isBootstrapping: isBootstrapping ?? this.isBootstrapping,
    );
  }
}

const _storage = FlutterSecureStorage();
const _tokenKey = 'auth_token';

final authStore = Store<AuthState>(const AuthState());

class AuthActions {
  static Future<void> bootstrap() async {
    final token = await _storage.read(key: _tokenKey);
    authStore.set((s) => s.copyWith(token: token, isBootstrapping: false));
  }

  static Future<void> setSession(String token, AppUser user) async {
    await _storage.write(key: _tokenKey, value: token);
    authStore.set((s) => s.copyWith(token: token, user: user));
  }

  static Future<void> logout() async {
    await _storage.delete(key: _tokenKey);
    authStore.set((s) => s.copyWith(clear: true));
  }
}
