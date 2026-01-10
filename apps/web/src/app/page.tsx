"use client";

import React, { useState, useMemo } from "react";
import type { DayInfo, DayEntryMap, Review } from "@/lib/types";
import { QUADRIMESTERS, Legend, ReviewCategory } from "@/lib/constants";
import { MonthGrid } from "@/components/calendar/month-grid";
import { MoodLegend } from "@/components/calendar/mood-legend";
import { DayModal } from "@/components/calendar/day-modal";
import {
  useYearEntries,
  useSaveDayEntry,
  useCreateReview,
  useUpdateReview,
  useDeleteReview,
  useCustomCategories,
  useDayEntry,
} from "@/lib/api/calendar";
import Loader from "@/components/core/loader";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import SignInDialog from "@/components/auth/sign-in-dialog";

export default function Home() {
  const [year] = useState(2026);
  const [selectedDay, setSelectedDay] = useState<DayInfo | null>(null);
  const [signInOpen, setSignInOpen] = useState(false);

  const { data: session, isPending: isSessionLoading } =
    authClient.useSession();

  const { data: yearData, isLoading: isLoadingYear } = useYearEntries();
  const { data: customCategoriesData } = useCustomCategories();
  const { data: dayData } = useDayEntry(selectedDay?.dateKey || null);

  const saveDayEntry = useSaveDayEntry();
  const createReview = useCreateReview();
  const updateReview = useUpdateReview();
  const deleteReview = useDeleteReview();

  const dayEntries: DayEntryMap = useMemo(() => {
    if (!yearData?.entries) return {};
    const map: DayEntryMap = {};
    yearData.entries.forEach((entry) => {
      map[entry.date] = entry;
    });
    return map;
  }, [yearData]);

  const reviewsByEntry: Record<string, Review[]> = useMemo(() => {
    if (!yearData?.reviews) return {};
    const map: Record<string, Review[]> = {};
    yearData.reviews.forEach((review) => {
      if (!map[review.dayEntryId]) {
        map[review.dayEntryId] = [];
      }
      map[review.dayEntryId]!.push(review);
    });
    return map;
  }, [yearData]);

  const totalEntries = yearData?.entries?.length || 0;
  const goodDaysCount =
    yearData?.entries?.filter(
      (e) => e.legend === Legend.GOOD_DAY || e.legend === Legend.CORE_MEMORY
    ).length || 0;

  const currentStreak = useMemo(() => {
    if (!yearData?.entries || yearData.entries.length === 0) return 0;
    const entryDates = new Set(yearData.entries.map((entry) => entry.date));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    let checkDate = new Date(today);
    const todayStr = formatDate(today);

    if (!entryDates.has(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    let streak = 0;
    const maxDaysToCheck = 365;

    for (let i = 0; i < maxDaysToCheck; i++) {
      const dateStr = formatDate(checkDate);

      if (entryDates.has(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }, [yearData]);

  const handleDayClick = (day: DayInfo) => {
    if (!session) {
      setSignInOpen(true);
      return;
    }
    setSelectedDay(day);
  };

  const handleSaveDayEntry = async (data: {
    date: string;
    legend: Legend;
    reviews: Array<{
      id?: string;
      category: ReviewCategory;
      customCategoryId?: string;
      content: string;
    }>;
    reviewsToDelete?: string[];
  }) => {
    try {
      // First, save the day entry
      const result = await saveDayEntry.mutateAsync({
        date: data.date,
        legend: data.legend,
      });

      // Then, create or update reviews
      if (data.reviews.length > 0 && result.entry) {
        await Promise.all(
          data.reviews.map((review) => {
            if (review.id) {
              return updateReview.mutateAsync({
                id: review.id,
                content: review.content,
              });
            } else {
              return createReview.mutateAsync({
                dayEntryId: result.entry.id,
                category: review.category,
                customCategoryId: review.customCategoryId,
                content: review.content,
              });
            }
          })
        );
      }

      // Handle deleted reviews
      if (data.reviewsToDelete && data.reviewsToDelete.length > 0) {
        await Promise.all(
          data.reviewsToDelete.map((id) => deleteReview.mutateAsync(id))
        );
      }

      setSelectedDay(null);
      toast.success("Day entry saved successfully!");
    } catch (error) {
      console.error("Error saving day entry:", error);
      toast.error("Failed to save day entry. Please try again.");
    }
  };

  const isSaving =
    saveDayEntry.isPending ||
    createReview.isPending ||
    updateReview.isPending ||
    deleteReview.isPending;

  if (isSessionLoading || (session && isLoadingYear)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen pb-20 px-4 md:px-6 lg:px-8 max-w-[1600px] mx-auto bg-[#0D0D0F]">
        {/* Header Section */}
        <header className="py-8 md:py-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className="bg-[#22D3EE]/10 text-[#22D3EE] text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest border border-[#22D3EE]/20">
                Personal Archivist
              </span>
              <span className="text-gray-500 text-sm font-medium">V 1.0</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-100 tracking-tight wrap-break-words">
              THE YEAR <span className="text-[#22D3EE]">{year}</span>
            </h1>
            <p className="text-gray-400 mt-2 font-medium max-w-xl text-sm md:text-base">
              A visual autobiography of your emotional journey. Every square
              holds a memory, every color tells a story.
            </p>
          </div>

          {session && (
            <div className="flex gap-3 md:gap-4 flex-wrap sm:flex-nowrap">
              <div className="bg-[#16161A] border border-[#2A2B2F] rounded-xl p-3 md:p-4 flex flex-col items-center min-w-[90px] md:min-w-[100px] shadow-sm">
                <span className="text-xl md:text-2xl font-black text-white">
                  {totalEntries}
                </span>
                <span className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  Logged
                </span>
              </div>
              <div className="bg-[#16161A] border border-[#2A2B2F] rounded-xl p-3 md:p-4 flex flex-col items-center min-w-[90px] md:min-w-[100px] shadow-sm">
                <span className="text-xl md:text-2xl font-black text-[#22C55E]">
                  {goodDaysCount}
                </span>
                <span className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  Great Days
                </span>
              </div>
              <div className="bg-[#16161A] border border-[#2A2B2F] rounded-xl p-3 md:p-4 flex flex-col items-center min-w-[90px] md:min-w-[100px] shadow-sm">
                <span className="text-xl md:text-2xl font-black text-[#F59E0B]">
                  {currentStreak}
                </span>
                <span className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  Day Streak
                </span>
              </div>
            </div>
          )}
        </header>

        {/* Main Layout Grid */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-8 lg:gap-12">
          {/* Year View */}
          <div className="flex-1 space-y-6 sm:space-y-10 md:space-y-12 lg:space-y-16 min-w-0 px-2 sm:px-0">
            {QUADRIMESTERS.map((quad, qIndex) => (
              <section
                key={quad.name}
                className="animate-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${qIndex * 150}ms` }}
              >
                <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-5 md:mb-6 justify-center sm:justify-start">
                  <h2 className="text-xs sm:text-xs md:text-sm font-black text-[#22D3EE] uppercase tracking-[0.15em] sm:tracking-[0.2em] md:tracking-[0.3em] whitespace-nowrap">
                    {quad.name}
                  </h2>
                  <div className="h-px bg-linear-to-r from-[#22D3EE]/30 to-transparent w-full hidden sm:block" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-y-4 sm:gap-y-6 md:gap-y-8 gap-x-2 sm:gap-x-3 md:gap-x-4 lg:gap-x-6 justify-items-center lg:justify-items-start min-w-0">
                  {quad.months.map((mIdx, idx) => (
                    <div key={mIdx} className="w-full max-w-xs sm:max-w-sm md:max-w-none min-w-0">
                      <MonthGrid
                        year={year}
                        monthIndex={mIdx}
                        dayEntries={dayEntries}
                        reviewsByEntry={reviewsByEntry}
                        onTileClick={handleDayClick}
                        showReviews={true}
                        showWeekdays={idx === 0}
                      />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Side Panel (Legend) */}
          <aside className="lg:w-64 shrink-0 w-full">
            <MoodLegend />
          </aside>
        </div>

        {/* Modal Overlay */}
        {selectedDay && session && (
          <DayModal
            day={selectedDay}
            entry={dayData?.entry}
            reviews={dayData?.reviews}
            customCategories={customCategoriesData?.categories}
            onClose={() => setSelectedDay(null)}
            onSave={handleSaveDayEntry}
            isSaving={isSaving}
          />
        )}
      </div>

      {/* Sign In Dialog */}
      <SignInDialog open={signInOpen} onOpenChange={setSignInOpen} />
    </>
  );
}
