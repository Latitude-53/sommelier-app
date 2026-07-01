# Changelog

## v1.1.6 — Datasets expansion + drinks.json +67 + filters fix (2025-07-01)

Большой релиз данных: расширили все категории ингредиентов, добавили 67 новых напитков, починили фильтры Browse.

### Датасеты ингредиентов (768 ингредиентов)

Все категории расширены с открытыми данными (MIT / CC BY-SA / CC BY 4.0):

| Тип | Было | Стало | Источник | Лицензия |
|---|---|---|---|---|
| 🍇 Виноград | 20 | **332** | Wikipedia List of grape varieties | CC BY-SA 4.0 |
| 🍏 Яблоки | 1 | **357** | Wikipedia List of apple cultivars | CC BY-SA 4.0 |
| 🌿 Хмель | 3 | **37** | HopDatabase (kasperg3) | MIT |
| 🌵 Агава | 2 | **10** | Ручная курификация + open data | факты |
| 🍵 Чай | 2 | **12** | Ручная курификация + Wikipedia | CC BY-SA 4.0 |
| ☕ Кофе | 2 | **12** | Ручная курификация + Wikipedia | CC BY-SA 4.0 |
| 🌾 Рис | 1 | **8** | Ручная курификация (sake rice) | факты |

Каждый ингредиент имеет координаты (lat/lng) для будущей карты.

### Датасеты регионов (2031 регион)

| Датасет | Кол-во | Источник | Лицензия |
|---|---|---|---|
| wine_regions.json | **1831** регион | Winery Map (Oliver Dressler) | MIT |
| beer_regions.json | 172 региона | Open Brewery DB | MIT |
| coffee_regions.json | 25 регионов | Coffee Quality Database (James LeDoux) | MIT |

### Датасет профилей пива (108 стилей)

- **beer_styles_profiles.json** — 108 стилей с профилями 7+7
- **Источник:** Beer Profile and Ratings Data Set © ruthgn
- **Лицензия:** CC BY 4.0
- 3 197 пив с tasting profiles → усреднены по стилям
- Маппинг на 7+7: Sour→acid, Sweet→sweet, Bitter→bitter, Astringency→tannin, Body→body, Salty→savory, Fruits→fruit, Spices→spice, Malty→sweet_pastry

### drinks.json — 322 напитка (+67 с v1.1.4)

| Категория | v1.1.4 | v1.1.6 | + |
|---|---|---|---|
| 🍷 Вино | 94 | **109** | +15 (Château Margaux, Romanée-Conti, Barolo, etc.) |
| 🍺 Пиво | 56 | **69** | +13 (Russian Imperial Stout, Trappist Quad, Gueuze, etc.) |
| 🥃 Крепкое | 52 | **64** | +12 (Mezcal, Rhum Agricole, Japanese whisky, Armagnac, etc.) |
| 🍵 Чай | 20 | **25** | +5 (Sencha, Earl Grey, Matcha, Pu-erh, Tieguanyin) |
| ☕ Кофе | 16 | **21** | +5 (Espresso, Pour-over, Latte, Cold Brew, Turkish) |
| 🍶 Саке | 10 | **14** | +4 (Junmai Nigori, Ginjo, Daiginjo, Koshu) |
| 🍏 Сидр | 4 | **12** | +8 (Kingston Black, Basque sagardoa, Ice cider, etc.) |
| 🍯 Медовуха | 3 | **8** | +5 (Melomel, Metheglin, Braggot, Cyser, Traditional) |

### Bugfixes
- **Browse фильтры** — убраны дубликаты sake/Саке, cider/Сидр, mead/Медовуха. Теперь 9 чистых type-фильтров с эмодзи + подкатегории только для wine/beer/spirit (50+ напитков).
- **Coffee filters** — убраны подкатегории Эспрессо/Фильтр/Латте (это способы приготовления, не категории).
- **Tea filters** — убраны (20 чаёв не нуждаются в подкатегориях).
- **Английские subcat** — 24 поля переведено (Junmai→Дзюммай, Melomel→Меломель, и т.д.).
- **Alcohol cleanup** — убран из всех label/color/key объектов (8 мест).

### README
- Добавлена секция «Данные и атрибуция» с лицензиями всех датасетов
- Указаны авторы и источники по требованиям MIT/CC BY

