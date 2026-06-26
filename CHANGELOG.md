# Changelog

All notable changes to this project are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.0.5] — 2025-06-26

### Added
- **Google Translate widget** in Settings (⚙) — translates UI into 8 languages (EN, ES, FR, DE, IT, PT, JA, ZH-CN). Auto-saves language preference.
- **Screenshots** — 6 mobile screenshots in `docs/screenshots/`, embedded in README.

### Fixed
- **TREE_STRUCT undefined** — fixed `typeof structLabels` check after I18N cleanup.
- **Google Translate URL** — changed `//` to `https://` for proper loading on GitHub Pages.
- **GT dropdown styling** — styled for dark theme (gold border, card background).

### Changed
- **Language switcher** — replaced RU/EN segmented control with Google Translate dropdown.
- **README** — bilingual (RU + EN description), screenshots table, "Try it" link to GitHub Pages.

## [1.0.4] — 2025-06-26

### Changed
- **Structure 8→7 axes** — removed "Alcohol" from radar (information leak). Now 7 structure + 7 aroma = 14 axes.
- **"Salty/Umami" → "Salinity/Mineral"** — clearer sensory marker.
- **Math** — denominator 32→28 (7×4) in all 5 comparison functions. Scale now 25-100% instead of 50-100%.
- **"Слепая" → "Дегустация"** — renamed tasting tab.

### Fixed
- **Compare radar dots** — showed drink number instead of parameter value.
- **All "8 parameters" references** — updated to 7.
- **DISH_RULES** — removed `alcohol` from 29 target profiles.

### Added
- **8 orange/natural wines** — total drinks: 263.
- **Compare empty state** — no more hardcoded demo drinks.
- **Browse filters** — sake/cider translated.

## [1.0.3] — 2025-06-26

### Fixed
- **Math % similarity** — denominator `40→32` and `35→28` in 5 functions.
- **Compare** — `compare_list: []` instead of hardcoded demo.
- **Browse filters** — `sake`/`cider` translated.
- **Typos in DISH_RULES** — `Matchingать` → `соответствовать`.

## [1.0.0] — 2025-06-24

### First release 🍷
- 263 drinks, 10 tabs, 232 terms, 29 dishes
- Interactive radar, swipes, theme/sound/haptics
- APK build scripts, admin panel, app icon
- Fully offline, zero dependencies

## [1.0.6] — 2025-06-26

### Fixed
- **GT top banner** — permanently hidden via CSS (`iframe.goog-te-banner-frame { display: none !important }`)
- **"Технологии Google" text** — branding text hidden via CSS
- **GT in hidden container** — widget initializes in off-screen visible container, moves to settings on open
- **Can't reset translation** — added "↩ Reset translation" button in settings (clears localStorage + reloads)

### Changed
- **GT layout** — removed `SIMPLE` layout, now uses default `<select>` dropdown (more reliable on mobile)
- **GT CSS** — styled select for dark theme (gold border, card background, 140px width)
