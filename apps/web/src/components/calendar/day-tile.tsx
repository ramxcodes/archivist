"use client";

import React from "react";
import type { DayInfo, DayEntry } from "@/lib/types";
import {
  LEGEND_CONFIG,
  DEFAULT_COLOR,
  DEFAULT_TEXT_COLOR,
} from "@/lib/constants";

interface DayTileProps {
  day: DayInfo | null;
  entry?: DayEntry;
  onClick: (day: DayInfo) => void;
}

export const DayTile: React.FC<DayTileProps> = ({ day, entry, onClick }) => {
  if (!day) {
    return <div className="w-8 h-8 md:w-10 md:h-10 invisible" />;
  }

  const legend = entry?.legend;
  const config = legend ? LEGEND_CONFIG[legend] : null;
  const isDefault = !legend;

  return (
    <button
      onClick={() => onClick(day)}
      title={`${day.dateKey}${config ? ` - ${config.label}` : ""}`}
      className={`
        w-8 h-8 md:w-10 md:h-10 rounded-md flex items-center justify-center
        transition-all duration-200 transform hover:scale-110 relative group
        shadow-sm border border-transparent
        ${isDefault ? "hover:bg-[#3F3F46]" : "hover:brightness-125"}
      `}
      style={{
        backgroundColor: config ? config.color : DEFAULT_COLOR,
        boxShadow: !isDefault ? `0 0 10px ${config?.color}44` : "none",
      }}
    >
      <span
        className={`text-[10px] md:text-xs font-bold transition-colors ${
          !isDefault ? "opacity-90" : "text-gray-500"
        }`}
        style={{
          color: !isDefault && config ? config.textColor : DEFAULT_TEXT_COLOR,
        }}
      >
        {day.dayNumber.toString().padStart(2, "0")}
      </span>

      {/* Tooltip implementation */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
        <div className="bg-[#1A1A1E] text-white text-[10px] py-1 px-2 rounded border border-[#3F3F46] whitespace-nowrap shadow-xl">
          {day.dateKey}
        </div>
        <div className="w-2 h-2 bg-[#1A1A1E] border-r border-b border-[#3F3F46] rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
      </div>
    </button>
  );
};
