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

  const journeySteps = [
    "Click a date",
    "Choose your mood",
    "Add reviews",
    "Track your journey",
  ];

  return (
    <div className="flex flex-col gap-3 p-3 md:p-4 bg-[#16161A] border border-[#2A2B2F] rounded-xl sticky top-6 h-fit w-full lg:max-w-xs backdrop-blur-sm overflow-hidden relative">
      {/* Content wrapper */}
      <div className="relative z-10">
        {/* Header - User Journey */}
        <div className="mb-3 pb-3 border-b border-[#2A2B2F]">
          <h3 className="text-xs font-black text-[#22D3EE] uppercase tracking-widest mb-2">
            Your Journey
          </h3>
          <div className="flex flex-wrap gap-1">
            {journeySteps.map((step, idx) => (
              <div key={step} className="flex items-center gap-1">
                <span className="text-[10px] bg-[#22D3EE]/10 text-[#22D3EE] px-2 py-0.5 rounded">
                  {step}
                </span>
                {idx < journeySteps.length - 1 && (
                  <span className="text-gray-600 text-xs">→</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Legend Header */}
        <div className="mb-2">
          <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">
            Mood Reference
          </p>
        </div>

        {/* Legend Items */}
        <div className="flex flex-col gap-1.5">
          {legends.map((type) => (
            <div
              key={type}
              onMouseEnter={() => setHoveredLegend(type)}
              onMouseLeave={() => setHoveredLegend(null)}
              className={`
                flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all duration-150 cursor-pointer
                ${
                  hoveredLegend === type
                    ? "bg-[#22D3EE]/10"
                    : "bg-transparent hover:bg-[#2A2B2F]"
                }
              `}
            >
              {/* Color indicator - smaller and simpler */}
              <div
                className="w-4 h-4 rounded transition-all duration-150 flex-shrink-0 border border-[#3F3F46]"
                style={{ 
                  backgroundColor: LEGEND_CONFIG[type].color,
                }}
              />
              
              {/* Label - cleaner */}
              <span className={`
                text-xs font-medium transition-all duration-150 whitespace-nowrap
                ${hoveredLegend === type ? "text-gray-100" : "text-gray-400"}
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
