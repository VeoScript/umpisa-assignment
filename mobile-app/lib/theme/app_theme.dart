import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Direct port of the web app's `@theme` CSS variables.
/// Keep this file as the single source of truth for colors/fonts so the
/// Flutter app stays visually in sync with the web app.
class AppColors {
  static const cream = Color(0xFFF2F5EC);
  static const creamDim = Color(0xFFE7ECDC);
  static const ink = Color(0xFF211D17);
  static const inkSoft = Color(0xFF55503F);
  static const saffron = Color(0xFFD98E04);
  static const saffronDark = Color(0xFFA86C03);
  static const plum = Color(0xFF5B3758);
  static const plumDark = Color(0xFF402540);
  static const sage = Color(0xFF8A9A7B);
  static const line = Color(0xFFD9D4C3);
  static const danger = Color(0xFFA3402F);
}

class AppTheme {
  // --font-display: Fraunces (headings / recipe titles)
  static TextStyle display(TextStyle base) =>
      GoogleFonts.fraunces(textStyle: base);

  // --font-body: Inter (everything else)
  static TextStyle body(TextStyle base) => GoogleFonts.inter(textStyle: base);

  // --font-mono: IBM Plex Mono (numbers, timers, macros, dates)
  static TextStyle mono(TextStyle base) =>
      GoogleFonts.ibmPlexMono(textStyle: base);

  static ThemeData light() {
    final base = ThemeData.light(useMaterial3: true);

    final textTheme = base.textTheme
        .apply(
          bodyColor: AppColors.ink,
          displayColor: AppColors.ink,
        )
        .copyWith(
          displayLarge: display(base.textTheme.displayLarge!),
          displayMedium: display(base.textTheme.displayMedium!),
          displaySmall: display(base.textTheme.displaySmall!),
          headlineLarge: display(base.textTheme.headlineLarge!),
          headlineMedium: display(base.textTheme.headlineMedium!),
          headlineSmall: display(base.textTheme.headlineSmall!),
          titleLarge: display(base.textTheme.titleLarge!),
        );

    return base.copyWith(
      scaffoldBackgroundColor: AppColors.cream,
      colorScheme: base.colorScheme.copyWith(
        primary: AppColors.saffron,
        onPrimary: AppColors.cream,
        secondary: AppColors.plum,
        onSecondary: AppColors.cream,
        surface: AppColors.cream,
        onSurface: AppColors.ink,
        error: AppColors.danger,
        outline: AppColors.line,
      ),
      textTheme: textTheme.apply(
        fontFamily: GoogleFonts.inter().fontFamily,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.cream,
        foregroundColor: AppColors.ink,
        elevation: 0,
        titleTextStyle: display(
          base.textTheme.titleLarge!.copyWith(color: AppColors.ink),
        ),
      ),
      cardTheme: CardThemeData(
        color: Colors.white,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: AppColors.line),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.saffron,
          foregroundColor: AppColors.cream,
          textStyle: body(const TextStyle(fontWeight: FontWeight.w600)),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.creamDim,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.line),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.line),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.saffron, width: 2),
        ),
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: AppColors.plumDark,
        contentTextStyle: body(const TextStyle(color: Colors.white)),
      ),
      dividerColor: AppColors.line,
    );
  }
}
