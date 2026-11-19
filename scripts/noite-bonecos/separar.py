# Separa Zezé (esq.) e Luciano (dir.) da arte da atração, já com a máscara do BiRefNet.
# Uso: python separar.py atracao.jpg mascara.png pasta_saida
import sys, numpy as np
from PIL import Image, ImageDraw, ImageFilter

foto = np.array(Image.open(sys.argv[1]).convert('RGB')).astype(np.float32)
masc = np.array(Image.open(sys.argv[2]).convert('L')).astype(np.float32) / 255
out = sys.argv[3]
H, W = masc.shape

def poli(pts):
    im = Image.new('L', (W, H), 0); ImageDraw.Draw(im).polygon(pts, fill=255)
    return np.array(im) > 0

# linha de contato entre os dois (x por y)
corte = [(742, 0), (742, 45), (738, 90), (735, 130), (742, 160), (742, 250), (740, 400)]
lado_esq = poli([(0, 0)] + corte + [(0, 400)])

# ---------- ZEZÉ ----------
zf = foto.copy(); zm = masc * lado_esq
# tira a manga azul e a mão do Luciano por cima do ombro
contorno = [(640, 122), (619, 137), (598, 151), (581, 166), (567, 186), (557, 210)]
acima = poli([(520, 60), (650, 60)] + contorno + [(520, 210)])
zm[acima] = 0
mao = poli(contorno + [(556, 205), (578, 206), (600, 209), (620, 198), (636, 166), (648, 134)])
yy, xx = np.mgrid[0:H, 0:W]

def camisa(reg, x0):
    # camisa branca com sombra nas bordas (parece pano, não recorte chapado)
    borda = np.array(Image.fromarray((reg * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(9))) / 255
    luz = 0.72 + 0.28 * np.clip(borda * 1.6 - 0.3, 0, 1) - np.clip((xx - x0) * 0.0012, -0.05, 0.08)
    base = np.array([236, 236, 242])
    return np.clip(base[None, None, :] * luz[..., None], 120, 248)

zf[mao] = camisa(mao, 590)[mao]; zm[mao] = 1
src_f, src_m = zf.copy(), zm.copy()   # fonte já sem a mão do Luciano

# lado direito do Zezé (escondido atrás do Luciano): corpo de três-quartos, braço do fundo escondido
ombro = poli([(742, 150), (760, 152), (772, 160), (777, 172), (742, 172)])
zf[ombro] = camisa(ombro, 760)[ombro] * 0.85; zm[ombro] = 1
colete = poli([(733, 166), (771, 164), (779, 180), (781, 240), (779, 330), (775, 400), (733, 400)])
cor = np.percentile(foto[320:380, 655:690].reshape(-1, 3), 30, axis=0) * 0.75
ruido = np.random.default_rng(3).normal(0, 2.5, (H, W, 1))
sombra = np.clip(1 - (xx - 742) * 0.012, 0.5, 1)[..., None]
zf[colete] = np.clip(cor[None, None, :] * sombra + ruido, 0, 255)[colete]; zm[colete] = 1

# ---------- LUCIANO ----------
lf = foto.copy(); lm = masc * (~lado_esq)
for y in range(100, H):
    for x in range(630, 742):
        xs = 1590 - x
        if lm[y, x] < 0.5 and masc[y, xs] > 0.5 and xs < W:
            lf[y, x] = foto[y, xs]; lm[y, x] = masc[y, xs]
# disfarça a costura do espelho (x=742)
for y in range(100, H):
    for x in range(738, 747):
        t = (x - 737) / 10
        lf[y, x] = lf[y, 737] * (1 - t) + lf[y, 747] * t

def salva(f, m, nome):
    mi = Image.fromarray((np.clip(m, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))
    im = Image.fromarray(np.clip(f, 0, 255).astype(np.uint8)).convert('RGBA'); im.putalpha(mi)
    im = im.crop(im.getbbox())
    im = im.resize((im.width * 2, im.height * 2), Image.LANCZOS)
    im.save(f'{out}/{nome}.png'); print(nome, im.size)

salva(zf, zm, 'zeze_recorte'); salva(lf, lm, 'luciano_recorte')
