#!/usr/bin/env python3
"""Добавить оранжевые и натуральные вина в drinks.json."""
import json

DRINKS_PATH = '/home/z/my-project/sommelier-app/data/drinks.json'

with open(DRINKS_PATH, 'r', encoding='utf-8') as f:
    drinks = json.load(f)

print(f'Было напитков: {len(drinks)}')

# Найдём следующий свободный ID
max_id = max(d['id'] for d in drinks)
next_id = max_id + 1

new_orange_natural = [
    {
        'id': next_id,
        'name': 'Оранжевое (УППА, Павел Швец)',
        'type': 'wine',
        'cat': 'Оранжевое (натуральное)',
        'origin': 'Россия, Краснодарский край',
        'abv': '12%',
        'tags': ['айва', 'абрикос', 'орех', 'чай', 'мёд', 'воск'],
        'desc': 'Оранжевое вино от Павла Швеца (винодельня УППА). Белый сорт по красной технологии — мацерация на мезге в амфоре. Янтарный цвет, орехово-восковая текстура, чайные ноты. Биодинамическое.',
        'pair': ['жареная курица', 'пряные блюда', 'грибы', 'хачапури'],
        'temp': '12-14°C',
        'glass': 'Бургундия',
        'cross': [149, 46, 50],
        's': {'acid': 4, 'sweet': 1, 'bitter': 3, 'tannin': 3, 'body': 4, 'alcohol': 3, 'carbonation': 1, 'savory': 4},
        'a': {'fruit': 3, 'floral': 1, 'spice': 1, 'wood_smoke': 1, 'mineral_earth': 3, 'sweet_pastry': 4, 'yeast_ferment': 3},
        'subcat': 'Оранжевое (натуральное)'
    },
    {
        'id': next_id + 1,
        'name': 'Оранжевое (Alma Valley)',
        'type': 'wine',
        'cat': 'Оранжевое (натуральное)',
        'origin': 'Крым',
        'abv': '12.5%',
        'tags': ['айва', 'инжир', 'орех', 'мёд', 'чай', 'земля'],
        'desc': 'Оранжевое вино от Alma Valley — выдержка с мезгой в квеври. Янтарный цвет, глубокий вкус с ореховыми и чайными нотами. Крымский терруар.',
        'pair': ['жареная курица', 'пряные блюда', 'грибы', 'хачапури'],
        'temp': '12-14°C',
        'glass': 'Бургундия',
        'cross': [149, next_id, 46],
        's': {'acid': 4, 'sweet': 1, 'bitter': 3, 'tannin': 3, 'body': 4, 'alcohol': 3, 'carbonation': 1, 'savory': 4},
        'a': {'fruit': 3, 'floral': 1, 'spice': 1, 'wood_smoke': 1, 'mineral_earth': 3, 'sweet_pastry': 4, 'yeast_ferment': 2},
        'subcat': 'Оранжевое (натуральное)'
    },
    {
        'id': next_id + 2,
        'name': 'Рамато (Friuli)',
        'type': 'wine',
        'cat': 'Оранжевое (натуральное)',
        'origin': 'Италия, Фриули',
        'abv': '12.5%',
        'tags': ['айва', 'груша', 'миндаль', 'мёд', 'орех', 'чай'],
        'desc': 'Итальянское оранжевое (ramato) из Пино Гриджио. Короткая мацерация на skins даёт медный оттенок. Орехово-медовый профиль с лёгкой горчинкой. Менее танинное чем грузинское.',
        'pair': ['паста', 'рикотта', 'жареная курица', 'пряные блюда'],
        'temp': '12-14°C',
        'glass': 'Бургундия',
        'cross': [149, next_id, 50],
        's': {'acid': 4, 'sweet': 2, 'bitter': 2, 'tannin': 2, 'body': 4, 'alcohol': 3, 'carbonation': 1, 'savory': 3},
        'a': {'fruit': 4, 'floral': 2, 'spice': 1, 'wood_smoke': 1, 'mineral_earth': 2, 'sweet_pastry': 4, 'yeast_ferment': 2},
        'subcat': 'Оранжевое (натуральное)'
    },
    {
        'id': next_id + 3,
        'name': 'Натуральное (Glou-Glou)',
        'type': 'wine',
        'cat': 'Оранжевое (натуральное)',
        'origin': 'Франция',
        'abv': '11%',
        'tags': ['яблоко', 'шиповник', 'свекла', 'земля', 'брожение'],
        'desc': 'Лёгкое натуральное вино («glou-glou» = «буль-буль», питкое). Низкий алкоголь, дикие дрожжи, без сульфитов. Мутноватое, фруктовое, питкое как сок. Тренд 2020-х.',
        'pair': ['холодные закуски', 'салаты', 'пицца', 'пикник'],
        'temp': '10-12°C',
        'glass': 'Бургундия',
        'cross': [149, next_id, next_id + 1],
        's': {'acid': 5, 'sweet': 2, 'bitter': 2, 'tannin': 2, 'body': 2, 'alcohol': 2, 'carbonation': 1, 'savory': 2},
        'a': {'fruit': 5, 'floral': 3, 'spice': 1, 'wood_smoke': 1, 'mineral_earth': 2, 'sweet_pastry': 2, 'yeast_ferment': 4},
        'subcat': 'Оранжевое (натуральное)'
    },
    {
        'id': next_id + 4,
        'name': 'Натуральное (Pétillant Naturel)',
        'type': 'wine',
        'cat': 'Оранжевое (натуральное)',
        'origin': 'Франция, Луара',
        'abv': '10-11%',
        'tags': ['яблоко', 'груша', 'дрожжи', 'мёд', 'земля', 'брожение'],
        'desc': 'Pét-Nat — петийон натюрель. Игристое по дедовскому методу Ancestral — розлив до конца брожения, пузырьки от остаточной ферментации. Мутное, лёгкое, живое. Натуральное.',
        'pair': ['аперитив', 'холодные закуски', 'салаты', 'пикник'],
        'temp': '8-10°C',
        'glass': 'Бургундия',
        'cross': [1, 2, 149],
        's': {'acid': 5, 'sweet': 3, 'bitter': 1, 'tannin': 1, 'body': 2, 'alcohol': 2, 'carbonation': 4, 'savory': 2},
        'a': {'fruit': 4, 'floral': 2, 'spice': 1, 'wood_smoke': 1, 'mineral_earth': 2, 'sweet_pastry': 3, 'yeast_ferment': 5},
        'subcat': 'Оранжевое (натуральное)'
    },
    {
        'id': next_id + 5,
        'name': 'Оранжевое (Grece, Domaine Glinavos)',
        'type': 'wine',
        'cat': 'Оранжевое (натуральное)',
        'origin': 'Греция, Эпир',
        'abv': '13%',
        'tags': ['айва', 'абрикос', 'орех', 'чай', 'земля', 'мёд'],
        'desc': 'Греческое оранжевое (Debina в амфоре). Сорт Debina мацерируется на skins в амфоре. Элегантнее грузинского, с цветочными нотами. Биодинамическое.',
        'pair': ['жареная курица', 'рыба', 'пряные блюда', 'грибы'],
        'temp': '12-14°C',
        'glass': 'Бургундия',
        'cross': [149, next_id, next_id + 1],
        's': {'acid': 4, 'sweet': 2, 'bitter': 2, 'tannin': 3, 'body': 4, 'alcohol': 3, 'carbonation': 1, 'savory': 3},
        'a': {'fruit': 4, 'floral': 3, 'spice': 1, 'wood_smoke': 1, 'mineral_earth': 3, 'sweet_pastry': 3, 'yeast_ferment': 2},
        'subcat': 'Оранжевое (натуральное)'
    },
    {
        'id': next_id + 6,
        'name': 'Оранжевое (Croatia, Piquentum)',
        'type': 'wine',
        'cat': 'Оранжевое (натуральное)',
        'origin': 'Хорватия, Истрия',
        'abv': '12.5%',
        'tags': ['айва', 'груша', 'орех', 'чай', 'мёд', 'земля'],
        'desc': 'Хорватское оранжевое (Malvasia Istriana в амфоре). Долгая мацерация на skins. Сложный орехово-чайный профиль, минеральность. Истрийский терруар.',
        'pair': ['жареная курица', 'паста', 'грибы', 'пряные блюда'],
        'temp': '12-14°C',
        'glass': 'Бургундия',
        'cross': [149, next_id, next_id + 1],
        's': {'acid': 4, 'sweet': 1, 'bitter': 3, 'tannin': 3, 'body': 4, 'alcohol': 3, 'carbonation': 1, 'savory': 4},
        'a': {'fruit': 3, 'floral': 2, 'spice': 1, 'wood_smoke': 1, 'mineral_earth': 3, 'sweet_pastry': 4, 'yeast_ferment': 2},
        'subcat': 'Оранжевое (натуральное)'
    },
    {
        'id': next_id + 7,
        'name': 'Амфорное (Georgia, Pheasant\'s Tears)',
        'type': 'wine',
        'cat': 'Оранжевое (натуральное)',
        'origin': 'Грузия, Кахетия',
        'abv': '13%',
        'tags': ['айва', 'абрикос', 'орех', 'чай', 'мёд', 'земля', 'воск'],
        'desc': 'Классическое грузинское амфорное вино от Pheasant\'s Tears. Сорт Rkatsiteli в квеври 6 месяцев. Глубокий янтарный цвет, восковая текстура, чайные и ореховые ноты. Эталон стиля.',
        'pair': ['хачапури', 'жареная курица', 'пряные блюда', 'грибы'],
        'temp': '12-14°C',
        'glass': 'Бургундия',
        'cross': [149, next_id, next_id + 1],
        's': {'acid': 4, 'sweet': 1, 'bitter': 3, 'tannin': 4, 'body': 5, 'alcohol': 3, 'carbonation': 1, 'savory': 5},
        'a': {'fruit': 4, 'floral': 1, 'spice': 1, 'wood_smoke': 1, 'mineral_earth': 3, 'sweet_pastry': 4, 'yeast_ferment': 1},
        'subcat': 'Оранжевое (натуральное)'
    }
]

drinks.extend(new_orange_natural)

with open(DRINKS_PATH, 'w', encoding='utf-8') as f:
    json.dump(drinks, f, ensure_ascii=False, indent=2)

print(f'Добавлено: {len(new_orange_natural)}')
print(f'Всего теперь: {len(drinks)}')
print(f'Новые ID: {next_id} - {next_id + len(new_orange_natural) - 1}')

# Перепроверим оранжевые
orange = [d for d in drinks if 'оранжев' in d.get('cat', '').lower() or 'оранжев' in d.get('name', '').lower()]
print(f'\nОранжевых/натуральных вин теперь: {len(orange)}')
for d in orange:
    print(f'  [{d["id"]}] {d["name"]} — {d.get("origin","")}')
