"use client";

import { useState } from "react";
import { createCategory } from "@/lib/actions/categories";
import { useRouter } from "next/navigation";

export default function CreateCategoryForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const result = await createCategory(formData);

    if (result.error && !result.categoryId) {
      setError(result.error);
    } else {
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm mb-3">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm mb-3">
          Category created!
        </div>
      )}
      <div className="flex gap-3">
        <input
          name="name"
          type="text"
          required
          maxLength={100}
          placeholder="New category name"
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create"}
        </button>
      </div>
    </form>
  );
}