### Stats
- **322 напитка** (было 255)
- **768 ингредиентов** (было 31)
- **2031 регион** с координатами
- **108 стилей пива** с профилями
- 11 вкладок, 180 терминов, 29 блюд
- Файл: ~602 KB (single HTML, 0 зависимостей)

---

## v1.1.5 — Datasets + Russian translation fix (2025-07-01)

### Новые датасеты (для будущей карты v1.3)
- **wine_regions.json** — 200 винодельческих регионов с координатами
  - Источник: Winery Map (MIT, © 2024 Oliver Dressler)
  - 39 Франция, 31 Италия, 25 США, 15 Испания, 13 Австрия
- **beer_regions.json** — 100 пивоваренных регионов
  - Источник: Open Brewery DB (MIT, © 2025)
  - 11 745 пивоварен в 23 странах, топ: Калифорния (915), Бавария (594), Вашингтон (460)
- **coffee_regions.json** — 25 кофе-регионов
  - Источник: Coffee Quality Database (MIT, © 2018 James LeDoux)
  - 1 311 кофе с рейтингами CQI, топ: Мексика (184), Колумбия (176), Гватемала (174)

### Bugfixes
- **Английские subcat в drinks.json** — 24 поля переведено на русский:
  - Саке: Junmai → Дзюммай, Ginjo → Гиндзё, Daiginjo → Дайгиндзё, Nigori → Нигори, Honjozo → Хондзёдзо, Namazake → Намадзакэ, Taruzake → Тарудзакэ, Koshu → Косю, Yamahai → Ямахай, Tokubetsu Junmai → Токубэцу Дзюммай
  - Медовуха: Melomel → Меломель, Cyser → Сайзер
  - Имена напитков тоже переведены
- **Browse фильтры** (v1.1.4) — убраны дубликаты sake/Саке, cider/Сидр, mead/Медовуха. Теперь 9 чистых type-фильтров с эмодзи + подкатегории по клику.

### README
- Добавлена секция «Данные и атрибуция» с лицензиями всех датасетов
- Указаны источники и авторы

### Stats
- 255 напитков (полностью русские subcat)
- 11 вкладок
- 4 датасета регионов (wine + beer + coffee + ingredients)
- Файл: ~547 KB (single HTML, 0 зависимостей)

---

## v1.1.4 — Code cleanup + bugfixes (2025-06-30)

### Code cleanup
- **Убран `alcohol` из всех label/color/key объектов** — оставался как мёртвый код после миграции 8→7 осей
  - `sLabels` (drinkCardHTML, openDrink, showTagDrinks, buildArchetype) — 4 места
  - `sColors` (openDrink) — 2 места
  - `sLabel` (clusterName) — 1 место
  - `keys` (computePairingScore) — 1 место
- **Удалены неиспользуемые функции:**
  - `typeLabelForWeb()` — дублировал typeLabel, не вызывался
  - `tapFeedback()` — тривиальная обёртка над haptic(), не вызывалась
- **Добавлен filter `alcohol` в pills** — drinkCardHTML теперь фильтрует alcohol из топ-3 параметров
- **Прогнан E2E тест** всех 11 вкладок через Playwright — 0 ошибок, все рендерятся

### Bugfixes
- **Build Profile пустой экран** (v1.1.3 регрессия) — `switchView('build-profile')` не вызывал `renderBuildProfile()`. Фикс: добавлен `if (v === 'build-profile') renderBuildProfile();`
- **Alcohol в dual-radar** — в некоторых местах всё ещё мог появиться через sLabels объекты. Убран полностью.

### Stats
- 255 напитков, 11 вкладок, 180 терминов, 29 блюд
- Файл: ~545 KB (single HTML, 0 зависимостей)
- E2E тест: 11/11 вкладок рендерятся, 0 JS ошибок

---

## v1.1.3 — Hotfix: восстановление игры «Построй профиль» (2025-06-30)

### Что случилось
В процессе сборки v1.1.2 код игры «Построй профиль» (renderBuildProfile, startBpGame, checkBpProfile, и т.д.) был случайно потерян из `app.js` — остался только v1.1.0 chess.com-стиль без новой игры. Восстановили из сохранённой версии пользователя.

