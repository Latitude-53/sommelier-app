# ============================================================
#  Помощник сомелье — установка иконки приложения
#  Запуск: двойной клик по install-icon.bat ИЛИ .\install-icon.ps1
#  Копирует PNG из android-icons/ в android/app/src/main/res/mipmap-*/
# ============================================================

$ErrorActionPreference = "Stop"
function Write-Step($msg) { Write-Host "▶ " -NoNewline -ForegroundColor Cyan; Write-Host $msg }
function Write-OK($msg)   { Write-Host "  ✓ " -NoNewline -ForegroundColor Green; Write-Host $msg }
function Write-Err($msg)  { Write-Host "  ✗ " -NoNewline -ForegroundColor Red; Write-Host $msg }

Write-Host ""
Write-Host "=========================================" -ForegroundColor Yellow
Write-Host "  Установка иконки приложения" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Yellow
Write-Host ""

# Проверки
if (-not (Test-Path "android-icons")) {
    Write-Err "Папка android-icons/ не найдена. Распакуй полный проект."
    Read-Host "Нажми Enter для выхода"
    exit 1
}
$resDir = "android\app\src\main\res"
if (-not (Test-Path $resDir)) {
    Write-Err "Папка $resDir не найдена. Сначала запусти build-apk (он создаст android/)"
    Read-Host "Нажми Enter для выхода"
    exit 1
}

# Маппинг: источник → назначение
$mapping = @{
    "android-icons\ic_launcher-mdpi.png"    = "$resDir\mipmap-mdpi\ic_launcher.png"
    "android-icons\ic_launcher-hdpi.png"    = "$resDir\mipmap-hdpi\ic_launcher.png"
    "android-icons\ic_launcher-xhdpi.png"   = "$resDir\mipmap-xhdpi\ic_launcher.png"
    "android-icons\ic_launcher-xxhdpi.png"  = "$resDir\mipmap-xxhdpi\ic_launcher.png"
    "android-icons\ic_launcher-xxxhdpi.png" = "$resDir\mipmap-xxxhdpi\ic_launcher.png"
}

Write-Step "Копирование иконок в mipmap-папки..."
foreach ($src in $mapping.Keys) {
    $dst = $mapping[$src]
    $dstDir = Split-Path $dst -Parent
    if (-not (Test-Path $dstDir)) { New-Item -ItemType Directory -Path $dstDir -Force | Out-Null }
    Copy-Item $src $dst -Force
    Write-OK "$src → $dst"
}

# Play Store иконка (отдельно, для релиза)
$playIcon = "$resDir\playstore_icon.png"
Copy-Item "android-icons\ic_launcher-playstore.png" $playIcon -Force
Write-OK "Play Store иконка → $playIcon"

# Удаляем старые webp (если были от Android Studio по умолчанию)
Write-Step "Удаление старых webp-иконок..."
Get-ChildItem $resDir -Recurse -Filter "ic_launcher*.webp" | ForEach-Object {
    Remove-Item $_.FullName -Force
    Write-OK "Удалён $($_.FullName)"
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "  ✓ Иконки установлены" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host  "  Теперь запусти build-apk.bat чтобы собрать APK с новой иконкой" -ForegroundColor Gray
Write-Host ""
Read-Host "Нажми Enter для выхода"
