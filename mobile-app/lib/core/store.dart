import 'package:flutter/foundation.dart';
import 'package:flutter_hooks/flutter_hooks.dart';

class Store<T> extends ChangeNotifier {
  Store(this._state);

  T _state;
  T get state => _state;

  void set(T Function(T current) updater) {
    _state = updater(_state);
    notifyListeners();
  }
}

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
