"use client";

import React, { useState, useMemo } from "react";
import type { DayInfo, DayEntryMap } from "@/lib/types";
import { QUADRIMESTERS, Legend, ReviewCategory } from "@/lib/constants";
import { MonthGrid } from "@/components/calendar/month-grid";
import { MoodLegend } from "@/components/calendar/mood-legend";
import { DayModal } from "@/components/calendar/day-modal";
import {
  useYearEntries,
  useSaveDayEntry,
  useCreateReview,
  useCustomCategories,
  useDayEntry,
} from "@/lib/api/calendar";
import Loader from "@/components/core/loader";

export default function CalendarPage() {
  const [year] = useState(2026);
  const [selectedDay, setSelectedDay] = useState<DayInfo | null>(null);

  // Fetch data
  const { data: yearData, isLoading: isLoadingYear } = useYearEntries();
  const { data: customCategoriesData } = useCustomCategories();
  const { data: dayData } = useDayEntry(selectedDay?.dateKey || null);

  // Mutations
  const saveDayEntry = useSaveDayEntry();
  const createReview = useCreateReview();

  // Convert entries array to map
  const dayEntries: DayEntryMap = useMemo(() => {
    if (!yearData?.entries) return {};
    const map: DayEntryMap = {};
    yearData.entries.forEach((entry) => {
      map[entry.date] = entry;
    });
    return map;
  }, [yearData]);

  // Calculate stats
  const totalEntries = yearData?.entries?.length || 0;
  const goodDaysCount =
    yearData?.entries?.filter(
      (e) => e.legend === Legend.GOOD_DAY || e.legend === Legend.CORE_MEMORY
    ).length || 0;

  const handleSaveDayEntry = async (data: {
    date: string;
    legend: Legend;
    reviews: Array<{
      category: ReviewCategory;
      customCategoryId?: string;
      content: string;
    }>;
  }) => {
    try {
      // First, save the day entry
      const result = await saveDayEntry.mutateAsync({
        date: data.date,
        legend: data.legend,
      });

      // Then, create all reviews
      if (data.reviews.length > 0 && result.entry) {
        await Promise.all(
          data.reviews.map((review) =>
            createReview.mutateAsync({
              dayEntryId: result.entry.id,
              category: review.category,
              customCategoryId: review.customCategoryId,
              content: review.content,
            })
          )
        );
      }

      setSelectedDay(null);
    } catch (error) {
      console.error("Error saving day entry:", error);
      alert("Failed to save day entry. Please try again.");
    }
  };

  if (isLoadingYear) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 px-4 md:px-8 max-w-[1600px] mx-auto overflow-x-hidden bg-[#0D0D0F]">
      {/* Header Section */}
      <header className="py-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-[#22D3EE]/10 text-[#22D3EE] text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest border border-[#22D3EE]/20">
              Personal Archivist
            </span>
            <span className="text-gray-500 text-sm font-medium">v1.0.0</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-100 tracking-tight">
            THE YEAR <span className="text-[#22D3EE]">{year}</span>
          </h1>
          <p className="text-gray-400 mt-2 font-medium max-w-xl">
            A visual autobiography of your emotional journey. Every square holds
            a memory, every color tells a story.
          </p>
        </div>

        <div className="flex gap-4">
          <div className="bg-[#16161A] border border-[#2A2B2F] rounded-xl p-4 flex flex-col items-center min-w-[100px] shadow-sm">
            <span className="text-2xl font-black text-white">
              {totalEntries}
            </span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              Logged
            </span>
          </div>
          <div className="bg-[#16161A] border border-[#2A2B2F] rounded-xl p-4 flex flex-col items-center min-w-[100px] shadow-sm">
            <span className="text-2xl font-black text-[#22C55E]">
              {goodDaysCount}
            </span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              Great Days
            </span>
          </div>
        </div>
      </header>

      {/* Main Layout Grid */}
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Year View */}
        <div className="flex-1 space-y-20">
          {QUADRIMESTERS.map((quad, qIndex) => (
            <section
              key={quad.name}
              className="animate-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: `${qIndex * 150}ms` }}
            >
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-sm font-black text-[#22D3EE] uppercase tracking-[0.3em] whitespace-nowrap">
                  {quad.name}
                </h2>
                <div className="h-px bg-linear-to-r from-[#22D3EE]/30 to-transparent w-full" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-y-12 gap-x-8">
                {quad.months.map((mIdx) => (
                  <div key={mIdx} className="overflow-x-auto no-scrollbar">
                    <MonthGrid
                      year={year}
                      monthIndex={mIdx}
                      dayEntries={dayEntries}
                      onTileClick={setSelectedDay}
                    />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Side Panel (Legend) */}
        <aside className="lg:w-64 shrink-0">
          <MoodLegend />
        </aside>
      </div>

      {/* Modal Overlay */}
      {selectedDay && (
        <DayModal
          day={selectedDay}
          entry={dayData?.entry}
          reviews={dayData?.reviews}
          customCategories={customCategoriesData?.categories}
          onClose={() => setSelectedDay(null)}
          onSave={handleSaveDayEntry}
        />
      )}

      {/* Footer Info */}
      <footer className="mt-32 pt-8 border-t border-[#2A2B2F] text-center">
        <p className="text-gray-600 text-[10px] uppercase font-bold tracking-[0.4em]">
          Mood Tracking System &copy; {year} &bull; Designed for Reflection
        </p>
      </footer>
    </div>
  );
}
