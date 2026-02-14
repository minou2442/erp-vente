"use client";

import { FormEvent, useState } from "react";
import CameraScanner from "./camera-scanner";
import UsbScanner from "./usb-scanner";

interface BarcodeInputProps {
  onScan: (barcode: string) => void;
}

export default function BarcodeInput({ onScan }: BarcodeInputProps) {
  const [value, setValue] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    const barcode = value.trim();
    if (!barcode) {
      return;
    }

    onScan(barcode);
    setValue("");
  }

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <form onSubmit={submit}>
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Scan barcode/QR or type manually"
        />
      </form>
      <CameraScanner onDetected={onScan} />
      <UsbScanner onDetected={onScan} />
    </div>
  );
}
