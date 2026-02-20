"use client";

import { useState } from "react";
import { updateProfile } from "@/lib/actions/profile";

interface ProfileFormProps {
  user: {
    displayName: string;
    email: string;
    phoneNumber: string | null;
    hostelNumber: string | null;
    roomNumber: string | null;
  };
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const result = await updateProfile(formData);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm">
          Profile updated successfully.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Read-only email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <p className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm">
            {user.email}
          </p>
          <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
        </div>

        {/* Display name */}
        <div>
          <label
            htmlFor="displayName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Display Name
          </label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            required
            defaultValue={user.displayName}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white text-gray-900"
            placeholder="Your name"
          />
        </div>

        <div className="border-t border-gray-100 pt-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-1">
            Contact Details
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            All fields are optional. Only share what you are comfortable with.
          </p>

          <div className="space-y-5">
            {/* Phone number */}
            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone Number{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                defaultValue={user.phoneNumber ?? ""}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white text-gray-900"
                placeholder="10-digit mobile number e.g. 9876543210"
              />
            </div>

            {/* Hostel + Room side by side */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="hostelNumber"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Hostel{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  id="hostelNumber"
                  name="hostelNumber"
                  type="text"
                  defaultValue={user.hostelNumber ?? ""}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white text-gray-900"
                  placeholder="e.g. H1, B"
                />
              </div>
              <div>
                <label
                  htmlFor="roomNumber"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Room{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  id="roomNumber"
                  name="roomNumber"
                  type="text"
                  defaultValue={user.roomNumber ?? ""}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white text-gray-900"
                  placeholder="e.g. 101, 204A"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}
