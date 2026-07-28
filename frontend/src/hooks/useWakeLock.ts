import { useCallback, useEffect, useRef, useState } from 'react';

export function useWakeLock() {
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<WakeLockSentinel | null>(null);
  const enabledRef = useRef(false);

  const supported = typeof navigator !== 'undefined' && 'wakeLock' in navigator;

  const acquire = useCallback(async () => {
    setError(null);
    try {
      const sentinel = await navigator.wakeLock.request('screen');
      // Toggled off while the request was in flight — release immediately
      // instead of leaving a sentinel the user no longer wants held.
      if (!enabledRef.current) { sentinel.release().catch(() => {}); return; }
      sentinelRef.current = sentinel;
      setActive(true);
      sentinel.addEventListener('release', () => {
        sentinelRef.current = null;
        if (enabledRef.current) setActive(false);
      });
    } catch (e) {
      // Rejects if toggled off mid-request, or if the platform refuses
      // (e.g. battery saver) — only surface an error if still meant to be on.
      if (!enabledRef.current) return;
      setActive(false);
      setError((e as Error).message || 'Could not keep the screen on');
    }
  }, []);

  const release = useCallback(() => {
    enabledRef.current = false;
    if (sentinelRef.current) {
      sentinelRef.current.release().catch(() => {});
      sentinelRef.current = null;
    }
    setActive(false);
  }, []);

  const toggle = useCallback(() => {
    if (enabledRef.current) {
      release();
    } else {
      enabledRef.current = true;
      acquire();
    }
  }, [acquire, release]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enabledRef.current) {
        acquire();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [acquire]);

  useEffect(() => () => { release(); }, [release]);

  return { supported, active, toggle, error };
}
