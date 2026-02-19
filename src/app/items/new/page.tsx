"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/ImageUpload";
import { createItem } from "@/lib/actions/items";
import { createCategory } from "@/lib/actions/categories";

interface Category {
  id: number;
  name: string;
}

export default function NewItemPage() {
  const router = useRouter();
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => {});
  }, []);

  async function handleCreateCategory() {
    if (!newCategoryName.trim()) return;
    const formData = new FormData();
    formData.set("name", newCategoryName.trim());
    const result = await createCategory(formData);
    if (result.error && !result.categoryId) {
      setError(result.error);
      return;
    }
    // Refresh categories
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data);
    setShowNewCategory(false);
    setNewCategoryName("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (imageUrls.length === 0) {
      setError("Please upload at least one image");
      return;
    }
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.set("imageUrls", JSON.stringify(imageUrls));

    const result = await createItem(formData);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push(`/items/${result.itemId}`);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Sell an Item</h1>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Photos
          </label>
          <ImageUpload onImagesChange={setImageUrls} maxImages={5} />
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            maxLength={200}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            placeholder="What are you selling?"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description (optional)
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            maxLength={2000}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
            placeholder="Describe the item, condition, etc."
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Asking Price (optional)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              &#8377;
            </span>
            <input
              id="price"
              name="price"
              type="number"
              step="1"
              min="0"
              className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder="Leave blank for bid-only"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Leave blank if you want buyers to bid freely</p>
        </div>

        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="categoryId"
            name="categoryId"
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {!showNewCategory ? (
            <button
              type="button"
              onClick={() => setShowNewCategory(true)}
              className="text-sm text-indigo-600 hover:text-indigo-500 mt-2"
            >
              + Create new category
            </button>
          ) : (
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category name"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
              <button
                type="button"
                onClick={handleCreateCategory}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNewCategory(false);
                  setNewCategoryName("");
                }}
                className="text-gray-500 px-3 py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating listing..." : "List Item for Sale"}
        </button>
      </form>
    </div>
  );
}
