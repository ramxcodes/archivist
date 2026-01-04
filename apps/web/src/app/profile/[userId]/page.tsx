"use client";

import React, { useMemo } from "react";
import { useParams } from "next/navigation";
import type { DayEntryMap } from "@/lib/types";
import { QUADRIMESTERS, Legend } from "@/lib/constants";
import { MonthGrid } from "@/components/calendar/month-grid";
import { MoodLegend } from "@/components/calendar/mood-legend";
import { usePublicProfile } from "@/lib/api/calendar";
import Loader from "@/components/core/loader";

export default function PublicProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const year = 2026;

  const { data: profileData, isLoading, error } = usePublicProfile(userId);

  // Convert entries array to map
  const dayEntries: DayEntryMap = useMemo(() => {
    if (!profileData?.entries) return {};
    const map: DayEntryMap = {};
    profileData.entries.forEach((entry: any) => {
      map[entry.date] = {
        ...entry,
        legend: entry.legend as Legend,
      };
    });
    return map;
  }, [profileData]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D0D0F]">
        <div className="text-center">
          <h1 className="text-4xl font-black text-gray-100 mb-4">
            Profile Not Found
          </h1>
          <p className="text-gray-400">
            This profile is private or does not exist.
          </p>
        </div>
      </div>
    );
  }

  const { user, settings, stats } = profileData;

  return (
    <div className="min-h-screen pb-20 px-4 md:px-6 lg:px-8 max-w-[1600px] mx-auto bg-[#0D0D0F]">
      {/* Header Section */}
      <header className="py-8 md:py-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="bg-[#22D3EE]/10 text-[#22D3EE] text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest border border-[#22D3EE]/20">
              Public Profile
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-100 tracking-tight">
            {user.name}&apos;s <span className="text-[#22D3EE]">{year}</span>
          </h1>
          <p className="text-gray-400 mt-2 font-medium max-w-xl text-sm md:text-base">
            A visual journey through the year.
          </p>
        </div>

        {settings.showStats && stats && (
          <div className="flex gap-3 md:gap-4 flex-wrap sm:flex-nowrap">
            <div className="bg-[#16161A] border border-[#2A2B2F] rounded-xl p-3 md:p-4 flex flex-col items-center min-w-[90px] md:min-w-[100px] shadow-sm">
              <span className="text-xl md:text-2xl font-black text-white">
                {stats.totalEntries}
              </span>
              <span className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Logged
              </span>
            </div>
            <div className="bg-[#16161A] border border-[#2A2B2F] rounded-xl p-3 md:p-4 flex flex-col items-center min-w-[90px] md:min-w-[100px] shadow-sm">
              <span className="text-xl md:text-2xl font-black text-[#22C55E]">
                {stats.goodDaysCount}
              </span>
              <span className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Great Days
              </span>
            </div>
          </div>
        )}
      </header>

      {/* Main Layout Grid */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Year View */}
        {settings.showMoods ? (
          <div className="flex-1 space-y-10 md:space-y-12 lg:space-y-16 overflow-hidden">
            {QUADRIMESTERS.map((quad, qIndex) => (
              <section
                key={quad.name}
                className="animate-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${qIndex * 150}ms` }}
              >
                <div className="flex items-center gap-4 mb-5 md:mb-6">
                  <h2 className="text-xs md:text-sm font-black text-[#22D3EE] uppercase tracking-[0.2em] md:tracking-[0.3em] whitespace-nowrap">
                    {quad.name}
                  </h2>
                  <div className="h-px bg-linear-to-r from-[#22D3EE]/30 to-transparent w-full" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-6 md:gap-y-8 gap-x-3 md:gap-x-4 lg:gap-x-6 justify-items-center lg:justify-items-start">
                  {quad.months.map((mIdx, idx) => (
                    <div key={mIdx} className="w-full max-w-sm md:max-w-none">
                      <MonthGrid
                        year={year}
                        monthIndex={mIdx}
                        dayEntries={dayEntries}
                        reviewsByEntry={profileData.reviews || {}}
                        onTileClick={() => {}} // Read-only, no interaction
                        showReviews={settings.showReviews}
                        showWeekdays={idx === 0}
                      />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center py-20">
            <p className="text-gray-400 text-base md:text-lg text-center px-4">
              This user has chosen not to share their calendar.
            </p>
          </div>
        )}

        {/* Side Panel (Legend) */}
        {settings.showMoods && (
          <aside className="lg:w-64 shrink-0 w-full">
            <MoodLegend />
          </aside>
        )}
      </div>
    </div>
  );
}
