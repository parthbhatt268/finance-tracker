import { useState, useEffect, useMemo } from 'react';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import { loadInitialDataSync, fetchRealSeed } from '../utils/dataLoader';
import {
  formatMonth,
  prevMonth,
  nextMonth,
  getUniqueYearsFromTransactions,
} from '../utils/dateHelpers';
import {
  filterByMonth,
  filterByYear,
  netWorth,
  totalCredits,
  totalDebits,
  savings as calcSavings,
  spendingByMonthInYear,
  spendingByMonthAllTime,
  spendingByYearLast5,
  savingsByMonthInYear,
  savingsByMonthAllTime,
  savingsByYearLast5,
  categoryBreakdown,
} from '../utils/calculations';
import Card from '../components/Card';
import Button from '../components/Button';
import ToggleGroup from '../components/ToggleGroup';
import TransactionForm from '../components/TransactionForm';
import TransactionRow from '../components/TransactionRow';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../components/ToastContext';
import SpendingChart from '../components/charts/SpendingChart';
import SavingsChart from '../components/charts/SavingsChart';
import CategoryPieChart from '../components/charts/CategoryPieChart';
import SpendingByCategoryBar from '../components/charts/SpendingByCategoryBar';

const VIEW_OPTIONS = [
  { value: 'year', label: 'Per Year' },
  { value: 'fiveyear', label: 'Five Year' },
  { value: 'all', label: 'All Time' },
];

const MODE = import.meta.env.VITE_DATA_MODE || 'demo';

