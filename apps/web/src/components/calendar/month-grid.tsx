"use client";

import React from "react";
import { MONTHS, WEEKDAYS } from "@/lib/constants";
import { getMonthGrid } from "@/lib/date-utils";
import type { DayInfo, DayEntryMap, Review } from "@/lib/types";
import { DayTile } from "./day-tile";

interface MonthGridProps {
  year: number;
  monthIndex: number;
  dayEntries: DayEntryMap;
  reviewsByEntry?: Record<string, Review[]>;
  onTileClick: (day: DayInfo) => void;
  showReviews?: boolean;
  showWeekdays?: boolean;
}

export const MonthGrid: React.FC<MonthGridProps> = ({
  year,
  monthIndex,
  dayEntries,
  reviewsByEntry = {},
  onTileClick,
  showReviews = true,
  showWeekdays = true,
}) => {
  const grid = getMonthGrid(year, monthIndex);

  const todayKey = new Date().toISOString().split("T")[0];

  return (
    <div className="flex flex-col gap-3 w-full max-w-full min-w-0">
      <div className="flex items-center justify-between mb-1">
        <h4 className="text-[10px] md:text-[11px] font-bold text-gray-400 tracking-[0.15em] md:tracking-[0.2em] uppercase">
          {MONTHS[monthIndex]} {year}
        </h4>
      </div>

      <div className="flex gap-2 w-full min-w-0">
        {showWeekdays && (
          <div className="flex flex-col gap-[8px] md:gap-[10px] lg:gap-[12px] pt-1 shrink-0">
            {WEEKDAYS.map((day) => (
              <div key={day} className="h-7 md:h-8 lg:h-10 flex items-center">
                <span className="text-[8px] md:text-[9px] font-bold text-gray-600">
                  {day}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-[6px] md:gap-[8px] lg:gap-[10px] flex-1 min-w-0 overflow-visible">
          {grid.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="flex gap-[6px] md:gap-[8px] lg:gap-[10px]"
            >
              {row.map((day, colIndex) => {
                const entry = day ? dayEntries[day.dateKey] : undefined;
                const reviews = entry ? reviewsByEntry[entry.id] || [] : [];
                const isToday = day?.dateKey === todayKey;

                return (
                  <DayTile
                    key={`${rowIndex}-${colIndex}`}
                    day={day}
                    entry={entry}
                    reviews={reviews}
                    onClick={onTileClick}
                    showReviews={showReviews}
                    isToday={isToday}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
