#!/usr/bin/env python3
# coding: utf-8
"""
Нормализовать названия напитков: Русское название (English).
Удалить дубликаты (Pisco 248 == 121, Blaufränkisch 246 оставляем как отдельное сладкое).
Добавить новые напитки: Негроамаро и др.
"""
import json, os

DRINKS_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'drinks.json')

with open(DRINKS_PATH, 'r', encoding='utf-8') as f:
    drinks = json.load(f)

print(f'Loaded {len(drinks)} drinks')

# 1. Rename English-only names to Russian (English)
RENAMES = {
    26: 'Рислинг TBA (Trockenbeerenauslese)',
    66: 'Доппельбок (Doppelbock)',
    68: 'Альтбир (Altbier)',
    70: 'Вайценбок (Weizenbock)',
    77: 'APA (American Pale Ale)',
    78: 'IPA (American West Coast)',
    79: 'NEIPA / Hazy IPA',
    80: 'Блэк IPA (Black IPA / Cascadian Dark)',
    81: 'Английский битер (English Bitter, cask)',
    82: 'ESB (Extra Special Bitter)',
    83: 'Английский браун эль (English Brown Ale)',
    84: 'Английский майлд (English Mild)',
    85: 'Барливайн (Barleywine, English)',
    86: 'Олд эль (Old Ale)',
    88: 'Молочный стаут (Milk Stout / Sweet Stout)',
    89: 'Овсяной стаут (Oatmeal Stout)',
    90: 'Имперский русский стаут (Imperial Russian Stout)',
    91: 'Пейстри стаут (Pastry Stout)',
    96: 'Гёз (Gueuze)',
    99: 'Фландрийский красный эль (Rodenbach)',
    105: 'Односолодовый скотч Спейсайд (Speyside)',
    106: 'Односолодовый скотч Хайленд (Highland)',
    107: 'Односолодовый скотч Айла, торфяной (Islay)',
    108: 'Бурбон (Bourbon, Kentucky)',
    109: 'Ржаной виски американский (Rye Whiskey)',
    110: 'Японский виски (Japanese Whisky)',
    112: 'Теннессийский виски (Tennessee Whiskey)',
    113: 'Канадский ржаной виски (Rye Whisky, Canadian)',
    114: 'Американский односолодовый виски (American Single Malt)',
    120: 'Бренди де Херес (Brandy de Jerez)',
    122: 'Эпплджек / яблочный бренди (Applejack)',
    123: 'Белый ром (White Rum, Puerto Rico)',
    125: 'Ямайский ром (Jamaican Rum, high ester)',
    126: 'Ром агриколь (Rhum Agricole, Martinique)',
    127: 'Лондонский сухой джин (London Dry Gin)',
    128: 'Плимутский джин (Plymouth Gin)',
    129: 'Олд Том джин (Old Tom Gin)',
    130: 'Современный джин (Contemporary / New Western)',
    131: 'Текила Бланко (Tequila Blanco, 100% агава)',
    132: 'Текила Репосадо (Tequila Reposado)',
    133: 'Текила Аньехо (Tequila Añejo)',
    153: 'Ламбруско (Lambrusco, Emilia)',
    154: 'Соаве Классико (Soave Classico, Garganega)',
    160: 'Пейстри сауэр (Pastry Sour / Fruited Sour)',
    161: 'Хэйзи DIPA (Double NEIPA)',
    162: 'Дикий эль (Wild Ale, mixed fermentation)',
    163: 'Бочковой стаут (Barrel-Aged Stout)',
    164: 'Фруктовая гозе (Gose with Fruit, Modern)',
    165: 'Односолодовый скотч Кэмпбелтаун (Campbeltown)',
    166: 'Японский купажированный виски (Suntory Hibiki)',
    167: 'Ирландский пот стилл виски (Irish Pot Still)',
    168: 'Индийский односолодовый виски (Amrut)',
    181: 'Флэт уайт (Flat White)',
    207: 'Аффогато (Affogato)',
    218: 'Вермут Россо (Carpano Antica)',
    219: 'Кампари (Campari)',
    220: 'Апероль (Aperol)',
    222: 'Лилле Блан (Lillet, Bordeaux)',
    234: 'Чемекс (Chemex)',
    236: 'Кортадо (Cortado)',
    238: 'Кентукки коммон (Kentucky Common)',
    239: 'Австралийский спарклинг эль (Australian Sparkling Ale)',
    244: 'Этна Россо (Nerello Mascalese, Etna)',
    246: 'Блауфранкиш аусбрух, сладкое (Blaufränkisch Ausbruch)',
    247: 'Коньяк Наполеон (Cognac Napoleon)',
    248: 'Писко ачоладо (Pisco Acholado)',
}

for d in drinks:
    if d['id'] in RENAMES:
        old = d['name']
        d['name'] = RENAMES[d['id']]
        if old != d['name']:
            print(f'  {d["id"]}. {old} → {d["name"]}')

# 2. Remove duplicates (keep the one with more info / earlier ID)
# 248 Pisco Acholado == 121 Pisco — remove 248
remove_ids = {248}
drinks = [d for d in drinks if d['id'] not in remove_ids]
print(f'Removed {len(remove_ids)} duplicates')

