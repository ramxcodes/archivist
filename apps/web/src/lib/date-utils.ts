import type { DayInfo } from "./types";

/**
 * Returns 0 for Monday, 6 for Sunday
 */
export const getStandardWeekday = (date: Date): number => {
  const day = date.getDay();
  return day === 0 ? 6 : day - 1;
};

export const getDaysInMonth = (year: number, month: number): DayInfo[] => {
  const date = new Date(year, month, 1);
  const days: DayInfo[] = [];

  while (date.getMonth() === month) {
    const d = date.getDate();
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const dateKey = `${y}-${m.toString().padStart(2, "0")}-${d
      .toString()
      .padStart(2, "0")}`;

    days.push({
      dateKey,
      dayNumber: d,
      weekday: getStandardWeekday(date),
      isValid: true,
    });
    date.setDate(date.getDate() + 1);
  }

  return days;
};

export const getMonthGrid = (year: number, month: number) => {
  const days = getDaysInMonth(year, month);
  const startOffset = days[0].weekday;

  // We need a grid of 7 rows (MON-SUN) and N columns (Weeks)
  // We'll return an array of weeks, where each week is an array of 7 items (DayInfo | null)
  const totalCellsNeeded = days.length + startOffset;
  const numWeeks = Math.ceil(totalCellsNeeded / 7);

  const grid: (DayInfo | null)[][] = Array.from({ length: 7 }, () =>
    Array.from({ length: numWeeks }, () => null)
  );

  days.forEach((day, index) => {
    const cellIndex = index + startOffset;
    const weekIndex = Math.floor(cellIndex / 7);
    const weekdayIndex = cellIndex % 7;
    grid[weekdayIndex][weekIndex] = day;
  });

  return grid;
};

export const isToday = (dateKey: string): boolean => {
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${(today.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;
  return dateKey === todayKey;
};

export const isFutureDate = (dateKey: string): boolean => {
  const date = new Date(dateKey);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return date > today;
};
