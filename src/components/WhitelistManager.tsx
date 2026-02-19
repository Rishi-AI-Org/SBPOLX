"use client";

import { useState } from "react";
import {
  addAllowedEmail,
  addBulkEmails,
  removeAllowedEmail,
} from "@/lib/actions/admin";
import { useRouter } from "next/navigation";

interface EmailEntry {
  email: string;
  registered: boolean;
  addedAt: string;
}

export default function WhitelistManager({
  emails,
}: {
  emails: EmailEntry[];
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showBulk, setShowBulk] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleAddSingle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData(e.currentTarget);
    const result = await addAllowedEmail(formData);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess("Email added to whitelist");
      (e.target as HTMLFormElement).reset();
      router.refresh();
    }
    setLoading(false);
  }

  async function handleBulkAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData(e.currentTarget);
    const result = await addBulkEmails(formData);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(`Added ${result.added} emails (${result.skipped} skipped)`);
      (e.target as HTMLFormElement).reset();
      router.refresh();
    }
    setLoading(false);
  }

  async function handleRemove(email: string) {
    if (!confirm(`Remove ${email} from whitelist?`)) return;
    await removeAllowedEmail(email);
    router.refresh();
  }

  return (
    <div>
      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {success}
        </div>
      )}

      {/* Add single email */}
      <form onSubmit={handleAddSingle} className="mb-4">
        <div className="flex gap-3">
          <input
            name="email"
            type="email"
            required
            placeholder="student@institution.edu"
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white text-gray-900"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </form>

      {/* Bulk add toggle */}
      <button
        type="button"
        onClick={() => setShowBulk(!showBulk)}
        className="text-sm text-indigo-600 hover:text-indigo-500 mb-4"
      >
        {showBulk ? "Hide bulk import" : "+ Bulk import emails"}
      </button>

      {showBulk && (
        <form onSubmit={handleBulkAdd} className="mb-6">
          <textarea
            name="emails"
            rows={6}
            required
            placeholder="Paste emails (one per line, or comma/semicolon separated)"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none mb-3 bg-white text-gray-900"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
          >
            Import All
          </button>
        </form>
      )}

      {/* Email list */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Email
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Status
              </th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {emails.map((entry) => (
              <tr key={entry.email} className="border-t border-gray-100">
                <td className="px-4 py-3 text-gray-900">{entry.email}</td>
                <td className="px-4 py-3">
                  {entry.registered ? (
                    <span className="text-green-600 text-xs font-medium">
                      Registered
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">Not yet</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleRemove(entry.email)}
                    className="text-red-600 hover:text-red-700 text-xs font-medium"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
