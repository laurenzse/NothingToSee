import { useCallback, useEffect, useMemo, useRef } from "react";

interface ConfigurePlaybackWindowOptions {
  duration: number | undefined;
  seekTo: (seconds: number) => void;
  onConfigured?: (start: number, end: number) => void;
}

interface UsePlaybackWindowOptions {
  windowSeconds: number;
  onForegroundExpired: () => void;
  onBackgroundExpired: () => void;
}

export function usePlaybackWindow({
  windowSeconds,
  onForegroundExpired,
  onBackgroundExpired,
}: UsePlaybackWindowOptions) {
  const windowSecondsRef = useRef(windowSeconds);
  const onForegroundExpiredRef = useRef(onForegroundExpired);
  const onBackgroundExpiredRef = useRef(onBackgroundExpired);
  const windowId = useRef(0);
  const timeout = useRef<number | null>(null);
  const timerStartedAt = useRef<number | null>(null);
  const remaining = useRef<number | null>(null);
  const endsAt = useRef<number | null>(null);
  const pendingSeekStart = useRef<number | null>(null);
  const hasConfigured = useRef(false);
  const hasExpired = useRef(false);

  useEffect(() => {
    windowSecondsRef.current = windowSeconds;
    onForegroundExpiredRef.current = onForegroundExpired;
    onBackgroundExpiredRef.current = onBackgroundExpired;
  }, [windowSeconds, onForegroundExpired, onBackgroundExpired]);

  const clearTimer = useCallback(() => {
    if (timeout.current !== null) {
      window.clearTimeout(timeout.current);
      timeout.current = null;
    }
  }, []);

  const expire = useCallback((id: number) => {
    if (id !== windowId.current || hasExpired.current) {
      return;
    }

    hasExpired.current = true;
    endsAt.current = null;
    remaining.current = 0;
    timerStartedAt.current = null;
    clearTimer();

    if (document.hidden) {
      onBackgroundExpiredRef.current();
    } else {
      onForegroundExpiredRef.current();
    }
  }, [clearTimer]);

  const pause = useCallback(() => {
    if (timeout.current === null) {
      return;
    }

    window.clearTimeout(timeout.current);
    timeout.current = null;

    if (remaining.current !== null && timerStartedAt.current !== null) {
      const elapsedSeconds = (Date.now() - timerStartedAt.current) / 1000;
      remaining.current = Math.max(remaining.current - elapsedSeconds, 0);
    }

    timerStartedAt.current = null;
  }, []);

  const start = useCallback(() => {
    if (
      hasExpired.current ||
      remaining.current === null ||
      timeout.current !== null
    ) {
      return;
    }

    const id = windowId.current;

    if (remaining.current <= 0) {
      expire(id);
      return;
    }

    timerStartedAt.current = Date.now();
    timeout.current = window.setTimeout(() => {
      timeout.current = null;
      timerStartedAt.current = null;
      remaining.current = 0;
      expire(id);
    }, remaining.current * 1000);
  }, [expire]);

  const reset = useCallback(() => {
    clearTimer();
    windowId.current += 1;
    timerStartedAt.current = null;
    remaining.current = null;
    endsAt.current = null;
    pendingSeekStart.current = null;
    hasConfigured.current = false;
    hasExpired.current = false;
  }, [clearTimer]);

  const configure = useCallback(({
    duration,
    seekTo,
    onConfigured,
  }: ConfigurePlaybackWindowOptions) => {
    const currentWindowSeconds = windowSecondsRef.current;

    if (
      hasConfigured.current ||
      typeof duration !== "number" ||
      !Number.isFinite(duration) ||
      duration <= currentWindowSeconds
    ) {
      return;
    }

    hasConfigured.current = true;

    const latestStart = duration - currentWindowSeconds;
    const randomStart = Math.random() * latestStart;
    const end = randomStart + currentWindowSeconds;

    // YouTube may ignore early seeks, so keep the target for later retry.
    pendingSeekStart.current = randomStart;
    endsAt.current = end;
    remaining.current = currentWindowSeconds;
    seekTo(randomStart);
    onConfigured?.(randomStart, end);
  }, []);

  const applyPendingSeek = useCallback((
    getCurrentTime: () => number | undefined,
    seekTo: (seconds: number) => void
  ) => {
    const targetStart = pendingSeekStart.current;

    if (targetStart === null) {
      return;
    }

    const currentTime = getCurrentTime();

    if (
      typeof currentTime === "number" &&
      Math.abs(currentTime - targetStart) < 2
    ) {
      pendingSeekStart.current = null;
      return;
    }

    seekTo(targetStart);
  }, []);

  const expireIfPastEnd = useCallback((currentTime: number | undefined) => {
    if (
      endsAt.current !== null &&
      typeof currentTime === "number" &&
      currentTime >= endsAt.current
    ) {
      expire(windowId.current);
    }
  }, [expire]);

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  return useMemo(
    () => ({
      applyPendingSeek,
      configure,
      expireIfPastEnd,
      pause,
      reset,
      start,
    }),
    [applyPendingSeek, configure, expireIfPastEnd, pause, reset, start]
  );
}
