# Meal Planner — Flutter mobile app

Boss, ito yung mobile app na kasunod ng `meal-planner-backend` mo (GraphQL/Hono/Prisma).
Nasa ilalim ito yung buod kung paano ginawa yung 3 hiningi mo, tapos yung setup steps.

## 1. Bakit ganito ginawa (mapping sa hiningi mo)

| Hiningi mo | Sa web/React kadalasan | Dito sa Flutter | Nasaan sa code |
|---|---|---|---|
| Data fetching parang TanStack Query | `useQuery` / `useMutation` | package **[fquery](https://pub.dev/packages/fquery)** — halos parehong API mismo: `useQuery(['key'], queryFn)`, `useMutation(mutationFn)`, may caching, refetch, at `invalidateQueries` | `lib/screens/*.dart`, `lib/api/api.dart` |
| State management parang Zustand | `create()` + `useStore(selector)` | wala pang tunay na "Zustand para sa Flutter" na package na mapagkakatiwalaan, kaya gumawa ako ng **maliit na `Store<T>` class** (~30 lines, nasa `lib/core/store.dart`) na parehong pattern: gumawa ka ng isang singleton store, tapos `useStoreValue(store, selector)` sa loob ng widget para mag-subscribe | `lib/core/store.dart`, `lib/stores/auth_store.dart` |
| Push notifications | — | `firebase_messaging` (yung tumatanggap ng push) + `flutter_local_notifications` (yung nagpapakita ng banner kahit bukas yung app) | `lib/notifications/push_notifications.dart` |

Yung **theme** mo (`cream`, `saffron`, `plum`, `sage`, etc + Fraunces/Inter/IBM Plex Mono fonts) — direkta kong nilagay sa `lib/theme/app_theme.dart`, parehong pangalan ng colors para madali i-match sa web.

## 2. Paano gumagana yung data flow (buod)

1. `lib/core/graphql_client.dart` — simpleng function na nagpapadala ng GraphQL query/mutation papunta sa backend mo (`POST /graphql`), automatic nilalagay yung `Authorization: Bearer <token>` kung naka-login.
2. `lib/api/api.dart` — dito nakalagay lahat ng query/mutation strings (register, login, searchMeals, saveRecipe, setMealPlanEntry, etc) bilang plain `Future` functions — ito mismo yung ipapasa mo sa `useQuery`/`useMutation`.
3. Sa mga screens (`lib/screens/`), ginagamit na lang yung mga function na iyon:
   ```dart
   final mealsQuery = useQuery(['meals', 'search', term], () => Api.searchMeals(term));
   ```
   Kapag pareho yung `queryKey`, kinukuha na lang sa cache — hindi na ulit magre-request sa server, katulad mismo ng TanStack Query.
4. Pagkatapos ng save/unsave o pag-assign ng meal plan, tinatawag yung `queryClient.invalidateQueries([...])` para mag-refresh yung mga related na screens.

## 3. Auth + push token

- Yung JWT galing sa `login`/`register` ay sinesave sa `flutter_secure_storage` (encrypted), tapos ni-restore ulit tuwing bubukas yung app (`AuthActions.bootstrap()` sa `main.dart`).
- **Note sa backend mo**: wala pang `registerPushToken` mutation sa schema mo ngayon, kaya kinuha ko na lang yung FCM token sa app (`PushNotificationService.instance.fcmToken`) pero hindi pa naise-send kahit saan. Kailangan mo idagdag sa backend:
  ```graphql
  registerPushToken(token: String!): Boolean!
  ```
  tapos i-save sa isang bagong table (`userId` → `fcmToken`), para may pagpapadalahan ka ng push (halimbawa: "Oy, i-plan mo na yung dinner mo bukas").

## 4. Setup steps

Wala akong Flutter SDK dito sa sandbox ko para i-run yung `flutter create`, kaya ito yung mga steps mo:

1. **Gawing tunay na Flutter project** (para makuha yung android/ios native folders):
   ```bash
   flutter create --org com.yourcompany --project-name meal_planner_app .
   ```
   Piliin "overwrite existing files" kung tatanungin — ligtas naman, hindi nito babaguhin yung laman ng `lib/`.

2. **Install dependencies:**
   ```bash
   flutter pub get
   ```

3. **I-configure yung GraphQL endpoint** papunta sa backend mo. Default `http://10.0.2.2:4000/graphql` (para sa Android emulator). Pwede mo i-override:
   ```bash
   flutter run --dart-define=GRAPHQL_ENDPOINT=http://192.168.1.20:4000/graphql
   ```

4. **Firebase para sa push notifications:**
   ```bash
   dart pub global activate flutterfire_cli
   flutterfire configure
   ```
   Gagawa ito ng `firebase_options.dart` at ii-download yung `google-services.json` (Android) / `GoogleService-Info.plist` (iOS) papunta sa tamang folder. Pagkatapos, i-update mo lang yung `Firebase.initializeApp()` sa `main.dart` para gamitin yung `DefaultFirebaseOptions.currentPlatform`.

5. Run:
   ```bash
   flutter run
   ```

## 5. Project structure

```
lib/
  main.dart                     # app entrypoint, fquery CacheProvider, AuthGate
  theme/app_theme.dart          # colors + fonts galing sa @theme mo
  core/
    store.dart                  # yung "zustand-like" Store<T> + useStoreValue hook
    graphql_client.dart         # POST /graphql wrapper
  stores/auth_store.dart        # session state (token, user) — zustand-like store
  api/
    models.dart                 # Meal, SavedRecipe, MealPlanEntry, Stats
    api.dart                    # lahat ng query/mutation functions
  notifications/push_notifications.dart
  screens/                      # login, register, home (search), recipe detail,
                                 # saved, weekly meal plan, profile/stats
  widgets/recipe_card.dart
```

## 6. Alam kong hindi pa 100% "just run it"

- Hindi ko na-test na mag-compile dahil walang Flutter SDK sa environment ko — pero sinunod ko yung totoong fquery API (`useQuery`, `useMutation`, `CacheProvider`, `useQueryClient().invalidateQueries`), kaya dapat konting tweak na lang kung may lumabas na version mismatch.
- Kung gusto mo, pwede kong tignan/idebug kapag na-run mo na at may error na lumabas — send mo lang yung error message.
