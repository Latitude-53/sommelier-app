# ============================================================
#  Помощник сомелье — сборка APK
#  Запуск: двойной клик по build-apk.bat ИЛИ в PowerShell:
#    .\build-apk.ps1
# ============================================================

# Цвета для красивого вывода
$ErrorActionPreference = "Stop"
function Write-Step($msg)  { Write-Host "▶ " -NoNewline -ForegroundColor Cyan;    Write-Host $msg }
function Write-OK($msg)    { Write-Host "  ✓ " -NoNewline -ForegroundColor Green;  Write-Host $msg }
function Write-Warn($msg)  { Write-Host "  ! " -NoNewline -ForegroundColor Yellow; Write-Host $msg }
function Write-Err($msg)   { Write-Host "  ✗ " -NoNewline -ForegroundColor Red;    Write-Host $msg }

Write-Host ""
Write-Host "=========================================" -ForegroundColor Yellow
Write-Host "  Помощник сомелье — сборка APK" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Yellow
Write-Host ""

# 0. Проверка что мы в папке проекта
if (-not (Test-Path "package.json") -or -not (Test-Path "capacitor.config.json")) {
    Write-Err "Не похоже на папку проекта. Запускай из корня sommelier-app/"
    Write-Host  "  Ожидаются: package.json, capacitor.config.json" -ForegroundColor Gray
    Read-Host "Нажми Enter для выхода"
    exit 1
}
Write-OK "Папка проекта: $(Get-Location)"

# 1. Проверка что www/index.html существует
if (-not (Test-Path "www/index.html")) {
    Write-Err "Не найден www/index.html — положи свежий HTML перед сборкой"
    Read-Host "Нажми Enter для выхода"
    exit 1
}
$htmlSize = (Get-Item "www/index.html").Length
Write-OK "www/index.html: $([math]::Round($htmlSize/1KB, 1)) KB"

# 2. Проверка что android/ папка есть (cap add уже выполнен)
if (-not (Test-Path "android/app/build.gradle")) {
    Write-Warn "Папка android/ не инициализирована. Запускаю: npx cap add android"
    npx cap add android
    if ($LASTEXITCODE -ne 0) {
        Write-Err "Не удалось инициализировать Android. Проверь что установлен Android Studio + SDK"
        Read-Host "Нажми Enter для выхода"
        exit 1
    }
    Write-OK "Android проект создан"
}

# 3. Синхронизация www → android
Write-Step "Синхронизация веб-контента (npx cap sync android)..."
npx cap sync android
if ($LASTEXITCODE -ne 0) {
    Write-Err "cap sync failed"
    Read-Host "Нажми Enter для выхода"
    exit 1
}
Write-OK "Контент синхронизирован"

# 4. Сборка APK
Write-Step "Сборка debug APK (gradlew assembleDebug)..."

