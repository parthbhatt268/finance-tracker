import { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';

function getCurrentMonthValue() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

const defaultTransaction = {
  monthValue: getCurrentMonthValue(),
  amount: '',
  category: '',
  description: '',
};

export default function TransactionForm({
  isOpen,
  onClose,
  onSubmit,
  transaction = null,
  type,
  creditCategories,
  debitCategories,
  initialCategory,
  initialDescription,
}) {
  const categories = type === 'credit' ? (creditCategories || []) : (debitCategories || []);
  const [form, setForm] = useState(defaultTransaction);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (transaction) {
      setForm({
        monthValue: transaction.date.slice(0, 7),
        amount: String(transaction.amount),
        category: transaction.category || '',
        description: transaction.description || '',
      });
    } else {
      setForm({
        ...defaultTransaction,
        monthValue: getCurrentMonthValue(),
        category: initialCategory || '',
        description: initialDescription || '',
      });
    }
    setErrors({});
  }, [transaction, isOpen, type, initialCategory, initialDescription]);

  const validate = () => {
    const e = {};
    if (!form.amount || Number(form.amount) <= 0) e.amount = 'Amount must be greater than 0';
    if (!form.category?.trim()) e.category = 'Category is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const date = `${form.monthValue}-01`;
    onSubmit({
      ...(transaction && { id: transaction.id }),
      type: type || transaction?.type,
      date,
      amount: Number(form.amount),
      category: form.category.trim(),
      description: form.description.trim() || form.category.trim(),
    });
    onClose();
  };

  const categoryNames = (categories || []).map((c) => (typeof c === 'string' ? c : c.name));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={transaction ? 'Edit Transaction' : type === 'credit' ? 'Add Credit' : 'Add Debit'}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm text-[var(--color-muted)]">Month & year</label>
          <input
            type="month"
            value={form.monthValue}
            onChange={(e) => setForm((f) => ({ ...f, monthValue: e.target.value }))}
            className="w-full rounded border border-[var(--color-border)] bg-[#0a0a0a] px-3 py-2 text-[var(--color-text)]"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-[var(--color-muted)]">Amount</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            className="w-full rounded border border-[var(--color-border)] bg-[#0a0a0a] px-3 py-2 text-[var(--color-text)]"
          />
          {errors.amount && (
            <p className="mt-1 text-xs text-[#ef4444]">{errors.amount}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm text-[var(--color-muted)]">Category</label>
          <input
            list="categories-list"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            placeholder="Select or type..."
            className="w-full rounded border border-[var(--color-border)] bg-[#0a0a0a] px-3 py-2 text-[var(--color-text)]"
          />
          <datalist id="categories-list">
            {categoryNames.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          {errors.category && (
            <p className="mt-1 text-xs text-[#ef4444]">{errors.category}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm text-[var(--color-muted)]">Description</label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Optional"
            className="w-full rounded border border-[var(--color-border)] bg-[#0a0a0a] px-3 py-2 text-[var(--color-text)]"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant={type === 'credit' ? 'green' : 'red'}>
            {transaction ? 'Save' : 'Add'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
