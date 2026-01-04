"use client";

import React, { useState, useEffect } from "react";
import type { DayInfo, DayEntry, Review, CustomCategory } from "@/lib/types";
import {
  Legend,
  LEGEND_CONFIG,
  ReviewCategory,
  DEFAULT_CATEGORIES,
} from "@/lib/constants";
import { isFutureDate } from "@/lib/date-utils";
import { Dialog, DialogContent } from "@repo/ui/components/ui/dialog";
import { Button } from "@repo/ui/components/ui/button";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Label } from "@repo/ui/components/ui/label";

interface DayModalProps {
  day: DayInfo | null;
  entry?: DayEntry;
  reviews?: Review[];
  customCategories?: CustomCategory[];
  onClose: () => void;
  onSave: (data: {
    date: string;
    legend: Legend;
    reviews: Array<{
      category: ReviewCategory;
      customCategoryId?: string;
      content: string;
    }>;
  }) => void;
}

export const DayModal: React.FC<DayModalProps> = ({
  day,
  entry,
  reviews = [],
  customCategories = [],
  onClose,
  onSave,
}) => {
  const [selectedLegend, setSelectedLegend] = useState<Legend>(Legend.NEUTRAL);
  const [reviewContents, setReviewContents] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    if (!day) return;

    // Set legend
    if (entry) {
      setSelectedLegend(entry.legend);
    } else {
      setSelectedLegend(Legend.NEUTRAL);
    }

    // Load existing reviews
    const contents: Record<string, string> = {};
    reviews.forEach((review) => {
      const key =
        review.category === ReviewCategory.CUSTOM && review.customCategoryId
          ? `custom-${review.customCategoryId}`
          : review.category.toLowerCase();
      contents[key] = review.content;
    });
    setReviewContents(contents);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day?.dateKey, entry?.id]);

  if (!day) return null;

  const legends = [
    Legend.CORE_MEMORY,
    Legend.GOOD_DAY,
    Legend.NEUTRAL,
    Legend.BAD_DAY,
    Legend.NIGHTMARE,
  ];

  const isFuture = isFutureDate(day.dateKey);

  const handleSave = () => {
    // Validate required custom categories
    const requiredCategories = customCategories.filter((c) => c.isRequired);
    const missingRequired = requiredCategories.some(
      (cat) => !reviewContents[`custom-${cat.id}`]?.trim()
    );

    if (missingRequired) {
      alert("Please fill in all required review categories");
      return;
    }

    // Build reviews array
    const reviewsToSave: Array<{
      category: ReviewCategory;
      customCategoryId?: string;
      content: string;
    }> = [];

    // Add default category reviews
    DEFAULT_CATEGORIES.forEach((cat) => {
      const content = reviewContents[cat.value.toLowerCase()]?.trim();
      if (content) {
        reviewsToSave.push({
          category: cat.value,
          content,
        });
      }
    });

    // Add custom category reviews
    customCategories.forEach((cat) => {
      const content = reviewContents[`custom-${cat.id}`]?.trim();
      if (content) {
        reviewsToSave.push({
          category: ReviewCategory.CUSTOM,
          customCategoryId: cat.id,
          content,
        });
      }
    });

    onSave({
      date: day.dateKey,
      legend: selectedLegend,
      reviews: reviewsToSave,
    });
  };

  return (
    <Dialog open={!!day} onOpenChange={onClose}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#16161A] border-[#2A2B2F]"
        showCloseButton={true}
      >
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold text-gray-100 mb-1">
              Log Day Entry
            </h2>
            <p className="text-gray-400 font-medium">
              {new Date(day.dateKey).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            {isFuture && (
              <p className="text-red-400 text-sm mt-1">
                Cannot create entries for future dates
              </p>
            )}
          </div>

          {/* Legend Selector */}
          <div>
            <Label className="block text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              How was your day? <span className="text-red-400">*</span>
            </Label>
            <div className="grid grid-cols-5 gap-2">
              {legends.map((type) => {
                const isSelected = selectedLegend === type;
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedLegend(type)}
                    disabled={isFuture}
                    className={`
                      aspect-square rounded-xl flex flex-col items-center justify-center gap-2 transition-all
                      ${
                        isSelected
                          ? "scale-105 shadow-lg ring-2 ring-offset-2 ring-offset-[#16161A] ring-white/20"
                          : "opacity-60 hover:opacity-100"
                      }
                      ${isFuture ? "cursor-not-allowed" : ""}
                    `}
                    style={{ backgroundColor: LEGEND_CONFIG[type].color }}
                    title={LEGEND_CONFIG[type].label}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-black/20" />
                  </button>
                );
              })}
            </div>
            <p
              className="mt-3 text-center text-sm font-bold"
              style={{ color: LEGEND_CONFIG[selectedLegend].color }}
            >
              {LEGEND_CONFIG[selectedLegend].label}
            </p>
          </div>

          {/* Review Sections */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Reviews (Optional)
            </h3>

            {/* Default Categories */}
            {DEFAULT_CATEGORIES.map((cat) => (
              <div key={cat.value}>
                <Label className="block text-sm font-medium text-gray-300 mb-2">
                  {cat.label}
                </Label>
                <Textarea
                  value={reviewContents[cat.value.toLowerCase()] || ""}
                  onChange={(e) =>
                    setReviewContents({
                      ...reviewContents,
                      [cat.value.toLowerCase()]: e.target.value,
                    })
                  }
                  disabled={isFuture}
                  placeholder={`Write about your ${cat.label.toLowerCase()} day...`}
                  className="w-full h-24 bg-[#0F0F12] border-[#2A2B2F] text-gray-200 focus:ring-[#22D3EE]/30 focus:border-[#22D3EE]/50 resize-none"
                />
              </div>
            ))}

            {/* Custom Categories */}
            {customCategories.map((cat) => (
              <div key={cat.id}>
                <Label className="block text-sm font-medium text-gray-300 mb-2">
                  {cat.name}
                  {cat.isRequired && (
                    <span className="text-red-400 ml-1">*</span>
                  )}
                </Label>
                <Textarea
                  value={reviewContents[`custom-${cat.id}`] || ""}
                  onChange={(e) =>
                    setReviewContents({
                      ...reviewContents,
                      [`custom-${cat.id}`]: e.target.value,
                    })
                  }
                  disabled={isFuture}
                  placeholder={`Write about ${cat.name.toLowerCase()}...`}
                  className="w-full h-24 bg-[#0F0F12] border-[#2A2B2F] text-gray-200 focus:ring-[#22D3EE]/30 focus:border-[#22D3EE]/50 resize-none"
                />
              </div>
            ))}
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={isFuture}
            className="w-full bg-[#22D3EE] hover:bg-[#06B6D4] text-gray-900 font-bold py-6 rounded-xl shadow-lg transition-all active:scale-[0.98]"
          >
            Save Entry
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
