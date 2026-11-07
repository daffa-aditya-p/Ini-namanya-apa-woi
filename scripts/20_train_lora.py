#!/usr/bin/env python3
"""
scripts/20_train_lora.py
Production QLoRA Fine-Tuning Script for Qwen2.5-Coder-1.5B-Instruct on Google Colab GPU.

Dirancang untuk dieksekusi secara headless di lingkungan Colab via `google-colab-cli`
atau notebook environment tanpa prompt interaktif (drivemount).

Spesifikasi Pelatihan:
- Target Model: Qwen/Qwen2.5-Coder-1.5B-Instruct (Apache 2.0, Ungated)
- Kuantisasi: 4-bit NormalFloat (NF4) via bitsandbytes
- LoRA Config: rank r=16, alpha=32, target modules (all linear projections)
- Learning Rate: 1e-4 dengan Cosine Scheduler & 5% Warmup
- Checkpoint: Disimpan ke $OUTPUT_DIR atau /content/checkpoints/
"""

import argparse
import os
import sys
import json
from pathlib import Path

def parse_args():
    parser = argparse.ArgumentParser(description="QLoRA Fine-Tuning for belajar.in Socratic Tutor")
    parser.add_argument("--model-name", default=os.getenv("MODEL_NAME", "Qwen/Qwen2.5-Coder-1.5B-Instruct"), help="Base Hugging Face model identifier")
    parser.add_argument("--train-file", default=os.getenv("TRAIN_FILE", "data/train.jsonl"), help="Path to train.jsonl")
    parser.add_argument("--val-file", default=os.getenv("VAL_FILE", "data/val.jsonl"), help="Path to val.jsonl")
    parser.add_argument("--output-dir", default=os.getenv("OUTPUT_DIR", "/content/checkpoints/qwen_socratic_lora"), help="Output directory for checkpoints")
    parser.add_argument("--epochs", type=int, default=int(os.getenv("EPOCHS", "3")), help="Number of training epochs")
    parser.add_argument("--batch-size", type=int, default=int(os.getenv("BATCH_SIZE", "4")), help="Per-device batch size")
    parser.add_argument("--grad-accum", type=int, default=int(os.getenv("GRAD_ACCUM", "4")), help="Gradient accumulation steps")
    parser.add_argument("--learning-rate", type=float, default=float(os.getenv("LEARNING_RATE", "1e-4")), help="Peak learning rate")
    parser.add_argument("--lora-r", type=int, default=16, help="LoRA rank")
    parser.add_argument("--lora-alpha", type=int, default=32, help="LoRA alpha scaling")
    parser.add_argument("--lora-dropout", type=float, default=0.05, help="LoRA dropout rate")
    parser.add_argument("--dry-run", action="store_true", help="Validate setup, configuration, and dataset without initializing GPU")
    return parser.parse_args()

def validate_dataset(file_path: str) -> int:
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"Dataset file not found: {file_path}")
    count = 0
    with open(path, "r", encoding="utf-8") as f:
        for line_num, line in enumerate(f, 1):
            line = line.strip()
            if not line:
                continue
            try:
                record = json.loads(line)
                if "messages" not in record or not isinstance(record["messages"], list):
                    raise ValueError(f"Line {line_num}: missing 'messages' array")
                count += 1
            except Exception as e:
                raise ValueError(f"Invalid JSON at {file_path}:{line_num}: {e}")
    return count

