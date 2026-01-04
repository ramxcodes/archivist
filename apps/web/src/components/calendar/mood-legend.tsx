"use client";

import React from "react";
import { Legend, LEGEND_CONFIG } from "@/lib/constants";

export const MoodLegend: React.FC = () => {
  const legends = [
    Legend.CORE_MEMORY,
    Legend.GOOD_DAY,
    Legend.NEUTRAL,
    Legend.BAD_DAY,
    Legend.NIGHTMARE,
  ];

  return (
    <div className="flex flex-col gap-4 p-4 bg-[#16161A] border border-[#2A2B2F] rounded-xl sticky top-6 shadow-xl h-fit w-full lg:w-56">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-2">
        Legend
      </h3>
      <div className="flex flex-col gap-3">
        {legends.map((type) => (
          <div key={type} className="flex items-center gap-3">
            <div
              className="w-5 h-5 rounded-md shadow-sm transition-transform"
              style={{ backgroundColor: LEGEND_CONFIG[type].color }}
            />
            <span className="text-sm font-medium text-gray-300 whitespace-nowrap">
              {LEGEND_CONFIG[type].label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
