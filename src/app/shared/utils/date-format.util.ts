import dayjs from 'dayjs';

export function getStartEndOfMonth(date: Date): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );
  return { start, end };
}

export function formatDateToString(
  date: Date,
  format: string = 'YYYY-MM-DD'
): string {
  return dayjs(date).format(format);
}
