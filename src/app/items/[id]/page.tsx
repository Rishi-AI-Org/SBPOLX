import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import BidList from "@/components/BidList";
import BidForm from "@/components/BidForm";
import ItemStatusActions from "@/components/ItemStatusActions";

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const item = await prisma.item.findUnique({
    where: { id: Number(id) },
    include: {
      seller: {
        select: {
          id: true,
          displayName: true,
          email: true,
          phoneNumber: true,
          hostelNumber: true,
          roomNumber: true,
        },
      },
      category: true,
      images: { orderBy: { isPrimary: "desc" } },
      bids: {
        orderBy: { amount: "desc" },
        include: {
          bidder: { select: { displayName: true, email: true } },
        },
      },
    },
  });

  if (!item) notFound();

  const isSeller = session?.user?.id === String(item.sellerId);

  // Privacy: only expose bidder identity to seller
  const bidsForDisplay = item.bids.map((bid) => ({
    amount: bid.amount,
    createdAt: bid.createdAt.toISOString(),
    ...(isSeller
      ? { bidderName: bid.bidder.displayName, bidderEmail: bid.bidder.email }
      : {}),
  }));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/browse"
        className="text-indigo-600 hover:text-indigo-500 text-sm font-medium mb-6 inline-block"
      >
        &larr; Back to Browse
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image gallery */}
        <div>
          {item.images.length > 0 ? (
            <div className="space-y-3">
              <div className="aspect-square relative rounded-xl overflow-hidden bg-gray-100">
                <Image
                  src={item.images[0].url}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>
              {item.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {item.images.slice(1).map((img) => (
                    <div
                      key={img.id}
                      className="aspect-square relative rounded-lg overflow-hidden bg-gray-100"
                    >
                      <Image
                        src={img.url}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="150px"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
              <p className="text-gray-400">No images</p>
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{item.title}</h1>
              <p className="text-sm text-gray-500 mt-1">
                Listed by {item.seller.displayName} in{" "}
                <Link
                  href={`/browse?category=${item.categoryId}`}
                  className="text-indigo-600 hover:underline"
                >
                  {item.category.name}
                </Link>
              </p>
              {session?.user &&
                !isSeller &&
                (item.seller.phoneNumber ||
                  item.seller.hostelNumber ||
                  item.seller.roomNumber) && (
                  <div className="mt-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                    <p className="text-xs font-semibold text-indigo-700 mb-1.5 uppercase tracking-wide">
                      Contact Seller
                    </p>
                    <div className="space-y-0.5">
                      {item.seller.phoneNumber && (
                        <p className="text-sm text-gray-700">
                          <span className="text-gray-500">Phone: </span>
                          {item.seller.phoneNumber}
                        </p>
                      )}
                      {(item.seller.hostelNumber ||
                        item.seller.roomNumber) && (
                        <p className="text-sm text-gray-700">
                          <span className="text-gray-500">Location: </span>
                          {[
                            item.seller.hostelNumber,
                            item.seller.roomNumber,
                          ]
                            .filter(Boolean)
                            .join(", Room ")}
                        </p>
                      )}
                    </div>
                  </div>
                )}
            </div>
            {item.status !== "active" && (
              <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium uppercase">
                {item.status}
              </span>
            )}
          </div>

          {item.price !== null ? (
            <p className="text-3xl font-bold text-indigo-600 mt-4">
              &#8377;{item.price.toLocaleString("en-IN")}
            </p>
          ) : (
            <p className="text-lg text-gray-500 italic mt-4">
              No asking price set &mdash; make an offer!
            </p>
          )}

          {item.description && (
            <div className="mt-6">
              <h2 className="font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">
                {item.description}
              </p>
            </div>
          )}

          <p className="text-xs text-gray-400 mt-4">
            Listed on{" "}
            {item.createdAt.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>

          {/* Seller actions */}
          {isSeller && (
            <div className="mt-6 flex gap-3 flex-wrap">
              <Link
                href={`/items/${item.id}/edit`}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
              >
                Edit Item
              </Link>
              <ItemStatusActions itemId={item.id} currentStatus={item.status} />
            </div>
          )}

          {/* Bids section */}
          <div className="mt-8 border-t pt-6">
            <h2 className="font-semibold text-gray-900">
              Bids ({item.bids.length})
            </h2>
            <BidList bids={bidsForDisplay} isSeller={isSeller} />

            {/* Bid form - only show to non-sellers when item is active */}
            {!isSeller && item.status === "active" && session?.user && (
              <BidForm itemId={item.id} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
