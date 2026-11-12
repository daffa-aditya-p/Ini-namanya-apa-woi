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

export function isSplitScreenDetected(
  currentWidth: number,
  currentHeight: number,
  initialWidth: number,
  initialHeight: number,
  screenWidth: number,
  screenHeight: number
): boolean {
  // 1. Desktop side-by-side split / window shrinkage
  const isShrunkSignificantly = initialWidth > 768 && currentWidth < initialWidth * 0.72;
  const isNarrowRatio = screenWidth > 800 && currentWidth / screenWidth < 0.6;
  const isNarrowSplit = currentWidth < 460 && screenWidth >= 600;

  // 2. Mobile vertical split screen (portrait top/bottom multitasking)
  const isPortrait = screenHeight > screenWidth;
  const isHeightShrunk =
    isPortrait && initialHeight > 450 && currentHeight < initialHeight * 0.72;
  const isNarrowHeightRatio =
    isPortrait && screenHeight > 550 && currentHeight / screenHeight < 0.62;

  return (
    isShrunkSignificantly ||
    isNarrowRatio ||
    isNarrowSplit ||
    isHeightShrunk ||
    isNarrowHeightRatio
  );
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
  const initialHeightRef = useRef<number>(
    typeof window !== 'undefined' ? window.innerHeight : 768
  );
  const timeoutRef = useRef<number | null>(null);
  const blurTimeoutRef = useRef<number | null>(null);
  const lastTabSwitchRef = useRef<number>(0);
  const violationsCountRef = useRef<number>(0);

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
      triggerAlert(`Peringatan Integritas: ${reason} (Pelanggaran #${newTotal})`);
      if (onViolation) {
        onViolation(reason, newTotal);
      }
    },
    [onViolation, triggerAlert]
  );

  // Copy / Cut protection handler - protects question content while permitting editor typing
  const handleCopyProtection = useCallback(
    (e: React.ClipboardEvent | ClipboardEvent) => {
      if (!enabled || !quizActive) return;

      const target = e.target as HTMLElement | null;
      // Allow copying / cutting within code editor (CodeMirror or textarea) so students can edit code
      if (
        target &&
        (target.closest('.cm-editor') ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'INPUT')
      ) {
        return;
      }

      e.preventDefault();
      violationsCountRef.current += 1;
      const count = violationsCountRef.current;
      setCopyAttempts((prev) => prev + 1);
      notifyViolation('Penyalinan / Pemotongan Teks Soal Dinonaktifkan', count);
    },
    [enabled, quizActive, notifyViolation]
  );

  // Context menu protection handler
  const handleContextMenuProtection = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      if (!enabled || !quizActive) return;

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.closest('.cm-editor') ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'INPUT')
      ) {
        return;
      }

      e.preventDefault();
      violationsCountRef.current += 1;
      const count = violationsCountRef.current;
      setCopyAttempts((prev) => prev + 1);
      notifyViolation('Klik Kanan (Context Menu) Dinonaktifkan pada Soal', count);
    },
    [enabled, quizActive, notifyViolation]
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

  // Monitor visibilitychange, window blur, fullscreen, and split-screen
  useEffect(() => {
    if (typeof window === 'undefined' || !enabled || !quizActive) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Cancel any pending blur timer to prevent double-counting on tab switch
        if (blurTimeoutRef.current) {
          window.clearTimeout(blurTimeoutRef.current);
          blurTimeoutRef.current = null;
        }
        lastTabSwitchRef.current = Date.now();
        violationsCountRef.current += 1;
        const count = violationsCountRef.current;
        setTabSwitches((prev) => prev + 1);
        notifyViolation('Beralih Tab / Aplikasi Lain Terdeteksi', count);
      }
    };

    const handleWindowBlur = () => {
      // If already hidden or a tab switch just fired, avoid duplicate blur counting
      if (document.hidden || Date.now() - lastTabSwitchRef.current < 250) {
        return;
      }

      // Schedule a 150ms debounce window. If visibilitychange fires within 150ms,
      // it is a tab switch, not an isolated window blur.
      if (blurTimeoutRef.current) {
        window.clearTimeout(blurTimeoutRef.current);
      }

      blurTimeoutRef.current = window.setTimeout(() => {
        if (!document.hidden && quizActive) {
          violationsCountRef.current += 1;
          const count = violationsCountRef.current;
          setBlurCount((prev) => prev + 1);
          notifyViolation('Kehilangan Fokus Jendela Kuis', count);
        }
        blurTimeoutRef.current = null;
      }, 150);
    };

    const handleWindowFocus = () => {
      if (blurTimeoutRef.current) {
        window.clearTimeout(blurTimeoutRef.current);
        blurTimeoutRef.current = null;
      }
    };

    const handleFullscreenChange = () => {
      const activeFs = Boolean(document.fullscreenElement);
      setIsFullscreen(activeFs);
      if (!activeFs && quizActive) {
        violationsCountRef.current += 1;
        const count = violationsCountRef.current;
        setFullscreenExits((prev) => prev + 1);
        notifyViolation('Keluar dari Mode Layar Penuh (Fullscreen)', count);
      }
    };

    const checkSplitScreen = () => {
      const currentWidth = window.innerWidth;
      const currentHeight = window.innerHeight;
      const screenWidth = window.screen.availWidth || window.innerWidth;
      const screenHeight = window.screen.availHeight || window.innerHeight;
      const initialWidth = initialWidthRef.current;
      const initialHeight = initialHeightRef.current;

      const isSplit = isSplitScreenDetected(
        currentWidth,
        currentHeight,
        initialWidth,
        initialHeight,
        screenWidth,
        screenHeight
      );

      setSplitScreenDetected(isSplit);
      if (isSplit) {
        triggerAlert(
          'Terdeteksi Layar Terbelah (Split-Screen / Multitasking). Gunakan layar penuh agar evaluasi valid!'
        );
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('resize', checkSplitScreen);

    // Initial split check
    checkSplitScreen();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('resize', checkSplitScreen);
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      if (blurTimeoutRef.current) {
        window.clearTimeout(blurTimeoutRef.current);
      }
    };
  }, [enabled, quizActive, notifyViolation, triggerAlert]);

  const resetProctoring = useCallback(() => {
    violationsCountRef.current = 0;
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
