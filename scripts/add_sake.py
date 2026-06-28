#!/usr/bin/env python3
# coding: utf-8
"""Добавить 6 новых саке для большего разнообразия в слепой."""
import json, os

DRINKS_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'drinks.json')

with open(DRINKS_PATH, 'r', encoding='utf-8') as f:
    drinks = json.load(f)

max_id = max(d['id'] for d in drinks)
new_sake = [
    {"id": max_id+1, "name": "Honjozo (лёгкое саке)", "type": "sake", "cat": "Саке", "subcat": "Honjozo",
     "origin": "Япония", "abv": "15-16%",
     "s": {"acid":2,"sweet":2,"bitter":1,"tannin":1,"body":3,"alcohol":2,"carbonation":1,"savory":3},
     "a": {"fruit":2,"floral":2,"spice":1,"wood_smoke":1,"mineral_earth":2,"sweet_pastry":2,"yeast_ferment":3},
     "tags": ["рис","грибы","молоко","орех","мёд","земля"],
     "desc": "Лёгкий стиль саке с добавлением небольшого количества дистиллированного алкоголя. Менее густое чем Junmai, более питкое. Чуть фруктовее. Подавать охлаждённым или комнатной температуры.",
     "pair": ["суши","сашими","жареная рыба"], "temp": "5-15°C", "glass": "ochoko", "cross": [135,193]},
    {"id": max_id+2, "name": "Namazake (не pastеризованное)", "type": "sake", "cat": "Саке", "subcat": "Namazake",
     "origin": "Япония", "abv": "15-18%",
     "s": {"acid":3,"sweet":3,"bitter":1,"tannin":1,"body":3,"alcohol":2,"carbonation":2,"savory":4},
     "a": {"fruit":4,"floral":3,"spice":1,"wood_smoke":1,"mineral_earth":2,"sweet_pastry":3,"yeast_ferment":4},
     "tags": ["рис","груша","молоко","дрожжи","умами","свежесть"],
     "desc": "Непастеризованное саке — живое, свежее, с яркими фруктовыми нотами. Весенний сезонный релиз. Лёгкая газация от брожения. Хранить только в холодильнике. Для ценителей.",
     "pair": ["сашими","белая рыба","spring rolls"], "temp": "5-8°C", "glass": "white wine glass", "cross": [136,135]},
    {"id": max_id+3, "name": "Taruzake (бочковое саке)", "type": "sake", "cat": "Саке", "subcat": "Taruzake",
     "origin": "Япония", "abv": "15-16%",
     "s": {"acid":2,"sweet":2,"bitter":2,"tannin":2,"body":4,"alcohol":2,"carbonation":1,"savory":3},
     "a": {"fruit":2,"floral":1,"spice":2,"wood_smoke":4,"mineral_earth":2,"sweet_pastry":3,"yeast_ferment":3},
     "tags": ["кедр","дуб","ваниль","рис","орех","специи"],
     "desc": "Саке, выдержанное в кедровых бочках (sugi). Уникальный древесный профиль — кедр, ваниль, специи. Традиционный весенний напиток (Hanami). Плотнее обычного саке.",
     "pair": ["жареное мясо","грибы","ягнёнок"], "temp": "10-15°C", "glass": "ochoko", "cross": [135,40]},
    {"id": max_id+4, "name": "Koshu (выдержанное саке)", "type": "sake", "cat": "Саке", "subcat": "Koshu",
     "origin": "Япония", "abv": "15-18%",
     "s": {"acid":2,"sweet":3,"bitter":2,"tannin":2,"body":5,"alcohol":3,"carbonation":1,"savory":5},
     "a": {"fruit":2,"floral":1,"spice":3,"wood_smoke":3,"mineral_earth":3,"sweet_pastry":4,"yeast_ferment":5},
     "tags": ["карамель","орех","соевый соус","грибы","земля","специи"],
     "desc": "Выдержанное 3-5 лет саке. Тёмно-янтарный цвет. Сложный профиль: карамель, орехи, соевый соус, умами. Ближе к хересу или коньяку чем к обычному саке. Для особых случаев.",
     "pair": ["тёмный шоколад","твёрдые сыры","дичь"], "temp": "15-20°C", "glass": "snifter", "cross": [135,55]},
    {"id": max_id+5, "name": "Yamahai (традиционная ферментация)", "type": "sake", "cat": "Саке", "subcat": "Yamahai",
     "origin": "Япония", "abv": "15-17%",
     "s": {"acid":4,"sweet":2,"bitter":2,"tannin":1,"body":4,"alcohol":2,"carbonation":1,"savory":5},
     "a": {"fruit":2,"floral":1,"spice":2,"wood_smoke":2,"mineral_earth":3,"sweet_pastry":2,"yeast_ferment":5},
     "tags": ["рис","грибы","соевый соус","земля","умами","молочная"],
     "desc": "Традиционный метод без добавления молочнокислых бактерий — медленная естественная ферментация. Высокая кислотность, мощный умами, землистый. Дикий, сложный характер. Для гурметов.",
     "pair": ["жареное мясо","грибы","сыры","соевый соус"], "temp": "10-15°C", "glass": "ochoko", "cross": [135,186]},
    {"id": max_id+6, "name": "Tokubetsu Junmai (особое)", "type": "sake", "cat": "Саке", "subcat": "Tokubetsu Junmai",
     "origin": "Япония", "abv": "15-16%",
     "s": {"acid":3,"sweet":2,"bitter":1,"tannin":1,"body":3,"alcohol":2,"carbonation":1,"savory":4},
     "a": {"fruit":3,"floral":2,"spice":1,"wood_smoke":1,"mineral_earth":2,"sweet_pastry":2,"yeast_ferment":4},
     "tags": ["рис","груша","молоко","орех","умами","минерал"],
     "desc": "'Особое' Junmai — обычно с большей полировкой риса или особым методом. Чище и элегантнее обычного Junmai. Баланс фруктов, умами и минеральности. Универсальное гастрономическое саке.",
     "pair": ["суши","сашими","жареная рыба","курица"], "temp": "5-15°C", "glass": "ochoko", "cross": [135,137]},
]

drinks.extend(new_sake)

with open(DRINKS_PATH, 'w', encoding='utf-8') as f:
    json.dump(drinks, f, ensure_ascii=False, indent=2)

print(f'Added {len(new_sake)} new sake. Total drinks: {len(drinks)}')
for s in new_sake:
    print(f'  {s["id"]}. {s["name"]} ({s["subcat"]})')
