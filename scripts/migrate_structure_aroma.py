#!/usr/bin/env python3
# coding: utf-8
"""
Фундаментальная миграция: разделяет Структуру (вкус/осязание) и Ароматику (обоняние).

СТАРАЯ СТРУКТУРА (p): acid, sweet, bitter, tannin, body, umami, salty
НОВАЯ СТРУКТУРА:
  s (structure 1-5) — то, что чувствует язык:
    acid, sweet, bitter, tannin, body, alcohol, carbonation, savory
  a (aroma 0-5) — кластеры обоняния:
    fruit, floral, spice, wood_smoke, mineral_earth, sweet_pastry, yeast_ferment
"""
import json
import os
import re

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data')
DRINKS_PATH = os.path.join(DATA_DIR, 'drinks.json')

# ============== AROMA CLUSTERS (тег → кластер) ==============
# Каждый тег относится к одному или нескольким кластерам
AROMA_CLUSTERS = {
    'fruit': {
        'name': 'Фруктовые / Ягодные',
        'tags': {
            'цитрус', 'лимон', 'лайм', 'грейпфрут', 'апельсин', 'апельсиновая цедра', 'юдзу', 'бергамот',
            'яблоко', 'зелёное яблоко', 'груша', 'айва', 'персик', 'абрикос', 'манго', 'маракуйя', 'ананас', 'тропики', 'тропики',
            'вишня', 'слива', 'ежевика', 'малина', 'клубника', 'земляника', 'красные ягоды', 'тёмные ягоды',
            'клюква', 'чёрная смородина', 'красная смородина', 'крыжовник',
            'изюм', 'чернослив', 'сухофрукты', 'цукаты', 'инжир',
            'фрукты', 'фруктовый', 'фруктовый леденец', 'ягоды', 'ягодное варенье',
            'т cable',  # опечатка, исправим
            'мармелад', 'джем', 'варенье',
        }
    },
    'floral': {
        'name': 'Цветочные / Травяные',
        'tags': {
            'роза', 'цветы', 'фиалка', 'орхидея', 'флердоранж', 'липы',
            'мята', 'ментол', 'трава', 'травы', 'свежесть', 'холодок',
            'крапива', 'укроп', 'фенхель',  # фенхель может быть и spice
            'прованские травы', 'травяной', 'листья',
            'вереск', 'ромашка', 'липовый цвет',
            'можжевельник',  # джин
            'хмель', 'хвоя', 'смола',
        }
    },
    'spice': {
        'name': 'Пряные / Специи',
        'tags': {
            'перец', 'чёрный перец', 'белый перец', 'зелёный перец', 'красный перец', 'пряности',
            'корица', 'гвоздика', 'анис', 'звёздочный анис', 'бадьян',
            'кардамон', 'имбирь', 'мускат', 'шафран', 'куркума',
            'специи', 'пряный', 'острый',
            'тмин', 'корриандр', 'кумин',
        }
    },
    'wood_smoke': {
        'name': 'Древесные / Дымные',
        'tags': {
            'дуб', 'древесина', 'ваниль', 'кедр', 'графит',
            'торф', 'дым', 'дымок', 'копчёное', 'копчёности', 'костёр',
            'табак', 'сигара', 'кожа', 'седло',
            'кофе', 'эспрессо', 'какао', 'шоколад', 'тёмный шоколад', 'горький шоколад',
            'жжёный', 'жжёный сахар', 'обжарка', 'обжарочный',
            'дёготь', 'уголь', 'смолы', 'смолистый',
            'трюфель',
        }
    },
    'mineral_earth': {
        'name': 'Минеральные / Земляные',
        'tags': {
            'минерал', 'минеральный', 'минеральность',
            'мел', 'меловой', 'меловая пыль', 'мокрый камень', 'кремень', 'сланец', 'гранит', 'камень',
            'морская соль', 'соль', 'солёный', 'йод', 'морская вода', 'океан',
            'земля', 'землистый', 'грибы', 'гриб', 'грибной', 'лес', 'лесная подстилка',
            'humus', 'гумус', 'почва',
            'камфорa', 'камфора',
        }
    },
    'sweet_pastry': {
        'name': 'Сладкие / Кондитерские',
        'tags': {
            'мёд', 'медовый', 'медовая',
            'карамель', 'ирис', 'toffee', 'жжёный сахар', 'патока', 'меласса',
            'сливочное масло', 'масло', 'сливки', 'сливочный',
            'выпечка', 'бриошь', 'тёплый хлеб', 'печение', 'печёное',
            'ваниль',  # ваниль — спорно, но чаще в sweet_pastry
            'сахар', 'сахарный',
            'молоко', 'молочная',  # может быть и yeast
            'сливочная карамель', 'сгущёнка', 'дульче-лече', 'молочная карамель',
            'кокос', 'орех', 'миндаль', 'фундук', 'грецкий орех', 'орешник', 'каштан', 'пралине', 'ореховая паста',
            'марципан',
        }
    },
    'yeast_ferment': {
        'name': 'Дрожжевые / Ферментативные',
        'tags': {
            'дрожжи', 'дрожжевой', 'хлеб', 'свежий хлеб', 'солод',
            'сыр', 'прелое яблоко', 'брожение',
            'молочная', 'кефир', 'йогурт', 'творог', 'crème fraîche',
            'уксус', 'уксусная', 'бальзамическая',
            'соевый соус',  # умами, но ферментативный
            ' Brett', 'brett', 'Brettanomyces',
            'сено', 'лошадь',
            'рассол', 'оливки', 'соленья',
        }
    }
}

