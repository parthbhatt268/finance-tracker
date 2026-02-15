import { useState } from 'react';
import { parseISO } from 'date-fns';
import { formatMonth } from '../utils/dateHelpers';
import Button from './Button';

export default function TransactionRow({ transaction, currency, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isCredit = transaction.type === 'credit';

  return (
    <div className="group relative flex items-center justify-between gap-2 border-b border-[var(--color-border)] py-2 last:border-0">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--color-muted)]">
            {formatMonth(parseISO(transaction.date))}
          </span>
          <span className="truncate text-sm">{transaction.description || transaction.category}</span>
        </div>
        <div className="text-xs text-[var(--color-muted)]">{transaction.category}</div>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`font-medium ${
            isCredit ? 'text-[#22c55e]' : 'text-[#ef4444]'
          }`}
        >
          {isCredit ? '+' : '-'}
          {Number(transaction.amount).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{' '}
          {currency}
        </span>
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="rounded p-1 text-[var(--color-muted)] hover:bg-white/10 hover:text-[var(--color-text)]"
            aria-label="Actions"
          >
            ⋮
          </button>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 top-full z-20 mt-1 w-32 rounded border border-[var(--color-border)] bg-[var(--color-surface)] py-1 shadow-lg">
                <button
                  type="button"
                  className="w-full px-3 py-1.5 text-left text-sm hover:bg-white/5"
                  onClick={() => {
                    onEdit(transaction);
                    setMenuOpen(false);
                  }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="w-full px-3 py-1.5 text-left text-sm text-[#ef4444] hover:bg-white/5"
                  onClick={() => {
                    onDelete(transaction);
                    setMenuOpen(false);
                  }}
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
