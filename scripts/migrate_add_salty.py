#!/usr/bin/env python3
# coding: utf-8
"""
Миграция: добавляет salty параметр ко всем напиткам на основе тегов.
Скорректирует umami: убирает соль/минералы, оставляет грибы/орехи/дрожжи.

Логика:
- salt_tags (высокая солёность): 'морская соль', 'соль', 'солёный', 'рассол', 'brine', 'added-salt'
- mineral_tags (минеральность, средняя salty): 'минерал', 'мел', 'мокрый камень', 'кремень', 'сланец', 'графит', 'гранит', 'камень', 'меловой', 'меловая пыль', 'мокрый камень'
- umami_tags (остаются в umami): 'грибы', 'дрожжи', 'орех', 'кожа', 'табак', 'земля', 'трюфель', 'умами', 'гриб', 'землистый', 'лес', 'выдержка', 'соевый соус'

Алгоритм:
1. Для каждого напитка считаем salt_score = макс(значение по тегам)
2. Корректируем umami: если umami был высоким из-за salt/mineral тегов — снижаем
3. Добавляем поле p.salty = salt_score
"""
import json
import os
import re

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data')
DRINKS_PATH = os.path.join(DATA_DIR, 'drinks.json')

# Теги, которые указывают на солёность (salty)
SALT_TAGS = {
    'морская соль': 5,
    'соль': 5,
    'солёный': 5,
    'рассол': 4,
    'brine': 4,
    'added-salt': 5,
    'соленья': 4,
}

# Теги, которые указывают на минеральность (salty, но мягче)
MINERAL_TAGS = {
    'минерал': 4,
    'минеральный': 4,
    'мел': 4,
    'меловой': 4,
    'меловая пыль': 4,
    'мокрый камень': 4,
    'кремень': 4,
    'сланец': 4,
    'графит': 3,
    'гранит': 3,
    'камень': 3,
    'камфорa': 2,  # опечатка в базе, оставим
    'камфора': 2,
    'морская соль': 5,  # дублируем для надёжности
}

# Теги, которые остаются в umami
UMAMI_TAGS = {
    'грибы', 'гриб', 'грибной', 'землистый', 'земля', 'лес', 'лесная подстилка',
    'дрожжи', 'дрожжевой', 'хлеб', 'бриошь', 'выпечка', 'тёплый хлеб', 'свежий хлеб',
    'орех', 'ореховый', 'миндаль', 'фундук', 'грецкий орех', 'орешник', 'каштан',
    'кожа', 'табак', 'трюфель', 'соевый соус', 'умами',
    'тёмные ягоды',  # иногда умами
    'выдержка', 'выдержанный',
    'воскоподобный', 'воск',
}

# Тег -> удаляется из umami考量 при корректировке (если был только salt/mineral)
def compute_salty(drink):
    """Вычисляет salty (1-5) на основе тегов и текущего umami."""
    tags = drink.get('tags', [])
    tag_set = set(t.lower().strip() for t in tags)

    salt_score = 1  # базовое значение

    # Проверяем salt теги
    for tag, val in SALT_TAGS.items():
        if tag in tag_set:
            salt_score = max(salt_score, val)

    # Проверяем mineral теги
    for tag, val in MINERAL_TAGS.items():
        if tag in tag_set:
            salt_score = max(salt_score, val)

    # Если у напитка высокий umami и есть соль-теги — часть переносим в salty
    current_umami = drink.get('p', {}).get('umami', 1)
    if salt_score >= 4 and current_umami >= 4:
        # Был высокий umami из-за соли — оставим umami поменьше
        pass  # корректировка ниже

    return min(5, salt_score)


def adjust_umami(drink, new_salty):
    """Корректирует umami: убирает "солевую" часть, оставляет грибно-ореховую."""
    tags = drink.get('tags', [])
    tag_set = set(t.lower().strip() for t in tags)

    current_umami = drink.get('p', {}).get('umami', 1)

    # Есть ли настоящие umami-теги (грибы, орехи, дрожжи)?
    has_real_umami = any(tag in tag_set for tag in UMAMI_TAGS)

    # Если salty высокий (4-5) и нет настоящих umami тегов
    # — значит umami был завышен из-за соли/минералов, снижаем
    if new_salty >= 4 and not has_real_umami:
        # Снижаем umami на 1-2
        new_umami = max(1, current_umami - 2)
    elif new_salty >= 4 and has_real_umami:
        # Снижаем umami на 1
        new_umami = max(1, current_umami - 1)
    elif new_salty >= 3 and not has_real_umami:
        # Минеральность без umami — слегка снижаем
        new_umami = max(1, current_umami - 1)
    else:
        new_umami = current_umami

    return new_umami


def migrate():
    with open(DRINKS_PATH, 'r', encoding='utf-8') as f:
        drinks = json.load(f)

    print(f'Loaded {len(drinks)} drinks')

    changes = 0
    for drink in drinks:
        if 'p' not in drink:
            continue
        p = drink['p']
        if 'salty' in p:
            continue  # уже мигрирован

        new_salty = compute_salty(drink)
        new_umami = adjust_umami(drink, new_salty)

        old_umami = p.get('umami', 1)
        p['salty'] = new_salty
        if new_umami != old_umami:
            p['umami'] = new_umami

        if new_salty != 1 or new_umami != old_umami:
            changes += 1
            print(f'  {drink["id"]}. {drink["name"][:40]:<40} umami: {old_umami}→{new_umami}, salty: {new_salty}')

    with open(DRINKS_PATH, 'w', encoding='utf-8') as f:
        json.dump(drinks, f, ensure_ascii=False, indent=2)

    print(f'\nMigrated {changes} drinks (out of {len(drinks)})')
    print(f'Wrote {DRINKS_PATH}')


if __name__ == '__main__':
    migrate()
