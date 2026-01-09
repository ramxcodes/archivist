"use client";

import React, { useState } from "react";
import type { DayInfo, DayEntry, Review } from "@/lib/types";
import {
  LEGEND_CONFIG,
  DEFAULT_COLOR,
  DEFAULT_TEXT_COLOR,
} from "@/lib/constants";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/ui/popover";
import { toast } from "sonner";

interface DayTileProps {
  day: DayInfo | null;
  entry?: DayEntry;
  reviews?: Review[];
  onClick: (day: DayInfo) => void;
  showReviews?: boolean;
  isToday?: boolean;
}

export const DayTile: React.FC<DayTileProps> = ({
  day,
  entry,
  reviews = [],
  onClick,
  showReviews = true,
  isToday = false,
}) => {
  const [open, setOpen] = useState(false);

  if (!day) {
    return (
      <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 invisible shrink-0" />
    );
  }

  const legend = entry?.legend;
  const config = legend ? LEGEND_CONFIG[legend] : null;
  const isDefault = !legend;

  const todayKey = new Date().toISOString().split("T")[0];
  const isFuture = day.dateKey > todayKey;

  const hasReviews = reviews.length > 0;
  const shouldShowReviews = showReviews && hasReviews;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);

    if (isFuture) {
      toast.error("Future dates are locked", {
        description: "Entries can only be added for today or past days.",
      });
      return;
    }

    onClick(day);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        onClick={handleClick}
        onMouseEnter={() => !isFuture && setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        disabled={isFuture}
        className={`
          w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 rounded-md flex items-center justify-center shrink-0
          transition-all duration-200 relative
          border
          ${
            isFuture
              ? "opacity-40 cursor-not-allowed"
              : "hover:scale-110"
          }
          ${
            isToday
              ? "border-indigo-400 shadow-[0_0_0_2px_rgba(99,102,241,0.4)]"
              : "border-transparent"
          }
          ${isDefault ? "hover:bg-[#3F3F46]" : "hover:brightness-125"}
        `}
        style={{
          backgroundColor: config ? config.color : DEFAULT_COLOR,
          boxShadow:
            !isDefault && !isToday
              ? `0 0 10px ${config?.color}44`
              : undefined,
        }}
      >
        <span
          className="text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs font-bold"
          style={{
            color: !isDefault && config ? config.textColor : DEFAULT_TEXT_COLOR,
          }}
        >
          {day.dayNumber.toString().padStart(2, "0")}
        </span>
      </PopoverTrigger>

      {!isFuture && (
        <PopoverContent
          className="bg-[#1A1A1E] text-white text-xs rounded-lg border border-[#3F3F46] shadow-2xl w-80 p-0"
          side="top"
          align="center"
          sideOffset={8}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <div className="px-3 py-2 border-b border-[#3F3F46]">
            <p className="font-bold text-[10px] text-gray-400">
              {new Date(day.dateKey).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
              {isToday && (
                <span className="ml-2 text-indigo-400 font-semibold">
                  Today
                </span>
              )}
            </p>
          </div>

          {config && (
            <div className="px-3 py-2 border-b border-[#3F3F46]">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: config.color }}
                />
                <p className="font-semibold text-xs text-gray-200">
                  {config.label}
                </p>
              </div>
            </div>
          )}

          {shouldShowReviews && (
            <div className="px-3 py-2 space-y-2">
              {reviews.map((review, idx) => (
                <div key={idx} className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">
                    {review.category === "CUSTOM"
                      ? "Custom"
                      : review.category.toLowerCase()}
                  </p>
                  <p className="text-[11px] text-gray-300">
                    {review.content}
                  </p>
                </div>
              ))}
            </div>
          )}

          {!config && (
            <div className="px-3 py-2">
              <p className="text-[10px] text-gray-500 italic">
                No entry yet
              </p>
            </div>
          )}
        </PopoverContent>
      )}
    </Popover>
  );
};
