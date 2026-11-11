import React, { useState, useEffect } from 'react';
import { PYTHON_CHAPTERS, isPythonChapterUnlocked } from '../lib/pythonQuizBank';
import { isExerciseCompleted } from '../lib/userStore';
import { TrophyIcon, LockIcon, ChevronDownIcon, ChevronUpIcon, CheckIcon } from './Icons';

interface ChapterNavigationProps {
  currentChapterId: string;
  activeSubBabId?: string;
}

export const ChapterNavigation: React.FC<ChapterNavigationProps> = ({
  currentChapterId,
  activeSubBabId,
}) => {
  const [completedQuizzes, setCompletedQuizzes] = useState<Record<string, boolean>>({});
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [currentHash, setCurrentHash] = useState<string>('');

  useEffect(() => {
    const updateCompletions = () => {
      const records: Record<string, boolean> = {};
      PYTHON_CHAPTERS.forEach((c) => {
        records[c.chapterId] = isExerciseCompleted(`quiz_${c.chapterId}`);
      });
      setCompletedQuizzes(records);
    };

    updateCompletions();

    if (typeof window !== 'undefined') {
      window.addEventListener('belajar:user-updated', updateCompletions);
      return () => {
        window.removeEventListener('belajar:user-updated', updateCompletions);
      };
    }
  }, []);

  const currentChapter = PYTHON_CHAPTERS.find((c) => c.chapterId === currentChapterId);

  // Scroll spy & hash detection
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.location.hash) {
      setCurrentHash(window.location.hash);
    } else if (currentChapter && currentChapter.subBabs.length > 0) {
      setCurrentHash(currentChapter.subBabs[0].hash);
    }

    const handleHashChange = () => setCurrentHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);

    let observer: IntersectionObserver | null = null;
    if ('IntersectionObserver' in window && currentChapter) {
      const targets = [
        ...currentChapter.subBabs.map((s) => document.getElementById(s.hash.replace('#', ''))),
        document.getElementById(`kuis-${currentChapterId}`),
      ].filter(Boolean) as HTMLElement[];

      if (targets.length > 0) {
        observer = new IntersectionObserver(
          (entries) => {
            const visible = entries.find((e) => e.isIntersecting);
            if (visible && visible.target) {
              setCurrentHash(`#${visible.target.id}`);
            }
          },
          {
            rootMargin: '-10% 0px -60% 0px',
            threshold: 0,
          }
        );

        targets.forEach((t) => observer?.observe(t));
      }
    }

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      observer?.disconnect();
    };
  }, [currentChapterId, currentChapter]);

  const completedCount = Object.values(completedQuizzes).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / PYTHON_CHAPTERS.length) * 100);

  return (
    <>
      {/* Mobile Sticky Drawer Bar (< lg) */}
      <div className="lg:hidden mb-6 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="w-full px-4 py-3 bg-[var(--bg-subtle)] flex items-center justify-between text-left text-xs font-mono font-medium text-[var(--text-primary)] cursor-pointer"
          aria-expanded={isMobileOpen}
          aria-label="Toggle Silabus Bab Python"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--accent-terracotta)]"></span>
            <span className="font-bold text-[var(--text-primary)]">Silabus Bab Python:</span>
            <span className="text-[var(--accent-terracotta)]">
              {currentChapter ? `Bab ${currentChapter.chapterNumber}` : 'Daftar Materi'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[var(--text-muted)]">
              {completedCount}/{PYTHON_CHAPTERS.length} Bab Selesai
            </span>
            <span className="text-[var(--text-secondary)]">
              {isMobileOpen ? (
                <ChevronUpIcon className="w-3.5 h-3.5" />
              ) : (
                <ChevronDownIcon className="w-3.5 h-3.5" />
              )}
            </span>
          </div>
        </button>

        {isMobileOpen && (
          <div className="p-4 border-t border-[var(--border-default)] space-y-4 max-h-96 overflow-y-auto">
            {/* Progress bar in mobile drawer */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono text-[var(--text-muted)]">
                <span>Penguasaan Jalur Python</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[var(--bg-subtle)] overflow-hidden">
                <div
                  className="h-full bg-[var(--accent-terracotta)] transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Chapters list mobile */}
            <div className="space-y-2">
              {PYTHON_CHAPTERS.map((chap) => {
                const isCurrent = chap.chapterId === currentChapterId;
                const isDone = Boolean(completedQuizzes[chap.chapterId]);
                const isUnlocked = isPythonChapterUnlocked(chap.chapterId, completedQuizzes);

                return (
                  <div
                    key={`mob-${chap.chapterId}`}
                    className={`rounded-lg border transition-all ${
                      isCurrent
                        ? 'border-[var(--accent-terracotta)] bg-[var(--accent-terracotta)]/5'
                        : !isUnlocked
                        ? 'border-[var(--border-default)]/60 bg-[var(--bg-subtle)]/40 opacity-75'
                        : 'border-[var(--border-default)] bg-[var(--bg-canvas)]'
                    }`}
                  >
                    <a
                      href={`/${chap.slug}`}
                      className="p-3 flex items-center justify-between text-decoration-none group"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-bold text-[var(--accent-terracotta)]">
                            Bab {chap.chapterNumber}
                          </span>
                          <span className="text-xs font-mono px-1.5 py-0.2 rounded bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
                            {chap.level}
                          </span>
                          {!isUnlocked && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border-default)] flex items-center gap-1">
                              <LockIcon className="w-2.5 h-2.5" />
                              <span>Terkunci</span>
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-display font-semibold text-[var(--text-primary)]">
                          {chap.title}
                        </div>
                        {!isUnlocked && (
                          <div className="text-[10px] font-mono text-[var(--text-muted)]">
                            Selesaikan Kuis Bab {chap.chapterNumber - 1} untuk membuka
                          </div>
                        )}
                      </div>

                      {isDone ? (
                        <span className="w-5 h-5 rounded-full bg-[var(--state-success)] text-white flex items-center justify-center text-[10px] shrink-0" title="Bab Terverifikasi Lulus">
                          <CheckIcon className="w-3 h-3" />
                        </span>
                      ) : isCurrent ? (
                        <span className="text-[10px] font-mono text-[var(--accent-terracotta)] font-bold">
                          Aktif
                        </span>
                      ) : !isUnlocked ? (
                        <span className="text-xs text-[var(--text-muted)]"><LockIcon className="w-3.5 h-3.5" /></span>
                      ) : null}
                    </a>

                    {/* Sub-babs if current */}
                    {isCurrent && (
                      <div className="px-3 pb-3 pt-1 border-t border-[var(--border-default)] space-y-1">
                        {chap.subBabs.map((sub) => {
                          const isActive = currentHash === sub.hash;
                          return (
                            <a
                              key={`mob-sub-${sub.id}`}
                              href={sub.hash}
                              onClick={() => setIsMobileOpen(false)}
                              className={`block px-2 py-1.5 rounded text-[11px] font-mono transition-colors text-decoration-none ${
                                isActive
                                  ? 'bg-[var(--accent-terracotta)] text-white font-bold'
                                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
                              }`}
                            >
                              <span className="font-semibold text-current opacity-80 mr-1.5">
                                {sub.number}
                              </span>
                              {sub.title}
                            </a>
                          );
                        })}
                        <a
                          href={`#kuis-${chap.chapterId}`}
                          onClick={() => setIsMobileOpen(false)}
                          className="flex items-center gap-1.5 px-2 py-1.5 rounded text-[11px] font-mono font-bold text-[var(--accent-terracotta)] hover:bg-[var(--accent-terracotta)]/10 text-decoration-none"
                        >
                          <TrophyIcon className="w-3 h-3" />
                          <span>Kuis Evaluasi Bab {chap.chapterNumber}</span>
                        </a>
                        {chap.chapterId === 'python-bab5' && (
                          <a
                            href="#ujian-akhir-modul"
                            onClick={() => setIsMobileOpen(false)}
                            className="flex items-center gap-1.5 px-2 py-1.5 rounded text-[11px] font-mono font-bold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] text-decoration-none border border-[var(--border-default)] bg-[var(--bg-subtle)] mt-1"
                          >
                            <TrophyIcon className="w-3 h-3" />
                            <span>Ujian Akhir Komprehensif (Bab 1–5)</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Desktop Sticky Sidebar (lg+) */}
      <aside
        aria-label="Silabus dan Navigasi Bab Python"
        className="hidden lg:block w-72 shrink-0 sticky top-24 self-start max-h-[calc(100vh-7rem)] overflow-y-auto pr-2 space-y-5"
      >
        {/* Track Header Card */}
        <div className="p-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-[var(--accent-terracotta)]">
              Jalur Kurikulum
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#3776AB]/15 text-[#20527B] dark:text-[#68B0EB]">
              Python 3.12
            </span>
          </div>

          <div>
            <h4 className="text-sm font-bold font-display text-[var(--text-primary)]">
              Silabus Lengkap Python
            </h4>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed mt-0.5">
              Struktur bertahap Bab & Sub-bab dengan evaluasi penguasaan konsep di tiap akhir bab.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="pt-2 border-t border-[var(--border-default)] space-y-1.5">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-[var(--text-muted)]">Penguasaan:</span>
              <strong className="text-[var(--text-primary)]">
                {completedCount} / {PYTHON_CHAPTERS.length} Bab ({progressPercent}%)
              </strong>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[var(--bg-subtle)] overflow-hidden">
              <div
                className="h-full bg-[var(--accent-terracotta)] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Chapters Outline Accordion / List */}
        <nav className="space-y-2.5">
          {PYTHON_CHAPTERS.map((chap) => {
            const isCurrent = chap.chapterId === currentChapterId;
            const isDone = Boolean(completedQuizzes[chap.chapterId]);
            const isUnlocked = isPythonChapterUnlocked(chap.chapterId, completedQuizzes);

            return (
              <div
                key={`desk-${chap.chapterId}`}
                className={`rounded-xl border transition-all overflow-hidden ${
                  isCurrent
                    ? 'border-[var(--accent-terracotta)] bg-[var(--bg-surface)] shadow-xs ring-1 ring-[var(--accent-terracotta)]/20'
                    : !isUnlocked
                    ? 'border-[var(--border-default)]/60 bg-[var(--bg-surface)]/60 opacity-80'
                    : 'border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--border-focused)] opacity-90'
                }`}
              >
                {/* Chapter Link / Header */}
                <a
                  href={`/${chap.slug}`}
                  className={`p-3.5 block transition-colors text-decoration-none group ${
                    isCurrent ? 'bg-[var(--accent-terracotta)]/5' : 'hover:bg-[var(--bg-subtle)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[var(--accent-terracotta)]">
                          Bab {chap.chapterNumber}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-default)]">
                          {chap.level}
                        </span>
                        {!isUnlocked && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border-default)] flex items-center gap-1">
                            <LockIcon className="w-2.5 h-2.5" />
                            <span>Terkunci</span>
                          </span>
                        )}
                      </div>
                      <div
                        className={`text-xs font-display font-semibold transition-colors ${
                          isCurrent
                            ? 'text-[var(--accent-terracotta)] font-bold'
                            : 'text-[var(--text-primary)] group-hover:text-[var(--accent-terracotta)]'
                        }`}
                      >
                        {chap.title}
                      </div>
                      {!isUnlocked && (
                        <div className="text-[10px] font-mono text-[var(--text-muted)]">
                          Prasyarat: Lulus Kuis Bab {chap.chapterNumber - 1}
                        </div>
                      )}
                    </div>

                    {isDone ? (
                      <span
                        title="Bab ini telah lulus evaluasi"
                        className="w-5 h-5 rounded-full bg-[var(--state-success)] text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5 shadow-2xs"
                      >
                        <CheckIcon className="w-3 h-3" />
                      </span>
                    ) : isCurrent ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-terracotta)] shrink-0 mt-1.5"></span>
                    ) : !isUnlocked ? (
                      <span className="text-xs text-[var(--text-muted)] shrink-0 mt-0.5" title="Bab Terkunci">
                        <LockIcon className="w-3.5 h-3.5" />
                      </span>
                    ) : null}
                  </div>
                </a>

                {/* Sub-babs list for current chapter */}
                {isCurrent && (
                  <div className="px-3 pb-3 pt-1 border-t border-[var(--border-default)] space-y-1 bg-[var(--bg-canvas)]/60">
                    <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider px-2 py-1">
                      Sub-bab Materi:
                    </div>

                    {chap.subBabs.map((sub) => {
                      const isActive =
                        currentHash === sub.hash || activeSubBabId === sub.id;
                      return (
                        <a
                          key={`desk-sub-${sub.id}`}
                          href={sub.hash}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all text-decoration-none ${
                            isActive
                              ? 'bg-[var(--accent-terracotta)] text-white font-semibold shadow-2xs'
                              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
                          }`}
                        >
                          <span className="truncate">
                            <span className="opacity-75 mr-1.5">{sub.number}</span>
                            {sub.title}
                          </span>
                        </a>
                      );
                    })}

                    <a
                      href={`#kuis-${chap.chapterId}`}
                      className="flex items-center gap-1.5 px-2.5 py-2 mt-1 rounded-lg text-xs font-mono font-bold text-[var(--accent-terracotta)] hover:bg-[var(--accent-terracotta)]/10 transition-colors text-decoration-none border border-[var(--accent-terracotta)]/25 bg-[var(--accent-terracotta)]/5"
                    >
                      <TrophyIcon className="w-3.5 h-3.5 shrink-0" />
                      <span>Kuis Evaluasi Bab {chap.chapterNumber}</span>
                    </a>

                    {chap.chapterId === 'python-bab5' && (
                      <a
                        href="#ujian-akhir-modul"
                        className="flex items-center gap-1.5 px-2.5 py-2 mt-1.5 rounded-lg text-xs font-mono font-bold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors text-decoration-none border border-[var(--border-default)] bg-[var(--bg-subtle)]"
                      >
                        <TrophyIcon className="w-3.5 h-3.5 shrink-0" />
                        <span>Ujian Akhir Final (Bab 1–5)</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
