import {
  format,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subMonths,
  addMonths,
  subYears,
  addYears,
  parseISO,
  isWithinInterval,
  eachDayOfInterval,
  eachMonthOfInterval,
  startOfDay,
  isBefore,
  isAfter,
} from 'date-fns';

export function formatMonth(date) {
  return format(date, 'MMM yyyy');
}

export function formatShort(date) {
  return format(typeof date === 'string' ? parseISO(date) : date, 'dd MMM');
}

export function formatYear(date) {
  return format(date, 'yyyy');
}

export function getMonthInterval(monthDate) {
  const start = startOfMonth(monthDate);
  const end = endOfMonth(monthDate);
  return { start, end };
}

export function getYearInterval(yearDate) {
  const start = startOfYear(yearDate);
  const end = endOfYear(yearDate);
  return { start, end };
}

export function prevMonth(date) {
  return subMonths(date, 1);
}

export function nextMonth(date) {
  return addMonths(date, 1);
}

export function prevYear(date) {
  return subYears(date, 1);
}

export function nextYear(date) {
  return addYears(date, 1);
}

export function isDateInMonth(isoDate, monthDate) {
  const d = typeof isoDate === 'string' ? parseISO(isoDate) : isoDate;
  const { start, end } = getMonthInterval(monthDate);
  return isWithinInterval(d, { start, end });
}

export function isDateInYear(isoDate, yearDate) {
  const d = typeof isoDate === 'string' ? parseISO(isoDate) : isoDate;
  const { start, end } = getYearInterval(yearDate);
  return isWithinInterval(d, { start, end });
}

export function getDaysInMonth(monthDate) {
  const { start, end } = getMonthInterval(monthDate);
  return eachDayOfInterval({ start, end });
}

export function getMonthsInRange(startDate, endDate) {
  return eachMonthOfInterval({ start: startDate, end: endDate });
}

export function getUniqueYearsFromTransactions(transactions) {
  const years = new Set();
  transactions.forEach((t) => {
    const d = parseISO(t.date);
    years.add(d.getFullYear());
  });
  return Array.from(years).sort((a, b) => a - b);
}

export function getEarliestDate(transactions) {
  if (!transactions?.length) return new Date();
  const dates = transactions.map((t) => parseISO(t.date));
  return new Date(Math.min(...dates.map((d) => d.getTime())));
}

export function getLatestDate(transactions) {
  if (!transactions?.length) return new Date();
  const dates = transactions.map((t) => parseISO(t.date));
  return new Date(Math.max(...dates.map((d) => d.getTime())));
}

export function isBeforeOrSame(d, ref) {
  return isBefore(d, ref) || d.getTime() === ref.getTime();
}

export function isAfterOrSame(d, ref) {
  return isAfter(d, ref) || d.getTime() === ref.getTime();
}