# 3. Add new drinks
max_id = max(d['id'] for d in drinks)
new_drinks = [
    {"id": max_id+1, "name": "Негроамаро (Negroamaro, Апулия)", "type": "wine", "cat": "Красное сухое", "subcat": "Красное сухое",
     "origin": "Италия, Апулия", "abv": "13-14%",
     "s": {"acid":3,"sweet":1,"bitter":3,"tannin":4,"body":4,"alcohol":3,"carbonation":1,"savory":4},
     "a": {"fruit":3,"floral":1,"spice":2,"wood_smoke":3,"mineral_earth":4,"sweet_pastry":2,"yeast_ferment":2},
     "tags": ["ежевика","слива","земля","кожа","перец","тёмный шоколад"],
     "desc": "Южноитальянский сорт из Апулии. Тёмное, землистое, с горьковато-сладким послевкусием (имя означает 'чёрный и горький'). Ежевика, слива, кожа, перец. Мягкие танины. Питкое, но с характером.",
     "pair": ["паста","пицца","барбекю","мясо"], "temp": "16-18°C", "glass": "Бордо", "cross": [41,42]},

    {"id": max_id+2, "name": "Неро д'Авола (Nero d'Avola, классика)", "type": "wine", "cat": "Красное сухое", "subcat": "Красное сухое",
     "origin": "Италия, Сицилия", "abv": "13-14%",
     "s": {"acid":3,"sweet":2,"bitter":2,"tannin":3,"body":4,"alcohol":3,"carbonation":1,"savory":2},
     "a": {"fruit":5,"floral":1,"spice":2,"wood_smoke":2,"mineral_earth":2,"sweet_pastry":2,"yeast_ferment":1},
     "tags": ["слива","ежевика","перец","табак","земля","вишня"],
     "desc": "Самый посевной красный сорт Сицилии. Спелое, тёплое, фруктовое. Слива, чёрный перец, табак. Мягкие танины. Понятное, питкое. Доступное.",
     "pair": ["барбекю","паста","пицца","стейк"], "temp": "16-18°C", "glass": "Бордо", "cross": [155,42]},

    {"id": max_id+3, "name": "Дольчетто (Dolcetto, Пьемонт)", "type": "wine", "cat": "Красное сухое", "subcat": "Красное сухое",
     "origin": "Италия, Пьемонт", "abv": "11.5-13%",
     "s": {"acid":3,"sweet":2,"bitter":3,"tannin":3,"body":3,"alcohol":2,"carbonation":1,"savory":2},
     "a": {"fruit":4,"floral":2,"spice":2,"wood_smoke":2,"mineral_earth":2,"sweet_pastry":2,"yeast_ferment":1},
     "tags": ["вишня","слива","фиалка","миндаль","горький шоколад"],
     "desc": "Пьемонтский сорт для раннего питья. Вишня, слива, фиалка. Низкая кислотность (для итальянцев), горьковатое миндальное послевкусие. Пьётся пока Бароло зреет.",
     "pair": ["паста","пицца","колбасы","сэндвичи"], "temp": "15-17°C", "glass": "Бургундия", "cross": [36,35]},

    {"id": max_id+4, "name": "Терольдего (Teroldego, Трентино)", "type": "wine", "cat": "Красное сухое", "subcat": "Красное сухое",
     "origin": "Италия, Трентино", "abv": "12.5-14%",
     "s": {"acid":4,"sweet":1,"bitter":3,"tannin":4,"body":4,"alcohol":3,"carbonation":1,"savory":3},
     "a": {"fruit":4,"floral":2,"spice":3,"wood_smoke":2,"mineral_earth":3,"sweet_pastry":1,"yeast_ferment":1},
     "tags": ["ежевика","вишня","перец","земля","специи","графит"],
     "desc": "Северный итальянский сорт из Трентино. Высокая кислотность, тёмные ягоды, перец, графит. Как Сира, но севернее. Недооценённый. Для любителей结构性 вин.",
     "pair": ["дичь","жаркое","барбекю","твёрдые сыры"], "temp": "16-18°C", "glass": "Бордо", "cross": [32,214]},

    {"id": max_id+5, "name": "Бобал (Bobal, Утьель-Рекена)", "type": "wine", "cat": "Красное сухое", "subcat": "Красное сухое",
     "origin": "Испания, Утьель-Рекена", "abv": "12.5-14%",
     "s": {"acid":4,"sweet":1,"bitter":3,"tannin":4,"body":4,"alcohol":3,"carbonation":1,"savory":3},
     "a": {"fruit":4,"floral":2,"spice":2,"wood_smoke":2,"mineral_earth":3,"sweet_pastry":1,"yeast_ferment":1},
     "tags": ["ежевика","вишня","кожа","земля","перец","кора"],
     "desc": "Испанский автохтон. Тёмное, высококислотное, танинное. Ежевика, вишня, кожа, земля. Структурное, как Мадиран, но испанское. Недорогое и серьёзное.",
     "pair": ["барбекю","жаркое","ягнёнок","твёрдые сыры"], "temp": "16-18°C", "glass": "Бордо", "cross": [48,174]},
]

drinks.extend(new_drinks)
print(f'Added {len(new_drinks)} new drinks')

with open(DRINKS_PATH, 'w', encoding='utf-8') as f:
    json.dump(drinks, f, ensure_ascii=False, indent=2)

print(f'\nTotal: {len(drinks)} drinks')
for d in new_drinks:
    print(f'  {d["id"]}. {d["name"]}')