### Восстановлено
- **Игра «Построй профиль»** (reverse blind) — 7 функций, ~200 строк кода
- **3 режима:** Оба (14 осей, ×2) / Структура / Ароматика
- **Setup-экран** с выбором режима
- **Compact layout** со sticky drink-info + sticky action-bar
- **Dual radar в reveal:** user (золото) vs real (синий)
- **×2 множители:** за режим «Оба» + за полный профиль (stack ×4)
- **Multiplier badges** на pills (×2 виден ещё до старта игры)
- **«Ещё раз»** возвращает на setup-экран (можно сменить режим)

### Новые скриншоты
- 6 свежих PNG через Playwright (iPhone 14, 2x DPI):
  - 01-blind-setup, 02-build-profile-setup, 03-tree
  - 04-browse, 05-compare, 06-build-profile-reveal
- README обновлён с таблицей 3×2

### Stats
- 255 напитков, 11 вкладок, 180 терминов, 29 блюд
- Файл: ~545 KB (single HTML, 0 зависимостей)

---

## v1.1.1 — Build Profile game + multiplier badges (2025-06-29)

### Новая игра: «Построй профиль» (Reverse Blind)
- **Новая вкладка** «Построй» — между Дегустацией и Деревом
- Дано: полное описание напитка (название, категория, регион, ABV, теги, описание)
- Задача: юзер **расставляет 14 ползунков** (7 структура + 7 ароматика), пытаясь попасть в реальный профиль
- **3 режима:** Оба (14 осей, ×2), Структура (7 осей), Ароматика (7 осей)
- **Setup-экран** с выбором режима (как в Дегустации)
- **Compact layout:** sticky drink-info сверху (сворачиваемый), sticky action-bar снизу с кнопками «Сброс» + «Проверить»
- **Reveal:** двойная паутина наложенная — user (золото) vs real (синий), % попадания, звёзды (1-5), таблица по всем осям с Δ отклонениями
- **Multipliers:** ×2 за режим «Оба» (14 осей сложно) + ×2 за полный профиль (stack-ится = ×4)
- Confetti при 75%+ попадания

### Multiplier badges на pills
- **Дегустация:** pills сложности теперь показывают ×2 (Эксперт), ×1.5 (Ноты/Профиль), без бейджа (Классика)
- **Построй профиль:** pill режима «Оба» показывает ×2
- Зелёный бейдж на неактивных, золотой на активной — привлекает внимание к бонусным режимам

### Bug fixes в сравнении с v1.1.0
- **Alcohol в радаре Build вкладки** — BUILD_STRUCT был 8 с alcohol, должен быть 7. Радар в Build теперь правильный.
- **sKeys в matchScore** — убран alcohol из 4 мест, знаменатель /40 → /35 (правильно для 7 осей)
- **Паутина в конце игры** — убран дубль паутины и описания в reveal Дегустации (только «К напитку»)
- **«Ещё раз» в Построй** — теперь возвращает на setup-экран (можно сменить режим), а не сразу новую игру

### Цвета dual-radar
- User: золото (rgba 201,165,92) — тёплый
- Real: синий (rgba 106,138,200) — холодный контраст
- Раньше был золото vs зелёный — сливалось, было не видно разницу

### Stats
- 255 напитков, 11 вкладок, 180 терминов, 29 блюд
- Файл: ~545 KB (single HTML, 0 зависимостей)

---

## v1.1.0 — Chess.com-inspired redesign (2025-06-28)

Полный рефакторинг UI под влиянием chess.com: новый визуальный язык, hero-карточки, плитки вместо списков, post-game экраны как у матчей.

### Architecture
- **build.py разделён** на `template.html` + `app.js` (5500 строк → 1456 строк в build.py)
- Логика рендера и стили теперь в отдельных файлах — легче итерировать

### New design system
- **Action-зелёный** (`--green: #7fa650`) для всех primary CTA — как chess.com «Play»
- **Золото** (`--gold`) — навигация, премиум, бейджи
- Чёткая иерархия: золото = навигация, зелёный = действие

### Дегустация (стартовая вкладка)
- **Hero CTA** — большая плитка с заголовком, мета-чипами и зелёной кнопкой «▶ Начать дегустацию»
- **Tile-grid 3×2** для выбора категории (вместо вертикального списка кнопок)
- **2×2 grid для сложности** — все 4 режима видно сразу, без скролла
- **3-column grid для режима** — 1 раунд / Серия ×5 / Марафон ×10
- Стала стартовой вкладкой (была 4-й) — вау-эффект с первого экрана

