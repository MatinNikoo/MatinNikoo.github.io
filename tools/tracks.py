"""Builds the playlist inside player.js.
Drop a cover into covers/<slug>.jpg (any size, jpg or png) and run:  python3 tools/tracks.py
Each cover is resized to 400px and its card colors come from Aura's palette_from()."""
import colorsys, json, os, re
from PIL import Image
H = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TRACKS = [  # slug, title, artist
    ('innerbloom', 'Innerbloom', 'RÜFÜS DU SOL'),
    ('music-is-better', 'Music Is Better', 'RÜFÜS DU SOL'),
    ('inner-light', 'Inner Light', 'Elderbrook & Bob Moses'),
    ('renegade', 'Renegade', 'Kavinsky'),
    ('make-you-feel', 'Make You Feel', 'Fahlberg'),
    ('set-your-mind', 'Set Your Mind', 'Cristoph & Fahlberg'),
    ('if-your-girl-only-knew', 'If Your Girl Only Knew', 'Fahlberg x Arodes'),
    ('stereo-love', 'Stereo Love', 'Edward Maya & Vika Jigulina'),
    ('lights', 'Lights', 'Ellie Goulding'),
    ('neverender', 'Neverender', 'Justice & Tame Impala'),
    ('afterimage', 'Afterimage', 'Justice'),
    ('mind-off', 'Mind Off', 'Carlita, WhoMadeWho & Orsay'),
    ('spiritual-but-not-religious', 'Spiritual But Not Religious', 'Oliver Koletzki'),
    ('sleepwalking', 'Sleepwalking', 'The Chain Gang of 1974'),
    ('late-night', 'Late Night', 'Marten Lou x Foals'),
    ('restart-my-heart', 'Restart My Heart (Matin Remix)', 'Astrality & AIKO'),
    ('bones', 'Bones (Matin Remix)', 'Oliver Koletzki'),
    ('daylight', 'Daylight (Matin Remix)', 'TCTS & Hayley May'),
]
NEUTRAL = {'bg': '#262428', 'text': '#f5f2f6', 'sub': '#c8c4cc', 'bar': '#e6e2ea'}  # Aura's NEUTRAL

def hx(h, s, v):
    return '#%02x%02x%02x' % tuple(round(c * 255) for c in colorsys.hsv_to_rgb(h, max(0, min(1, s)), max(0, min(1, v))))

def palette_from(im):
    small = im.convert('RGB').resize((64, 64)); q = small.quantize(colors=8, method=Image.Quantize.MEDIANCUT); pal = q.getpalette()
    best, bs = (0, 0, .5), -1
    for count, idx in q.getcolors():
        r, g, b = pal[idx * 3: idx * 3 + 3]; h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
        w = .15 if (v < .13 or (v > .94 and s < .08)) else 1; sc = count * (.35 + s) * w
        if sc > bs: bs, best = sc, (h, s, v)
    h, s, v = best; sat = (lambda z: 0) if s < .1 else (lambda z: z)
    return {'bg': hx(h, sat(min(.62, s * .85 + .18)), .24), 'text': hx(h, sat(.2), .98), 'sub': hx(h, sat(.32), .88), 'bar': hx(h, sat(max(.42, min(.7, s))), .97)}

durs = json.load(open(os.path.join(H, 'music', 'durations.json')))
out, missing = [], []
for slug, title, artist in TRACKS:
    cover = None
    for ext in ('jpg', 'jpeg', 'png', 'webp'):
        p = os.path.join(H, 'covers', slug + '.' + ext)
        if os.path.exists(p):
            im = Image.open(p).convert('RGB')
            if im.size != (400, 400) or ext != 'jpg':
                im = im.resize((400, 400), Image.Resampling.LANCZOS); os.remove(p) if ext != 'jpg' else None
                im.save(os.path.join(H, 'covers', slug + '.jpg'), quality=86, optimize=True, progressive=True)
            cover = 'covers/' + slug + '.jpg'; c = palette_from(im); break
    if not cover: missing.append(slug); c = NEUTRAL
    out.append({'s': 'music/' + slug + '.mp3', 't': title, 'a': artist, 'c': cover, 'd': durs[slug], 'p': c})
js = 'var TRACKS = ' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';'
pj = os.path.join(H, 'player.js'); s = open(pj, encoding='utf8').read()
s = re.sub(r'/\*TRACKS\*/.*?/\*END\*/', lambda m: '/*TRACKS*/' + js + '/*END*/', s, flags=re.S)
open(pj, 'w', encoding='utf8').write(s)
print(len(out), 'tracks,', len(out) - len(missing), 'with covers. missing:', ', '.join(missing) or 'none')