export default function Dashboard() {
  const [data, setData] = useState(() => loadInitialDataSync(MODE));
  const [selectedMonth, setSelectedMonth] = useState(() => new Date());
  const [chartView, setChartView] = useState('year');
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [formOpen, setFormOpen] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [initialCreditCategory, setInitialCreditCategory] = useState(null);
  const [initialCreditDescription, setInitialCreditDescription] = useState(null);
  const [savingToFile, setSavingToFile] = useState(false);
  const { show: toast } = useToast();

  useEffect(() => {
    if (MODE === 'real' && !data) {
      fetchRealSeed().then((seed) => {
        const stored = loadFromStorage('real');
        if (stored?.transactions && Array.isArray(stored.transactions)) {
          setData({
            settings: stored.settings ?? seed.settings,
            creditCategories: stored.creditCategories ?? seed.creditCategories,
            debitCategories: stored.debitCategories ?? seed.debitCategories,
            transactions: stored.transactions,
          });
        } else {
          setData(seed);
          saveToStorage(seed, 'real');
        }
      });
    }
  }, []);

  useEffect(() => {
    if (data) saveToStorage(data, MODE);
  }, [data]);

  const { settings, creditCategories = [], debitCategories = [], transactions = [] } = data || {};
  const currency = settings?.currency || 'EUR';
  const startingBalance = Number(settings?.startingBalance) || 0;

  const years = useMemo(
    () => getUniqueYearsFromTransactions(transactions),
    [transactions]
  );
  const selectedYearDate = useMemo(
    () => new Date(selectedYear, 0, 1),
    [selectedYear]
  );

  const monthTransactions = useMemo(
    () => filterByMonth(transactions, selectedMonth),
    [transactions, selectedMonth]
  );

  const creditsInMonth = useMemo(
    () =>
      monthTransactions
        .filter((t) => t.type === 'credit')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [monthTransactions]
  );

  const debitsInMonth = useMemo(
    () =>
      monthTransactions
        .filter((t) => t.type === 'debit')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [monthTransactions]
  );

  const monthSpendingByCategory = useMemo(
    () => categoryBreakdown(monthTransactions, 'debit'),
    [monthTransactions]
  );

  const monthSummary = useMemo(
    () => ({
      income: totalCredits(monthTransactions),
      spending: totalDebits(monthTransactions),
      savings: calcSavings(monthTransactions),
    }),
    [monthTransactions]
  );

  const totalNetWorth = netWorth(transactions, startingBalance);

  const addTransaction = (payload) => {
    const id = payload.id || crypto.randomUUID?.() || `t${Date.now()}`;
    if (payload.id) {
      setData((d) => ({
        ...d,
        transactions: d.transactions.map((t) =>
          t.id === payload.id ? { ...t, ...payload } : t
        ),
      }));
      toast('Transaction updated');
    } else {
      setData((d) => ({
        ...d,
        transactions: [
          ...d.transactions,
          { ...payload, id, type: payload.type || formOpen },
        ],
      }));
      toast(formOpen === 'credit' ? 'Credit added' : 'Debit added');
    }
    setFormOpen(null);
    setEditingTransaction(null);
  };

  const deleteTransaction = (tx) => {
    setData((d) => ({
      ...d,
      transactions: d.transactions.filter((t) => t.id !== tx.id),
    }));
    setDeleteConfirm(null);
    toast('Transaction deleted');
  };

  const handleSaveToFile = async () => {
    if (!data || MODE !== 'real') return;
    setSavingToFile(true);
    try {
      const res = await fetch('/api/save-real-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json().catch(() => ({}));
      if (res.ok && result.ok) {
        toast('Saved to real-data.json');
      } else {
        toast(result.error || 'Failed to save');
      }
    } catch (e) {
      toast('Failed to save (is the dev server running?)');
    } finally {
      setSavingToFile(false);
    }
  };

  const transactionsForChartPeriod = useMemo(() => {
    if (chartView === 'year') return filterByYear(transactions, selectedYearDate);
    if (chartView === 'fiveyear') {
      const currentYear = new Date().getFullYear();
      const startYear = currentYear - 4;
      return transactions.filter((t) => {
        const y = new Date(t.date).getFullYear();
        return y >= startYear && y <= currentYear;
      });
    }
    return transactions;
  }, [chartView, transactions, selectedYearDate]);

  const spendingChartData = useMemo(() => {
    if (chartView === 'year')
      return spendingByMonthInYear(transactions, selectedYearDate);
    if (chartView === 'fiveyear')
      return spendingByYearLast5(transactions);
    return spendingByMonthAllTime(transactions);
  }, [chartView, transactions, selectedYearDate]);

  const savingsChartData = useMemo(() => {
    if (chartView === 'year') {
      const raw = savingsByMonthInYear(transactions, selectedYearDate);
      const now = new Date();
      const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      let lastKnownIndex = -1;
      let lastKnownSavings = 0;
      raw.forEach((point, i) => {
        if (point.date <= currentYearMonth) {
          lastKnownIndex = i;
          lastKnownSavings = point.savings;
        }
      });
      return raw.map((point, i) => {
        if (i <= lastKnownIndex) {
          const savingsProjected = i === lastKnownIndex ? point.savings : null;
          return { ...point, isProjected: false, savingsProjected };
        }
        return {
          ...point,
          savings: lastKnownSavings,
          isProjected: true,
          savingsProjected: lastKnownSavings,
        };
      });
    }
    if (chartView === 'fiveyear')
      return savingsByYearLast5(transactions);
    return savingsByMonthAllTime(transactions);
  }, [chartView, transactions, selectedYearDate]);

  const categoryPieData = useMemo(
    () => categoryBreakdown(transactionsForChartPeriod, 'debit'),
    [transactionsForChartPeriod]
  );

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] text-[var(--color-muted)]">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-bg)]/95 px-4 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight">Finance Tracker</h1>
            <span className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-0.5 text-xs font-medium text-[var(--color-muted)]">
              {MODE === 'real' ? 'Real' : 'Demo'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            {MODE === 'real' && (
              <Button
                variant="primary"
                onClick={handleSaveToFile}
                disabled={savingToFile}
              >
                {savingToFile ? 'Saving…' : 'Save to file'}
              </Button>
            )}
            <span className="text-sm font-medium text-[var(--color-muted)]">Net Worth</span>
            <span
              className={`text-2xl font-bold tabular-nums ${
                totalNetWorth >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'
              }`}
            >
              {totalNetWorth.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}{' '}
              {currency}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-4 lg:grid lg:grid-cols-[1fr_1.2fr] lg:gap-6 lg:items-start">
        <section className="flex w-full flex-col gap-4">
          <Card title="Transactions">
            <div className="mb-3 flex items-center gap-1 rounded border border-[var(--color-border)] p-0.5">
              <button
                type="button"
                onClick={() => setSelectedMonth((m) => prevMonth(m))}
                className="rounded px-2 py-1 text-[var(--color-muted)] hover:bg-white/10 hover:text-[var(--color-text)]"
                aria-label="Previous month"
              >
                ◀
              </button>
              <span className="min-w-[7rem] px-2 text-center font-medium">
                {formatMonth(selectedMonth)}
              </span>
              <button
                type="button"
                onClick={() => setSelectedMonth((m) => nextMonth(m))}
                className="rounded px-2 py-1 text-[var(--color-muted)] hover:bg-white/10 hover:text-[var(--color-text)]"
                aria-label="Next month"
              >
                ▶
              </button>
            </div>

            <div className="mb-3">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                Credit
              </h3>
              {creditsInMonth.length === 0 ? (
                <p className="py-2 text-sm text-[var(--color-muted)]">
                  No credits this month
                </p>
              ) : (
                creditsInMonth.map((t) => (
                  <TransactionRow
                    key={t.id}
                    transaction={t}
                    currency={currency}
                    onEdit={setEditingTransaction}
                    onDelete={setDeleteConfirm}
                  />
                ))
              )}
              <Button
                variant="green"
                className="mt-2 w-full"
                onClick={() => setFormOpen('credit')}
              >
                Add Credit
              </Button>
            </div>

            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                Debit
              </h3>
              {debitsInMonth.length === 0 ? (
                <p className="py-2 text-sm text-[var(--color-muted)]">
                  No debits this month
                </p>
              ) : (
                debitsInMonth.map((t) => (
                  <TransactionRow
                    key={t.id}
                    transaction={t}
                    currency={currency}
                    onEdit={setEditingTransaction}
                    onDelete={setDeleteConfirm}
                  />
                ))
              )}
              <Button
                variant="red"
                className="mt-2 w-full"
                onClick={() => setFormOpen('debit')}
              >
                Add Debit
              </Button>
            </div>
          </Card>

          <Card title={`Spending this month (${formatMonth(selectedMonth)})`}>
            <SpendingByCategoryBar
              data={monthSpendingByCategory}
              currency={currency}
              categoryColors={debitCategories}
            />
          </Card>
        </section>

        <section className="flex w-full flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <ToggleGroup
              options={VIEW_OPTIONS}
              value={chartView}
              onChange={setChartView}
            />
            {chartView === 'year' && (
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1.5 text-sm text-[var(--color-text)]"
              >
                {years.length ? years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                )) : (
                  <option value={new Date().getFullYear()}>
                    {new Date().getFullYear()}
                  </option>
                )}
              </select>
            )}
          </div>

          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 shadow-sm shadow-black/20">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
              {formatMonth(selectedMonth)}
            </div>
            <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]">Income</div>
              <div className="mt-0.5 text-sm font-semibold text-[#22c55e]">
                {monthSummary.income.toLocaleString(undefined, { maximumFractionDigits: 0 })} {currency}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]">Spending</div>
              <div className="mt-0.5 text-sm font-semibold text-[#ef4444]">
                {monthSummary.spending.toLocaleString(undefined, { maximumFractionDigits: 0 })} {currency}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]">Savings</div>
              <div className={`mt-0.5 text-sm font-semibold ${monthSummary.savings >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                {monthSummary.savings.toLocaleString(undefined, { maximumFractionDigits: 0 })} {currency}
              </div>
            </div>
            </div>
          </div>

          <Card title="Spending">
            <SpendingChart data={spendingChartData} currency={currency} />
          </Card>

          <Card title="Savings">
            <SavingsChart data={savingsChartData} currency={currency} />
            <p className="mt-2 text-xs text-[var(--color-muted)]">
              Add existing investments or one-off savings so they count in net worth.
            </p>
            <Button
              variant="green"
              className="mt-3 w-full"
              onClick={() => {
                setFormOpen('credit');
                setInitialCreditCategory('Lump sum');
                setInitialCreditDescription('Lump sum investment');
              }}
            >
              Add lump sum / savings
            </Button>
          </Card>

          <Card title="Spending by category">
            <CategoryPieChart
              data={categoryPieData}
              currency={currency}
              categoryColors={debitCategories}
            />
          </Card>

        </section>
      </main>

      <TransactionForm
        isOpen={formOpen !== null || editingTransaction !== null}
        onClose={() => {
          setFormOpen(null);
          setEditingTransaction(null);
          setInitialCreditCategory(null);
          setInitialCreditDescription(null);
        }}
        onSubmit={addTransaction}
        transaction={editingTransaction}
        type={editingTransaction ? undefined : formOpen}
        creditCategories={creditCategories}
        debitCategories={debitCategories}
        initialCategory={initialCreditCategory}
        initialDescription={initialCreditDescription}
      />

      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteTransaction(deleteConfirm)}
        title="Delete transaction"
        message={`Delete "${deleteConfirm?.description || deleteConfirm?.category}"?`}
        confirmLabel="Delete"
        danger
      />

    </div>
  );
}
