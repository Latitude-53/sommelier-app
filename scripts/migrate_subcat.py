#!/usr/bin/env python3
# coding: utf-8
"""
Миграция: добавляет subcat для ВСЕХ напитков.
- wine/beer/spirit: subcat = cat (уже информативно)
- sake: Junmai / Ginjo / Daiginjo / Nigori
- cider: Французский / Испанский / Английский / Перри
- mead: Традиционная / Melomel
- coffee: Эспрессо / Альтернатива / Молочный / Холодный
- tea: Зелёный / Чёрный / Улун / Пуэр / Белый / Тизан
"""
import json
import os

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data')
DRINKS_PATH = os.path.join(DATA_DIR, 'drinks.json')

with open(DRINKS_PATH, 'r', encoding='utf-8') as f:
    drinks = json.load(f)

print(f'Loaded {len(drinks)} drinks')

# Точный mapping по ID для tea/coffee/sake/cider/mead
SUBCAT_MAP = {
    # SAKE (135-138)
    135: 'Junmai',
    136: 'Ginjo',
    137: 'Daiginjo',
    138: 'Nigori',

    # CIDER (139-142)
    139: 'Французский',
    140: 'Испанский',
    141: 'Английский',
    142: 'Перри (грушевый)',

    # MEAD (143-144)
    143: 'Традиционная',
    144: 'Melomel (фруктовая)',

    # COFFEE (175-182, 203-207)
    175: 'Эспрессо',
    176: 'Альтернатива',
    177: 'Молочный',
    178: 'Молочный',
    179: 'Холодный',
    180: 'Эспрессо',
    181: 'Молочный',
    182: 'Альтернатива',
    203: 'Альтернатива',
    204: 'Эспрессо',
    205: 'Эспрессо',
    206: 'Эспрессо',
    207: 'Холодный',

    # TEA (183-192, 208-212)
    183: 'Зелёный',
    184: 'Чёрный',
    185: 'Улун',
    186: 'Пуэр',
    187: 'Белый',
    188: 'Зелёный',
    189: 'Чёрный',
    190: 'Чёрный',
    191: 'Тизан',
    192: 'Тизан',
    208: 'Чёрный',
    209: 'Зелёный',
    210: 'Улун',
    211: 'Пуэр',
    212: 'Зелёный',
}

changed = 0
for d in drinks:
    if 'subcat' in d:
        continue  # уже есть

    did = d.get('id')
    dtype = d.get('type', '')
    dcat = d.get('cat', '')

    if did in SUBCAT_MAP:
        d['subcat'] = SUBCAT_MAP[did]
    elif dtype in ('wine', 'beer', 'spirit'):
        d['subcat'] = dcat  # cat уже информативен
    else:
        d['subcat'] = dcat  # fallback

    changed += 1

with open(DRINKS_PATH, 'w', encoding='utf-8') as f:
    json.dump(drinks, f, ensure_ascii=False, indent=2)

# Статистика
from collections import Counter
subcats = Counter()
for d in drinks:
    t = d.get('type', '?')
    sc = d.get('subcat', '?')
    subcats[f'{t} → {sc}'] += 1

print(f'\nMigrated {changed} drinks')
print(f'\nSubcat distribution:')
for k, v in sorted(subcats.items()):
    print(f'  {k}: {v}')

print(f'\nWrote {DRINKS_PATH}')
