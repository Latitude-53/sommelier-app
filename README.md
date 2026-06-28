# Помощник сомелье

Мобильное приложение для распознавания вкусов напитков: дерево рецепторов, слепая дегустация, поиск по ноте, паутина связей.


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
    <td align="center">🙈 Слепая</td>
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

## Возможности

- **🌳 Дерево вкусов** — 5 рецепторов → 23 подкатегории → 110 конкретных нот → напитки
- **🎯 Я в тупике** — квиз из 5 вопросов → типаж + кластеры похожих по нотам
- **🔍 Слепая** — угадай напиток по радару/нотам/подсказке, 4 уровня сложности
- **📚 База** — 222 напитка в 8 категориях (вино, пиво, крепкое, саке, сидр, медовуха, кофе, чай)
- **🏷️ По ноте** — облако тегов → паутина связей между напитками
- **🍽️ К еде** — 15 блюд → напитки
- **📊 Сравнить** — до 4 напитков с наложенными радарами
- **📖 Словарь** — 46 терминов с объяснениями
- **📝 Заметки** — сохраняются в localStorage

## Структура проекта

```
sommelier-app/
├── www/
│   └── index.html              # финальный файл (300 KB, офлайн)
├── data/                       # датасет, админ-editable
│   ├── drinks.json             # 222 напитка
│   ├── taxonomy.json           # дерево вкусов
│   ├── glossary.json           # 46 терминов
│   ├── dish_pairs.json         # 15 блюд
│   ├── quiz.json               # 5 вопросов квиза
│   └── blind_modes.json        # 4 режима сложности слепой
├── scripts/
│   └── build.py                # генератор: JSON → HTML
├── capacitor.config.json       # конфиг Capacitor (Android)
├── package.json                # npm-зависимости
└── README.md
```

## Разработка

### Веб-версия (быстрый старт)

```bash
python3 scripts/build.py
# открой www/index.html в браузере
```

### Редактирование датасета

1. Открой любой `data/*.json` в текстовом редакторе
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
# → APK появится в android/app/build/outputs/apk/debug/app-debug.apk
```

### Публикация в Google Play

1. Создай аккаунт разработчика ($25 один раз): https://play.google.com/console
2. Сгенерируй подписанный APK:
   ```bash
   cd android
   ./gradlew bundleRelease
   ```
   → AAB появится в `android/app/build/outputs/bundle/release/app-release.aab`
3. Загрузи AAB через Play Console
4. Модерация 1-3 дня

## Датасет

Все данные — JSON, можно редактировать:

### drinks.json — напитки
```json
{
  "id": 1,
  "name": "Шампань (Brut)",
  "type": "wine",           // wine/beer/spirit/sake/cider/mead/coffee/tea
  "cat": "Игристое",
  "origin": "Франция, Шампань",
  "abv": "12%",
  "p": {                     // вкусовой профиль 1-5
    "acid": 4, "sweet": 1, "bitter": 2, "tannin": 1, "body": 3, "umami": 3
  },
  "tags": ["цитрус","бриошь","минерал","миндаль"],
  "desc": "Классическое французское игристое...",
  "pair": ["устрицы","икра","бри"],
  "temp": "8-10°C",
  "glass": "флют или кубок",
  "cross": [51, 86, 28]      // ID похожих в других категориях
}
```

### blind_modes.json — режимы слепой
```json
{
  "id": "expert",
  "title": "Эксперт",
  "icon": "🏆",
  "description": "Только подсказка: происхождение + крепость",
  "show_radar": false,
  "show_tags": false,
  "show_hint": true
}
```

## Технологии

- HTML5 + CSS3 + vanilla JavaScript (0 зависимостей)
- Canvas API для радар-чартов и force-directed graph
- localStorage для заметок
- Capacitor 6 для Android-обёртки

## Лицензия

MIT
