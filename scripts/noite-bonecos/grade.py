import sys
from PIL import Image, ImageDraw
img = Image.open(sys.argv[1]).convert('RGB')
x0, y0, x1, y1 = [int(v) for v in sys.argv[3].split(',')]
c = img.crop((x0, y0, x1, y1))
esc = 3
c = c.resize((c.width * esc, c.height * esc), Image.LANCZOS)
d = ImageDraw.Draw(c)
for x in range(x0 - x0 % 10, x1, 10):
    cor = (255, 0, 0) if x % 50 == 0 else (255, 255, 0)
    if x % 50 == 0 or x % 10 == 0:
        d.line([((x - x0) * esc, 0), ((x - x0) * esc, c.height)], fill=cor, width=1 if x % 50 else 2)
    if x % 50 == 0: d.text(((x - x0) * esc + 2, 2), str(x), fill=(255, 0, 0))
for y in range(y0 - y0 % 10, y1, 10):
    cor = (255, 0, 0) if y % 50 == 0 else (255, 255, 0)
    d.line([(0, (y - y0) * esc), (c.width, (y - y0) * esc)], fill=cor, width=1 if y % 50 else 2)
    if y % 50 == 0: d.text((2, (y - y0) * esc + 2), str(y), fill=(255, 0, 0))
c.save(sys.argv[2])
