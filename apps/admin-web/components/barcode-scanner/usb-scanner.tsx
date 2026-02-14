"use client";

import { useEffect, useRef, useState } from "react";

interface UsbScannerProps {
  onDetected: (value: string) => void;
  minLength?: number;
}

export default function UsbScanner({ onDetected, minLength = 5 }: UsbScannerProps) {
  const [status, setStatus] = useState("USB scanner listener active");
  const bufferRef = useRef("");
  const lastKeyTimeRef = useRef(0);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const now = Date.now();
      const isBurst = now - lastKeyTimeRef.current < 50;
      lastKeyTimeRef.current = now;

      if (!isBurst) {
        bufferRef.current = "";
      }

      if (event.key === "Enter") {
        const value = bufferRef.current.trim();
        if (value.length >= minLength) {
          onDetected(value);
          setStatus(`Detected: ${value}`);
        }
        bufferRef.current = "";
        return;
      }

      if (event.key.length === 1) {
        bufferRef.current += event.key;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [minLength, onDetected]);

  return <small>{status}</small>;
}
