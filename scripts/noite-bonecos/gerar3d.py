# Plano A: forma 3D de cada cantor com Hunyuan3D-2mini-turbo (nós nativos do ComfyUI).
# Sobe o ComfyUI, manda os 2 trabalhos, copia os .glb para C:\IA\bonecos-sunset e desliga.
# Uso (pela fila de render): python_embeded\python.exe gerar3d.py [passos] [cfg]
import json, os, shutil, subprocess, sys, time, urllib.request
from PIL import Image

BASE = r'C:\IA\ComfyUI_windows_portable'
COMFY = os.path.join(BASE, 'ComfyUI')
TRAB = r'C:\IA\bonecos-sunset'
PORTA = 8199
passos = int(sys.argv[1]) if len(sys.argv) > 1 else 8
cfg = float(sys.argv[2]) if len(sys.argv) > 2 else 5.0

# entradas: recorte centralizado num quadrado branco (borda de 12%)
for nome in ('zeze', 'luciano'):
    im = Image.open(os.path.join(TRAB, f'{nome}_recorte.png')).convert('RGBA')
    lado = int(max(im.size) / 0.76)
    q = Image.new('RGBA', (lado, lado), (255, 255, 255, 255))
    q.alpha_composite(im, ((lado - im.width) // 2, (lado - im.height) // 2))
    q.convert('RGB').resize((768, 768), Image.LANCZOS).save(os.path.join(COMFY, 'input', f'{nome}_in.png'))

def api(caminho, dados=None):
    req = urllib.request.Request(f'http://127.0.0.1:{PORTA}{caminho}',
                                 data=json.dumps(dados).encode() if dados is not None else None,
                                 headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())

log = open(os.path.join(TRAB, 'comfy.log'), 'w', encoding='utf-8')
proc = subprocess.Popen([os.path.join(BASE, 'python_embeded', 'python.exe'), '-s', 'main.py', '--port', str(PORTA),
                         '--disable-auto-launch'], cwd=COMFY, stdout=log, stderr=subprocess.STDOUT)
try:
    for _ in range(180):
        try: api('/system_stats'); break
        except Exception: time.sleep(1)
    else:
        raise SystemExit('ComfyUI não subiu em 3 min')
    ids = {}
    for nome in ('zeze', 'luciano'):
        wf = {
            '1': {'class_type': 'ImageOnlyCheckpointLoader', 'inputs': {'ckpt_name': 'hunyuan3d-dit-v2-mini-turbo.safetensors'}},
            '2': {'class_type': 'LoadImage', 'inputs': {'image': f'{nome}_in.png'}},
            '3': {'class_type': 'CLIPVisionEncode', 'inputs': {'clip_vision': ['1', 1], 'image': ['2', 0], 'crop': 'none'}},
            '4': {'class_type': 'Hunyuan3Dv2Conditioning', 'inputs': {'clip_vision_output': ['3', 0]}},
            '5': {'class_type': 'EmptyLatentHunyuan3Dv2', 'inputs': {'resolution': 3072, 'batch_size': 1}},
            '6': {'class_type': 'KSampler', 'inputs': {'model': ['1', 0], 'positive': ['4', 0], 'negative': ['4', 1],
                  'latent_image': ['5', 0], 'seed': 7, 'steps': passos, 'cfg': cfg, 'sampler_name': 'euler',
                  'scheduler': 'normal', 'denoise': 1.0}},
            '7': {'class_type': 'VAEDecodeHunyuan3D', 'inputs': {'samples': ['6', 0], 'vae': ['1', 2], 'num_chunks': 8000, 'octree_resolution': 256}},
            '8': {'class_type': 'VoxelToMesh', 'inputs': {'voxel': ['7', 0], 'algorithm': 'surface net', 'threshold': 0.6}},
            '9': {'class_type': 'SaveGLB', 'inputs': {'mesh': ['8', 0], 'filename_prefix': f'bonecos/{nome}'}},
        }
        ids[nome] = api('/prompt', {'prompt': wf})['prompt_id']
    inicio = time.time()
    feitos = set()
    while len(feitos) < len(ids) and time.time() - inicio < 1500:
        time.sleep(3)
        for nome, pid in ids.items():
            if nome in feitos: continue
            h = api(f'/history/{pid}')
            if pid in h:
                st = h[pid].get('status', {})
                if st.get('status_str') == 'error':
                    print(nome, 'ERRO', json.dumps(st)[:1500]); feitos.add(nome); continue
                for saida in h[pid].get('outputs', {}).values():
                    for chave in ('3d', 'meshes', 'result', 'files'):
                        for arq in saida.get(chave, []) if isinstance(saida.get(chave), list) else []:
                            if isinstance(arq, dict) and arq.get('filename', '').endswith('.glb'):
                                src = os.path.join(COMFY, 'output', arq.get('subfolder', ''), arq['filename'])
                                shutil.copy(src, os.path.join(TRAB, f'{nome}_forma.glb'))
                    print(nome, 'saidas', json.dumps(saida)[:400])
                feitos.add(nome); print(nome, 'ok em', int(time.time() - inicio), 's')
finally:
    proc.terminate()
    try: proc.wait(20)
    except Exception: proc.kill()
