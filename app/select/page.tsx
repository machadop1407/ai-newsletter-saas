"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const categories = [
  {
    id: "technology",
    name: "Technology",
    description: "Latest tech news and innovations",
  },
  {
    id: "business",
    name: "Business",
    description: "Business trends and market updates",
  },
  { id: "sports", name: "Sports", description: "Sports news and highlights" },
  {
    id: "entertainment",
    name: "Entertainment",
    description: "Movies, TV, and celebrity news",
  },
  {
    id: "science",
    name: "Science",
    description: "Scientific discoveries and research",
  },
  { id: "health", name: "Health", description: "Health and wellness updates" },
  {
    id: "politics",
    name: "Politics",
    description: "Political news and current events",
  },
  {
    id: "environment",
    name: "Environment",
    description: "Climate and environmental news",
  },
];

const frequencyOptions = [
  { id: "daily", name: "Daily", description: "Every day" },
  { id: "weekly", name: "Weekly", description: "Once a week" },
  { id: "biweekly", name: "Bi-weekly", description: "Twice a week" },
];

export default function SelectPage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedFrequency, setSelectedFrequency] = useState<string>("weekly");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  // useEffect(() => {
  //   fetch("/api/subscription-status")
  //     .then((r) => r.json())
  //     .then((json) => {
  //       if (!json.active) {
  //         router.replace("/subscribe");
  //       }
  //     })
  //     .catch(() => {
  //       router.replace("/subscribe");
  //     });
  // }, [router]);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedCategories.length === 0) {
      alert("Please select at least one category");
      return;
    }

    if (!user) {
      alert("Please sign in to continue");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/user-preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categories: selectedCategories,
          frequency: selectedFrequency,
          email: user.email,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save preferences");
      }

      alert(
        "Your newsletter preferences have been saved! You'll start receiving newsletters according to your schedule."
      );
      router.push("/dashboard");
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to save preferences. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Customize Your Newsletter
          </h1>
          <p className="text-xl text-gray-600">
            Select your interests and delivery frequency to start receiving
            personalized newsletters
          </p>
        </div>

        <form
          onSubmit={handleSavePreferences}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          {/* Categories Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Choose Your Categories
            </h2>
            <p className="text-gray-600 mb-6">
              Select the topics you'd like to see in your personalized
              newsletter
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {categories.map((category) => (
                <label
                  key={category.id}
                  className={`relative flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                    selectedCategories.includes(category.id)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => handleCategoryToggle(category.id)}
                  />
                  <div className="flex items-center h-5">
                    <div
                      className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                        selectedCategories.includes(category.id)
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedCategories.includes(category.id) && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">
                      {category.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {category.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div className="text-sm text-gray-600 mb-6">
              {selectedCategories.length} categor
              {selectedCategories.length !== 1 ? "ies" : "y"} selected
            </div>
          </div>

          {/* Frequency Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Delivery Frequency
            </h2>
            <p className="text-gray-600 mb-6">
              How often would you like to receive your newsletter?
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {frequencyOptions.map((frequency) => (
                <label
                  key={frequency.id}
                  className={`relative flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                    selectedFrequency === frequency.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="frequency"
                    className="sr-only"
                    checked={selectedFrequency === frequency.id}
                    onChange={() => setSelectedFrequency(frequency.id)}
                  />
                  <div className="flex items-center h-5">
                    <div
                      className={`w-5 h-5 border-2 rounded-full flex items-center justify-center ${
                        selectedFrequency === frequency.id
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedFrequency === frequency.id && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">
                      {frequency.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {frequency.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedCategories.length} categor
              {selectedCategories.length !== 1 ? "ies" : "y"} selected •
              {selectedFrequency} delivery
            </div>
            <button
              type="submit"
              className={`px-6 py-3 rounded-lg font-medium text-white transition-colors ${
                selectedCategories.length === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
