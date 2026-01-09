"use client";

import React, { useState } from "react";
import { Legend, LEGEND_CONFIG } from "@/lib/constants";

export const MoodLegend: React.FC = () => {
  const [hoveredLegend, setHoveredLegend] = useState<Legend | null>(null);

  const legends = [
    Legend.CORE_MEMORY,
    Legend.GOOD_DAY,
    Legend.NEUTRAL,
    Legend.BAD_DAY,
    Legend.NIGHTMARE,
  ];

  return (
    <div className="relative">
      {/* Subtle backlight glow */}
      <div className="absolute -inset-4 bg-gradient-to-br from-[#22D3EE]/5 via-transparent to-[#22D3EE]/5 rounded-2xl blur-2xl pointer-events-none opacity-40" />
      
      <div className="relative flex flex-col gap-3 p-4 md:p-5 bg-[#16161A]/95 border border-[#2A2B2F] rounded-xl sticky top-6 h-fit w-full lg:max-w-xs backdrop-blur-sm overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 select-none">
        {/* Legend Header */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest pointer-events-none">
            Mood Legend
          </p>
        </div>

        {/* Legend Items */}
        <div className="flex flex-col gap-2">
          {legends.map((type) => (
            <div
              key={type}
              onMouseEnter={() => setHoveredLegend(type)}
              onMouseLeave={() => setHoveredLegend(null)}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 cursor-pointer select-none
                ${
                  hoveredLegend === type
                    ? "bg-[#22D3EE]/15 scale-105"
                    : "bg-transparent hover:bg-[#2A2B2F]/40"
                }
              `}
            >
              {/* Color indicator - with glow on hover */}
              <div
                className="w-4 h-4 rounded transition-all duration-300 flex-shrink-0 border border-[#3F3F46]"
                style={{ 
                  backgroundColor: LEGEND_CONFIG[type].color,
                  boxShadow: hoveredLegend === type ? `0 0 12px ${LEGEND_CONFIG[type].color}40` : `0 0 4px ${LEGEND_CONFIG[type].color}20`,
                }}
              />
              
              {/* Label - smooth transition */}
              <span className={`
                text-xs transition-all duration-300 whitespace-nowrap pointer-events-none font-medium
                ${hoveredLegend === type ? "text-gray-50 opacity-100" : "text-gray-500 opacity-80"}
              `}>
                {LEGEND_CONFIG[type].label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
