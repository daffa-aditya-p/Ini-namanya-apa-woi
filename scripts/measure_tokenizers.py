"""
Skrip Pengukuran Tokenizer Mandiri (Qwen2.5-Coder vs SmolLM2)
Bahasa Indonesia & Kode Pemrograman
Lokasi: scripts/measure_tokenizers.py
Platform: belajar.in
"""

import json
import os
import re
import sys
import urllib.request

SEARCH_PATHS = [
    os.environ.get("TMPDIR", "/data/data/com.termux/files/usr/tmp"),
    os.path.dirname(os.path.abspath(__file__)),
    os.getcwd(),
]

TOKENIZER_URLS = {
    "qwen_tokenizer.json": "https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct/raw/main/tokenizer.json",
    "smol_tokenizer.json": "https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct/raw/main/tokenizer.json",
}

def locate_or_download_tokenizer(filename):
    for p in SEARCH_PATHS:
        full = os.path.join(p, filename)
        if os.path.isfile(full):
            return full
    # Unduh ke direktori pertama yang bisa ditulis
    target_dir = SEARCH_PATHS[0]
    target_path = os.path.join(target_dir, filename)
    url = TOKENIZER_URLS.get(filename)
    if not url:
        raise FileNotFoundError(f"Tidak ada URL unduhan untuk {filename}")
    print(f"Mengunduh {filename} dari {url}...")
    urllib.request.urlretrieve(url, target_path)
    return target_path


class BPETokenizer:
    def __init__(self, tokenizer_data):
        self.vocab = tokenizer_data["model"]["vocab"]
        merges_raw = tokenizer_data["model"]["merges"]
        self.bpe_ranks = {}
        for i, m in enumerate(merges_raw):
            if isinstance(m, str):
                parts = tuple(m.split(" "))
            else:
                parts = tuple(m)
            self.bpe_ranks[parts] = i
        
        self.byte_encoder = self._bytes_to_unicode()
        
    def _bytes_to_unicode(self):
        bs = list(range(ord("!"), ord("~")+1)) + list(range(ord("¡"), ord("¬")+1)) + list(range(ord("®"), ord("ÿ")+1))
        cs = bs[:]
        n = 0
        for b in range(2**8):
            if b not in bs:
                bs.append(b)
                cs.append(2**8 + n)
                n += 1
        cs = [chr(n) for n in cs]
        return dict(zip(bs, cs))

    def _get_pairs(self, word):
        pairs = set()
        prev_char = word[0]
        for char in word[1:]:
            pairs.add((prev_char, char))
            prev_char = char
        return pairs

    def bpe(self, token):
        word = tuple(token)
        pairs = self._get_pairs(word)
        if not pairs:
            return token
        while True:
            min_pair = min(pairs, key=lambda pair: self.bpe_ranks.get(pair, float("inf")))
            if min_pair not in self.bpe_ranks:
                break
            first, second = min_pair
            new_word = []
            i = 0
            while i < len(word):
                try:
                    j = word.index(first, i)
                    new_word.extend(word[i:j])
                    i = j
                except ValueError:
                    new_word.extend(word[i:])
                    break
                if i < len(word) - 1 and word[i] == first and word[i+1] == second:
                    new_word.append(first + second)
                    i += 2
                else:
                    new_word.append(word[i])
                    i += 1
            word = tuple(new_word)
            if len(word) == 1:
                break
            else:
                pairs = self._get_pairs(word)
        return word

    def tokenize(self, text):
        simple_pat = re.compile(r"""'s|'t|'re|'ve|'m|'ll|'d|\w+|[^\w\s]+|\s+""")
        tokens = []
        for match in simple_pat.finditer(text):
            piece = match.group()
            piece_enc = "".join(self.byte_encoder.get(b, chr(b)) for b in piece.encode("utf-8"))
            bpe_tokens = self.bpe(piece_enc)
            tokens.extend(bpe_tokens)
        return tokens


def main():
    qwen_file = locate_or_download_tokenizer("qwen_tokenizer.json")
    smol_file = locate_or_download_tokenizer("smol_tokenizer.json")

    print("Memuat Tokenizer Qwen2.5 (151k vocab)...")
    with open(qwen_file) as f:
        qwen = BPETokenizer(json.load(f))

    print("Memuat Tokenizer SmolLM2 (49k vocab)...")
    with open(smol_file) as f:
        smol = BPETokenizer(json.load(f))

    samples = {
        "1. Socratic Hint": "Perhatikan baris ke-4. Kamu mencoba mengakses elemen array dengan indeks negatif, padahal di JavaScript indeks array dimulai dari 0 hingga panjang array dikurangi satu. Coba periksa kembali nilai variabel i sebelum memanggil daftar[i].",
        "2. Konsep Asinkron": "Pemrograman asinkron memungkinkan eksekusi kode berjalan tanpa memblokir thread utama. Ketika memanggil API cuaca BMKG, fetch mengembalikan sebuah Promise yang akan diselesaikan ketika data selesai diunduh dari jaringan.",
        "3. Diagnosis Error": "Kesalahan TypeError terjadi karena kamu menggabungkan tipe data integer dengan string secara langsung. Di Python, kamu harus mengubah angka menjadi string terlebih dahulu menggunakan fungsi str() atau menggunakan f-string seperti f'Hasil: {angka}'.",
        "4. Kode & Komentar": "function cariMaksimum(angka) {\n  let maks = angka[0];\n  for (let i = 1; i < angka.length; i++) {\n    if (angka[i] > maks) maks = angka[i];\n  }\n  return maks;\n}"
    }

    print("\n" + "="*86)
    print(f"| {'Kategori Teks':<20} | {'Chars':<6} | {'Kata':<5} | {'Qwen':<6} | {'SmolLM':<6} | {'Qwen C/T':<9} | {'Smol C/T':<9} | {'Hemat Qwen':<10} |")
    print("="*86)

    tot_c, tot_w, tot_q, tot_s = 0, 0, 0, 0

    for name, text in samples.items():
        chars = len(text)
        words = len(text.split())
        q_toks = qwen.tokenize(text)
        s_toks = smol.tokenize(text)
        
        q_len = len(q_toks)
        s_len = len(s_toks)
        
        tot_c += chars
        tot_w += words
        tot_q += q_len
        tot_s += s_len
        
        q_ct = chars / q_len
        s_ct = chars / s_len
        eff = (s_len - q_len) / s_len * 100
        
        print(f"| {name:<20} | {chars:<6} | {words:<5} | {q_len:<6} | {s_len:<6} | {q_ct:<9.2f} | {s_ct:<9.2f} | {eff:<+9.1f}% |")

    print("="*86)
    tot_eff = (tot_s - tot_q) / tot_s * 100
    print(f"| {'TOTAL RATA-RATA':<20} | {tot_c:<6} | {tot_w:<5} | {tot_q:<6} | {tot_s:<6} | {tot_c/tot_q:<9.2f} | {tot_c/tot_s:<9.2f} | {tot_eff:<+9.1f}% |")
    print("="*86)

    print("\n--- Analisis Fragmentasi Kata Kunci Bahasa Indonesia ---")
    test_words = ["pemrograman", "menggunakan", "pengulangan", "kesalahan", "memperbaiki", "menghasilkan", "antarmuka"]
    print(f"{'Kata':<15} | {'Qwen Subwords':<25} | {'SmolLM2 Subwords':<35}")
    print("-" * 80)
    for w in test_words:
        qw = qwen.tokenize(w)
        sm = smol.tokenize(w)
        print(f"{w:<15} | {str(qw):<25} | {str(sm):<35}")


if __name__ == "__main__":
    main()
