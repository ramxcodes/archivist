import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { env } from "@archivist/env/web";
import type {
  DayEntry,
  Review,
  CustomCategory,
  ProfileSettings,
} from "@/lib/types";
import { Legend, ReviewCategory } from "@/lib/constants";

const API_URL = env.NEXT_PUBLIC_SERVER_URL;

// API Response Types
type YearEntriesResponse = {
  entries: DayEntry[];
  reviews: Review[];
};

type DayEntryResponse = {
  entry: DayEntry;
  reviews: Review[];
};

type CategoriesResponse = {
  categories: CustomCategory[];
};

type ProfileSettingsResponse = {
  settings: ProfileSettings;
};

// API Functions

const getYearEntries = async (): Promise<YearEntriesResponse> => {
  const response = await fetch(`${API_URL}/api/days/2026`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch year entries");
  }
  return response.json();
};

const getDayEntry = async (date: string): Promise<DayEntryResponse> => {
  const response = await fetch(`${API_URL}/api/days/${date}`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch day entry");
  }
  return response.json();
};

const createOrUpdateDayEntry = async (data: {
  date: string;
  legend: Legend;
}): Promise<{ entry: DayEntry }> => {
  const response = await fetch(`${API_URL}/api/days`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "An error occurred" }));
    throw new Error(error.message || "Failed to save day entry");
  }
  return response.json();
};

const deleteDayEntry = async (date: string): Promise<void> => {
  const response = await fetch(`${API_URL}/api/days/${date}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to delete day entry");
  }
};

const createReview = async (data: {
  dayEntryId: string;
  category: ReviewCategory;
  customCategoryId?: string;
  content: string;
}): Promise<{ review: Review }> => {
  const response = await fetch(`${API_URL}/api/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "An error occurred" }));
    throw new Error(error.message || "Failed to create review");
  }
  return response.json();
};

const updateReview = async (data: {
  id: string;
  content: string;
}): Promise<{ review: Review }> => {
  const response = await fetch(`${API_URL}/api/reviews/${data.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ content: data.content }),
  });
  if (!response.ok) {
    throw new Error("Failed to update review");
  }
  return response.json();
};

const deleteReview = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/api/reviews/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to delete review");
  }
};

const getCustomCategories = async (): Promise<CategoriesResponse> => {
  const response = await fetch(`${API_URL}/api/categories`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch custom categories");
  }
  return response.json();
};

const createCategory = async (data: {
  name: string;
  isRequired: boolean;
  order: number;
}): Promise<{ category: CustomCategory }> => {
  const response = await fetch(`${API_URL}/api/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "An error occurred" }));
    throw new Error(error.message || "Failed to create category");
  }
  return response.json();
};

const updateCategory = async (data: {
  id: string;
  name?: string;
  isRequired?: boolean;
}): Promise<{ category: CustomCategory }> => {
  const { id, ...body } = data;
  const response = await fetch(`${API_URL}/api/categories/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error("Failed to update category");
  }
  return response.json();
};

const deleteCategory = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/api/categories/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to delete category");
  }
};

const getProfileSettings = async (): Promise<ProfileSettingsResponse> => {
  const response = await fetch(`${API_URL}/api/profile/settings`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch profile settings");
  }
  return response.json();
};

const updateProfileSettings = async (
  data: Partial<ProfileSettings>
): Promise<ProfileSettingsResponse> => {
  const response = await fetch(`${API_URL}/api/profile/settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "An error occurred" }));
    throw new Error(error.message || "Failed to update profile settings");
  }
  return response.json();
};

const getPublicProfile = async (userIdOrSlug: string): Promise<any> => {
  const response = await fetch(`${API_URL}/api/profile/${userIdOrSlug}`);
  if (!response.ok) {
    throw new Error("Failed to fetch public profile");
  }
  return response.json();
};

// React Query Hooks

export function useYearEntries() {
  return useQuery({
    queryKey: ["year-entries"],
    queryFn: getYearEntries,
  });
}

export function useDayEntry(date: string | null) {
  return useQuery({
    queryKey: ["day-entry", date],
    queryFn: () => getDayEntry(date!),
    enabled: !!date,
  });
}

export function useSaveDayEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createOrUpdateDayEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["year-entries"] });
    },
  });
}

export function useDeleteDayEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDayEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["year-entries"] });
    },
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["day-entry"] });
      queryClient.invalidateQueries({ queryKey: ["year-entries"] });
    },
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["day-entry"] });
      queryClient.invalidateQueries({ queryKey: ["year-entries"] });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["day-entry"] });
      queryClient.invalidateQueries({ queryKey: ["year-entries"] });
    },
  });
}

export function useCustomCategories() {
  return useQuery({
    queryKey: ["custom-categories"],
    queryFn: getCustomCategories,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-categories"] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-categories"] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-categories"] });
    },
  });
}

export function useProfileSettings() {
  return useQuery({
    queryKey: ["profile-settings"],
    queryFn: getProfileSettings,
  });
}

export function useUpdateProfileSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfileSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile-settings"] });
    },
  });
}

export function usePublicProfile(userIdOrSlug: string | null) {
  return useQuery({
    queryKey: ["public-profile", userIdOrSlug],
    queryFn: () => getPublicProfile(userIdOrSlug!),
    enabled: !!userIdOrSlug,
  });
}
