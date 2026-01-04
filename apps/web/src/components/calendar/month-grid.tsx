"use client";

import React from "react";
import { MONTHS, WEEKDAYS } from "@/lib/constants";
import { getMonthGrid } from "@/lib/date-utils";
import type { DayInfo, DayEntryMap } from "@/lib/types";
import { DayTile } from "./day-tile";

interface MonthGridProps {
  year: number;
  monthIndex: number;
  dayEntries: DayEntryMap;
  onTileClick: (day: DayInfo) => void;
}

export const MonthGrid: React.FC<MonthGridProps> = ({
  year,
  monthIndex,
  dayEntries,
  onTileClick,
}) => {
  const grid = getMonthGrid(year, monthIndex);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between mb-1">
        <h4 className="text-[11px] font-bold text-gray-400 tracking-[0.2em] uppercase">
          {MONTHS[monthIndex]} {year}
        </h4>
      </div>

      <div className="flex gap-2">
        {/* Weekday labels */}
        <div className="flex flex-col gap-[10px] md:gap-[12px] pt-1">
          {WEEKDAYS.map((day) => (
            <div key={day} className="h-8 md:h-10 flex items-center">
              <span className="text-[9px] font-bold text-gray-600 tracking-tighter">
                {day}
              </span>
            </div>
          ))}
        </div>

        {/* The Grid */}
        <div className="flex flex-col gap-[8px] md:gap-[10px]">
          {grid.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-[8px] md:gap-[10px]">
              {row.map((day, colIndex) => (
                <DayTile
                  key={`${rowIndex}-${colIndex}`}
                  day={day}
                  entry={day ? dayEntries[day.dateKey] : undefined}
                  onClick={onTileClick}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
