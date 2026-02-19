"use client";

import { useState } from "react";
import { updateItemStatus, deleteItem } from "@/lib/actions/items";
import { useRouter } from "next/navigation";

interface ItemStatusActionsProps {
  itemId: number;
  currentStatus: string;
}

export default function ItemStatusActions({
  itemId,
  currentStatus,
}: ItemStatusActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleStatusChange(status: "active" | "sold" | "withdrawn") {
    setLoading(true);
    await updateItemStatus(itemId, status);
    setLoading(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this item? This cannot be undone.")) return;
    setLoading(true);
    const result = await deleteItem(itemId);
    if (result.success) {
      router.push("/my-items");
    }
    setLoading(false);
  }

  return (
    <>
      {currentStatus === "active" && (
        <button
          onClick={() => handleStatusChange("sold")}
          disabled={loading}
          className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-200 transition disabled:opacity-50"
        >
          Mark as Sold
        </button>
      )}
      {currentStatus === "active" && (
        <button
          onClick={() => handleStatusChange("withdrawn")}
          disabled={loading}
          className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-200 transition disabled:opacity-50"
        >
          Withdraw
        </button>
      )}
      {currentStatus !== "active" && (
        <button
          onClick={() => handleStatusChange("active")}
          disabled={loading}
          className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-200 transition disabled:opacity-50"
        >
          Re-activate
        </button>
      )}
      <button
        onClick={handleDelete}
        disabled={loading}
        className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-200 transition disabled:opacity-50"
      >
        Delete
      </button>
    </>
  );
}
