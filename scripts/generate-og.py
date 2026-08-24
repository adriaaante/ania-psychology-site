#!/usr/bin/env python3
"""Генерирует og-обложку 1200x630 (assets/img/og-cover.png) в палитре сайта.

Запуск: python3 scripts/generate-og.py  (нужен Pillow: pip install pillow).
Шрифты — системные DejaVu (есть кириллица). Запускать после смены
имени/подписи бренда.
"""
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
BG = (251, 249, 244)
SAGE = (74, 97, 81)
SAGE_DARK = (53, 73, 60)
CARAMEL = (192, 138, 98)
CARAMEL_PALE = (245, 232, 220)
PALE_GREEN = (231, 237, 228)
MUTED = (108, 117, 110)

img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)

# мягкие круги на фоне
d.ellipse([W - 380, -220, W + 160, 320], fill=PALE_GREEN)
d.ellipse([-180, H - 260, 260, H + 180], fill=CARAMEL_PALE)

# монограмма «А» в кольце
cx, cy, r = 240, 315, 130
d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=SAGE, width=6)
aw = 92  # полуширина буквы
d.line([cx - aw, cy + 78, cx, cy - 92], fill=SAGE, width=16)
d.line([cx, cy - 92, cx + aw, cy + 78], fill=SAGE, width=16)
# дуга-перекладина
d.arc([cx - 52, cy - 10, cx + 52, cy + 62], start=20, end=160, fill=CARAMEL, width=13)
# листок у вершины
d.polygon([(cx + 4, cy - 96), (cx + 26, cy - 128), (cx + 56, cy - 136),
           (cx + 50, cy - 108), (cx + 22, cy - 90)], fill=CARAMEL)

serif_b = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf", 84)
serif = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf", 40)
sans = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 26)

tx = 440
d.text((tx, 200), "Анна", font=serif_b, fill=SAGE_DARK)
d.text((tx, 300), "Маловичко", font=serif_b, fill=SAGE_DARK)
d.text((tx, 424), "психолог", font=serif, fill=CARAMEL)
d.text((tx, 492), "Пятигорск · онлайн-консультации", font=sans, fill=MUTED)

# тонкая рамка
d.rectangle([24, 24, W - 24, H - 24], outline=CARAMEL, width=2)

img.save("assets/img/og-cover.png", optimize=True)
print("ok: assets/img/og-cover.png")
