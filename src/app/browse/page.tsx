import { prisma } from "@/lib/db";
import ItemCard from "@/components/ItemCard";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const params = await searchParams;
  const categoryId = params.category ? Number(params.category) : undefined;
  const searchQuery = params.q || "";

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { items: { where: { status: "active" } } } } },
  });

  const where: Record<string, unknown> = { status: "active" };
  if (categoryId) where.categoryId = categoryId;
  if (searchQuery) {
    where.OR = [
      { title: { contains: searchQuery, mode: "insensitive" } },
      { description: { contains: searchQuery, mode: "insensitive" } },
    ];
  }

  const items = await prisma.item.findMany({
    where,
    include: {
      category: true,
      images: { where: { isPrimary: true }, take: 1 },
      bids: { select: { amount: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search bar */}
      <form className="mb-8">
        <div className="flex gap-3">
          <input
            name="q"
            type="text"
            defaultValue={searchQuery}
            placeholder="Search items..."
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white text-gray-900"
          />
          {categoryId && (
            <input type="hidden" name="category" value={categoryId} />
          )}
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            Search
          </button>
        </div>
      </form>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Category sidebar */}
        <aside className="lg:w-56 flex-shrink-0">
          <h2 className="font-semibold text-gray-900 mb-3">Categories</h2>
          <div className="space-y-1">
            <Link
              href="/browse"
              className={`block px-3 py-2 rounded-lg text-sm transition ${
                !categoryId
                  ? "bg-indigo-50 text-indigo-700 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              All Items
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/browse?category=${cat.id}${searchQuery ? `&q=${searchQuery}` : ""}`}
                className={`block px-3 py-2 rounded-lg text-sm transition ${
                  categoryId === cat.id
                    ? "bg-indigo-50 text-indigo-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {cat.name}
                <span className="text-gray-400 ml-1">({cat._count.items})</span>
              </Link>
            ))}
          </div>
        </aside>

        {/* Items grid */}
        <div className="flex-1">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No items found</p>
              <p className="text-gray-400 mt-2">
                {searchQuery
                  ? "Try a different search term"
                  : "Be the first to list something!"}
              </p>
              <Link
                href="/items/new"
                className="inline-block mt-4 bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition"
              >
                Sell an Item
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => {
                const topBid =
                  item.bids.length > 0
                    ? Math.max(...item.bids.map((b) => b.amount))
                    : null;
                return (
                  <ItemCard
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    price={item.price}
                    status={item.status}
                    categoryName={item.category.name}
                    imageUrl={item.images[0]?.url || null}
                    bidCount={item.bids.length}
                    topBid={topBid}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
