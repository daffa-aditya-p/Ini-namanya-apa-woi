# Gerbang Evaluasi Kualitas Model AI (eval/GATES.md)

**Platform:** belajar.in  
**Model Target:** Qwen/Qwen2.5-Coder-1.5B-Instruct  
**Arsitektur Pelatihan:** Parameter-Efficient Fine-Tuning (QLoRA 4-bit NF4, LoRA $r=16, \alpha=32$)  
**Lingkungan Pelatihan:** Google Colab GPU (NVIDIA T4 16GB / L4 24GB via `google-colab-cli`)  
**Metodologi Pengujian:** Clopper-Pearson Exact Binomial 95% Confidence Interval & Statistical Gates  

---

## 1. Landasan Filosofis: Anti-Halusinasi & Pedagogi Sokratik

Model AI pada platform **belajar.in** mengemban peran sebagai **Tutor Sokratik Adaptif** dan **Auditor Kode Ramah Pemula**. Oleh karena itu, model tidak diperbolehkan bertindak layaknya generator kode instan ("vibe coding") yang langsung memuntahkan jawaban jadi. Model wajib:
1. Menuntun pemikiran murid melalui tangga petunjuk (*Socratic Hint Ladder*) bertahap (Konseptual $\rightarrow$ Sintaktis $\rightarrow$ Faded Scaffold $\rightarrow$ Solusi Penuh).
2. Membumikan setiap penjelasan teknis pada referensi resmi kurikulum (*Grounding Citations*).
3. Bersikap jujur dan menolak menjawab (*Abstention*) apabila pertanyaan berada di luar cakupan pedagogis atau mengandung premis keliru (*ungrounded / malicious prompt*).
4. Menghasilkan kode yang **100% lulus eksekusi** di runtime sandboxed tanpa galat sintaks.

---

## 2. Matriks 6 Gerbang Kualitas (Quality Gates)

| No | Gerbang Evaluasi | Definisi & Tolok Ukur | Ukuran Sampel ($N$) | Ambang Kelulusan | Interval Kepercayaan (95% CI) | Status Kegagalan |
|---|---|---|---|---|---|---|
| **Gate 1** | **Generalization Gap** | Perbedaan nilai kerugian validasi dan pelatihan: $\text{Loss}_{\text{val}} - \text{Loss}_{\text{train}}$ | $N = 250$ pasangan prompt-respons subset validasi | $\le 0.15$ | Ambang Heuristik Empiris | Tolak adapter; indikasi overfitting |
| **Gate 2** | **Unsupported-Claim Rate** | Persentase klaim teknis yang tidak berdasar pada referensi kurikulum/spesifikasi | $N = 250$ respons acak audit silang grounding | Cacat $k \le 1$ ($p_{\text{est}} \le 0.4\%$) | Batas atas Clopper-Pearson $\le 2.0\%$ ($p_{\text{upper}} = 1.88\%$) | Tolak rilis; bahaya miskonsepsi |
| **Gate 3** | **Citation Accuracy** | Ketepatan penyebutan ID modul kurikulum (J1-J3, P1-P3) dan spesifikasi resmi | $N = 250$ klaim sitasi | Salah $k \le 1$ ($p_{\text{est}} \ge 99.6\%$) | Batas bawah Clopper-Pearson $\ge 98.0\%$ ($p_{\text{lower}} = 98.12\%$) | Model dilarang merujuk modul fiktif |
| **Gate 4** | **Code Execution Pass Rate** | Seluruh cuplikan kode dalam respons tutor dieksekusi di runner Vitest/Pyodide | $N = 200$ snippet kode terisolasi | $100\%$ lulus tanpa error ($k = 0$) | Batas bawah Clopper-Pearson $\ge 98.51\%$ | Tolak rilis; dilarang memberi kode rusak |
| **Gate 5** | **Abstention F1-Score** | Ketepatan menolak pertanyaan adversarial / di luar cakupan JavaScript & Python | $N = 200$ ($100$ adversarial + $100$ in-scope) | Point estimate $F_1 \ge 0.95$ | Precision & Recall batas bawah 95% CI $\ge 91.8\%$ | Gagalkan adapter; risiko halusinasi |
| **Gate 6** | **Baseline Outperformance** | Model adapter wajib mengalahkan Base Model + Few-Shot Prompting via uji McNemar | $N = 150$ evaluasi komparatif buta | $p < 0.05$ signifikan | Uji beda proporsi berpasangan | Jika gagal, gunakan Base Model murni |

---

## 3. Formulasi Statistik & Bukti Ukuran Sampel $N$

### 3.1 Mengapa Sampel $N = 100$ Ditolak Secara Matematis
Untuk mengklaim tingkat kegagalan $p \le 2.0\%$ dengan keyakinan 95%:
Jika diuji pada $N = 100$ sampel dan menghasilkan 0 kesalahan ($k = 0$):
$$\text{Batas Atas Clopper-Pearson } = 1 - (0.05)^{1/100} = 1 - 0.97048 = 2.95\%$$
Karena $2.95\% > 2.0\%$, sampel $N = 100$ **secara matematis tidak memadai** untuk membuktikan klaim $p \le 2.0\%$, bahkan saat tidak ada satu pun kesalahan ditemukan.

### 3.2 Penetapan Sampel $N = 250$
Dengan $N = 250$ dan toleransi realistis $k \le 1$ kesalahan:
$$p_{\text{upper}} = 1 - \beta(0.05; 250 - 1 + 1, 1) = 1.88\% \le 2.0\%$$
Oleh karena itu, $N = 250$ adalah batas minimum yang valid secara ilmiah untuk menguji Gate 2 dan Gate 3.

---

## 4. Prosedur Audit Otomatis Headless

Pengujian seluruh gerbang dijalankan melalui skrip evaluasi mandiri:
```bash
python scripts/30_evaluate.py \
  --checkpoint-dir /content/checkpoints/final_adapter \
  --test-dataset data/eval_suite.jsonl \
  --output-report eval/EVAL_REPORT.json
```

Hasil evaluasi akan menghasilkan laporan biner (`PASS` atau `FAIL`):
- Jika **seluruh 6 Gate PASS**: Adapter model dinyatakan lolos sertifikasi dan diekspor ke format GGUF / SafeTensors untuk integrasi backend.
- Jika **salah satu Gate FAIL**: Pipeline otomatis menandai build sebagai ditolak (*rejected*), mengarsipkan log kegagalan, dan fallback ke Base Model dengan prompt RAG ketat.
