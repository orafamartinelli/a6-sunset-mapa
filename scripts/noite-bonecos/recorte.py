# Recorte do fundo da arte da atração com BiRefNet (HuggingFace ZhengPeng7/BiRefNet).
# Uso: python_embeded\python.exe recorte.py <entrada.jpg> <saida_mascara.png>
import sys, torch
from PIL import Image
from torchvision import transforms
from transformers import AutoModelForImageSegmentation

ent, sai = sys.argv[1], sys.argv[2]
modelo = AutoModelForImageSegmentation.from_pretrained('ZhengPeng7/BiRefNet', trust_remote_code=True)
dev = 'cuda' if torch.cuda.is_available() else 'cpu'
modelo.to(dev).eval().half() if dev == 'cuda' else modelo.eval()
img = Image.open(ent).convert('RGB')
tf = transforms.Compose([
    transforms.Resize((1024, 1024)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])
x = tf(img).unsqueeze(0).to(dev)
if dev == 'cuda': x = x.half()
with torch.no_grad():
    pred = modelo(x)[-1].sigmoid().float().cpu()[0, 0]
m = transforms.ToPILImage()(pred).resize(img.size, Image.BILINEAR)
m.save(sai)
print('ok', img.size)
