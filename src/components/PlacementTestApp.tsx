import React, { useState, useEffect } from 'react';
import {
  applyTestOutMastery,
  recordConceptObservation,
  loadBKTMasteryFromIndexedDB,
} from '../lib/bkt';
import { awardExerciseCompletion } from '../lib/userStore';
import { SparklesIcon, TrophyIcon, ArrowRightIcon } from './Icons';

interface PlacementQuestion {
  id: string;
  track: 'javascript' | 'python';
  level: 'L0' | 'L1' | 'L2' | 'L3';
  conceptId: string;
  prompt: string;
  codeSnippet?: string;
  options: {
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
}

const PLACEMENT_QUESTIONS: PlacementQuestion[] = [
  // JavaScript Questions
  {
    id: 'js-q1',
    track: 'javascript',
    level: 'L1',
    conceptId: 'J1-Variables-Types',
    prompt: 'Apa keluaran dari kode perbandingan kesetaraan ketat berikut?',
    codeSnippet: 'const a = "42";\nconst b = 42;\nconsole.log(a === b, a == b);',
    options: [
      {
        text: 'false true',
        isCorrect: true,
        explanation: '=== mengecek tipe dan nilai tanpa coercion (false), sedangkan == melakukan implicit coercion string ke number (true).',
      },
      {
        text: 'true true',
        isCorrect: false,
        explanation: 'Operator === tidak mengizinkan konversi tipe otomatis antar tipe string dan number.',
      },
      {
        text: 'false false',
        isCorrect: false,
        explanation: 'Operator longgar == akan mengonversi string "42" menjadi angka 42.',
      },
    ],
  },
  {
    id: 'js-q2',
    track: 'javascript',
    level: 'L2',
    conceptId: 'J2-Array-FP',
    prompt: 'Manakah method array modern di JavaScript yang mengembalikan array baru dengan elemen yang telah ditransformasikan secara murni (pure immutability)?',
    codeSnippet: 'const numbers = [1, 2, 3];\n// Ubah menjadi [2, 4, 6] tanpa memutasi array asli',
    options: [
      {
        text: 'numbers.map(x => x * 2)',
        isCorrect: true,
        explanation: 'map() membuat array baru tanpa mengubah array asal, memenuhi prinsip functional immutability.',
      },
      {
        text: 'numbers.forEach(x => x * 2)',
        isCorrect: false,
        explanation: 'forEach() selalu mengembalikan undefined dan biasanya digunakan untuk side effects.',
      },
      {
        text: 'numbers.push(2, 4, 6)',
        isCorrect: false,
        explanation: 'push() memutasi array asli dan mengembalikan panjang array baru.',
      },
    ],
  },
  {
    id: 'js-q3',
    track: 'javascript',
    level: 'L2',
    conceptId: 'J2-Closures',
    prompt: 'Apa yang dicetak ketika fungsi closure berikut dipanggil dua kali?',
    codeSnippet: 'function createCounter() {\n  let count = 0;\n  return () => ++count;\n}\nconst c = createCounter();\nconsole.log(c(), c());',
    options: [
      {
        text: '1 2',
        isCorrect: true,
        explanation: 'Variabel count tetap hidup di heap memory dalam lexical environment closure c, sehingga nilainya berlanjut bertambah.',
      },
      {
        text: '1 1',
        isCorrect: false,
        explanation: 'Variabel leksikal tidak di-reset setiap pemanggilan closure yang sama.',
      },
      {
        text: '0 1',
        isCorrect: false,
        explanation: 'Prefix increment ++count menambahkan nilai terlebih dahulu sebelum mengembalikannya.',
      },
    ],
  },
  // Python Questions
  {
    id: 'py-q1',
    track: 'python',
    level: 'L1',
    conceptId: 'P1-Name-Binding',
    prompt: 'Bagaimana model memori variabel bekerja pada CPython?',
    codeSnippet: 'x = [1, 2]\ny = x\ny.append(3)\nprint(x)',
    options: [
      {
        text: '[1, 2, 3]',
        isCorrect: true,
        explanation: 'Variabel y dan x mengikat (name binding) ke objek list yang sama di heap memory. Memutasi y juga memutasi x.',
      },
      {
        text: '[1, 2]',
        isCorrect: false,
        explanation: 'Penugasan y = x tidak membuat salinan (copy) baru melainkan mengikat referensi objek yang sama.',
      },
      {
        text: 'Error: Cannot reassign',
        isCorrect: false,
        explanation: 'Python mengizinkan mutasi objek mutable seperti list secara dinamis.',
      },
    ],
  },
  {
    id: 'py-q2',
    track: 'python',
    level: 'L2',
    conceptId: 'P2-Comprehensions',
    prompt: 'Apa hasil dari list comprehension dengan filter kondisi berikut?',
    codeSnippet: 'angka = [1, 2, 3, 4, 5, 6]\nhasil = [x ** 2 for x in angka if x % 2 == 0]\nprint(hasil)',
    options: [
      {
        text: '[4, 16, 36]',
        isCorrect: true,
        explanation: 'Hanya angka genap (2, 4, 6) yang diproses dan dipangkatkan dua: 2^2=4, 4^2=16, 6^2=36.',
      },
      {
        text: '[1, 9, 25]',
        isCorrect: false,
        explanation: 'Itu adalah kuadrat dari bilangan ganjil, sedangkan kondisinya x % 2 == 0 (genap).',
      },
      {
        text: '[2, 4, 6]',
        isCorrect: false,
        explanation: 'Ekspresi x ** 2 melakukan operasi kuadrat pada elemen yang lolos filter.',
      },
    ],
  },
  {
    id: 'py-q3',
    track: 'python',
    level: 'L2',
    conceptId: 'P2-FileIO-Exceptions',
    prompt: 'Mengapa context manager `with open(...)` sangat dianjurkan saat membaca/menulis file di Python?',
    options: [
      {
        text: 'Menjamin file otomatis ditutup dengan aman bahkan jika terjadi exception runtime.',
        isCorrect: true,
        explanation: 'Context manager secara deterministik memanggil method __exit__ untuk menutup file descriptor.',
      },
      {
        text: 'Meningkatkan kecepatan baca file hingga 10x lipat dibanding C standar.',
        isCorrect: false,
        explanation: 'Keuntungan utama adalah kebersihan alokasi resource dan exception safety, bukan percepatan komputasi 10x.',
      },
      {
        text: 'Menghindari kebutuhan import os di awal script.',
        isCorrect: false,
        explanation: 'Fungsi open() adalah fungsi bawaan (built-in), context manager with menangani resource cleanup.',
      },
    ],
  },
];

export function PlacementTestApp() {
  const [selectedTrack, setSelectedTrack] = useState<'javascript' | 'python'>('javascript');
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [placementOutcome, setPlacementOutcome] = useState<{
    recommendedLevel: string;
    levelName: string;
    lessonUrl: string;
    unlockedConcepts: string[];
    bktMasteryAverage: number;
    feedback: string;
  } | null>(null);

  useEffect(() => {
    loadBKTMasteryFromIndexedDB().catch(() => {});
  }, []);

  const activeQuestions = PLACEMENT_QUESTIONS.filter((q) => q.track === selectedTrack);
  const currentQuestion = activeQuestions[currentQIndex];

  const handleSelectOption = (idx: number) => {
    setSelectedOption(idx);
  };

  const handleNextQuestion = () => {
    if (selectedOption === null || !currentQuestion) return;

    const isCorrect = currentQuestion.options[selectedOption].isCorrect;
    const newAnswers = { ...answers, [currentQuestion.id]: selectedOption };
    setAnswers(newAnswers);

    // Update BKT concept observation
    recordConceptObservation(currentQuestion.conceptId, isCorrect);

    setSelectedOption(null);

    if (currentQIndex < activeQuestions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
    } else {
      evaluatePlacement(newAnswers);
    }
  };

  const evaluatePlacement = (finalAnswers: Record<string, number>) => {
    let correctCount = 0;
    activeQuestions.forEach((q) => {
      const chosen = finalAnswers[q.id];
      if (chosen !== undefined && q.options[chosen]?.isCorrect) {
        correctCount += 1;
      }
    });

    const percent = Math.round((correctCount / activeQuestions.length) * 100);

    if (selectedTrack === 'javascript') {
      if (percent >= 66) {
        // Qualified for J2! Test-out from J1 concepts
        const j1Concepts = ['J1-Variables-Types', 'J1-Control-Flow', 'J1-Functions'];
        applyTestOutMastery(j1Concepts);
        awardExerciseCompletion('placement_test_js', 75, 1);

        setPlacementOutcome({
          recommendedLevel: 'J2',
          levelName: 'Level J2: Core JavaScript & Struktur Data',
          lessonUrl: '/curriculum/javascript/j2',
          unlockedConcepts: ['J1 (Test-Out Sukses)', 'J2 (Terbuka Penuh)'],
          bktMasteryAverage: 0.90,
          feedback: `Luar biasa! Skor diagnostikmu ${percent}%. Fondasi J1 telah kamu kuasai, sehingga sistem menempatkanmu langsung di Level J2 dengan BKT penguasaan laten P(L) = 0.90.`,
        });
      } else {
        awardExerciseCompletion('placement_test_js', 35, 1);
        setPlacementOutcome({
          recommendedLevel: 'J1',
          levelName: 'Level J1: Fundamental JavaScript',
          lessonUrl: '/curriculum/javascript/j1',
          unlockedConcepts: ['J1 (Disarankan)'],
          bktMasteryAverage: 0.55,
          feedback: `Skor diagnostikmu ${percent}%. Kami menyarankan memulai dari Level J1 untuk memperkuat fondasi mutabilitas nilai, type coercion, dan kontrol alur modular.`,
        });
      }
    } else {
      if (percent >= 66) {
        // Qualified for P2! Test-out from P1 concepts
        const p1Concepts = ['P1-Name-Binding', 'P1-Syntax-Indentation', 'P1-Control-Flow'];
        applyTestOutMastery(p1Concepts);
        awardExerciseCompletion('placement_test_py', 75, 1);

        setPlacementOutcome({
          recommendedLevel: 'P2',
          levelName: 'Level P2: Struktur Data & Manipulasi File Python',
          lessonUrl: '/curriculum/python/p2',
          unlockedConcepts: ['P1 (Test-Out Sukses)', 'P2 (Terbuka Penuh)'],
          bktMasteryAverage: 0.90,
          feedback: `Luar biasa! Skor diagnostikmu ${percent}%. Pemahaman CPython name binding dan logikamu solid. Sistem menempatkanmu langsung di Level P2.`,
        });
      } else {
        awardExerciseCompletion('placement_test_py', 35, 1);
        setPlacementOutcome({
          recommendedLevel: 'P1',
          levelName: 'Level P1: Fondasi Pemrograman Python',
          lessonUrl: '/curriculum/python/p1',
          unlockedConcepts: ['P1 (Disarankan)'],
          bktMasteryAverage: 0.50,
          feedback: `Skor diagnostikmu ${percent}%. Disarankan memulai dari Level P1 untuk memperdalam pemahaman Zen of Python, sintaks indentasi, dan penelusuran fungsi.`,
        });
      }
    }

    setIsFinished(true);
  };

  const handleSwitchTrack = (track: 'javascript' | 'python') => {
    setSelectedTrack(track);
    setCurrentQIndex(0);
    setAnswers({});
    setSelectedOption(null);
    setIsFinished(false);
    setPlacementOutcome(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="text-center sm:text-left space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-[var(--bg-subtle)] text-[var(--accent-terracotta)] border border-[var(--border-default)]">
          <SparklesIcon className="w-3.5 h-3.5" />
          Evaluasi Mandiri & Fast-Track Level Test-Out
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-[var(--text-primary)]">
          Uji Penempatan Adaptif (Placement Test)
        </h1>
        <p className="text-base text-[var(--text-secondary)] font-serif max-w-2xl leading-relaxed">
          Punya pengalaman coding sebelumnya? Ikuti uji diagnostik adaptif ini untuk langsung membuka Level 2 (J2 / P2) tanpa harus mengulang materi dasar dari awal. Hasil evaluasi langsung memperbarui Bayesian Knowledge Tracing (BKT) di profilmu.
        </p>
      </div>

      {/* Track Selector */}
      <div className="flex items-center justify-center sm:justify-start gap-3 p-1.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-default)] w-fit">
        <button
          type="button"
          onClick={() => handleSwitchTrack('javascript')}
          className={`px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
            selectedTrack === 'javascript'
              ? 'bg-[var(--accent-terracotta)] text-white font-bold shadow-xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          Jalur JavaScript (J1 / J2)
        </button>
        <button
          type="button"
          onClick={() => handleSwitchTrack('python')}
          className={`px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
            selectedTrack === 'python'
              ? 'bg-[#3776AB] text-white font-bold shadow-xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          Jalur Python (P1 / P2)
        </button>
      </div>

      {/* Question Card */}
      {!isFinished && currentQuestion && (
        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border-default)]">
            <span className="text-xs font-mono text-[var(--accent-teal)] font-semibold uppercase tracking-wider">
              Pertanyaan {currentQIndex + 1} dari {activeQuestions.length} • Simpul Konsep: {currentQuestion.conceptId}
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border-default)]">
              {currentQuestion.level}
            </span>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg sm:text-xl font-bold font-display text-[var(--text-primary)] leading-snug">
              {currentQuestion.prompt}
            </h2>

            {currentQuestion.codeSnippet && (
              <div className="p-4 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-default)] font-mono text-xs sm:text-sm overflow-x-auto text-[var(--text-primary)]">
                <pre className="whitespace-pre">{currentQuestion.codeSnippet}</pre>
              </div>
            )}

            <div className="space-y-2.5 pt-2">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-mono transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'border-[var(--accent-terracotta)] bg-[var(--accent-terracotta)]/10 text-[var(--accent-terracotta)] font-semibold shadow-2xs'
                        : 'border-[var(--border-default)] bg-[var(--bg-canvas)] text-[var(--text-primary)] hover:border-[var(--border-focused)]'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center shrink-0 text-xs mt-0.5">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1 whitespace-pre-wrap">{option.text}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border-default)] flex items-center justify-between">
            <span className="text-xs font-mono text-[var(--text-muted)]">
              Pilih satu jawaban yang paling tepat
            </span>
            <button
              type="button"
              onClick={handleNextQuestion}
              disabled={selectedOption === null}
              className="px-5 py-2.5 rounded-lg text-xs font-mono font-semibold bg-[var(--accent-terracotta)] text-white hover:opacity-90 disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              {currentQIndex === activeQuestions.length - 1 ? 'Selesai & Evaluasi' : 'Pertanyaan Berikutnya →'}
            </button>
          </div>
        </div>
      )}

      {/* Outcome / Result Card */}
      {isFinished && placementOutcome && (
        <div className="rounded-2xl border border-[var(--border-focused)] bg-[var(--bg-surface)] p-6 sm:p-8 shadow-md space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[var(--state-success)]/15 text-[var(--state-success)] flex items-center justify-center">
              <TrophyIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--state-success)]">
                Hasil Penempatan Selesai
              </div>
              <h2 className="text-2xl font-bold font-display text-[var(--text-primary)]">
                Rekomendasi: {placementOutcome.levelName}
              </h2>
            </div>
          </div>

          <p className="text-sm sm:text-base leading-relaxed text-[var(--text-secondary)] font-serif">
            {placementOutcome.feedback}
          </p>

          <div className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-default)] space-y-2 text-xs font-mono">
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Status Pembukaan (Mastery Gate):</span>
              <strong className="text-[var(--state-success)]">
                {placementOutcome.recommendedLevel === 'J2' || placementOutcome.recommendedLevel === 'P2'
                  ? 'Level 1 Terlewati (Test-Out Berhasil)'
                  : 'Level 1 Dibuka'}
              </strong>
            </div>
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Estimasi Kemampuan Laten BKT P(L):</span>
              <strong className="text-[var(--text-primary)]">{placementOutcome.bktMasteryAverage}</strong>
            </div>
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Konsep yang Diperbarui:</span>
              <span className="text-[var(--accent-teal)]">{placementOutcome.unlockedConcepts.join(', ')}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border-default)] flex flex-wrap items-center gap-4">
            <a
              href={placementOutcome.lessonUrl}
              className="px-5 py-2.5 rounded-lg text-xs font-mono font-semibold bg-[var(--accent-terracotta)] text-white hover:opacity-90 transition-opacity flex items-center gap-2 shadow-xs text-decoration-none"
            >
              <span>Mulai Belajar di {placementOutcome.recommendedLevel}</span>
              <ArrowRightIcon className="w-4 h-4" />
            </a>

            <a
              href="/dashboard"
              className="px-4 py-2.5 rounded-lg text-xs font-mono rounded-lg border border-[var(--border-default)] bg-[var(--bg-canvas)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-focused)] transition-colors text-decoration-none"
            >
              Kembali ke Dashboard
            </a>

            <button
              type="button"
              onClick={() => handleSwitchTrack(selectedTrack)}
              className="px-3 py-2 text-xs font-mono text-[var(--text-secondary)] border border-[var(--border-default)] rounded-lg hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              ↺ Uji Ulang Jalur Ini
            </button>

            <button
              type="button"
              onClick={() => handleSwitchTrack(selectedTrack === 'javascript' ? 'python' : 'javascript')}
              className="px-3 py-2 text-xs font-mono text-[var(--accent-teal)] border border-[var(--accent-teal)]/30 rounded-lg hover:bg-[var(--accent-teal)]/10 transition-colors cursor-pointer"
            >
              → Uji Jalur {selectedTrack === 'javascript' ? 'Python (P1/P2)' : 'JavaScript (J1/J2)'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
