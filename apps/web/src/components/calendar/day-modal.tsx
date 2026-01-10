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
import { toast } from "sonner";
import { ArrowRight, ArrowLeft } from "@phosphor-icons/react/dist/ssr";

interface DayModalProps {
  day: DayInfo | null;
  entry?: DayEntry;
  reviews?: Review[];
  customCategories?: CustomCategory[];
  isSaving?: boolean;
  onClose: () => void;
  onSave: (data: {
    date: string;
    legend: Legend;
    reviews: Array<{
      id?: string;
      category: ReviewCategory;
      customCategoryId?: string;
      content: string;
    }>;
    reviewsToDelete?: string[];
  }) => void;
}

export const DayModal: React.FC<DayModalProps> = ({
  day,
  entry,
  reviews = [],
  customCategories = [],
  isSaving = false,
  onClose,
  onSave,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedLegend, setSelectedLegend] = useState<Legend>(Legend.NEUTRAL);
  const [reviewContents, setReviewContents] = useState<Record<string, string>>(
    {}
  );
  const [reviewIds, setReviewIds] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!day) return;

    // Reset to step 1 when day changes
    setStep(1);

    // Set legend
    if (entry) {
      setSelectedLegend(entry.legend);
    } else {
      setSelectedLegend(Legend.NEUTRAL);
    }

    // Load existing reviews
    const contents: Record<string, string> = {};
    const ids: Record<string, string> = {};
    reviews.forEach((review) => {
      const key =
        review.category === ReviewCategory.CUSTOM && review.customCategoryId
          ? `custom-${review.customCategoryId}`
          : review.category.toLowerCase();
      contents[key] = review.content;
      ids[key] = review.id;
    });
    setReviewContents(contents);
    setReviewIds(ids);
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

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleSave = () => {
    // Validate required custom categories
    const requiredCategories = customCategories.filter((c) => c.isRequired);
    const missingRequired = requiredCategories.some(
      (cat) => !reviewContents[`custom-${cat.id}`]?.trim()
    );

    if (missingRequired) {
      toast.error("Please fill in all required review categories");
      return;
    }

    // Build reviews array
    const reviewsToSave: Array<{
      id?: string;
      category: ReviewCategory;
      customCategoryId?: string;
      content: string;
    }> = [];

    // Add default category reviews
    DEFAULT_CATEGORIES.forEach((cat) => {
      const content = reviewContents[cat.value.toLowerCase()]?.trim();
      if (content) {
        reviewsToSave.push({
          id: reviewIds[cat.value.toLowerCase()],
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
          id: reviewIds[`custom-${cat.id}`],
          category: ReviewCategory.CUSTOM,
          customCategoryId: cat.id,
          content,
        });
      }
    });

    // Identify deleted reviews (have ID but empty/missing content)
    const reviewsToDelete: string[] = [];

    // Check default categories for deletion
    DEFAULT_CATEGORIES.forEach((cat) => {
      const id = reviewIds[cat.value.toLowerCase()];
      const content = reviewContents[cat.value.toLowerCase()]?.trim();
      if (id && !content) {
        reviewsToDelete.push(id);
      }
    });

    // Check custom categories for deletion
    customCategories.forEach((cat) => {
      const id = reviewIds[`custom-${cat.id}`];
      const content = reviewContents[`custom-${cat.id}`]?.trim();
      if (id && !content) {
        reviewsToDelete.push(id);
      }
    });

    onSave({
      date: day.dateKey,
      legend: selectedLegend,
      reviews: reviewsToSave,
      reviewsToDelete,
    });
  };

  const handleSkipReviews = () => {
    onSave({
      date: day.dateKey,
      legend: selectedLegend,
      reviews: [],
    });
  };

  return (
    <Dialog open={!!day} onOpenChange={onClose}>
      <DialogContent
        className="w-full max-w-[calc(100vw-2rem)] sm:max-w-lg max-h-[90vh] overflow-y-auto bg-[#16161A] border-[#2A2B2F] mx-2 sm:mx-4 p-4 sm:p-6"
        showCloseButton={true}
      >
        {/* Step 1: Legend Selection */}
        {step === 1 && (
          <div className="space-y-4 sm:space-y-6 py-2">
            {/* Header */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-[#22D3EE]/10 text-[#22D3EE] text-xs font-bold px-3 py-1 rounded-full mb-2 sm:mb-3 border border-[#22D3EE]/20">
                <span>STEP 1 OF 2</span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-100 mb-2">
                How was your day?
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm font-medium">
                {new Date(day.dateKey).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              {isFuture && (
                <p className="text-red-400 text-xs mt-2 font-medium">
                  Cannot create entries for future dates
                </p>
              )}
            </div>

            {/* Legend Selector */}
            <div className="space-y-2 sm:space-y-3">
              {legends.map((type) => {
                const isSelected = selectedLegend === type;
                const config = LEGEND_CONFIG[type];
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedLegend(type)}
                    disabled={isFuture}
                    className={`
                      w-full p-4 rounded-xl flex items-center gap-4 transition-all
                      ${isSelected
                        ? "ring-2 ring-[#22D3EE] shadow-lg scale-[1.02]"
                        : "hover:scale-[1.01] opacity-70 hover:opacity-100"
                      }
                      ${isFuture ? "cursor-not-allowed" : "cursor-pointer"}
                      bg-[#0F0F12] border border-[#2A2B2F]
                    `}
                  >
                    <div
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: config.color }}
                    >
                      <div className="w-2 h-2 rounded-full bg-black/30" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-bold text-gray-100 text-sm sm:text-base">{config.label}</p>
                      <p className="text-xs text-gray-500">
                        {type === Legend.CORE_MEMORY &&
                          "An unforgettable moment"}
                        {type === Legend.GOOD_DAY && "Things went well"}
                        {type === Legend.NEUTRAL && "Just another day"}
                        {type === Legend.BAD_DAY && "Could have been better"}
                        {type === Legend.NIGHTMARE && "A difficult day"}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-[#22D3EE] flex items-center justify-center shrink-0">
                        <svg
                          className="w-4 h-4 text-gray-900"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            <Button
              onClick={handleNext}
              disabled={isFuture}
              className="w-full bg-[#22D3EE] hover:bg-[#06B6D4] text-gray-900 font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98]"
            >
              Continue to Reviews
              <ArrowRight className="ml-2 w-5 h-5" weight="bold" />
            </Button>
          </div>
        )}

        {/* Step 2: Reviews */}
        {step === 2 && (
          <div className="space-y-4 sm:space-y-6 py-2">
            {/* Header */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-[#22D3EE]/10 text-[#22D3EE] text-xs font-bold px-3 py-1 rounded-full mb-2 sm:mb-3 border border-[#22D3EE]/20">
                <span>STEP 2 OF 2</span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-100 mb-2">
                Add Your Reviews
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm">
                Share more details about your day (optional)
              </p>
            </div>

            {/* Review Sections */}
            <div className="space-y-3 sm:space-y-4 max-h-[50vh] overflow-y-auto pr-2">
              {/* Default Categories */}
              {DEFAULT_CATEGORIES.map((cat) => (
                <div key={cat.value}>
                  <Label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
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
                    placeholder={`Write about your ${cat.label.toLowerCase()}...`}
                    className="w-full h-20 sm:h-24 bg-[#0F0F12] border-[#2A2B2F] text-gray-200 focus:ring-[#22D3EE]/30 focus:border-[#22D3EE]/50 resize-none text-xs sm:text-sm p-3"
                  />
                </div>
              ))}

              {/* Custom Categories */}
              {customCategories.map((cat) => (
                <div key={cat.id}>
                  <Label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
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
                    className="w-full h-20 sm:h-24 bg-[#0F0F12] border-[#2A2B2F] text-gray-200 focus:ring-[#22D3EE]/30 focus:border-[#22D3EE]/50 resize-none text-xs sm:text-sm p-3"
                  />
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 sm:space-y-3">
              <Button
                onClick={handleSave}
                disabled={isFuture || isSaving}
                className="w-full bg-[#22D3EE] hover:bg-[#06B6D4] text-gray-900 font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98]"
              >
                {isSaving
                  ? entry
                    ? "Updating..."
                    : "Saving..."
                  : entry
                    ? "Update Entry"
                    : "Save Entry"}
              </Button>
              <div className="flex gap-2 sm:gap-3">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="flex-1 border-[#2A2B2F] hover:bg-[#2A2B2F] text-gray-300 py-2 sm:py-3 text-sm sm:text-base"
                >
                  <ArrowLeft className="mr-2 w-4 h-4" weight="bold" />
                  Back
                </Button>
                <Button
                  onClick={handleSkipReviews}
                  variant="outline"
                  disabled={isFuture}
                  className="flex-1 border-[#2A2B2F] hover:bg-[#2A2B2F] text-gray-300 py-2 sm:py-3 text-sm sm:text-base"
                >
                  Skip Reviews
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
