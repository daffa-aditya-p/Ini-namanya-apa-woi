import React, { useState, useEffect } from 'react';
import { isExerciseCompleted } from '../lib/userStore';
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  ArrowDownIcon,
  LockIcon,
  CheckIcon,
} from './Icons';

interface ChapterLink {
  title: string;
  slug: string;
  number: number;
}

interface ChapterFooterNavProps {
  currentChapterId: string;
  currentChapterNumber: number;
  prevChapter: ChapterLink | null;
  nextChapter: ChapterLink | null;
}

export const ChapterFooterNav: React.FC<ChapterFooterNavProps> = ({
  currentChapterId,
  currentChapterNumber,
  prevChapter,
  nextChapter,
}) => {
  const [isCurrentQuizPassed, setIsCurrentQuizPassed] = useState(false);

  useEffect(() => {
    const checkMastery = () => {
      setIsCurrentQuizPassed(isExerciseCompleted(`quiz_${currentChapterId}`));
    };

    checkMastery();

    if (typeof window !== 'undefined') {
      window.addEventListener('belajar:user-updated', checkMastery);
      return () => {
        window.removeEventListener('belajar:user-updated', checkMastery);
      };
    }
  }, [currentChapterId]);

  const handleScrollToQuiz = () => {
    if (typeof window !== 'undefined') {
      const quizEl = document.getElementById(`kuis-${currentChapterId}`);
      if (quizEl) {
        quizEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div className="mt-12 pt-6 border-t border-[var(--border-default)] flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
      {prevChapter ? (
        <a
          href={`/${prevChapter.slug}`}
          className="px-4 py-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--border-focused)] hover:text-[var(--text-primary)] transition-colors text-decoration-none flex items-center gap-1.5 shadow-2xs"
        >
          <ArrowLeftIcon className="w-3.5 h-3.5" />
          <span>Bab {prevChapter.number}: {prevChapter.title}</span>
        </a>
      ) : (
        <a
          href="/"
          className="px-4 py-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--border-focused)] hover:text-[var(--text-primary)] transition-colors text-decoration-none flex items-center gap-1.5"
        >
          <ArrowLeftIcon className="w-3.5 h-3.5" />
          <span>Beranda</span>
        </a>
      )}

      {nextChapter ? (
        isCurrentQuizPassed ? (
          <a
            href={`/${nextChapter.slug}`}
            className="px-5 py-2.5 rounded-lg bg-[var(--text-primary)] text-[var(--bg-canvas)] font-bold hover:opacity-90 transition-opacity text-decoration-none flex items-center gap-1.5 shadow-2xs"
          >
            <span>Lanjut ke Bab {nextChapter.number}: {nextChapter.title}</span>
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </a>
        ) : (
          <button
            type="button"
            onClick={handleScrollToQuiz}
            className="px-4 py-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-focused)] transition-all flex items-center gap-2 shadow-2xs cursor-pointer text-left"
            title="Luluskan Kuis Evaluasi Bab ini (≥80%) untuk membuka bab berikutnya"
          >
            <LockIcon className="w-3.5 h-3.5 shrink-0" />
            <span>Luluskan Kuis Bab {currentChapterNumber} untuk Buka Bab {nextChapter.number}</span>
            <ArrowDownIcon className="w-3 h-3 opacity-60" />
          </button>
        )
      ) : (
        <a
          href="/dashboard"
          className="px-5 py-2.5 rounded-lg bg-[var(--text-primary)] text-[var(--bg-canvas)] font-bold hover:opacity-90 transition-opacity text-decoration-none flex items-center gap-1.5 shadow-2xs"
        >
          <span>Kembali ke Meja Kerja</span>
          <CheckIcon className="w-3.5 h-3.5" />
        </a>
      )}
    </div>
  );
};
