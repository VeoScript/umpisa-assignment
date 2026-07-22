# Meal Planner Mobile App

Flutter mobile application for the Meal Planner platform. This client is designed to work with the `meal-planner-backend` GraphQL API and provides recipe browsing, meal planning, and authentication. The project follows a lightweight architecture inspired by modern React development patterns while remaining idiomatic to Flutter.

## Architecture Overview

The application adopts patterns similar to those commonly used in React applications while leveraging Flutter's ecosystem.

| Requirement      | React Equivalent                           | Flutter Implementation                                                                                                  | Location                                            |
| ---------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Data fetching    | TanStack Query (`useQuery`, `useMutation`) | [`fquery`](https://pub.dev/packages/fquery) with query caching, automatic refetching, mutations, and cache invalidation | `lib/screens/`, `lib/api/api.dart`                  |
| State management | Zustand                                    | Lightweight custom `Store<T>` implementation following a Zustand-like pattern with selectors and subscriptions          | `lib/core/store.dart`, `lib/stores/auth_store.dart` |

The application's visual theme—including the **cream**, **saffron**, **plum**, and **sage** color palette, along with the **Fraunces**, **Inter**, and **IBM Plex Mono** fonts—is implemented in `lib/theme/app_theme.dart` using the same naming convention as the web application to ensure design consistency across platforms.

## Application Flow

The client communicates exclusively with the GraphQL backend.

1. **GraphQL Client**

   `lib/core/graphql_client.dart` contains a lightweight GraphQL client responsible for sending all requests to `POST /graphql`. When a user is authenticated, the client automatically includes the JWT access token in the `Authorization` header.

2. **API Layer**

   `lib/api/api.dart` contains all GraphQL queries and mutations exposed as simple asynchronous Dart functions, including authentication, recipe search, saved recipes, meal planning, and user statistics.

3. **Data Fetching**

   Screens consume the API using `fquery`.

   ```dart
   final mealsQuery = useQuery(
     ['meals', 'search', term],
     () => Api.searchMeals(term),
   );
   ```

   Queries sharing the same cache key reuse cached data whenever possible, minimizing unnecessary network requests. Mutations invalidate related queries to ensure cached data remains synchronized with the backend.

4. **Cache Management**

   After successful mutations such as saving recipes, removing favorites, or updating meal plan entries, the application refreshes affected data using:

   ```dart
   queryClient.invalidateQueries([...]);
   ```

## Authentication

Authentication is handled using JWT access tokens returned by the backend's `login` and `register` mutations.

The token is securely stored using `flutter_secure_storage` and automatically restored when the application launches through `AuthActions.bootstrap()` in `main.dart`. Once restored, all subsequent GraphQL requests are authenticated automatically.

## Getting Started

Since Flutter tooling is not available within the development environment used to generate this project, the native Android and iOS project files must be created locally.

### 1. Create the Flutter project

```bash
flutter create \
  --org com.yourcompany \
  --project-name meal_planner_app .
```

If prompted to overwrite existing files, it is safe to proceed. The contents of the `lib/` directory will be preserved.

### 2. Install dependencies

```bash
flutter pub get
```

### 3. Configure the GraphQL endpoint

The default endpoint targets the Android emulator:

```
http://10.0.2.2:4000/graphql
```

To connect to another backend instance, specify a custom endpoint when running the application:

```bash
flutter run \
  --dart-define=GRAPHQL_ENDPOINT=http://192.168.1.20:4000/graphql
```

### 4. Configure Firebase

Install FlutterFire CLI:

```bash
dart pub global activate flutterfire_cli
```

Configure Firebase:

```bash
flutterfire configure
```

This generates `firebase_options.dart` and downloads the required platform-specific configuration files (`google-services.json` for Android and `GoogleService-Info.plist` for iOS).

After configuration, initialize Firebase in `main.dart` using:

```dart
DefaultFirebaseOptions.currentPlatform
```

### 5. Run the application

```bash
flutter run
```

## Project Structure

```
lib/
├── main.dart                      # Application entry point
├── theme/
│   └── app_theme.dart             # Application colors and typography
├── core/
│   ├── graphql_client.dart        # GraphQL HTTP client
│   └── store.dart                 # Zustand-inspired Store<T>
├── stores/
│   └── auth_store.dart            # Authentication state
├── api/
│   ├── api.dart                   # GraphQL queries and mutations
│   └── models.dart                # Data models
├── screens/                       # Authentication, home, recipes,
│                                  # saved recipes, meal planner,
│                                  # profile, and statistics
└── widgets/
    └── recipe_card.dart
```

## Notes

- The application has not been compiled or tested in the current environment because the Flutter SDK is unavailable.
- The implementation follows the official `fquery` API (`useQuery`, `useMutation`, `CacheProvider`, and `invalidateQueries`) and is expected to require minimal adjustments if package versions differ.
- If build or runtime issues arise after local setup, they can typically be resolved with minor dependency or configuration updates.
