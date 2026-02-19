import Link from "next/link";
import Image from "next/image";

interface ItemCardProps {
  id: number;
  title: string;
  price: number | null;
  status: string;
  categoryName: string;
  imageUrl: string | null;
  bidCount: number;
  topBid: number | null;
}

export default function ItemCard({
  id,
  title,
  price,
  status,
  categoryName,
  imageUrl,
  bidCount,
  topBid,
}: ItemCardProps) {
  return (
    <Link href={`/items/${id}`} className="block group">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        <div className="aspect-square relative bg-gray-100">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {status !== "active" && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white text-gray-900 px-3 py-1 rounded-full text-sm font-semibold uppercase">
                {status}
              </span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 truncate">{title}</h3>
          <p className="text-xs text-gray-500 mt-1">{categoryName}</p>
          <div className="flex items-center justify-between mt-3">
            <div>
              {price !== null ? (
                <span className="text-lg font-bold text-indigo-600">
                  &#8377;{price.toLocaleString("en-IN")}
                </span>
              ) : (
                <span className="text-sm text-gray-500 italic">No asking price</span>
              )}
            </div>
            <div className="text-right">
              {bidCount > 0 ? (
                <div>
                  <span className="text-xs text-gray-500">{bidCount} bid{bidCount !== 1 ? "s" : ""}</span>
                  {topBid !== null && (
                    <p className="text-sm font-semibold text-green-600">
                      Top: &#8377;{topBid.toLocaleString("en-IN")}
                    </p>
                  )}
                </div>
              ) : (
                <span className="text-xs text-gray-400">No bids yet</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
