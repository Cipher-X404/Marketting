#!/usr/bin/env python3
"""Replace remote (Unsplash / ui-avatars) image URLs with the local files in assets/images/.
A URL is only replaced once its target file exists, so it is safe to re-run after adding images.
Usage: python3 scripts/localize-images.py"""
import os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMAGES = os.path.join(ROOT, 'assets', 'images')

# Unsplash photo id -> file under assets/images/
PHOTO = {
    '1500937386664': 'farms/green-valley.jpg',   '1625246333195': 'farms/ibe-organic.jpg',
    '1500382017468': 'farms/sunrise-agro.jpg',   '1472099645785': 'farms/ogun-river.jpg',
    '1560493676':    'farms/badagry-coop.jpg',   '1595273670150': 'farms/ibe-organic.jpg',
    '1533900298318': 'farms/badagry-coop.jpg',
    '1488459716781': 'products/veg-basket.jpg',  '1542838132':    'products/veg-basket.jpg',
    '1595841696677': 'products/veg-basket.jpg',  '1516253593875': 'products/roma-basket.jpg',
    '1595840251141': 'products/roma-basket.jpg', '1598965675045': 'products/eggs-crate.jpg',
    '1587486913049': 'products/eggs-crate.jpg',  '1598514982205': 'products/brown-eggs.jpg',
    '1571501679680': 'products/bananas.jpg',     '1571771894821': 'products/bananas.jpg',
    '1598030304671': 'products/cabbage.jpg',     '1518977676601': 'products/potatoes.jpg',
}
# Face photos used as customer avatars in the farmers orders page
FACES = ['1494790108377', '1507003211169', '1534528741775', '1500648767791', '1544005313',
         '1472099645785', '1517841905240', '1522075469751']
NAMES = {'Ibe': 1, 'Sarah': 2, 'Michael': 3, 'James': 4, 'Emily': 5, 'David': 6}

def exists(rel): return os.path.exists(os.path.join(IMAGES, rel))
def files():
    for base, dirs, fs in os.walk(ROOT):
        dirs[:] = [d for d in dirs if d not in ('.git', 'node_modules', 'scripts', 'docs')]
        for f in fs:
            if f.endswith(('.html', '.js', '.css')): yield os.path.join(base, f)

def rel_prefix(path):
    """Relative URL to assets/images/. JS strings resolve against the page, not the script."""
    d = os.path.dirname(path)
    if path.endswith('.js'):
        d = os.path.dirname(os.path.dirname(os.path.dirname(path)))  # <interface>/assets/js/x.js -> <interface>
        if not d.startswith(ROOT): d = ROOT
    return os.path.relpath(IMAGES, d).replace(os.sep, '/') + '/'

URL = re.compile(r"https://images\.unsplash\.com/photo-([0-9a-z]+(?:-[0-9a-f]+)?)[^'\"`) ]*")
AV = re.compile(r"https://ui-avatars\.com/api/\?name=([A-Za-z]+)[^'\"`) ]*")
changed = 0
for p in files():
    s = old = open(p, encoding='utf-8').read()
    pre = rel_prefix(p)
    is_orders_js = p.endswith(os.path.join('farmers interface', 'assets', 'js', 'orders.js'))
    def photo(m):
        pid = m.group(1)
        pid = pid.split('-')[0] if pid.split('-')[0] in PHOTO or pid.split('-')[0] in FACES else pid
        if is_orders_js and pid in FACES:
            rel = 'avatars/avatar-%02d.jpg' % (FACES.index(pid) % 6 + 1)
        else:
            rel = PHOTO.get(pid)
        return pre + rel if rel and exists(rel) else m.group(0)
    def av(m):
        rel = 'avatars/avatar-%02d.jpg' % NAMES.get(m.group(1), 1)
        return pre + rel if exists(rel) else m.group(0)
    s = URL.sub(photo, s); s = AV.sub(av, s)
    if exists('avatars/avatar-01.jpg') and 'farmers interface' in p and p.endswith('.html'):
        s = re.sub(r'src="profile\.jpg"(\s+onerror="[^"]*")?', 'src="' + pre + 'avatars/avatar-01.jpg"', s)
    if s != old:
        open(p, 'w', encoding='utf-8').write(s); changed += 1; print('updated', os.path.relpath(p, ROOT))
print('files changed:', changed)
