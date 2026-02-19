interface BidData {
  amount: number;
  createdAt: string;
  bidderName?: string;
  bidderEmail?: string;
}

interface BidListProps {
  bids: BidData[];
  isSeller: boolean;
}

export default function BidList({ bids, isSeller }: BidListProps) {
  if (bids.length === 0) {
    return <p className="text-gray-500 text-sm mt-2">No bids yet. Be the first!</p>;
  }

  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 pr-4 font-medium text-gray-600">Amount</th>
            <th className="text-left py-2 pr-4 font-medium text-gray-600">Time</th>
            {isSeller && (
              <>
                <th className="text-left py-2 pr-4 font-medium text-gray-600">Bidder</th>
                <th className="text-left py-2 font-medium text-gray-600">Email</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {bids.map((bid, i) => (
            <tr key={i} className="border-b border-gray-100">
              <td className="py-2 pr-4 font-semibold text-green-600">
                &#8377;{bid.amount.toLocaleString("en-IN")}
              </td>
              <td className="py-2 pr-4 text-gray-500">
                {new Date(bid.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>
              {isSeller && (
                <>
                  <td className="py-2 pr-4 text-gray-700">{bid.bidderName}</td>
                  <td className="py-2 text-gray-500">{bid.bidderEmail}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
