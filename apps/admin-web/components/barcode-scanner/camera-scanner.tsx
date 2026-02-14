"use client";

import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";
import { useEffect, useRef, useState } from "react";

interface CameraScannerProps {
  onDetected: (value: string) => void;
  buttonLabel?: string;
}

export default function CameraScanner({ onDetected, buttonLabel = "Scan with Camera" }: CameraScannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!isOpen || !videoRef.current) {
      return;
    }

    const reader = new BrowserMultiFormatReader();
    let controls: IScannerControls | null = null;
    let active = true;

    reader
      .decodeFromVideoDevice(undefined, videoRef.current, (result) => {
        if (!active || !result) {
          return;
        }

        const text = result.getText();
        onDetected(text);
        setStatus(`Detected: ${text}`);
        setIsOpen(false);
      })
      .then((ctrl) => {
        controls = ctrl;
      })
      .catch((error) => {
        setStatus(error instanceof Error ? error.message : "Camera scanner failed");
      });

    return () => {
      active = false;
      controls?.stop();
    };
  }, [isOpen, onDetected]);

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <button className="ghost-btn" type="button" onClick={() => setIsOpen((value) => !value)}>
        {isOpen ? "Stop Camera" : buttonLabel}
      </button>
      {isOpen ? (
        <video
          ref={videoRef}
          muted
          autoPlay
          playsInline
          style={{ width: "100%", maxWidth: 420, borderRadius: 10, border: "1px solid var(--line)" }}
        />
      ) : null}
      {status ? <small>{status}</small> : null}
    </div>
  );
}
