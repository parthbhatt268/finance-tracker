import { parseISO, startOfMonth, startOfDay } from 'date-fns';
import {
  getMonthInterval,
  getYearInterval,
  getDaysInMonth,
  getEarliestDate,
  getMonthsInRange,
} from './dateHelpers';

export function totalCredits(transactions) {
  return transactions
    .filter((t) => t.type === 'credit')
    .reduce((sum, t) => sum + Number(t.amount), 0);
}

export function totalDebits(transactions) {
  return transactions
    .filter((t) => t.type === 'debit')
    .reduce((sum, t) => sum + Number(t.amount), 0);
}

export function savings(transactions) {
  return totalCredits(transactions) - totalDebits(transactions);
}

export function netWorth(transactions, startingBalance = 0) {
  return startingBalance + totalCredits(transactions) - totalDebits(transactions);
}

export function filterByMonth(transactions, monthDate) {
  const { start, end } = getMonthInterval(monthDate);
  const startTs = start.getTime();
  const endTs = end.getTime();
  return transactions.filter((t) => {
    const ts = parseISO(t.date).getTime();
    return ts >= startTs && ts <= endTs;
  });
}

export function filterByYear(transactions, yearDate) {
  const { start, end } = getYearInterval(yearDate);
  const startTs = start.getTime();
  const endTs = end.getTime();
  return transactions.filter((t) => {
    const ts = parseISO(t.date).getTime();
    return ts >= startTs && ts <= endTs;
  });
}

export function filterBeforeOrOn(transactions, date) {
  const refTs = startOfDay(date).getTime();
  return transactions.filter((t) => parseISO(t.date).getTime() <= refTs);
}

export function spendingByDayInMonth(transactions, monthDate) {
  const days = getDaysInMonth(monthDate);
  const byDay = {};
  days.forEach((d) => {
    const key = d.toISOString().slice(0, 10);
    byDay[key] = { date: key, amount: 0, day: d.getDate() };
  });
  const monthTx = filterByMonth(
    transactions.filter((t) => t.type === 'debit'),
    monthDate
  );
  monthTx.forEach((t) => {
    const key = t.date.slice(0, 10);
    if (byDay[key]) byDay[key].amount += Number(t.amount);
  });
  return Object.values(byDay).sort((a, b) => a.day - b.day);
}

export function spendingByMonthInYear(transactions, yearDate) {
  const { start, end } = getYearInterval(yearDate);
  const months = getMonthsInRange(start, end);
  return months.map((m) => {
    const monthTx = filterByMonth(
      transactions.filter((t) => t.type === 'debit'),
      m
    );
    const amount = totalDebits(monthTx);
    return {
      month: m.getMonth() + 1,
      label: m.toLocaleString('default', { month: 'short' }),
      amount,
      date: m.toISOString().slice(0, 7),
    };
  });
}

export function spendingByMonthAllTime(transactions) {
  const start = getEarliestDate(transactions);
  const end = new Date();
  const months = getMonthsInRange(start, end);
  return months.map((m) => {
    const monthTx = filterByMonth(
      transactions.filter((t) => t.type === 'debit'),
      m
    );
    const amount = totalDebits(monthTx);
    return {
      month: m.getMonth() + 1,
      label: m.toLocaleString('default', { month: 'short' }),
      year: m.getFullYear(),
      amount,
      date: m.toISOString().slice(0, 7),
    };
  });
}

const LAST_N_YEARS = 5;

export function spendingByYearLast5(transactions) {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear - LAST_N_YEARS + 1; y <= currentYear; y++) {
    const yearDate = new Date(y, 0, 1);
    const yearTx = filterByYear(
      transactions.filter((t) => t.type === 'debit'),
      yearDate
    );
    years.push({
      label: String(y),
      year: y,
      amount: totalDebits(yearTx),
    });
  }
  return years;
}

export function savingsByYearLast5(transactions) {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear - LAST_N_YEARS + 1; y <= currentYear; y++) {
    const yearDate = new Date(y, 0, 1);
    const yearTx = filterByYear(transactions, yearDate);
    const cred = totalCredits(yearTx);
    const deb = totalDebits(yearTx);
    years.push({
      label: String(y),
      year: y,
      savings: cred - deb,
    });
  }
  return years;
}

export function savingsByDayInMonth(transactions, monthDate) {
  const days = getDaysInMonth(monthDate);
  const byDay = {};
  days.forEach((d) => {
    const key = d.toISOString().slice(0, 10);
    byDay[key] = { date: key, credit: 0, debit: 0, savings: 0, day: d.getDate() };
  });
  const monthTx = filterByMonth(transactions, monthDate);
  monthTx.forEach((t) => {
    const key = t.date.slice(0, 10);
    if (!byDay[key]) return;
    if (t.type === 'credit') byDay[key].credit += Number(t.amount);
    else byDay[key].debit += Number(t.amount);
  });
  let running = 0;
  return Object.values(byDay)
    .sort((a, b) => a.day - b.day)
    .map((row) => {
      running += row.credit - row.debit;
      return { ...row, savings: running };
    });
}

export function savingsByMonthInYear(transactions, yearDate) {
  const { start, end } = getYearInterval(yearDate);
  const months = getMonthsInRange(start, end);
  return months.map((m) => {
    const monthTx = filterByMonth(transactions, m);
    const cred = totalCredits(monthTx);
    const deb = totalDebits(monthTx);
    return {
      month: m.getMonth() + 1,
      label: m.toLocaleString('default', { month: 'short' }),
      savings: cred - deb,
      date: m.toISOString().slice(0, 7),
    };
  });
}

export function savingsByMonthAllTime(transactions) {
  const start = getEarliestDate(transactions);
  const end = new Date();
  const months = getMonthsInRange(start, end);
  return months.map((m) => {
    const monthTx = filterByMonth(transactions, m);
    const cred = totalCredits(monthTx);
    const deb = totalDebits(monthTx);
    return {
      month: m.getMonth() + 1,
      label: m.toLocaleString('default', { month: 'short' }),
      year: m.getFullYear(),
      savings: cred - deb,
      date: m.toISOString().slice(0, 7),
    };
  });
}

export function categoryBreakdown(transactions, type = 'debit') {
  const filtered = transactions.filter((t) => t.type === type);
  const byCat = {};
  filtered.forEach((t) => {
    const cat = t.category || 'Uncategorized';
    byCat[cat] = (byCat[cat] || 0) + Number(t.amount);
  });
  return Object.entries(byCat).map(([name, value]) => ({ name, value }));
}

export function netWorthOverTime(transactions, startingBalance) {
  const sorted = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const points = [];
  let running = startingBalance;
  const seen = new Set();
  sorted.forEach((t) => {
    const d = t.date.slice(0, 10);
    if (t.type === 'credit') running += Number(t.amount);
    else running -= Number(t.amount);
    if (!seen.has(d)) {
      seen.add(d);
      points.push({ date: d, netWorth: running });
    } else {
      const last = points[points.length - 1];
      if (last.date === d) last.netWorth = running;
      else points.push({ date: d, netWorth: running });
    }
  });
  if (points.length === 0) {
    points.push({
      date: new Date().toISOString().slice(0, 10),
      netWorth: startingBalance,
    });
  }
  return points;
}
