"use client";
import { useEffect, useRef, useState } from "react";

export function Timer({ seconds, onExpire }: { seconds: number; onExpire?: () => void }) {
  const [remaining, setRemaining] = useState(seconds);
  const intervalRef = useRef<number | null>(null);

  // Reset timer when seconds prop changes
  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      setRemaining((s) => {
        if (s <= 1) {
          if (intervalRef.current) window.clearInterval(intervalRef.current);
          onExpire?.();
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => { 
      if (intervalRef.current) window.clearInterval(intervalRef.current); 
    };
  }, [onExpire]);

  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  return <span className="font-mono tabular-nums">{m}:{s.toString().padStart(2,'0')}</span>;
}
