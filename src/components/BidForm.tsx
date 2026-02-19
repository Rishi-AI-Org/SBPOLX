"use client";

import { useState } from "react";
import { placeBid } from "@/lib/actions/bids";

interface BidFormProps {
  itemId: number;
}

export default function BidForm({ itemId }: BidFormProps) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const result = await placeBid(itemId, formData);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      {error && (
        <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm mb-3">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm mb-3">
          Bid placed successfully!
        </div>
      )}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            &#8377;
          </span>
          <input
            name="amount"
            type="number"
            step="1"
            min="1"
            required
            placeholder="Enter your bid"
            className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white text-gray-900"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
        >
          {loading ? "Placing..." : "Place Bid"}
        </button>
      </div>
    </form>
  );
}
