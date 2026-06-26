# 🍷 Помощник сомелье

> Мобильное приложение для распознавания вкусов напитков. Полностью офлайн, без серверов и API — весь датасет встроен в один HTML-файл.

> A mobile app for recognizing drink flavors. Fully offline, no servers or API — the entire dataset is embedded in a single HTML file.

**263 напитка • 10 вкладок • 232 термина • 29 блюд • 4 режима дегустации**

## 🌐 Try it

**Online:** https://latitude-53.github.io/sommelier-app/

**APK:** See [Releases](https://github.com/Latitude-53/sommelier-app/releases)

> ⚠️ UI is in Russian — open Settings (⚙) → "Translate" to switch to English (or 7 other languages via Google Translate).

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
    <td align="center">👅 Дегустация</td>
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

## ✨ Возможности

| Вкладка | Что делает |
|---------|------------|
| 🌳 **Дерево** | 7 параметров структуры (язык) + 7 кластеров ароматики (нос) → напитки с высоким значением |
| 🤔 **Я в тупике** | Квиз из 5 вопросов → типаж напитка + кластеры похожих |
| ✏️ **Опиши** | Конструктор профиля: 14 draggable точек на радаре → топ-10 похожих напитков |
| 👅 **Дегустация** | 4 режима сложности, серии 5/10 раундов, очки, confetti |
| 📚 **База** | 263 напитка в 8 категориях (вино, пиво, крепкое, саке, сидр, медовуха, кофе, чай) |
| 🏷️ **По ноте** | 186 вкусовых нот → блоки/связи/список. Тап по ноте → все напитки |
| 🍽️ **К еде** | 29 блюд → классика + математика (DISH_RULES). Обратная связь: напиток → топ-5 блюд |
| 📊 **Сравнить** | До 4 напитков, 2 радара + сводная таблица с сортировкой по параметрам |
| 📖 **Словарь** | 232 термина с алфавитной навигацией |
| 📝 **Заметки** | Личные заметки по напиткам (localStorage) |

## 🤖 Как это сделано

Этот проект — **вайбкод**. Весь код написан в диалоге с AI (Claude/GLM), без ручного программирования. Идея → обсуждение → AI генерирует код → тест → итерация.

Архитектура простая до наивности:
- **`scripts/build.py`** — генератор HTML из JSON (источник правды)
- **`data/*.json`** — датасет (напитки, термины, блюда, сорта)
- **`www/index.html`** — финальный файл (514 KB, всё в одном, 0 зависимостей)
- **Capacitor 6** — обёртка в APK

Никаких React, Vue, npm-пакетов на фронтенде. Pure HTML/CSS/vanilla JS + Canvas API.

## 🚀 Запуск

### В браузере
Открой `www/index.html` — работает офлайн.

### Онлайн (GitHub Pages)
`https://latitude-53.github.io/sommelier-app/`

### Сборка APK
1. Установи Node.js 20+ и Android Studio
2. `npm install` → `npx cap add android`
3. Двойной клик `setup-jdk.bat` (скачает JDK)
4. Двойной клик `install-icon.bat` (установит иконку)
5. Двойной клик `build-apk.bat` (соберёт APK)

Подробнее: `docs/BUILD-APK.md`

## 📂 Структура

```
sommelier-app/
├── www/
│   ├── index.html              # финальный файл (514 KB, офлайн)
│   └── admin.html              # админка (Chrome/Edge)
├── data/                       # датасет (JSON)
│   ├── drinks.json             # 263 напитка
│   ├── glossary.json           # 232 термина
│   ├── dish_pairs.json         # 29 блюд
│   ├── grapes.json             # 43 сорта (на будущее)
│   ├── taxonomy.json           # дерево вкусов
│   ├── quiz.json               # вопросы квиза
│   └── blind_modes.json        # режимы дегустации
├── scripts/
│   └── build.py                # генератор HTML из JSON
├── android-icons/              # PNG иконки (mdpi→xxxhdpi)
├── docs/                       # документация + скриншоты
├── build-apk.bat / .ps1        # сборка APK двойным кликом
├── install-icon.bat / .ps1     # установка иконки
├── setup-jdk.bat / .ps1        # авто-установка JDK
├── capacitor.config.json       # конфиг Android
└── package.json                # npm зависимости
```

## 🤝 Участие

Предложения по улучшению приветствуются!

Открой Issue если:
- 🐛 Нашёл баг
- 💡 Есть идея для новой вкладки или игры
- 📚 Хочешь помочь с расширением датасета (напитки, термины, блюда)
- 🎨 Есть идеи по дизайну

Особенно нужен help с:
- Расширением базы (пиво, крепкое, кофе, чай — пока перекос в вино)
- Иконкой (нужно переработать SVG для мелких размеров)
- Идеями для геймификации (турниры, дегустация по сортам)

## 📊 Датасет

263 напитка с профилями:
- **Структура** (7 осей): кислотность, сладость, горечь, танины, тело, газация, солёность/минеральность
- **Ароматика** (7 кластеров): фрукты, цветы/травы, специи, дерево/дым, минералы, сладкое, дрожжи
- **Метаданные**: категория, происхождение, ABV, теги, пары к еде, кросс-категории
