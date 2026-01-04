import { Legend, ReviewCategory } from "./constants";

export interface DayInfo {
  dateKey: string;
  dayNumber: number;
  weekday: number;
  isValid: boolean;
}

export interface DayEntry {
  id: string;
  userId: string;
  date: string;
  legend: Legend;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  dayEntryId: string;
  category: ReviewCategory;
  customCategoryId: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomCategory {
  id: string;
  userId: string;
  name: string;
  isRequired: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileSettings {
  id: string;
  userId: string;
  isPublic: boolean;
  showMoods: boolean;
  showReviews: boolean;
  showStats: boolean;
  publicSlug: string | null;
  createdAt: string;
  updatedAt: string;
}

export type DayEntryMap = Record<string, DayEntry>;
export type ReviewMap = Record<string, Review[]>;