def main():
    args = parse_args()
    print("=" * 70)
    print("  belajar.in — QLoRA Socratic AI Training Pipeline (Colab T4/L4 Ready)")
    print("=" * 70)
    print(f"[*] Base Model       : {args.model_name}")
    print(f"[*] Training File    : {args.train_file}")
    print(f"[*] Validation File  : {args.val_file}")
    print(f"[*] Output Directory : {args.output_dir}")
    print(f"[*] Hyperparameters  : Epochs={args.epochs}, Batch={args.batch_size}, GradAccum={args.grad_accum}, LR={args.learning_rate}")
    print(f"[*] LoRA Setup       : r={args.lora_r}, alpha={args.lora_alpha}, dropout={args.lora_dropout}")
    print("-" * 70)

    # 1. Validate Datasets
    print("[*] Validating dataset format and integrity...")
    n_train = validate_dataset(args.train_file)
    n_val = validate_dataset(args.val_file)
    print(f"[✓] Training dataset OK: {n_train} verified ChatML samples")
    print(f"[✓] Validation dataset OK: {n_val} verified ChatML samples")

    if args.dry_run:
        print("\n[✓] Dry-run check completed successfully! Configuration and dataset are fully valid.")
        print("[*] To launch full training on Colab GPU, run:")
        print("    colab launch --gpu=t4 --command 'python scripts/20_train_lora.py'")
        return

    # 2. Check GPU Environment
    try:
        import torch
        has_cuda = torch.cuda.is_available()
    except ImportError:
        has_cuda = False

    if not has_cuda:
        print("[!] No CUDA GPU detected in current environment.")
        print("[!] For actual fine-tuning, please run on a Google Colab GPU runtime (T4 or L4).")
        print("[*] Exiting after validation (code 0). Use --dry-run for CI checks.")
        sys.exit(0)

    import torch
    from transformers import (
        AutoModelForCausalLM,
        AutoTokenizer,
        BitsAndBytesConfig,
        TrainingArguments,
    )
    from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
    from datasets import load_dataset
    from trl import SFTTrainer

    gpu_name = torch.cuda.get_device_name(0)
    vram_gb = torch.cuda.get_device_properties(0).total_memory / (1024 ** 3)
    print(f"[✓] Detected GPU: {gpu_name} ({vram_gb:.2f} GB VRAM)")

    # 3. Kuantisasi NF4 4-bit
    compute_dtype = torch.bfloat16 if torch.cuda.is_bf16_supported() else torch.float16
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_use_double_quant=True,
        bnb_4bit_compute_dtype=compute_dtype,
    )

    print(f"[*] Loading base model with 4-bit NF4 quantization ({compute_dtype})...")
    tokenizer = AutoTokenizer.from_pretrained(args.model_name, trust_remote_code=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    model = AutoModelForCausalLM.from_pretrained(
        args.model_name,
        quantization_config=bnb_config,
        device_map="auto",
        trust_remote_code=True,
    )
    model = prepare_model_for_kbit_training(model)

    # 4. LoRA Adapter Config
    target_modules = [
        "q_proj", "k_proj", "v_proj", "o_proj",
        "gate_proj", "up_proj", "down_proj"
    ]
    peft_config = LoraConfig(
        r=args.lora_r,
        lora_alpha=args.lora_alpha,
        lora_dropout=args.lora_dropout,
        target_modules=target_modules,
        bias="none",
        task_type="CAUSAL_LM",
    )
    model = get_peft_model(model, peft_config)
    model.print_trainable_parameters()

    # 5. Load Datasets
    train_dataset = load_dataset("json", data_files=args.train_file, split="train")
    val_dataset = load_dataset("json", data_files=args.val_file, split="train")

    # 6. SFT Training Arguments
    out_dir = Path(args.output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    training_args = TrainingArguments(
        output_dir=str(out_dir),
        per_device_train_batch_size=args.batch_size,
        gradient_accumulation_steps=args.grad_accum,
        per_device_eval_batch_size=args.batch_size,
        learning_rate=args.learning_rate,
        lr_scheduler_type="cosine",
        warmup_ratio=0.05,
        num_train_epochs=args.epochs,
        logging_steps=10,
        eval_strategy="epoch",
        save_strategy="epoch",
        bf16=torch.cuda.is_bf16_supported(),
        fp16=not torch.cuda.is_bf16_supported(),
        save_total_limit=2,
        report_to="none",
        gradient_checkpointing=True,
    )

    trainer = SFTTrainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=val_dataset,
        peft_config=peft_config,
    )

    print("[*] Starting QLoRA fine-tuning...")
    trainer.train()

    # 7. Save Final Adapter
    final_adapter_dir = out_dir / "final_adapter"
    print(f"[*] Saving trained LoRA adapter to {final_adapter_dir}...")
    trainer.model.save_pretrained(str(final_adapter_dir))
    tokenizer.save_pretrained(str(final_adapter_dir))
    print("[✓] Fine-tuning completed and adapter saved successfully!")

if __name__ == "__main__":
    main()