# ============== STRUCTURE: alcohol & carbonation ==============
def parse_abv(abv_str):
    """Парсит ABV строку и возвращает число (максимальное если диапазон)."""
    if not abv_str:
        return 0
    # Ищем числа, берём максимальное (для диапазонов типа "13-14%")
    nums = re.findall(r'(\d+\.?\d*)', abv_str.replace(',', '.'))
    if not nums:
        return 0
    return max(float(n) for n in nums)

def abv_to_alcohol(abv):
    """ABV → alcohol (1-5)."""
    if abv <= 0:
        return 1  # безалкогольное (кофе/чай) — 1, не 0
    if abv <= 5:
        return 1
    if abv <= 10:
        return 2
    if abv <= 15:
        return 3
    if abv <= 25:
        return 4
    return 5

def drink_to_carbonation(drink):
    """Категория/тип → carbonation (1-5)."""
    cat = (drink.get('cat') or '').lower()
    type_ = drink.get('type', '')
    name = (drink.get('name') or '').lower()

    # Игристое вино
    if 'игрист' in cat or 'шампанск' in cat:
        return 5
    # Пет-нат
    if 'пет-нат' in name or 'pet-nat' in name:
        return 4
    # Ламбик/гез — слабая газация
    if 'ламбик' in name or 'lambic' in name or 'gueuze' in name.lower() or 'гез' in name or 'kriek' in name.lower() or 'framboise' in name.lower():
        return 3
    # Пиво — средняя/высокая
    if type_ == 'beer':
        if 'британск' in name or 'cask' in name or 'mild' in name.lower() or 'bitter' in name.lower():
            return 2  # английские cask ales — низкая
        return 4
    # Сидр
    if type_ == 'cider':
        if 'французск' in name or 'normandie' in name.lower():
            return 4
        return 3
    # Саке — тихое
    if type_ == 'sake':
        return 1
    # Кофе/чай — тихое
    if type_ in ('coffee', 'tea'):
        return 1
    # Крепкое — тихое
    if type_ == 'spirit':
        return 1
    # Медовуха — может быть игристой, но обычно тихая
    if type_ == 'mead':
        return 1
    # Вино тихое
    return 1

def old_to_savory(p):
    """Объединяет umami + salty в savory (1-5)."""
    umami = p.get('umami', 1)
    salty = p.get('salty', 1)
    # Берём максимум, но не больше 5
    return min(5, max(umami, salty))

# ============== MIGRATION ==============
def compute_aroma(drink):
    """Вычисляет aroma-кластеры (0-5) из тегов."""
    tags = drink.get('tags', [])
    tag_set = set(t.lower().strip() for t in tags)

    aroma = {}
    for cluster_id, cluster in AROMA_CLUSTERS.items():
        cluster_tags = cluster['tags']
        # Считаем сколько тегов из этого кластера есть у напитка
        matches = sum(1 for t in tag_set if t in cluster_tags)
        if matches == 0:
            aroma[cluster_id] = 1  # базовое значение (не 0, чтобы радар не выглядел пустым)
        elif matches == 1:
            aroma[cluster_id] = 3
        elif matches == 2:
            aroma[cluster_id] = 4
        else:  # 3+
            aroma[cluster_id] = 5

    return aroma

def migrate():
    with open(DRINKS_PATH, 'r', encoding='utf-8') as f:
        drinks = json.load(f)

    print(f'Loaded {len(drinks)} drinks')

    migrated = 0
    for drink in drinks:
        if 's' in drink and 'a' in drink:
            continue  # уже мигрирован

        p = drink.get('p', {})
        abv = parse_abv(drink.get('abv', ''))

        # Structure
        s = {
            'acid': p.get('acid', 1),
            'sweet': p.get('sweet', 1),
            'bitter': p.get('bitter', 1),
            'tannin': p.get('tannin', 1),
            'body': p.get('body', 1),
            'alcohol': abv_to_alcohol(abv),
            'carbonation': drink_to_carbonation(drink),
            'savory': old_to_savory(p),
        }

        # Aroma
        a = compute_aroma(drink)

        drink['s'] = s
        drink['a'] = a
        # Удаляем старое p
        if 'p' in drink:
            del drink['p']

        migrated += 1

    with open(DRINKS_PATH, 'w', encoding='utf-8') as f:
        json.dump(drinks, f, ensure_ascii=False, indent=2)

    print(f'\nMigrated {migrated} drinks')
    print(f'\nПримеры:')
    for d in drinks[:3]:
        print(f'  {d["name"][:40]}')
        print(f'    s: {d["s"]}')
        print(f'    a: {d["a"]}')
    print(f'\nWrote {DRINKS_PATH}')

if __name__ == '__main__':
    migrate()
