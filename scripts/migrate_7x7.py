#!/usr/bin/env python3
"""Миграция: убрать alcohol из структуры (s), оставить 7 осей.
Alcohol уже есть в метаданных (abv поле). Структура становится 7/7 с ароматикой.
Также: ключ 'savory' остаётся, но label будет 'Солёность/Минеральность'.
"""
import json

DRINKS_PATH = '/home/z/my-project/sommelier-app/data/drinks.json'

with open(DRINKS_PATH, 'r', encoding='utf-8') as f:
    drinks = json.load(f)

print(f'Было напитков: {len(drinks)}')

removed = 0
for d in drinks:
    if 's' in d and 'alcohol' in d['s']:
        del d['s']['alcohol']
        removed += 1

print(f'Удалено s.alcohol: {removed}')

# Проверим что у всех теперь 7 ключей в s
s_keys_expected = {'acid', 'sweet', 'bitter', 'tannin', 'body', 'carbonation', 'savory'}
ok = 0
bad = []
for d in drinks:
    if 's' in d:
        actual = set(d['s'].keys())
        if actual == s_keys_expected:
            ok += 1
        else:
            bad.append(f"  [{d['id']}] {d['name']}: keys={actual}")

print(f'Корректных (7 ключей): {ok}')
if bad:
    print(f'Проблемных: {len(bad)}')
    for b in bad[:10]:
        print(b)

with open(DRINKS_PATH, 'w', encoding='utf-8') as f:
    json.dump(drinks, f, ensure_ascii=False, indent=2)

print(f'\nСохранено в {DRINKS_PATH}')
print('Структура теперь: s = {acid, sweet, bitter, tannin, body, carbonation, savory} (7 осей)')
