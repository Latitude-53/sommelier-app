# ============================================================
#  Sommelier app — auto-download JDK 17 (Temurin)
#  Run: double-click setup-jdk.bat
#  Downloads JDK to .jdk\ folder, saves path to .java-home
# ============================================================

$ErrorActionPreference = "Stop"
function Write-Step($msg) { Write-Host "[1/4] " -NoNewline -ForegroundColor Cyan; Write-Host $msg }
function Write-OK($msg)   { Write-Host "  OK   " -NoNewline -ForegroundColor Green; Write-Host $msg }
function Write-Err($msg)  { Write-Host "  FAIL " -NoNewline -ForegroundColor Red; Write-Host $msg }

Write-Host ""
Write-Host "=========================================" -ForegroundColor Yellow
Write-Host "  Auto-setup JDK 17 (Temurin)" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Yellow
Write-Host ""

# Если уже есть сохранённый путь и он рабочий — выходим
$javaHomeFile = "$PSScriptRoot\.java-home"
if (Test-Path $javaHomeFile) {
    $saved = (Get-Content $javaHomeFile -ErrorAction SilentlyContinue | Select-Object -First 1).Trim()
    if ($saved -and (Test-Path "$saved\bin\java.exe")) {
        Write-OK "JDK уже установлен: $saved"
        Write-Host "  Если хочешь переустановить — удали файл .java-home" -ForegroundColor Gray
        Read-Host "Нажми Enter для выхода"
        exit 0
    }
}

# Архитектура x64
$arch = "x64"
Write-Step "Платформа: Windows $arch"

# URL темурин JDK 17 (стабильная LTS версия)
# Используем API Eclipse Adoptium — выдаёт последний стабильный билд
$apiUrl = "https://api.adoptium.net/v3/binary/latest/17/ga/windows/$arch/jdk/hotspot/normal/eclipse"

# Папка для JDK
$jdkRoot = "$PSScriptRoot\.jdk"
if (-not (Test-Path $jdkRoot)) { New-Item -ItemType Directory -Path $jdkRoot -Force | Out-Null }

$zipPath = "$jdkRoot\jdk.zip"

Write-Step "Скачивание JDK 17 (Temurin)..."
Write-Host "  URL: $apiUrl" -ForegroundColor Gray
Write-Host "  Это ~190 MB, может занять 2-5 минут в зависимости от сети" -ForegroundColor Gray
Write-Host ""

try {
    # Прогресс-бар
    $ProgressPreference = "Continue"
    Invoke-WebRequest -Uri $apiUrl -OutFile $zipPath -UseBasicParsing
    $ProgressPreference = "SilentlyContinue"
    $size = [math]::Round((Get-Item $zipPath).Length / 1MB, 1)
    Write-OK "Скачано: $size MB"
} catch {
    Write-Err "Не удалось скачать JDK"
    Write-Host "  Причина: $($_.Exception.Message)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  Альтернатива — скачай вручную:" -ForegroundColor Yellow
    Write-Host "  1. Открой https://adoptium.net/temurin/releases/?version=17" -ForegroundColor Gray
    Write-Host "  2. Выбери: Windows x64, .zip" -ForegroundColor Gray
    Write-Host "  3. Скачай, распакуй в папку .jdk\" -ForegroundColor Gray
    Write-Host "  4. В файл .java-home впиши путь к распакованной папке" -ForegroundColor Gray
    Read-Host "Нажми Enter для выхода"
    exit 1
}

Write-Step "Распаковка..."
try {
    Expand-Archive -Path $zipPath -DestinationPath $jdkRoot -Force
    Remove-Item $zipPath -Force
    Write-OK "Распаковано в $jdkRoot"
} catch {
    Write-Err "Не удалось распаковать: $($_.Exception.Message)"
    Read-Host "Нажми Enter для выхода"
    exit 1
}

# Найти папку с java.exe (обычно .jdk\jdk-17.0.x+y\)
Write-Step "Поиск java.exe..."
$jdkDir = Get-ChildItem $jdkRoot -Directory | Where-Object { Test-Path "$($_.FullName)\bin\java.exe" } | Select-Object -First 1
if (-not $jdkDir) {
    Write-Err "В распакованном архиве нет bin\java.exe"
    Write-Host "  Проверь содержимое .jdk\ и удали нерабочее" -ForegroundColor Gray
    Read-Host "Нажми Enter для выхода"
    exit 1
}
$jdkHome = $jdkDir.FullName
Write-OK "JDK найден: $jdkHome"

# Проверка что java работает
# java -version выводит в stderr (это нормально для native CLI),
# поэтому временно отключаем Stop-on-error
Write-Step "Проверка java -version..."
$ErrorActionPreference = "Continue"
$javaVersion = & "$jdkHome\bin\java.exe" -version 2>&1 | Select-Object -First 1
$ErrorActionPreference = "Stop"
Write-OK "Java: $javaVersion"

# Сохраняем путь
$jdkHome | Out-File -FilePath $javaHomeFile -Encoding utf8 -NoNewline
Write-OK "Путь сохранён в .java-home"

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "  JDK установлен и готов!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Теперь запусти build-apk.bat — сборка должна работать." -ForegroundColor Gray
Write-Host ""
Read-Host "Нажми Enter для выхода"
