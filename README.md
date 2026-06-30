# 🍷 Помощник сомелье

**Мобильное приложение для распознавания вкусов напитков.** Учимся понимать вино, пиво, крепкое, кофе и чай через 7+7 осей: 🫁 структура (язык) + 👃 ароматика (нос). Без сервера, без зависимостей — один HTML-файл работает офлайн.

🔗 **Live demo:** https://latitude-53.github.io/sommelier-app/

## 🎮 Две игры + инструменты

### 🍷 Дегустация (слепая)
Загадываем случайный напиток — угадывай по радару вкусов за 3 шага: тип → категория → конкретный напиток.
- **4 режима сложности** с множителями очков: 🎯 Классика (×1) · 🏷️ Только ноты (×1.5) · 📊 Только профиль (×1.5) · 🏆 Эксперт (×2)
- **3 режима игры:** 1 раунд / Серия ×5 / Марафон ×10
- 6 категорий на выбор: Все / Вино / Пиво / Крепкое / Кофе+Чай / Саке
- Post-game экран как у chess.com: badge ✓/✗, очки с множителем, quick restart

### 🎯 Построй профиль (reverse blind)
Дано полное описание напитка — восстанови его вкусовой профиль ползунками. Чем точнее попадёшь, тем больше очков.
- **3 режима:** 🎯 Оба (14 осей, ×2) · 🫁 Структура (7 осей) · 👃 Ароматика (7 осей)
- Compact layout: sticky drink-info сверху (сворачиваемый), action-bar снизу
- Reveal: **двойная паутина** наложенная — твоё (золото) vs реальное (синий), % попадания, звёзды 1-5
- **×2 за режим «Оба»** + **×2 за полный профиль** (стек = ×4)
- Confetti при 75%+ попадания

### 🛠️ Инструменты
- **🌳 Дерево** — 7 параметров структуры + 7 кластеров ароматики, таб-переключатель с анимированным indicator
- **❓ Я в тупике** — квиз из 5 вопросов → типаж + кластеры похожих
- **✏️ Опиши** — конструктор профиля с draggable точками на радаре → similar drinks
- **📚 База** — 255 напитков с list-items (avatar + meta + chevron)
- **🏷️ По ноте** — облако тегов → напитки с этой нотой во всех категориях
- **🍽️ К еде** — 29 блюд → напитки из всех категорий
- **📊 Сравнить** — до 4 напитков с наложенными радарами
- **📖 Словарь** — 180 терминов с объяснениями
- **📝 Заметки** — сохраняются в localStorage

## 📸 Скриншоты

<table>
  <tr>
    <td><img src="docs/screenshots/01-tree.png" width="180"></td>
    <td><img src="docs/screenshots/02-drink-card.png" width="180"></td>
    <td><img src="docs/screenshots/03-blind.png" width="180"></td>
  </tr>
  <tr>
    <td align="center">🌳 Дерево</td>
    <td align="center">🍷 Карточка</td>
    <td align="center">🍷 Слепая</td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/04-build.png" width="180"></td>
    <td><img src="docs/screenshots/05-pairing.png" width="180"></td>
    <td><img src="docs/screenshots/06-compare.png" width="180"></td>
  </tr>
  <tr>
    <td align="center">✏️ Опиши</td>
    <td align="center">🍽️ К еде</td>
    <td align="center">📊 Сравнить</td>
  </tr>
</table>

> *Скриншоты с v1.0.x — UI обновился в v1.1.x (chess.com-стиль). Будем обновлять.*

## 🎨 Дизайн v1.1 (chess.com-inspired)

- **Hero CTA** на старте Дегустации и Построй профиля — большая плитка с заголовком + зелёная кнопка «▶ Начать»
- **Action-зелёный** (`#7fa650`) для primary CTA, **золото** (`#c9a55c`) для навигации
- **Tile-grid** для категорий (3×2) и pills (2×2 / 3-column) для режимов
- **List items** с avatar-иконками по типу напитка (вино=бордовый, пиво=янтарный, ...)
- **Floating pill sticky-bar** с blur-эффектом для ответов в Дегустации
- **Post-game экраны** как chess.com post-match: result-badge 72×72, лейбл W/L, score-pill
- **HTML overlay для лейблов радара** — не обрезаются canvas-границами, word-wrap для длинных названий
- **Tab-indicator** с анимированным подчёркиванием (cubic-bezier) в Дереве

## 📊 Структура проекта