### Post-game экран (как chess.com post-match)
- Большой **result-badge** 72×72 (зелёный при win, золотой при partial, бордовый при loss)
- Крупный label «ПОЛНОЕ ПОПАДАНИЕ! / ЧАСТИЧНО ВЕРНО / МИМО»
- 3 step-cards (Тип/Стиль/Напиток) с цветовой индикацией ✓/✗
- Score-pill с очками и множителем
- **2 кнопки**: зелёная «▶ Ещё раз» (primary) + secondary «📖 К напитку»
- Убран дубль паутины и описания внизу — они в карточке напитка

### Карточки напитков (list-items)
- **Avatar 42×42** слева с цветной заливкой по типу напитка (wine=бордовый, beer=янтарный, spirit=тил, ...)
- Имя + мета (категория • регион • ABV) по центру
- Pills с топ-3 параметрами
- Chevron `›` справа с анимацией slide-right при тапе
- Применено везде: База, Поиск по ноте, similar drinks, модалки

### Дерево вкусов
- **Tab-indicator** Структура/Ароматика с анимированным подчёркиванием (cubic-bezier)
- Состояние таба сохраняется при переключении вкладок
- Убраны tree-tiles grid (были избыточны)

### Радар
- **Лейблы как HTML overlay** поверх canvas (вместо ctx.fillText) — не обрезаются canvas-границами
- Smart positioning: top-axis лейблы висят ВНИЗ от anchor, bottom — ВВЕРХ, sides — в стороны
- Per-axis offset: top +4, bottom +10, sides 0
- Canvas 180×180 → **220×220** для blind радаров
- Padding 38 → 25 — радар больше на ~30%
- Лейблы появляются сразу, не ждут анимацию

### Sticky-bar с ответами
- Полностью **floating pill** (`border-radius: 22px` со всех сторон)
- `backdrop-filter: blur(12px)` — glass-эффект
- `box-shadow: 0 8px 28px` — парит над контентом
- Кнопки-ответы — pill-shape (`border-radius: 24px`)

### Bug fixes
- **Alcohol в радаре** — STRUCT_LABELS/KEYS/N были 8 с alcohol, должно быть 7. На 6-й оси было `undefined`. Починено во всех радарах (blind, drink card, compare).
- **Двойное зачисление очков** — свайп туда-сюда после reveal добавлял очки каждый re-render. Фикс через `_pointsAwarded` flag.
- **Свайпы ломались на скролле** шапки/pill-row/filters — touchstart теперь игнорируется в горизонтально-скроллящихся контейнерах.
- **GT widget пропадал из настроек** если юзер быстро переключал вкладки — moveGTToSettings теперь с retry-loop (6 сек).
- **resetTranslation без reload** — чистим cookie + select='' + change event, gtObserver ловит и перерисовывает canvas.
- **SWIPE_VIEWS порядок** обновлён под новую раскладку (Дегустация первая).

### Stats
- 255 напитков в базе
- 10 вкладок
- 29 блюд в pairing
- Файл: ~527 KB (single HTML, 0 зависимостей)

---

## v1.0.7 (2025-06-27)
- Google Translate Widget с 8 языками
- Скрытые DOM span для перевода canvas-лейблов
- GT banner killer (setInterval 200ms)
- gtObserver для перерисовки радаров при активации GT
- resetTranslation через cookie cleanup
- Tree state preservation при переключении вкладок
- 6 скриншотов в README

## v1.0.6 (2025-06-26)
- Splash screen при запуске
- Android back button handling
- Safe-area insets для Android
- Settings modal с темой/звуком/вибрацией
- PowerShell скрипты для сборки APK (build-apk.bat, install-icon.bat, setup-jdk.bat)

## v1.0.5 (2025-06-25)
- Дерево вкусов: 7 структура + 7 ароматика (вместо 8/7)
- Alcohol убран как information leak (ABV виден в данных)
- Знаменатель в pairing математике: 28 (7×4 для значений 1-5)
- Compare вкладка с multi-radar
- Build вкладка с draggable точками на радаре

## v1.0.0 (2025-06-20)
- Первый релиз
- 110 напитков, 5 категорий
- Базовый radar chart
- Дегустация (3 шага: тип → категория → напиток)
- Поиск по ноте, словарь терминов, заметки
