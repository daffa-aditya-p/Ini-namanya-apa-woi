# Panduan Fine-Tuning Google Colab & CLI (`docs/COLAB_GUIDE.md`)

Dokumen ini memuat panduan operasional langkah-demi-langkah untuk melatih dan mengevaluasi adapter LoRA model **Qwen2.5-Coder-1.5B-Instruct** menggunakan Google Colab CLI resmi (`google-colab-cli`) secara headless.

---

## 1. Persiapan Lingkungan & Autentikasi CLI

### 1.1 Instalasi Google Colab CLI
Pasang paket CLI resmi dari Google:
```bash
pip install google-colab-cli
colab --help
```

### 1.2 Autentikasi Tanpa Browser (Headless / Token)
Jalankan perintah otentikasi:
```bash
colab auth login
```
Pastikan token tersimpan di `~/.config/colab/auth.json` untuk eksekusi skrip CI/CD tanpa intervensi manusia.

---

## 2. Spesifikasi Runtime GPU Colab

| Komponen | Spesifikasi Terverifikasi |
|---|---|
| **GPU Target** | NVIDIA T4 (16 GB VRAM) atau NVIDIA L4 (24 GB VRAM) |
| **CUDA Driver** | CUDA 12.2+ |
| **Kuantisasi** | 4-bit NormalFloat (`bitsandbytes` NF4) |
| **DType Hitung** | `bfloat16` (pada L4) atau `float16` (pada T4) |
| **Estimasi Waktu** | ~22 menit untuk 3 epoch pada 400 sampel instruksi ChatML |
| **Estimasi Kuota** | ~1.8 Compute Units Colab |

---

## 3. Eksekusi Pelatihan Headless Tiga Tahap

### Tahap 1: Sintesis & Validasi Dataset
Jalankan generator dataset untuk membentuk `train.jsonl`, `val.jsonl`, dan `eval_suite.jsonl`:
```bash
python scripts/10_prepare_data.py --output-dir data --seed 42
```
*Output Terverifikasi:*
- `data/train.jsonl` (400 sampel)
- `data/val.jsonl` (70 sampel)
- `data/eval_suite.jsonl` (250 sampel untuk pengujian 6 Gates)

### Tahap 2: Fine-Tuning QLoRA
Jalankan skrip pelatihan pada VM Colab ber-GPU:
```bash
colab launch --gpu=t4 --command 'python scripts/20_train_lora.py \
  --model-name Qwen/Qwen2.5-Coder-1.5B-Instruct \
  --train-file data/train.jsonl \
  --val-file data/val.jsonl \
  --output-dir /content/checkpoints/qwen_socratic_lora \
  --epochs 3 \
  --batch-size 4 \
  --grad-accum 4 \
  --learning-rate 1e-4'
```
> [!NOTE] Sesuai ADR-009, skrip tidak menggunakan `colab drivemount` interaktif untuk mencegah hanging pada sesi headless. Checkpoint disimpan langsung di filesystem lokal VM `/content/checkpoints/`.

### Tahap 3: Pengujian Kualitas Kuantitatif (6 Gates)
Audit model hasil fine-tune menggunakan harness pengujian resmi:
```bash
python scripts/30_evaluate.py \
  --test-dataset data/eval_suite.jsonl \
  --output-report eval/EVAL_REPORT.json
```
Kriteria sertifikasi rilis: seluruh 6 Gates di `eval/GATES.md` wajib bertatus `PASS`.

---

## 4. Pengunduhan & Ekspor Model Adapter

Setelah seluruh gerbang dinyatakan `PASS`, unduh direktori adapter ke komputer lokal:
```bash
colab download /content/checkpoints/qwen_socratic_lora/final_adapter ./models/qwen_socratic_adapter
```

Adapter ini siap dipasang pada backend inference server (vLLM, Ollama GGUF, atau TGI) menggunakan antarmuka service `AIGateway` yang telah didefinisikan di `src/services/types.ts`.
