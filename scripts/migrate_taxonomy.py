#!/usr/bin/env python3
# coding: utf-8
"""
Миграция taxonomy: разделяет umami на 2 рецептора:
- umami (грибы, дрожжи, орехи, кожа, табак, выдержка)
- salty (соль, минерал, мел, мокрый камень, кремень, сланец)
"""
import json
import os

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data')
TAXONOMY_PATH = os.path.join(DATA_DIR, 'taxonomy.json')

with open(TAXONOMY_PATH, 'r', encoding='utf-8') as f:
    taxonomy = json.load(f)

# Найдём umami рецептор и разделим
new_taxonomy = []
for r in taxonomy:
    if r['id'] == 'umami':
        # Разделим subs на umami и salty
        umami_subs = []
        salty_subs = []
        for s in r['subs']:
            if s['id'] in ['mineral', 'salty']:
                salty_subs.append(s)
            else:
                umami_subs.append(s)

        # umami рецептор (грибы, дрожжи, орехи, земля)
        new_taxonomy.append({
            'id': 'umami',
            'icon': '🍄',
            'title': 'Умами',
            'sub': 'грибы, дрожжи, орехи, выдержка',
            'class': 'umami',
            'subs': umami_subs
        })
        # salty рецептор (соль, минералы)
        new_taxonomy.append({
            'id': 'salty',
            'icon': '🧂',
            'title': 'Солёное / минеральное',
            'sub': 'соль, морская соль, мел, мокрый камень, сланец',
            'class': 'salty',
            'subs': salty_subs
        })
    else:
        new_taxonomy.append(r)

with open(TAXONOMY_PATH, 'w', encoding='utf-8') as f:
    json.dump(new_taxonomy, f, ensure_ascii=False, indent=2)

print('Taxonomy migrated:')
for r in new_taxonomy:
    print(f'  {r["id"]:12} {r["icon"]} {r["title"]:<30} subs: {[s["id"] for s in r["subs"]]}')
print(f'\nWrote {TAXONOMY_PATH}')
