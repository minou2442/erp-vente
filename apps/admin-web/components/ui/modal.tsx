import type { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}

export function Modal({ isOpen, title, children, onClose }: ModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "grid",
        placeItems: "center",
        zIndex: 30
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--bg-soft)",
          border: "1px solid var(--line)",
          borderRadius: 14,
          width: "min(520px, 92vw)",
          padding: 16
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <h3 style={{ marginTop: 0 }}>{title}</h3>
        {children}
      </div>
    </div>
  );
}
