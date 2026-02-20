"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!session) return null;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/browse" className="text-xl font-bold text-indigo-600">
              Campus Market
            </Link>
            <div className="hidden md:flex ml-8 space-x-6">
              <Link href="/browse" className="text-gray-700 hover:text-indigo-600 font-medium transition">
                Browse
              </Link>
              <Link href="/items/new" className="text-gray-700 hover:text-indigo-600 font-medium transition">
                Sell Item
              </Link>
              <Link href="/my-items" className="text-gray-700 hover:text-indigo-600 font-medium transition">
                My Items
              </Link>
              <Link href="/profile" className="text-gray-700 hover:text-indigo-600 font-medium transition">
                Profile
              </Link>
              <Link href="/categories" className="text-gray-700 hover:text-indigo-600 font-medium transition">
                Categories
              </Link>
              {session.user.isAdmin && (
                <Link href="/admin/whitelist" className="text-gray-700 hover:text-indigo-600 font-medium transition">
                  Admin
                </Link>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <span className="text-sm text-gray-500">{session.user.name}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-sm text-gray-600 hover:text-red-600 font-medium transition"
            >
              Sign Out
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-700 hover:text-indigo-600 p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-3">
            <Link href="/browse" onClick={() => setMenuOpen(false)} className="block text-gray-700 hover:text-indigo-600 font-medium">
              Browse
            </Link>
            <Link href="/items/new" onClick={() => setMenuOpen(false)} className="block text-gray-700 hover:text-indigo-600 font-medium">
              Sell Item
            </Link>
            <Link href="/my-items" onClick={() => setMenuOpen(false)} className="block text-gray-700 hover:text-indigo-600 font-medium">
              My Items
            </Link>
            <Link href="/profile" onClick={() => setMenuOpen(false)} className="block text-gray-700 hover:text-indigo-600 font-medium">
              Profile
            </Link>
            <Link href="/categories" onClick={() => setMenuOpen(false)} className="block text-gray-700 hover:text-indigo-600 font-medium">
              Categories
            </Link>
            {session.user.isAdmin && (
              <Link href="/admin/whitelist" onClick={() => setMenuOpen(false)} className="block text-gray-700 hover:text-indigo-600 font-medium">
                Admin
              </Link>
            )}
            <div className="border-t pt-3">
              <p className="text-sm text-gray-500 mb-2">{session.user.name}</p>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-sm text-red-600 font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
