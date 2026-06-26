# Design System — Помощник сомелье

Документ описывает визуальный язык приложения: цвета, типографику, компоненты, анимации. Все изменения UI должны следовать этим правилам для консистентности.

## 1. Цветовая палитра

### Тёмная тема (default)
```css
--bg: #1a1410          /* основной фон — глубокий тёмно-коричневый */
--bg-2: #221a14        /* вторичный фон */
--card: #2a2018        /* карточки */
--card-2: #322620      /* вложенные элементы */
--border: #3d2f24      /* границы */
--text: #f5e6d3        /* основной текст — тёплый кремовый */
--text-dim: #b8a08a    /* вторичный текст */
--text-mute: #7a6a5a   /* подсказки, метаданные */
--gold: #c9a55c        /* акцент — золото (бренд) */
--gold-dim: #8a7440    /* затемнённое золото для активных состояний */
```

### Светлая тема
```css
--bg: #f5f0e8          /* тёплый кремовый фон */
--card: #ffffff        /* белые карточки */
--text: #1a1410        /* тёмный текст */
--gold: #b8923a        /* более насыщенное золото для контраста */
```

### Цвета по типам напитков
| Тип | HEX | Назначение |
|------|-----|------------|
| wine | `#a8484a` | Вино |
| beer | `#d4a574` | Пиво |
| spirit | `#5a8a8a` | Крепкое |
| sake | `#e8c8a8` | Саке |
| cider | `#b8d4a8` | Сидр |
| mead | `#d4b85a` | Медовуха |
| coffee | `#8a6a4a` | Кофе |
| tea | `#8a9a5a` | Чай |

### Цвета вкусовых параметров
| Параметр | HEX |
|----------|-----|
| acid (кислотность) | `#c9b04a` |
| sweet (сладость) | `#d47b6a` |
| bitter (горечь) | `#7a8a4a` |
| tannin (танины) | `#9a5a6a` |
| savory (умами) | `#8a6a9a` |

## 2. Типографика

```css
body: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif
headings (h1, h2, h3, .serif): Georgia, "Times New Roman", serif
```

### Размеры
| Элемент | Размер | Вес |
|---------|--------|-----|
| h1 (заголовок приложения) | 17px | 600 |
| h2 (модалка) | 22px | 600 |
| h3 (секции вкладки) | 18px | 600 |
| Основной текст | 16px | 400 |
| Карточки/напитки | 13px | 400-600 |
| Метаданные | 11px | 400 |
| Подсказки | 10px | 400 |
| Лейблы uppercase | 11px | 700, letter-spacing 0.1em |

## 3. Компоненты

### Card
```css
.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 12px;
}
```

### Кнопки
- **Primary** (`.restart-btn`): full-width, padding 12px 20px, radius 12px, background card, border
- **Gold** (highlight): `background: var(--gold-dim); border-color: var(--gold); color: var(--text); font-weight: 600`
- **Filter chip**: radius 16px, padding 6px 12px, font 12px. Active: `background: var(--gold-dim); border-color: var(--gold)`

### Segmented Control
Используется для: theme/lang (настройки), classic/math (pairing), blocks/links/list (по ноте).
```css
.pairing-tabs, .settings-segmented {
  display: flex;
  background: var(--bg-2);
  border-radius: 10px;
  padding: 3px;
  border: 1px solid var(--border);
}
.seg-btn.active, .pairing-tab.active {
  background: var(--gold-dim);
  color: var(--text);
}
```

### iOS Switch (toggle)
```css
.switch { width: 46px; height: 26px; }
.switch input:checked + .slider { background: var(--gold); }
.switch input:checked + .slider::before { transform: translateX(20px); }
```

### Profile pill
Маленький бейдж для вкусового параметра: `font-size: 11px; background: var(--card-2); padding: 2px 8px; border-radius: 10px`. Strong (значение ≥4): `color: var(--gold); border-color: var(--gold-dim)`.

