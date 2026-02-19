import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function MyItemsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const items = await prisma.item.findMany({
    where: { sellerId: Number(session.user.id) },
    include: {
      category: true,
      images: { where: { isPrimary: true }, take: 1 },
      bids: {
        orderBy: { amount: "desc" },
        include: {
          bidder: { select: { displayName: true, email: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Listed Items</h1>
        <Link
          href="/items/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
        >
          + Sell New Item
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500 text-lg">You haven&apos;t listed any items yet</p>
          <Link
            href="/items/new"
            className="inline-block mt-4 bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            Sell Your First Item
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {items.map((item) => {
            const topBid =
              item.bids.length > 0
                ? Math.max(...item.bids.map((b) => b.amount))
                : null;

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Thumbnail */}
                  <div className="w-full sm:w-40 h-40 relative bg-gray-100 flex-shrink-0">
                    {item.images[0] ? (
                      <Image
                        src={item.images[0].url}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="160px"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link
                          href={`/items/${item.id}`}
                          className="text-lg font-semibold text-gray-900 hover:text-indigo-600"
                        >
                          {item.title}
                        </Link>
                        <p className="text-sm text-gray-500">
                          {item.category.name}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${
                          item.status === "active"
                            ? "bg-green-100 text-green-700"
                            : item.status === "sold"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div className="flex gap-6 mt-3 text-sm">
                      <div>
                        <span className="text-gray-500">Asking:</span>{" "}
                        {item.price !== null ? (
                          <span className="font-semibold">
                            &#8377;{item.price.toLocaleString("en-IN")}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">Not set</span>
                        )}
                      </div>
                      <div>
                        <span className="text-gray-500">Bids:</span>{" "}
                        <span className="font-semibold">{item.bids.length}</span>
                      </div>
                      {topBid !== null && (
                        <div>
                          <span className="text-gray-500">Top bid:</span>{" "}
                          <span className="font-semibold text-green-600">
                            &#8377;{topBid.toLocaleString("en-IN")}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Bids breakdown - seller can see bidder identity */}
                    {item.bids.length > 0 && (
                      <div className="mt-4 border-t pt-3">
                        <p className="text-xs font-medium text-gray-600 mb-2">
                          All Bids:
                        </p>
                        <div className="space-y-1">
                          {item.bids.map((bid) => (
                            <div
                              key={bid.id}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="text-gray-700">
                                {bid.bidder.displayName}{" "}
                                <span className="text-gray-400">
                                  ({bid.bidder.email})
                                </span>
                              </span>
                              <span className="font-semibold text-green-600">
                                &#8377;{bid.amount.toLocaleString("en-IN")}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
