import { prisma } from "@/lib/db";
import Link from "next/link";
import CreateCategoryForm from "@/components/CreateCategoryForm";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { items: true } },
      creator: { select: { displayName: true } },
    },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Categories</h1>

      <CreateCategoryForm />

      <div className="mt-8 space-y-3">
        {categories.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No categories yet. Create one above!
          </p>
        ) : (
          categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/browse?category=${cat.id}`}
              className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition"
            >
              <div>
                <h3 className="font-medium text-gray-900">{cat.name}</h3>
                {cat.creator && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    Created by {cat.creator.displayName}
                  </p>
                )}
              </div>
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                {cat._count.items} item{cat._count.items !== 1 ? "s" : ""}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