## 4. Анимации

| Имя | Длительность | Easing | Назначение |
|-----|--------------|--------|------------|
| `fadeIn` | 0.25s | ease | Появление view при переключении |
| `slideUp` | 0.3s | ease | Появление новых карточек |
| `bounce-in` | 0.5s | cubic-bezier(0.34, 1.56, 0.64, 1) | Reveal в слепой |
| `pulse-gold` | 1.5s | ease infinite | Важные кнопки |
| `scorePulse` | 0.6s | cubic-bezier(0.34, 1.56, 0.64, 1) | Анимация счёта |

**Правило**: анимации ≤0.3s для UI-откликов, 0.4-0.6s для celebratory moments. Никаких анимаций дольше 1s кроме pulse (loop).

## 5. Haptic feedback

Все тапы дают `haptic('light')`. Важные события:
- Правильный ответ в слепой → `haptic('success')` + `playSound('celebrate')`
- Неправильный → `haptic('warning')` + `playSound('error')`
- Свайп к краю → `haptic('warning')` (нельзя дальше)

Уважает настройку `settings.haptic` (по умолчанию ON).

## 6. Звуки (Web Audio API)

Только если `settings.sound === true`. Никаких внешних файлов — всё генерируется осцилляторами.

| Sound | Параметры | Когда |
|-------|-----------|-------|
| `tap` | sine 800Hz, 60ms | Включение звука в настройках |
| `pop` | sine 400→800Hz, 80ms | Find similar, reveal в слепой (не угадал) |
| `success` | C5→E5→G5 arpeggio | Find similar, квиз |
| `celebrate` | C5→E5→G5→C6 triangle | Угадал напиток в слепой |
| `error` | square 220→110Hz | Неправильный ответ |

## 7. Иконка приложения

SVG: `android-icon.svg`. Концепт — бокал вина в центре вкусового радара (8 золотых точек-вершин соединены в многоугольник).

PNG-версии (6 размеров) в `android-icons/`:
- `ic_launcher-mdpi.png` (48×48)
- `ic_launcher-hdpi.png` (72×72)
- `ic_launcher-xhdpi.png` (96×96)
- `ic_launcher-xxhdpi.png` (144×144)
- `ic_launcher-xxxhdpi.png` (192×192)
- `ic_launcher-playstore.png` (512×512, для Google Play)

### Установка в Android
Скопировать в `android/app/src/main/res/mipmap-{density}/ic_launcher.png` (перед `cap sync`), либо использовать через adaptive icon (`res/mipmap-anydpi-v26/ic_launcher.xml`).

## 8. Принципы UI

1. **Mobile-first**: всё укладывается в 390px, никаких desktop-layouts
2. **Touch target ≥44px**: кнопки и тапабельные элементы минимум 44×44px
3. **Safe-area**: header учитывает `env(safe-area-inset-top)` для вырезов
4. **Single-column**: контент в одной колонке, никаких multi-column grids на мобильном
5. **Progressive disclosure**: сложные опции (сортировка, фильтры) скрыты, доступны по тапу
6. **Offline-first**: 0 внешних запросов, всё встроено в HTML

## 9. Шрифтовые размеры для radar canvas

```js
font: '9px sans-serif'   // level numbers на радаре
font: '10px sans-serif'  // labels осей
font: '11px sans-serif'  // legend
font: 'bold 10px sans-serif' // active label
font: 'bold 11px sans-serif' // value в точке (drag/hover)
```

## 10. Чеклист перед коммитом UI-изменений

- [ ] Работает в тёмной и светлой теме
- [ ] Не ломается на 360px ширине (маленькие Android)
- [ ] Touch targets ≥44px
- [ ] Haptic на тапах
- [ ] Нет горизонтального скролла
- [ ] Modal закрывается по back button
- [ ] Анимации не дольше 0.6s (кроме pulse)
- [ ] Текст читаем (контраст ≥4.5:1 для основного текста)
