import 'package:flutter/foundation.dart';
import 'package:flutter_hooks/flutter_hooks.dart';

/// A tiny "zustand-like" store for Flutter.
///
/// Zustand pattern:            Flutter/Dart equivalent here:
/// -----------------------     -----------------------------
/// const useAuth = create(...)  final authStore = Store<AuthState>(...)
/// useAuth((s) => s.user)        useStoreValue(authStore, (s) => s.user)
/// set((s) => ({ ...s }))        authStore.set((s) => s.copyWith(...))
///
/// Create ONE instance per store (module-level singleton, see
/// stores/auth_store.dart), then read/subscribe to it from any widget with
/// [useStoreValue]. No BuildContext, no Provider wiring needed.
class Store<T> extends ChangeNotifier {
  Store(this._state);

  T _state;
  T get state => _state;

  /// Update state immutably, like zustand's `set(partial)`.
  void set(T Function(T current) updater) {
    _state = updater(_state);
    notifyListeners();
  }
}

/// Hook that subscribes a widget to a [Store], rebuilding only when the
/// selected slice actually changes (shallow `!=` check) — this is the
/// zustand "selector" pattern, avoiding unnecessary rebuilds.
S useStoreValue<T, S>(Store<T> store, S Function(T state) selector) {
  final selected = useState(selector(store.state));

  useEffect(() {
    void listener() {
      final next = selector(store.state);
      if (next != selected.value) {
        selected.value = next;
      }
    }

    store.addListener(listener);
    return () => store.removeListener(listener);
  }, [store]);

  return selected.value;
}
