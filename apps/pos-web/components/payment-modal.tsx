"use client";

import { useState } from "react";
import type { PaymentMethod } from "../app/pos/payment";

interface PaymentModalProps {
  open: boolean;
  total: number;
  onClose: () => void;
  onConfirm: (payload: { paymentMethod: PaymentMethod; paidAmount: number }) => void;
}

export default function PaymentModal({ open, total, onClose, onConfirm }: PaymentModalProps) {
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [paidAmount, setPaidAmount] = useState(total);

  if (!open) {
    return null;
  }

  return (
    <div className="modal-layer" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <h3>Payment</h3>
        <p>Total: {total.toFixed(2)}</p>
        <select value={method} onChange={(event) => setMethod(event.target.value as PaymentMethod)}>
          <option value="CASH">Cash</option>
          <option value="CARD">Card</option>
          <option value="TRANSFER">Transfer</option>
          <option value="MIXED">Mixed</option>
        </select>
        <input
          type="number"
          min="0"
          step="0.01"
          value={paidAmount}
          onChange={(event) => setPaidAmount(Number(event.target.value))}
        />
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button className="btn-primary" type="button" onClick={() => onConfirm({ paymentMethod: method, paidAmount })}>
            Confirm Payment
          </button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
