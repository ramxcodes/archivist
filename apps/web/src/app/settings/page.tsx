"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Switch } from "@repo/ui/components/ui/switch";
import { Card } from "@repo/ui/components/ui/card";
import { Separator } from "@repo/ui/components/ui/separator";
import {
  useCustomCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useProfileSettings,
  useUpdateProfileSettings,
} from "@/lib/api/calendar";
import { Trash2, Plus, Copy, Check } from "lucide-react";
import Loader from "@/components/core/loader";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui/components/ui/alert-dialog";

export default function SettingsPage() {
  // Custom Categories State
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryRequired, setNewCategoryRequired] = useState(false);

  // Profile Settings State
  const [isPublic, setIsPublic] = useState(false);
  const [showMoods, setShowMoods] = useState(true);
  const [showReviews, setShowReviews] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [publicSlug, setPublicSlug] = useState("");
  const [copied, setCopied] = useState(false);

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  // Fetch data
  const { data: categoriesData, isLoading: isLoadingCategories } =
    useCustomCategories();
  const { data: profileData, isLoading: isLoadingProfile } =
    useProfileSettings();

  // Mutations
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const updateProfileSettings = useUpdateProfileSettings();

  // Load profile settings
  useEffect(() => {
    if (profileData?.settings) {
      setIsPublic(profileData.settings.isPublic);
      setShowMoods(profileData.settings.showMoods);
      setShowReviews(profileData.settings.showReviews);
      setShowStats(profileData.settings.showStats);
      setPublicSlug(profileData.settings.publicSlug || "");
    }
  }, [profileData]);

  const categories = categoriesData?.categories || [];
  const categoriesCount = categories.length;

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    if (categoriesCount >= 3) {
      toast.error("Maximum of 3 custom categories allowed");
      return;
    }

    try {
      // Find next available order
      const usedOrders = categories.map((c) => c.order);
      let nextOrder = 1;
      while (usedOrders.includes(nextOrder) && nextOrder <= 3) {
        nextOrder++;
      }

      await createCategory.mutateAsync({
        name: newCategoryName,
        isRequired: newCategoryRequired,
        order: nextOrder,
      });

      setNewCategoryName("");
      setNewCategoryRequired(false);
      toast.success("Category created successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to create category");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    setCategoryToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      await deleteCategory.mutateAsync(categoryToDelete);
      toast.success("Category deleted successfully!");
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete category");
    }
  };

  const handleToggleRequired = async (id: string, currentValue: boolean) => {
    try {
      await updateCategory.mutateAsync({
        id,
        isRequired: !currentValue,
      });
      toast.success("Category updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update category");
    }
  };

  const handleSaveProfileSettings = async () => {
    try {
      await updateProfileSettings.mutateAsync({
        isPublic,
        showMoods,
        showReviews,
        showStats,
        publicSlug: publicSlug.trim() || null,
      });
      toast.success("Profile settings saved successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to save profile settings");
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/profile/${
      publicSlug || profileData?.settings.userId
    }`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoadingCategories || isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 px-4 md:px-6 lg:px-8 max-w-4xl mx-auto bg-[#0D0D0F]">
      <header className="py-8 md:py-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-100 tracking-tight mb-2">
          Settings
        </h1>
        <p className="text-gray-400 font-medium text-sm md:text-base">
          Manage your custom categories and public profile settings
        </p>
      </header>

      <div className="space-y-6 md:space-y-8">
        {/* Custom Categories Section */}
        <Card className="p-4 md:p-6 bg-[#16161A] border-[#2A2B2F]">
          <h2 className="text-xl md:text-2xl font-bold text-gray-100 mb-2">
            Custom Review Categories
          </h2>
          <p className="text-gray-400 text-xs md:text-sm mb-4 md:mb-6">
            Create up to 3 custom review categories. You can mark them as
            required.
          </p>

          <div className="space-y-4">
            {/* Existing Categories */}
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3 md:p-4 bg-[#0F0F12] border border-[#2A2B2F] rounded-lg"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-1 min-w-0">
                  <span className="text-gray-200 font-medium text-sm md:text-base truncate">
                    {category.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={category.isRequired}
                      onCheckedChange={() =>
                        handleToggleRequired(category.id, category.isRequired)
                      }
                    />
                    <Label className="text-xs md:text-sm text-gray-400">
                      Required
                    </Label>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteCategory(category.id)}
                  className="text-red-400 hover:text-red-300 self-end sm:self-auto"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}

            {/* Add New Category */}
            {categoriesCount < 3 && (
              <div className="p-3 md:p-4 bg-[#0F0F12] border border-[#2A2B2F] rounded-lg space-y-3">
                <Input
                  value={newCategoryName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewCategoryName(e.target.value)
                  }
                  placeholder="New category name"
                  className="bg-[#16161A] border-[#2A2B2F] text-gray-200 text-sm"
                />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={newCategoryRequired}
                      onCheckedChange={setNewCategoryRequired}
                    />
                    <Label className="text-xs md:text-sm text-gray-400">
                      Required
                    </Label>
                  </div>
                  <Button
                    onClick={handleCreateCategory}
                    className="bg-[#22D3EE] hover:bg-[#06B6D4] text-gray-900 text-sm w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                  </Button>
                </div>
              </div>
            )}

            <p className="text-xs text-gray-500">
              {categoriesCount} of 3 custom categories used
            </p>
          </div>
        </Card>

        <Separator className="bg-[#2A2B2F]" />

        {/* Public Profile Section */}
        <Card className="p-4 md:p-6 bg-[#16161A] border-[#2A2B2F]">
          <h2 className="text-xl md:text-2xl font-bold text-gray-100 mb-2">
            Public Profile
          </h2>
          <p className="text-gray-400 text-xs md:text-sm mb-4 md:mb-6">
            Control what others can see when viewing your public profile
          </p>

          <div className="space-y-4 md:space-y-6">
            {/* Make Profile Public */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <Label className="text-gray-200 font-medium text-sm md:text-base">
                  Make Profile Public
                </Label>
                <p className="text-xs md:text-sm text-gray-400 mt-1">
                  Allow others to view your calendar
                </p>
              </div>
              <Switch
                checked={isPublic}
                onCheckedChange={setIsPublic}
                className="shrink-0"
              />
            </div>

            {isPublic && (
              <>
                {/* Public Slug */}
                <div>
                  <Label className="text-gray-200 font-medium mb-2 block text-sm md:text-base">
                    Public Profile URL
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={publicSlug}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setPublicSlug(e.target.value)
                      }
                      placeholder="your-username"
                      className="bg-[#0F0F12] border-[#2A2B2F] text-gray-200 text-sm flex-1"
                    />
                    <Button
                      onClick={handleCopyLink}
                      variant="outline"
                      className="border-[#2A2B2F] shrink-0"
                    >
                      {copied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Default: Your email username (e.g., ram@gmail.com → ram)
                  </p>
                  <p className="text-xs text-gray-500">
                    Only lowercase letters, numbers, and hyphens allowed
                  </p>
                </div>

                {/* Visibility Settings */}
                <div className="space-y-4">
                  <h3 className="text-base md:text-lg font-semibold text-gray-200">
                    What to Share
                  </h3>

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <Label className="text-gray-200 text-sm md:text-base">
                        Show Moods/Legends
                      </Label>
                      <p className="text-xs md:text-sm text-gray-400">
                        Display colored day tiles
                      </p>
                    </div>
                    <Switch
                      checked={showMoods}
                      onCheckedChange={setShowMoods}
                      className="shrink-0"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <Label className="text-gray-200 text-sm md:text-base">
                        Show Reviews
                      </Label>
                      <p className="text-xs md:text-sm text-gray-400">
                        Display review content
                      </p>
                    </div>
                    <Switch
                      checked={showReviews}
                      onCheckedChange={setShowReviews}
                      className="shrink-0"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <Label className="text-gray-200 text-sm md:text-base">
                        Show Statistics
                      </Label>
                      <p className="text-xs md:text-sm text-gray-400">
                        Display total entries and great days count
                      </p>
                    </div>
                    <Switch
                      checked={showStats}
                      onCheckedChange={setShowStats}
                      className="shrink-0"
                    />
                  </div>
                </div>
              </>
            )}

            <Button
              onClick={handleSaveProfileSettings}
              className="w-full bg-[#22D3EE] hover:bg-[#06B6D4] text-gray-900 font-bold py-4 md:py-6 text-sm md:text-base"
            >
              Save Profile Settings
            </Button>
          </div>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#16161A] border-[#2A2B2F]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-100">
              Delete Category
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete this category? This action cannot
              be undone and all reviews in this category will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#0D0D0F] border-[#2A2B2F] text-gray-200 hover:bg-[#2A2B2F]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCategory}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
