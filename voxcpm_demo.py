"""Minimal VoxCPM text-to-speech demo.

Run inside the project's virtualenv:
    .venv/bin/python voxcpm_demo.py

On first run this downloads the openbmb/VoxCPM2 model weights from
Hugging Face (~several GB). A GPU is recommended but CPU works (slower).
"""
from voxcpm import VoxCPM
import soundfile as sf


def main() -> None:
    model = VoxCPM.from_pretrained("openbmb/VoxCPM2", load_denoiser=False)
    wav = model.generate(
        text="VoxCPM2 generates realistic multilingual speech synthesis.",
        cfg_value=2.0,
        inference_timesteps=10,
    )
    sf.write("demo.wav", wav, model.tts_model.sample_rate)
    print("Wrote demo.wav")


if __name__ == "__main__":
    main()