# Авто-поиск JAVA_HOME если не установлен
# Сначала пробуем запомненный путь из .java-home файла
$javaHomeFile = "$PSScriptRoot\.java-home"
if (-not $env:JAVA_HOME -or -not (Test-Path $env:JAVA_HOME)) {
    # 1. Пробуем запомненный путь
    if (Test-Path $javaHomeFile) {
        $saved = (Get-Content $javaHomeFile -ErrorAction SilentlyContinue | Select-Object -First 1).Trim()
        if ($saved -and (Test-Path "$saved\bin\java.exe")) {
            $env:JAVA_HOME = $saved
            Write-OK "JAVA_HOME (from .java-home) = $env:JAVA_HOME"
        }
    }
}
if (-not $env:JAVA_HOME -or -not (Test-Path $env:JAVA_HOME)) {
    Write-Warn "JAVA_HOME не установлен. Ищу JDK..."
    # 2. Расширенный список кандидатов (включая нестандартные диски)
    $candidates = @(
        # Android Studio jbr (стандартные пути)
        "$env:LOCALAPPDATA\Programs\Android Studio\jbr",
        "$env:ProgramFiles\Android\Android Studio\jbr",
        "${env:ProgramFiles(x86)}\Android\Android Studio\jbr",
        # Если профиль перенесён на другой диск (D:, E:)
        "$env:USERPROFILE\AppData\Local\Programs\Android Studio\jbr",
        # JDK установленные отдельно
        "$env:LOCALAPPDATA\Programs\Eclipse Adoptium\jdk-17.*",
        "$env:ProgramFiles\Eclipse Adoptium\jdk-17.*",
        "$env:ProgramFiles\Java\jdk-*",
        "$env:ProgramFiles\Microsoft\jdk-*",
        "$env:USERPROFILE\.jdks\*"
    )
    foreach ($cand in $candidates) {
        $resolved = Get-Item $cand -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($resolved -and (Test-Path "$($resolved.FullName)\bin\java.exe")) {
            $env:JAVA_HOME = $resolved.FullName
            Write-OK "JAVA_HOME = $env:JAVA_HOME"
            # Сохраняем для следующих запусков
            $env:JAVA_HOME | Out-File -FilePath $javaHomeFile -Encoding utf8 -NoNewline
            Write-OK "Путь сохранён в .java-home (больше спрашивать не буду)"
            break
        }
    }
    # 3. Если не нашёл — спрашиваем у пользователя
    if (-not $env:JAVA_HOME) {
        Write-Host ""
        Write-Host "  JDK не найден автоматически." -ForegroundColor Yellow
        Write-Host "  Найди папку JDK вручную:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "  Вариант 1: открой Android Studio →" -ForegroundColor Gray
        Write-Host "             File → Project Structure → SDK Location → JDK Location" -ForegroundColor Gray
        Write-Host "             Скопируй путь (обычно заканчивается на \jbr)" -ForegroundColor Gray
        Write-Host ""
        Write-Host "  Вариант 2: найди папку Android Studio и открой в ней подпапку jbr" -ForegroundColor Gray
        Write-Host "             (например D:\Android Studio\jbr)" -ForegroundColor Gray
        Write-Host ""
        $userPath = Read-Host "Введи путь к JDK (или Enter для отмены)"
        if ($userPath -and (Test-Path "$userPath\bin\java.exe")) {
            $env:JAVA_HOME = $userPath
            $env:JAVA_HOME | Out-File -FilePath $javaHomeFile -Encoding utf8 -NoNewline
            Write-OK "JAVA_HOME = $env:JAVA_HOME"
            Write-OK "Путь сохранён в .java-home"
        } elseif ($userPath) {
            Write-Err "В пути нет bin\java.exe — это не JDK. Проверь путь."
            Read-Host "Нажми Enter для выхода"
            exit 1
        } else {
            Write-Err "Сборка отменена. JDK обязателен."
            Read-Host "Нажми Enter для выхода"
            exit 1
        }
    }
}

Push-Location android
try {
    # На Windows — gradlew.bat, на *nix — ./gradlew
    $gradlew = if ($PSVersionTable.Platform -eq "Unix") { "./gradlew" } else { ".\gradlew.bat" }
    & $gradlew assembleDebug
    if ($LASTEXITCODE -ne 0) {
        Write-Err "Сборка не удалась. См. ошибки Gradle выше"
        Pop-Location
        Read-Host "Нажми Enter для выхода"
        exit 1
    }
} finally {
    Pop-Location
}
Write-OK "Сборка завершена"

# 5. Проверка что APK создался
$apkPath = "android\app\build\outputs\apk\debug\app-debug.apk"
if (Test-Path $apkPath) {
    $apkSize = (Get-Item $apkPath).Length
    $apkSizeMB = [math]::Round($apkSize/1MB, 2)
    Write-Host ""
    Write-Host "=========================================" -ForegroundColor Green
    Write-Host "  ✓ APK ГОТОВ" -ForegroundColor Green
    Write-Host "=========================================" -ForegroundColor Green
    Write-Host  "  Путь: $apkPath" -ForegroundColor White
    Write-Host  "  Размер: $apkSizeMB MB" -ForegroundColor White
    Write-Host ""
    Write-Host  "Перекинь app-debug.apk на телефон и установи." -ForegroundColor Gray
    Write-Host  "(Разреши установку из неизвестных источников)" -ForegroundColor Gray

    # Опционально — открыть папку с APK
    $open = Read-Host "Открыть папку с APK? (y/N)"
    if ($open -eq "y" -or $open -eq "Y") {
        explorer.exe (Resolve-Path "android\app\build\outputs\apk\debug")
    }
} else {
    Write-Warn "APK не найден по ожидаемому пути. Поищи в android\app\build\outputs\"
}

Write-Host ""
Read-Host "Готово. Нажми Enter для выхода"
