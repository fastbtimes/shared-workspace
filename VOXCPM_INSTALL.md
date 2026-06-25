# VoxCPM Installation

[VoxCPM](https://github.com/OpenBMB/VoxCPM) is a tokenizer-free text-to-speech
and voice-cloning system from OpenBMB. The current release (`voxcpm` 2.0.3,
"VoxCPM2") is a ~2B-parameter model supporting 30 languages, voice design from
text descriptions, controllable voice cloning, and 48 kHz audio output.

## What was installed

- `voxcpm` **2.0.3** and its full dependency tree (PyTorch 2.12.1, transformers,
  funasr, gradio, librosa, etc.) into an isolated virtualenv at `.venv/`.
- Verified: `from voxcpm import VoxCPM` imports successfully and `torch` loads.

## Requirements

| Component | Requirement | This environment |
|-----------|-------------|------------------|
| Python    | >=3.10, <3.13 | 3.11.15 ✅ |
| PyTorch   | >=2.5       | 2.12.1 ✅ |
| CUDA/GPU  | CUDA 12+ (optional) | none — CPU only |

CUDA is unavailable here, so inference runs on CPU (functional but slow).

## Install

```bash
./install_voxcpm.sh          # creates .venv and installs voxcpm
```

### Why a virtualenv?

The system Python ships a Debian-patched `setuptools` that fails to build
several legacy dependencies (`crcmod`, `jieba`, `oss2`, `aliyun-python-sdk-core`,
`antlr4-python3-runtime`) with `AttributeError: install_layout`. A fresh venv
with upstream `setuptools`/`wheel` builds them cleanly.

## Usage

```bash
.venv/bin/python voxcpm_demo.py   # writes demo.wav
```

```python
from voxcpm import VoxCPM
import soundfile as sf

model = VoxCPM.from_pretrained("openbmb/VoxCPM2", load_denoiser=False)
wav = model.generate(
    text="VoxCPM2 generates realistic multilingual speech synthesis.",
    cfg_value=2.0,
    inference_timesteps=10,
)
sf.write("demo.wav", wav, model.tts_model.sample_rate)
```

## Note on model weights

The package is installed and importable, but **end-to-end generation could not be
run in this session**: the first call to `from_pretrained` downloads the model
weights from `huggingface.co`, which is blocked by this environment's outbound
egress policy (proxy returns `403 Forbidden` for `huggingface.co:443`). In an
environment with Hugging Face access the demo will download the weights and run.

If only ModelScope is reachable, weights can instead be fetched with:

```python
from modelscope import snapshot_download
snapshot_download("OpenBMB/VoxCPM2", local_dir="./pretrained_models/VoxCPM2")
```
