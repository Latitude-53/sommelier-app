#!/usr/bin/env python3
# coding: utf-8
"""Добавить ~25 новых напитков для расширения базы."""
import json, os

DRINKS_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'drinks.json')

with open(DRINKS_PATH, 'r', encoding='utf-8') as f:
    drinks = json.load(f)

max_id = max(d['id'] for d in drinks)

new_drinks = [
    # MORE TEA (5)
    {"id": max_id+1, "name": "Гёкуро (Jade Dew)", "type": "tea", "cat": "Чай", "subcat": "Зелёный",
     "origin": "Япония, Киото", "abv": "0%",
     "s": {"acid":3,"sweet":4,"bitter":1,"tannin":1,"body":3,"alcohol":1,"carbonation":1,"savory":5},
     "a": {"fruit":2,"floral":3,"spice":1,"wood_smoke":1,"mineral_earth":3,"sweet_pastry":4,"yeast_ferment":3},
     "tags": ["умами","морская соль","шпинат","мёд","орех"],
     "desc": "Высший сорт японского зелёного чая. Лозы затеняют за 20 дней до сбора — больше хлорофилла и умами. Густой, насыщенный, сладковатый. Заваривать 50-60°C. Самый умами-насыщенный чай.",
     "pair": ["суши","сашими","вагаси"], "temp": "50-60°C", "glass": "гайвань 80 мл", "cross": [188,135]},

    {"id": max_id+2, "name": "Пуэр Шэн (выдержанный 10+ лет)", "type": "tea", "cat": "Чай", "subcat": "Пуэр",
     "origin": "Китай, Юньнань", "abv": "0%",
     "s": {"acid":2,"sweet":3,"bitter":2,"tannin":3,"body":5,"alcohol":1,"carbonation":1,"savory":5},
     "a": {"fruit":3,"floral":1,"spice":2,"wood_smoke":3,"mineral_earth":5,"sweet_pastry":3,"yeast_ferment":4},
     "tags": ["слива","камфора","лекарство","кожа","дерево","мёд"],
     "desc": "Выдержанный сырой пуэр — 10+ лет естественной ферментации. Глубокий, сложный: слива, камфора, лекарство, кожа. Смягчается с возрастом. Гунфу-сцена, для коллекционеров.",
     "pair": ["тёмный шоколад","дичь","твёрдые сыры"], "temp": "95°C", "glass": "исинский чайник 100 мл", "cross": [186,55]},

    {"id": max_id+3, "name": "Да Хун Пао (выдержанный)", "type": "tea", "cat": "Чай", "subcat": "Улун",
     "origin": "Китай, Уишань", "abv": "0%",
     "s": {"acid":2,"sweet":4,"bitter":1,"tannin":3,"body":5,"alcohol":1,"carbonation":1,"savory":5},
     "a": {"fruit":2,"floral":1,"spice":2,"wood_smoke":4,"mineral_earth":4,"sweet_pastry":4,"yeast_ferment":3},
     "tags": ["обжарка","карамель","орех","камень","мёд","дымок"],
     "desc": "Выдержанный Да Хун Пао — глубже и мягче молодого. Минеральные утёсы Уишань дают 'yan yun' (утёсный дух). Карамель, орех, камень. 15+ заварок. Эталон уишаньских улунов.",
     "pair": ["жареное мясо","грибы","сыры"], "temp": "95°C", "glass": "гайвань 120 мл", "cross": [185,40]},

    {"id": max_id+4, "name": "Ройбуш (красный куст)", "type": "tea", "cat": "Чай", "subcat": "Тизан",
     "origin": "ЮАР, Седерберг", "abv": "0%",
     "s": {"acid":1,"sweet":4,"bitter":1,"tannin":1,"body":3,"alcohol":1,"carbonation":1,"savory":1},
     "a": {"fruit":2,"floral":1,"spice":2,"wood_smoke":3,"mineral_earth":2,"sweet_pastry":5,"yeast_ferment":1},
     "tags": ["мёд","ваниль","карамель","орех","земля"],
     "desc": "Тизан из южноафриканского куста Aspalathus linearis. Без кофеина. Медово-карамельно-ореховый профиль. Можно пить с молоком. Богат антиоксидантами. Детский чай.",
     "pair": ["печенье","молоко","десерты"], "temp": "95-100°C", "glass": "кружка 250 мл", "cross": [191,143]},

    {"id": max_id+5, "name": "Иван-чай (кипрей)", "type": "tea", "cat": "Чай", "subcat": "Тизан",
     "origin": "Россия", "abv": "0%",
     "s": {"acid":1,"sweet":3,"bitter":2,"tannin":2,"body":3,"alcohol":1,"carbonation":1,"savory":2},
     "a": {"fruit":3,"floral":3,"spice":1,"wood_smoke":2,"mineral_earth":2,"sweet_pastry":3,"yeast_ferment":2},
     "tags": ["мёд","яблоко","цветы","трава","ваниль"],
     "desc": "Ферментированный кипрей узколистный. Традиционный русский напиток. Мёд, яблоко, цветы, лёгкая ваниль. Без кофеина. Успокаивающий. Можно заваривать 3-4 раза.",
     "pair": ["мёд","печенье","блины"], "temp": "90-95°C", "glass": "кружка 250 мл", "cross": [191,143]},

    # MORE COFFEE (3)
    {"id": max_id+6, "name": "Chemex", "type": "coffee", "cat": "Кофе", "subcat": "Альтернатива",
     "origin": "США, 1941", "abv": "0%",
     "s": {"acid":4,"sweet":2,"bitter":1,"tannin":1,"body":2,"alcohol":1,"carbonation":1,"savory":2},
     "a": {"fruit":5,"floral":4,"spice":1,"wood_smoke":1,"mineral_earth":2,"sweet_pastry":2,"yeast_ferment":1},
     "tags": ["ягоды","цитрус","цветы","чистота","прозрачность"],
     "desc": "Стеклянная колба с толстым бумажным фильтром. Самый чистый чашечный профиль — никакой мутности. Светлая обжарка, моносорт. Цветочно-ягодный. Дизайн в MoMA.",
     "pair": ["круассан","фруктовые десерты"], "temp": "92-96°C", "glass": "стеклянная колба 500 мл", "cross": [176,182]},

    {"id": max_id+7, "name": "Turkish Coffee (турка, классика)", "type": "coffee", "cat": "Кофе", "subcat": "Эспрессо",
     "origin": "Турция / Ближний Восток", "abv": "0%",
     "s": {"acid":2,"sweet":2,"bitter":5,"tannin":4,"body":5,"alcohol":1,"carbonation":1,"savory":4},
     "a": {"fruit":1,"floral":1,"spice":4,"wood_smoke":3,"mineral_earth":2,"sweet_pastry":3,"yeast_ferment":1},
     "tags": ["кардамон","тёмный шоколад","смолы","специи","дымок"],
     "desc": "Турецкий кофе — самая мелкая фракция помола, варится в медной джезве, подаётся с гущей. Кардамон — классика. Густой, горький, тёмный, пряный. Церемония, не напиток.",
     "pair": ["рахат-лукум","пахлава"], "temp": "70-75°C", "glass": "маленькая чашка 60 мл", "cross": [180,134]},

    {"id": max_id+8, "name": "Cortado", "type": "coffee", "cat": "Кофе", "subcat": "Молочный",
     "origin": "Испания", "abv": "0%",
     "s": {"acid":3,"sweet":3,"bitter":3,"tannin":2,"body":4,"alcohol":1,"carbonation":1,"savory":4},
     "a": {"fruit":2,"floral":1,"spice":1,"wood_smoke":2,"mineral_earth":1,"sweet_pastry":4,"yeast_ferment":2},
     "tags": ["кофе","молоко","карамель","какао","сливки"],
     "desc": "Эспрессо + тёплое молоко 1:1, без пены. Испанская классика. Сбалансированный — кофе не теряется в молоке, молоко смягчает горечь. Меньше чем латте, чище чем капучино.",
     "pair": ["печенье","бриошь"], "temp": "60-65°C", "glass": "стакан 150 мл", "cross": [177,181]},

    # MORE BEER (5)
    {"id": max_id+9, "name": "Grodziskie (польское шампанское)", "type": "beer", "cat": "Специальное", "subcat": "Grodziskie",
     "origin": "Польша, Гродзиск-Велькопольски", "abv": "2.5-3.5%",
     "s": {"acid":3,"sweet":2,"bitter":3,"tannin":1,"body":2,"alcohol":1,"carbonation":5,"savory":2},
     "a": {"fruit":1,"floral":3,"spice":1,"wood_smoke":4,"mineral_earth":1,"sweet_pastry":2,"yeast_ferment":2},
     "tags": ["дым","копчёный солод","хлеб","хмель","свежесть"],
     "desc": "Возрождённый польский стиль — копчёное пшеничное пиво с дубовых дров. Лёгкое (2.5-3.5%), но с ярким дымным характером. Высокая газация — 'польское шампанское'. Уникально.",
     "pair": ["копчёная рыба","колбасы","сэндвичи"], "temp": "6-8°C", "glass": "покале", "cross": [101,62]},

    {"id": max_id+10, "name": "Kentucky Common", "type": "beer", "cat": "Специальное", "subcat": "Kentucky Common",
     "origin": "США, Луисвилл, KY", "abv": "4-5%",
     "s": {"acid":3,"sweet":3,"bitter":2,"tannin":2,"body":3,"alcohol":1,"carbonation":2,"savory":3},
     "a": {"fruit":2,"floral":1,"spice":1,"wood_smoke":3,"mineral_earth":2,"sweet_pastry":4,"yeast_ferment":3},
     "tags": ["карамель","хлеб","рожь","орех","дымок"],
     "desc": "Исторический американский стиль из Луисвилла (1850-1920). Тёмный, карамельный, с лёгкой кислинкой и ржаным характером. Быстро созревал — пиво рабочего класса. Возрождён крафтом.",
     "pair": ["бургеры","барбекю","сэндвичи"], "temp": "8-10°C", "glass": "пинт", "cross": [103,83]},

    {"id": max_id+11, "name": "Australian Sparkling Ale", "type": "beer", "cat": "Эль", "subcat": "Sparkling Ale",
     "origin": "Австралия", "abv": "5-5.5%",
     "s": {"acid":3,"sweet":2,"bitter":3,"tannin":1,"body":3,"alcohol":2,"carbonation":5,"savory":2},
     "a": {"fruit":4,"floral":2,"spice":1,"wood_smoke":1,"mineral_earth":1,"sweet_pastry":2,"yeast_ferment":3},
     "tags": ["эфиры","груша","специи","хлеб","свежесть"],
     "desc": "Австралийский стиль эля с выразительными фруктовыми эфирами от специфических дрожжей. Cooper's Sparkling Ale — эталон. Сложнее, чем кажется. Нефильтрованное, с осадком.",
     "pair": ["морепродукты","курица","салаты"], "temp": "6-8°C", "glass": "pint", "cross": [75,67]},

    {"id": max_id+12, "name": "Lichtenhainer (копчёно-кислое)", "type": "beer", "cat": "Кислое", "subcat": "Lichtenhainer",
     "origin": "Германия, Тюрингия", "abv": "3-4%",
     "s": {"acid":5,"sweet":1,"bitter":2,"tannin":1,"body":2,"alcohol":1,"carbonation":4,"savory":2},
     "a": {"fruit":2,"floral":1,"spice":1,"wood_smoke":4,"mineral_earth":2,"sweet_pastry":1,"yeast_ferment":3},
     "tags": ["дым","копчёное","уксус","яблоко","молочная"],
     "desc": "Исторический немецкий стиль — копчёный кислый эль. Буквально: дым + кислинка. Лёгкий, низкий алкоголь. На любителя, но уникальный. Возрождён крафтом.",
     "pair": ["копчёная рыба","сэндвичи","салаты"], "temp": "6-8°C", "glass": "Stange", "cross": [101,93]},

    {"id": max_id+13, "name": "Braggot (медовуха + пиво)", "type": "beer", "cat": "Специальное", "subcat": "Braggot",
     "origin": "Англия / Уэльс, исторический", "abv": "6-12%",
     "s": {"acid":2,"sweet":4,"bitter":3,"tannin":2,"body":5,"alcohol":3,"carbonation":3,"savory":2},
     "a": {"fruit":3,"floral":3,"spice":2,"wood_smoke":2,"mineral_earth":1,"sweet_pastry":5,"yeast_ferment":2},
     "tags": ["мёд","хмель","карамель","цветы","хлеб"],
     "desc": "Гибрид медовухи и пива — мёд + солод + хмель. Исторический стиль кельтских монахов. Сладкое, тёплое, медово-карамельное с хмелевой горчинкой. Между пивом и медовухой.",
     "pair": ["десерты","орехи","сыры"], "temp": "10-12°C", "glass": "snifter", "cross": [143,85]},

    # MORE WINE (5)
    {"id": max_id+14, "name": "Poulsard (Jura, красное)", "type": "wine", "cat": "Красное сухое", "subcat": "Красное сухое",
     "origin": "Франция, Юра", "abv": "11-12.5%",
     "s": {"acid":4,"sweet":1,"bitter":2,"tannin":1,"body":2,"alcohol":2,"carbonation":1,"savory":3},
     "a": {"fruit":4,"floral":2,"spice":1,"wood_smoke":1,"mineral_earth":3,"sweet_pastry":1,"yeast_ferment":2},
     "tags": ["красные ягоды","перец","земля","грибы","мёд"],
     "desc": "Прозрачно-красное вино из Юры — самое светлое красное в мире. Тонкое, лёгкое, с красными ягодами и землистостью. Странное, не похожее на типичное красное. Пьётся охлаждённым.",
     "pair": ["птица","грибы","паштеты"], "temp": "13-15°C", "glass": "Бургундия", "cross": [217,30]},

    {"id": max_id+15, "name": "Savennières (Chenin Blanc сухое)", "type": "wine", "cat": "Белое сухое", "subcat": "Белое сухое",
     "origin": "Франция, Долина Луары", "abv": "13-14%",
     "s": {"acid":5,"sweet":1,"bitter":2,"tannin":1,"body":4,"alcohol":3,"carbonation":1,"savory":3},
     "a": {"fruit":3,"floral":2,"spice":1,"wood_smoke":2,"mineral_earth":4,"sweet_pastry":3,"yeast_ferment":3},
     "tags": ["айва","мёд","орех","минерал","воскоподобный"],
     "desc": "Сухое Chenin Blanc с сланцевых почв Савеньера. Мощная кислотность, айва, мёд, минеральность. Полнотелое, но сухое. Живёт десятилетиями. Недооценённое.",
     "pair": ["свинина","паштеты","козий сыр"], "temp": "10-12°C", "glass": "тюльпан", "cross": [13,170]},

    {"id": max_id+16, "name": "Etna Rosso (Nerello Mascalese)", "type": "wine", "cat": "Красное сухое", "subcat": "Красное сухое",
     "origin": "Италия, Сицилия, Этна", "abv": "12.5-14%",
     "s": {"acid":4,"sweet":1,"bitter":3,"tannin":3,"body":3,"alcohol":3,"carbonation":1,"savory":4},
     "a": {"fruit":4,"floral":3,"spice":3,"wood_smoke":2,"mineral_earth":5,"sweet_pastry":1,"yeast_ferment":2},
     "tags": ["красные ягоды","перец","вулканический","минерал","травы"],
     "desc": "Красное с вулканических склонов Этны. Высокая кислотность, тёмные ягоды, перец, мощная минеральность. Как Пино Нуар, но с вулканическим характером. Высота 600-1000м. Растущая звезда.",
     "pair": ["гриль","грибы","ягнёнок"], "temp": "15-17°C", "glass": "Бургундия", "cross": [30,19]},

    {"id": max_id+17, "name": "Assyrtiko (Santorini, белый)", "type": "wine", "cat": "Белое сухое", "subcat": "Белое сухое",
     "origin": "Греция, Санторини", "abv": "13-14%",
     "s": {"acid":5,"sweet":1,"bitter":2,"tannin":1,"body":3,"alcohol":3,"carbonation":1,"savory":4},
     "a": {"fruit":3,"floral":1,"spice":1,"wood_smoke":2,"mineral_earth":5,"sweet_pastry":1,"yeast_ferment":2},
     "tags": ["лимон","морская соль","кремень","дымок","йод"],
     "desc": "Виноград с вулканических почв Санторини. Электрическая кислотность, лимон, морская соль, кремень. Старые лозы (200+ лет). Серьёзное, долго живёт. Лучшее белое Греции.",
     "pair": ["морепродукты","гриль","солёные сыры"], "temp": "10-12°C", "glass": "тюльпан", "cross": [19,15]},

    {"id": max_id+18, "name": "Blaufränkisch (Ausbruch, сладкое)", "type": "wine", "cat": "Десертное красное", "subcat": "Десертное красное",
     "origin": "Австрия, Бургенланд", "abv": "13-14%",
     "s": {"acid":3,"sweet":5,"bitter":2,"tannin":3,"body":5,"alcohol":3,"carbonation":1,"savory":3},
     "a": {"fruit":5,"floral":1,"spice":3,"wood_smoke":2,"mineral_earth":2,"sweet_pastry":4,"yeast_ferment":2},
     "tags": ["ежевика","вишня","перец","кора","шоколад"],
     "desc": "Сладкое красное из заизюмленного Blaufränkisch. Редкий стиль. Ежевика, вишня, перец, шоколад. Плотное, тёплое. Как Port, но из Австрии. Для холодных вечеров.",
     "pair": ["тёмный шоколад","десерты","твёрдые сыры"], "temp": "14-16°C", "glass": "маленький тюльпан", "cross": [214,49]},

    # MORE SPIRITS (4)
    {"id": max_id+19, "name": "Cognac (Napoleon)", "type": "spirit", "cat": "Бренди", "subcat": "Бренди",
     "origin": "Франция, Коньяк", "abv": "40%",
     "s": {"acid":1,"sweet":3,"bitter":2,"tannin":4,"body":5,"alcohol":4,"carbonation":1,"savory":4},
     "a": {"fruit":4,"floral":2,"spice":3,"wood_smoke":4,"mineral_earth":2,"sweet_pastry":4,"yeast_ferment":2},
     "tags": ["орех","кожа","табак","изюм","ваниль","какао"],
     "desc": "Коньяк Napoleon — минимум 6 лет в дубе (фактически 15-20). Глубже VSOP, не такой мощный как XO. Орехи, кожа, табак, изюм, ваниль. Идеальный баланс зрелости и свежести.",
     "pair": ["сигара","тёмный шоколад","кофе"], "temp": "16-18°C", "glass": "snifter", "cross": [116,115]},

    {"id": max_id+20, "name": "Pisco (Quebranta, Acholado)", "type": "spirit", "cat": "Бренди", "subcat": "Бренди",
     "origin": "Перу", "abv": "40-43%",
     "s": {"acid":2,"sweet":2,"bitter":2,"tannin":1,"body":3,"alcohol":4,"carbonation":1,"savory":2},
     "a": {"fruit":4,"floral":4,"spice":1,"wood_smoke":1,"mineral_earth":2,"sweet_pastry":2,"yeast_ferment":2},
     "tags": ["виноград","цветы","цитрус","травы","земля"],
     "desc": "Acholado — купаж сортов винограда (Quebranta + Italia + Torontel). Цветочный, фруктовый, с травянистыми нотами. Без выдержки в дубе — чистый виноград. Основа Pisco Sour.",
     "pair": ["севиче","суши","коктейли"], "temp": "6-8°C (коктейли)", "glass": "rocks", "cross": [121,198]},

    {"id": max_id+21, "name": "Ardbeg Uigeadail (Islay, бочковой крепости)", "type": "spirit", "cat": "Виски", "subcat": "Виски",
     "origin": "Шотландия, Айла", "abv": "54.2%",
     "s": {"acid":1,"sweet":2,"bitter":4,"tannin":3,"body":5,"alcohol":5,"carbonation":1,"savory":5},
     "a": {"fruit":1,"floral":1,"spice":3,"wood_smoke":5,"mineral_earth":5,"sweet_pastry":3,"yeast_ferment":2},
     "tags": ["торф","дым","йод","море","кофе","тёмный шоколад"],
     "desc": "Бочковой крепости (54.2%) — купаж бурбоновых и хересных бочек. Экстремальный торф, дым, йод, но с хересной сладостью. Мощный, но сложный. Культовый Айла. Для торфяных фанатов.",
     "pair": ["копчёный лосось","тёмный шоколад","орехи"], "temp": "16-18°C", "glass": "Glencairn", "cross": [107,165]},

    {"id": max_id+22, "name": "Calvados (Pays d'Auge, 12 лет)", "type": "spirit", "cat": "Бренди", "subcat": "Бренди",
     "origin": "Франция, Нормандия", "abv": "42%",
     "s": {"acid":2,"sweet":3,"bitter":2,"tannin":4,"body":5,"alcohol":4,"carbonation":1,"savory":3},
     "a": {"fruit":5,"floral":1,"spice":2,"wood_smoke":3,"mineral_earth":2,"sweet_pastry":4,"yeast_ferment":2},
     "tags": ["яблоко","груша","карамель","выпечка","орех","ваниль"],
     "desc": "12 лет в дубовых бочках. Печёные яблоки, карамель, ваниль, орех. Глубокий, тёплый, сложный. Trou Normand — между блюдами. Нормандская классика для особых случаев.",
     "pair": ["яблочные десерты","сыры с белой коркой","кофе"], "temp": "14-16°C", "glass": "snifter", "cross": [118,122]},

    # MEAD (1)
    {"id": max_id+23, "name": "Cyser (медовуха + яблоки)", "type": "mead", "cat": "Медовуха", "subcat": "Cyser",
     "origin": "Англия / Скандинавия", "abv": "8-12%",
     "s": {"acid":3,"sweet":4,"bitter":1,"tannin":2,"body":4,"alcohol":2,"carbonation":2,"savory":1},
     "a": {"fruit":5,"floral":3,"spice":1,"wood_smoke":1,"mineral_earth":1,"sweet_pastry":4,"yeast_ferment":3},
     "tags": ["мёд","яблоко","цветы","цитрус","ваниль"],
     "desc": "Гибрид мёда и яблочного сока — медовуха + сидр. Фруктовый, медовый, цветочный. Сладость мёда + кислотность яблок. Свежее, но сложное. Возрождён крафтом.",
     "pair": ["фруктовые десерты","блины","печенье"], "temp": "10-14°C", "glass": "кубок", "cross": [143,139]},
]

drinks.extend(new_drinks)

with open(DRINKS_PATH, 'w', encoding='utf-8') as f:
    json.dump(drinks, f, ensure_ascii=False, indent=2)

print(f'Added {len(new_drinks)} new drinks. Total: {len(drinks)}')
for d in new_drinks:
    print(f'  {d["id"]}. {d["name"]} ({d["type"]}/{d["subcat"]})')
