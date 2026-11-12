import React, { useState, useEffect } from 'react';
import { isPythonChapterUnlocked, getPreviousPythonChapter } from '../lib/pythonQuizBank';
import { isExerciseCompleted } from '../lib/userStore';
import { LockIcon, ArrowLeftIcon } from './Icons';

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
      className="mb-8 p-5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-2xs"
    >
      <div className="flex items-start gap-3.5">
        <span className="w-8 h-8 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-default)] flex items-center justify-center shrink-0 mt-0.5">
          <LockIcon className="w-4 h-4 text-[var(--text-secondary)]" />
        </span>
        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-[var(--bg-subtle)] text-[var(--text-primary)] border border-[var(--border-default)]">
              Bab Ini Belum Terbuka
            </span>
            <span className="text-xs font-mono text-[var(--text-secondary)]">
              Prasyarat: Lulus Kuis Evaluasi Bab {prev.chapterNumber} (≥80%)
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans leading-relaxed">
            Kamu belum menyelesaikan kuis evaluasi <strong>Bab {prev.chapterNumber}: {prev.title}</strong>. Agar alur pemahamanmu terstruktur, selesaikan bab sebelumnya terlebih dahulu.
          </p>

          <div className="pt-1 flex flex-wrap items-center gap-3 font-mono text-xs">
            <a
              href={`/${prev.slug}#kuis-${prev.chapterId}`}
              className="px-3.5 py-1.5 rounded-lg font-medium bg-[var(--text-primary)] text-[var(--bg-canvas)] hover:opacity-90 transition-opacity text-decoration-none shadow-2xs inline-flex items-center gap-1.5"
            >
              <ArrowLeftIcon className="w-3.5 h-3.5" />
              <span>Selesaikan Kuis Bab {prev.chapterNumber}</span>
            </a>
            <span className="text-[11px] text-[var(--text-muted)]">
              (Materi di bawah tetap dapat dibaca sebagai referensi)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
