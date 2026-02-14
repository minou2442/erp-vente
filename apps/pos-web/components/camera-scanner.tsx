"use client";

import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";
import { useEffect, useRef, useState } from "react";

interface CameraScannerProps {
  onDetected: (value: string) => void;
}

export default function CameraScanner({ onDetected }: CameraScannerProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!open || !videoRef.current) {
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

        const value = result.getText();
        onDetected(value);
        setStatus(`Detected: ${value}`);
        setOpen(false);
      })
      .then((ctrl) => {
        controls = ctrl;
      })
      .catch((error) => {
        setStatus(error instanceof Error ? error.message : "Scanner error");
      });

    return () => {
      active = false;
      controls?.stop();
    };
  }, [open, onDetected]);

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <button className="btn-primary" type="button" onClick={() => setOpen((value) => !value)}>
        {open ? "Stop Camera" : "Camera Scan"}
      </button>
      {open ? (
        <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", borderRadius: 10, border: "1px solid var(--line)" }} />
      ) : null}
      {status ? <small>{status}</small> : null}
    </div>
  );
}
