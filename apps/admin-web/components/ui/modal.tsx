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
        background: "rgba(0, 0, 0, 0.55)",
        display: "grid",
        placeItems: "center",
        zIndex: 30,
        animation: "fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--bg-soft)",
          border: "1px solid var(--line)",
          borderRadius: 16,
          width: "min(520px, 92vw)",
          padding: 24,
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.2)",
          animation: "riseIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '1.25rem', fontWeight: '700', color: 'var(--fg)' }}>{title}</h3>
        <div style={{ marginTop: '16px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
