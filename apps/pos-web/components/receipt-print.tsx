"use client";

import type { ReceiptPayload } from "../app/pos/receipt";

interface ReceiptPrintProps {
  receipt: ReceiptPayload | null;
}

export default function ReceiptPrint({ receipt }: ReceiptPrintProps) {
  if (!receipt) {
    return null;
  }
  const currentReceipt = receipt;

  function printReceipt() {
    const win = window.open("", "_blank", "noopener,noreferrer,width=420,height=640");
    if (!win) {
      return;
    }

    const rows = currentReceipt.items
      .map(
        (item) =>
          `<tr><td>${item.name}</td><td style="text-align:right">${item.quantity}</td><td style="text-align:right">${item.unitPrice.toFixed(
            2
          )}</td><td style="text-align:right">${(item.quantity * item.unitPrice).toFixed(2)}</td></tr>`
      )
      .join("");

    win.document.write(`
      <!doctype html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>TREXBYTE POS Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 14px; color: #1d2b43; }
          h2 { margin: 0 0 8px; }
          p { margin: 4px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border-bottom: 1px solid #d7dfea; padding: 6px; font-size: 12px; }
          .total { margin-top: 10px; font-size: 16px; font-weight: bold; text-align: right; }
        </style>
      </head>
      <body>
        <h2>TREXBYTE POS</h2>
        <p>Receipt: ${currentReceipt.id}</p>
        <p>Date: ${new Date(currentReceipt.createdAt).toLocaleString()}</p>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align:right">Qty</th>
              <th style="text-align:right">Unit</th>
              <th style="text-align:right">Total</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <p class="total">Total: ${currentReceipt.total.toFixed(2)}</p>
      </body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
  }

  return (
    <section className="pos-panel">
      <h2>Last Receipt</h2>
      <p>Receipt ID: {currentReceipt.id}</p>
      <p>Date: {new Date(currentReceipt.createdAt).toLocaleString()}</p>
      <ul>
        {currentReceipt.items.map((item) => (
          <li key={item.productId}>
            {item.name} x{item.quantity} = {(item.quantity * item.unitPrice).toFixed(2)}
          </li>
        ))}
      </ul>
      <strong>Total: {currentReceipt.total.toFixed(2)}</strong>
      <div style={{ marginTop: 12 }}>
        <button className="btn-primary" type="button" onClick={printReceipt}>
          Print Receipt
        </button>
      </div>
    </section>
  );
}
