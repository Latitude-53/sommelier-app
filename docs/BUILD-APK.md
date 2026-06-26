# Сборка APK — инструкции

## Быстрый старт

### Первый раз (после распаковки ZIP)

1. Установи Node.js 20+ с nodejs.org
2. Распакуй проект в папку (например `C:\sommelier-app\`)
3. Открой терминал в этой папке и выполни:
   ```bash
   npm install
   npx cap add android
   ```
4. Установи иконку: **двойной клик по `install-icon.bat`**
5. Собери APK: **двойной клик по `build-apk.bat`**

### Каждый раз (когда обновил HTML)

1. Положи свежий `sommelier.html` в `www/index.html` (замени)
2. **Двойной клик по `build-apk.bat`**
3. APK появится в `android\app\build\outputs\apk\debug\app-debug.apk`
4. Перекинь на телефон, установи

## Файлы скриптов

| Файл | Что делает |
|------|------------|
| `build-apk.bat` | Двойной клик → собирает APK (вызывает PS1) |
| `build-apk.ps1` | PowerShell: cap sync + gradlew assembleDebug |
| `install-icon.bat` | Двойной клик → устанавливает иконку (вызывает PS1) |
| `install-icon.ps1` | Копирует PNG из `android-icons/` в `android/app/src/main/res/mipmap-*/` |

## Что делает build-apk.ps1

1. Проверяет что мы в папке проекта (есть `package.json`)
2. Проверяет `www/index.html`
3. Если нет `android/` — запускает `npx cap add android` автоматически
4. `npx cap sync android` — копирует веб-контент в Android
5. `gradlew assembleDebug` — собирает APK
6. Показывает путь к готовому APK + предлагает открыть папку

## Что делает install-icon.ps1

1. Копирует 5 PNG (mdpi→xxxhdpi) в `mipmap-*/ic_launcher.png`
2. Копирует 512px в `playstore_icon.png` (для релиза в Play Store)
3. Удаляет старые `ic_launcher.webp` (если Android Studio создала дефолтные)

**Запускать один раз** — после `npx cap add android`. Иконки не перетираются при `cap sync`.

## Командная строка (вместо .bat)

Если хочешь вручную:
```powershell
npx cap sync android
cd android
.\gradlew.bat assembleDebug
cd ..
```

APK будет в `android\app\build\outputs\apk\debug\app-debug.apk`.

## Проблемы

| Проблема | Решение |
|----------|---------|
| `npx: command not found` | Установи Node.js 20+ с nodejs.org |
| `gradlew не является внутренней командой` | Запускай из папки android/ или используй `.\gradlew.bat` |
| `SDK location not found` | Открой Android Studio, она настроит SDK |
| Gradle Sync висит | Первый раз долго (5-15 мин), качает зависимости |
| PowerShell: execution policy | Скрипт сам ставит Bypass, но если ругается: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |
| APK не устанавливается | На телефоне: Настройки → Безопасность → Неизвестные источники |

## Release APK (для публикации)

Для Play Store нужен подписанный release APK/AAB:
```powershell
cd android
.\gradlew.bat bundleRelease
cd ..
```
AAB будет в `android\app\build\outputs\bundle\release\app-release.aab`.
Нужен keystore — создавай через `keytool` (в JDK).
