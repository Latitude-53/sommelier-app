#!/usr/bin/env python3
"""Generate Android app icons (PNG) from SVG using cairosvg or rsvg-convert."""
import os
import subprocess
import sys

SVG = '/home/z/my-project/sommelier-app/android-icon.svg'
OUT_DIR = '/home/z/my-project/sommelier-app/android-icons'
os.makedirs(OUT_DIR, exist_ok=True)

# Android launcher icon sizes (in px)
SIZES = {
    'mdpi': 48,
    'hdpi': 72,
    'xhdpi': 96,
    'xxhdpi': 144,
    'xxxhdpi': 192,
    'playstore': 512,
}

def convert_with_inkscape(svg, out, size):
    try:
        subprocess.run(['inkscape', '-w', str(size), '-h', str(size), svg, '-o', out], check=True, capture_output=True)
        return True
    except Exception:
        return False

def convert_with_rsvg(svg, out, size):
    try:
        subprocess.run(['rsvg-convert', '-w', str(size), '-h', str(size), svg, '-o', out], check=True, capture_output=True)
        return True
    except Exception:
        return False

def convert_with_cairosvg(svg, out, size):
    try:
        import cairosvg
        cairosvg.svg2png(url=svg, write_to=out, output_width=size, output_height=size)
        return True
    except Exception:
        return False

ok = False
for density, size in SIZES.items():
    out = os.path.join(OUT_DIR, f'ic_launcher-{density}.png')
    success = convert_with_inkscape(SVG, out, size) or convert_with_rsvg(SVG, out, size) or convert_with_cairosvg(SVG, out, size)
    if success:
        print(f'OK {density}: {size}x{size} → {out}')
        ok = True
    else:
        print(f'FAIL {density}: no SVG→PNG converter available')

if not ok:
    print('\nNo SVG→PNG converter found. Install one of:')
    print('  sudo apt install inkscape      # or')
    print('  sudo apt install librsvg2-bin  # (rsvg-convert)')
    print('  pip install cairosvg')
    sys.exit(1)

print(f'\nIcons saved to: {OUT_DIR}')
