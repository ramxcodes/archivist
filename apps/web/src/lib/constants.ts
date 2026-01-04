export enum Legend {
  CORE_MEMORY = "CORE_MEMORY",
  GOOD_DAY = "GOOD_DAY",
  NEUTRAL = "NEUTRAL",
  BAD_DAY = "BAD_DAY",
  NIGHTMARE = "NIGHTMARE",
}

export const LEGEND_CONFIG = {
  [Legend.CORE_MEMORY]: {
    label: "Core Memory",
    color: "#22D3EE",
    textColor: "#083344",
  },
  [Legend.GOOD_DAY]: {
    label: "A Good Day",
    color: "#22C55E",
    textColor: "#052e16",
  },
  [Legend.NEUTRAL]: {
    label: "Neutral",
    color: "#FACC15",
    textColor: "#422006",
  },
  [Legend.BAD_DAY]: {
    label: "A Bad Day",
    color: "#FB923C",
    textColor: "#431407",
  },
  [Legend.NIGHTMARE]: {
    label: "Nightmare",
    color: "#EF4444",
    textColor: "#450a0a",
  },
};

export const DEFAULT_COLOR = "#2A2B2F";
export const DEFAULT_TEXT_COLOR = "#9CA3AF";

export const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
export const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

export const QUADRIMESTERS = [
  { name: "Quadrimester 1", months: [0, 1, 2, 3] },
  { name: "Quadrimester 2", months: [4, 5, 6, 7] },
  { name: "Quadrimester 3", months: [8, 9, 10, 11] },
];

export enum ReviewCategory {
  WORK = "WORK",
  PERSONAL = "PERSONAL",
  LEARNING = "LEARNING",
  CUSTOM = "CUSTOM",
}

export const DEFAULT_CATEGORIES = [
  { value: ReviewCategory.WORK, label: "Work" },
  { value: ReviewCategory.PERSONAL, label: "Personal" },
  { value: ReviewCategory.LEARNING, label: "Learning" },
];
