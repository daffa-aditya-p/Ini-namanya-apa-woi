import React, { useState, useEffect } from 'react';
import { isPythonChapterUnlocked, getPreviousPythonChapter } from '../lib/pythonQuizBank';
import { isExerciseCompleted } from '../lib/userStore';

interface ChapterLockBannerProps {
  chapterId: string;
}

export const ChapterLockBanner: React.FC<ChapterLockBannerProps> = ({ chapterId }) => {
  const [isUnlocked, setIsUnlocked] = useState(true);

  useEffect(() => {
    const checkStatus = () => {
      const unlocked = isPythonChapterUnlocked(chapterId);
      setIsUnlocked(unlocked);
    };

    checkStatus();

    if (typeof window !== 'undefined') {
      window.addEventListener('belajar:user-updated', checkStatus);
      return () => {
        window.removeEventListener('belajar:user-updated', checkStatus);
      };
    }
  }, [chapterId]);

  if (isUnlocked) {
    return null;
  }

  const prev = getPreviousPythonChapter(chapterId);
  if (!prev) return null;

  const prevQuizDone = isExerciseCompleted(`quiz_${prev.chapterId}`);
  if (prevQuizDone) return null;

  return (
    <div
      role="alert"
      className="mb-8 p-5 rounded-2xl border-2 border-amber-500/40 bg-amber-500/10 text-[var(--text-primary)] shadow-xs animate-in fade-in duration-300"
    >
      <div className="flex items-start gap-3.5">
        <span className="text-2xl leading-none select-none">🔒</span>
        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30">
              Bab Ini Masih Terkunci
            </span>
            <span className="text-xs font-mono text-[var(--text-secondary)]">
              Prasyarat: Lulus Kuis Evaluasi Bab {prev.chapterNumber} (≥80%)
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans leading-relaxed">
            Kamu belum menyelesaikan kuis evaluasi <strong>Bab {prev.chapterNumber}: {prev.title}</strong>. Agar alur pemahamanmu tidak bingung dan berantakan, selesaikan bab sebelumnya terlebih dahulu sebelum mempelajari materi ini.
          </p>

          <div className="pt-1 flex flex-wrap items-center gap-3 font-mono text-xs">
            <a
              href={`/${prev.slug}#kuis-${prev.chapterId}`}
              className="px-4 py-2 rounded-xl font-bold bg-[var(--accent-terracotta)] text-white hover:opacity-95 transition-all text-decoration-none shadow-2xs inline-flex items-center gap-1.5"
            >
              <span>← Selesaikan Kuis Bab {prev.chapterNumber} Sekarang</span>
            </a>
            <span className="text-[11px] text-[var(--text-muted)]">
              (Kamu tetap dapat membaca materi di bawah sebagai referensi)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
