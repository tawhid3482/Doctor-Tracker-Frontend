'use client';

import { useEffect, useRef } from 'react';
import { AlertTriangle, LoaderCircle, X } from 'lucide-react';

type ConfirmDialogProps = {
  title: string;
  description: string;
  confirmLabel?: string;
  busy?: boolean;
  error?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({ title, description, confirmLabel = 'Delete', busy = false, error, onCancel, onConfirm }: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelRef.current?.focus();
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !busy) onCancel();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [busy, onCancel]);

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]" onMouseDown={event => { if (event.target === event.currentTarget && !busy) onCancel(); }}>
    <section role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-description" className="w-full max-w-md rounded-2xl border border-line bg-white p-6 shadow-2xl">
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600"><AlertTriangle size={21}/></span>
        <div className="min-w-0 flex-1">
          <h2 id="confirm-title" className="text-lg font-semibold text-ink">{title}</h2>
          <p id="confirm-description" className="mt-2 text-sm leading-6 text-muted">{description}</p>
          {error&&<p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        </div>
        <button type="button" aria-label="Close confirmation" disabled={busy} onClick={onCancel} className="rounded-md p-1 text-muted hover:bg-slate-100 disabled:opacity-50"><X size={18}/></button>
      </div>
      <div className="mt-7 flex justify-end gap-2">
        <button ref={cancelRef} type="button" disabled={busy} onClick={onCancel} className="rounded-lg border border-line px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50">Cancel</button>
        <button type="button" disabled={busy} onClick={onConfirm} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-wait disabled:opacity-70">{busy&&<LoaderCircle size={15} className="animate-spin"/>}{busy?'Deleting…':confirmLabel}</button>
      </div>
    </section>
  </div>;
}
