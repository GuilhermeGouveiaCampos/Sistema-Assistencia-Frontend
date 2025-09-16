import { useEffect, useRef } from "react";

type ResetFn = () => void;

const defaultEvents: (keyof DocumentEventMap)[] = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
  "click",
  "visibilitychange",
];

export function useIdleLogout(
  timeoutMs: number,
  onTimeout: () => void,
  events: (keyof DocumentEventMap)[] = defaultEvents
) {
  const timerRef = useRef<number | null>(null);

  const reset: ResetFn = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      onTimeout();
    }, timeoutMs);
  };

  useEffect(() => {
    reset();
    const handlers = events.map((ev) => {
      const h = () => reset();
      document.addEventListener(ev, h);
      return { ev, h };
    });

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      handlers.forEach(({ ev, h }) => document.removeEventListener(ev, h));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeoutMs, onTimeout]);
}