```
sommelier-app/
├── www/
│   └── index.html              # финальный файл (~545 KB, офлайн)
├── scripts/
│   ├── build.py                # генератор: JSON → HTML (~1450 строк)
│   ├── template.html           # HTML структура + CSS (~830 строк)
│   └── app.js                  # JS логика (~3900 строк)
├── data/                       # датасет, admin-editable JSON
│   ├── drinks.json             # 255 напитков
│   ├── taxonomy.json           # дерево вкусов (7+7)
│   ├── glossary.json           # 180 терминов
│   ├── dish_pairs.json         # 29 блюд
│   ├── quiz.json               # 5 вопросов
│   └── blind_modes.json        # 4 режима сложности
├── docs/
│   ├── index.html              # GitHub Pages (копия www/)
│   └── screenshots/            # 6 PNG
├── capacitor.config.json       # Android-обёртка
├── package.json                # v1.1.1
├── CHANGELOG.md                # v1.0.0 → v1.1.1
├── build-apk.bat / .ps1        # сборка APK двойным кликом
├── install-icon.bat / .ps1     # установка иконки
├── setup-jdk.bat / .ps1        # авто-скачивание JDK 17
└── README.md
```

## 🚀 Разработка

### Веб-версия (быстрый старт)

```bash
python3 scripts/build.py
# открой www/index.html в браузере
```

### Редактирование датасета

1. Открой любой `data/*.json` в текстовом редакторе (или `www/admin.html`)
2. Внеси изменения
3. Запусти `python3 scripts/build.py`
4. Готово — `www/index.html` обновлён

### Android-версия (через Capacitor)

**Требования:** Node.js 18+, Android Studio, JDK 17+

```bash
# 1. Установить зависимости
npm install

# 2. Инициализировать Android-проект
npm run android:init

# 3. Синхронизировать (после любого изменения data/ или build.py)
npm run android:sync

# 4. Открыть в Android Studio
npm run android:open
# ИЛИ собрать APK из командной строки:
npm run android:build
# → APK в android/app/build/outputs/apk/debug/app-debug.apk
```

**Простой путь (Windows):** двойной клик по `build-apk.bat` — автоматически скачает JDK, соберёт APK.

### Публикация в Google Play

1. Создай аккаунт разработчика ($25 один раз): https://play.google.com/console
2. Сгенерируй подписанный AAB:
   ```bash
   cd android
   ./gradlew bundleRelease
   ```
   → `android/app/build/outputs/bundle/release/app-release.aab`
3. Загрузи AAB через Play Console
4. Модерация 1-3 дня

## 📝 Датасет

### drinks.json — напитки
```json
{
  "id": 2,
  "name": "Шампань (Brut)",
  "type": "wine",
  "cat": "Игристое",
  "origin": "Франция, Шампань",
  "abv": "12%",
  "s": {                          // структура (7 осей, 1-5)
    "acid": 4, "sweet": 1, "bitter": 2, "tannin": 1,
    "body": 3, "carbonation": 4, "savory": 3
  },
  "a": {                          // ароматика (7 кластеров, 1-5)
    "fruit": 3, "floral": 2, "spice": 1, "wood_smoke": 1,
    "mineral_earth": 4, "sweet_pastry": 2, "yeast_ferment": 4
  },
  "tags": ["цитрус","бриошь","минерал","миндаль"],
  "desc": "Классическое французское игристое...",
  "pair": ["устрицы","икра","бри"],
  "temp": "8-10°C",
  "glass": "флют или кубок",
  "cross": [51, 86, 28]
}
```

## 🌐 Перевод (i18n)

UI на русском. **Google Translate Widget** встроен в Settings (⚙) — переводит на лету на 8 языков: English, Español, Français, Deutsch, Italiano, Português, 日本語, 中文.

Canvas-лейблы радара переводятся через скрытые DOM span-элементы → JS читает переведённый текст → рисует на canvas.

## 🔧 Технологии

- **HTML5 + CSS3 + vanilla JavaScript** (0 зависимостей, single file ~545 KB)
- **Canvas API** для радар-чартов с HTML overlay для лейблов
- **localStorage** для заметок, темы, настроек, GT-языка
- **Capacitor 6** для Android-обёртки
- **Google Translate Widget** для i18n без сервера

## 📈 Roadmap

- [ ] **Daily Tasting** — детерминированный напиток дня (hash от даты, один для всех)
- [ ] **Higher/Lower** — quick-игра с серией правильных ответов
- [ ] **Профиль** — stats, achievements, history
- [ ] **Tournament** — bracket из 16 напитков
- [ ] **Расширение базы** — сидр/медовуха/саке/чай/кофе до 400+ напитков
- [ ] **iOS версия**
- [ ] **Remote JSON** — обновление базы без APK

## 📜 Лицензия

MIT

## 🙏 Благодарности

- Данные о напитках собраны из открытых источников и книг по сомелье
- Иконки напитков — emoji Unicode
- Шрифты — системные (Georgia для заголовков, sans-serif для тела)
