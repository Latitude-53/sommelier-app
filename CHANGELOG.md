# Changelog

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
