#!/usr/bin/env bash
# Reproducible installer for VoxCPM (https://github.com/OpenBMB/VoxCPM)
#
# VoxCPM is a tokenizer-free text-to-speech / voice-cloning system from OpenBMB.
# Requirements: Python >=3.10,<3.13 ; PyTorch >=2.5 ; CUDA 12+ for GPU (CPU works too).
set -euo pipefail

cd "$(dirname "$0")"

# Use an isolated virtualenv. The system Python ships a Debian-patched
# setuptools that fails to build several legacy deps (crcmod, jieba, oss2,
# antlr4-python3-runtime ...). A fresh venv with upstream setuptools avoids that.
python3 -m venv .venv
.venv/bin/pip install --upgrade pip setuptools wheel
.venv/bin/pip install voxcpm

echo
echo "VoxCPM installed. Verify with:"
echo "  .venv/bin/python -c 'from voxcpm import VoxCPM; print(\"ok\")'"
echo
echo "NOTE: First inference downloads the ~2B-param model weights from"
echo "Hugging Face (openbmb/VoxCPM2). This requires network access to"
echo "huggingface.co. Run the demo with:  .venv/bin/python voxcpm_demo.py"
