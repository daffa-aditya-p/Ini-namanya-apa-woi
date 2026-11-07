import { useState, useEffect, useCallback, useRef } from 'react';

export interface ProctoringState {
  tabSwitches: number;
  blurCount: number;
  fullscreenExits: number;
  copyAttempts: number;
  splitScreenDetected: boolean;
  isFullscreen: boolean;
  totalViolations: number;
  recentAlert: string | null;
}

export interface UseProctoringOptions {
  enabled: boolean;
  quizActive: boolean;
  onViolation?: (reason: string, totalCount: number) => void;
}

export function useProctoring({
  enabled = true,
  quizActive = false,
  onViolation,
}: UseProctoringOptions) {
  const [tabSwitches, setTabSwitches] = useState(0);
  const [blurCount, setBlurCount] = useState(0);
  const [fullscreenExits, setFullscreenExits] = useState(0);
  const [copyAttempts, setCopyAttempts] = useState(0);
  const [splitScreenDetected, setSplitScreenDetected] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [recentAlert, setRecentAlert] = useState<string | null>(null);

  const initialWidthRef = useRef<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  const timeoutRef = useRef<number | null>(null);

  const triggerAlert = useCallback(
    (message: string) => {
      setRecentAlert(message);
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(() => {
        setRecentAlert(null);
      }, 5000);
    },
    []
  );

  const totalViolations = tabSwitches + blurCount + fullscreenExits + copyAttempts;

  const notifyViolation = useCallback(
    (reason: string, newTotal: number) => {
      triggerAlert(`⚠️ Peringatan Integritas: ${reason} (Pelanggaran #${newTotal})`);
      if (onViolation) {
        onViolation(reason, newTotal);
      }
    },
    [onViolation, triggerAlert]
  );

  // Copy / Cut protection handler
  const handleCopyProtection = useCallback(
    (e: React.ClipboardEvent | ClipboardEvent) => {
      if (!enabled || !quizActive) return;
      e.preventDefault();
      setCopyAttempts((prev) => {
        const next = prev + 1;
        notifyViolation('Penyalinan / Pemotongan Teks Dinonaktifkan', totalViolations + 1);
        return next;
      });
    },
    [enabled, quizActive, notifyViolation, totalViolations]
  );

  // Context menu protection handler
  const handleContextMenuProtection = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      if (!enabled || !quizActive) return;
      e.preventDefault();
      setCopyAttempts((prev) => {
        const next = prev + 1;
        notifyViolation('Klik Kanan (Context Menu) Dinonaktifkan', totalViolations + 1);
        return next;
      });
    },
    [enabled, quizActive, notifyViolation, totalViolations]
  );

  // Fullscreen toggle
  const toggleFullscreen = useCallback(async () => {
    if (typeof document === 'undefined') return;
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // Browser permissions may restrict programmatic fullscreen
    }
  }, []);

  // Monitor visibilitychange & window blur
  useEffect(() => {
    if (typeof window === 'undefined' || !enabled || !quizActive) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches((prev) => {
          const next = prev + 1;
          notifyViolation('Beralih Tab / Aplikasi Lain Terdeteksi', totalViolations + 1);
          return next;
        });
      }
    };

    const handleWindowBlur = () => {
      // Ignore if document is already hidden (visibilitychange will catch it)
      if (!document.hidden) {
        setBlurCount((prev) => {
          const next = prev + 1;
          notifyViolation('Kehilangan Fokus Jendela Kuis', totalViolations + 1);
          return next;
        });
      }
    };

    const handleFullscreenChange = () => {
      const activeFs = Boolean(document.fullscreenElement);
      setIsFullscreen(activeFs);
      if (!activeFs && quizActive) {
        setFullscreenExits((prev) => {
          const next = prev + 1;
          notifyViolation('Keluar dari Mode Layar Penuh (Fullscreen)', totalViolations + 1);
          return next;
        });
      }
    };

    const checkSplitScreen = () => {
      const currentWidth = window.innerWidth;
      const screenWidth = window.screen.availWidth || window.innerWidth;
      const initialWidth = initialWidthRef.current;

      // Multitasking or split-screen triggers:
      // 1. Width shrunk by > 25% compared to start
      // 2. Width is less than 50% of available screen on a non-mobile display
      const isShrunkSignificantly = initialWidth > 768 && currentWidth < initialWidth * 0.72;
      const isNarrowRatio = screenWidth > 800 && currentWidth / screenWidth < 0.6;
      const isNarrowSplit = currentWidth < 460 && screenWidth >= 600;

      const isSplit = isShrunkSignificantly || isNarrowRatio || isNarrowSplit;
      setSplitScreenDetected(isSplit);
      if (isSplit) {
        triggerAlert('⚠️ Terdeteksi Layar Terbelah (Split-Screen / Multitasking). Gunakan layar penuh agar evaluasi valid!');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('resize', checkSplitScreen);

    // Initial split check
    checkSplitScreen();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('resize', checkSplitScreen);
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, quizActive, notifyViolation, totalViolations, triggerAlert]);

  const resetProctoring = useCallback(() => {
    setTabSwitches(0);
    setBlurCount(0);
    setFullscreenExits(0);
    setCopyAttempts(0);
    setSplitScreenDetected(false);
    setRecentAlert(null);
  }, []);

  return {
    tabSwitches,
    blurCount,
    fullscreenExits,
    copyAttempts,
    splitScreenDetected,
    isFullscreen,
    totalViolations,
    recentAlert,
    toggleFullscreen,
    handleCopyProtection,
    handleContextMenuProtection,
    resetProctoring,
    dismissAlert: () => setRecentAlert(null),
  };
}
