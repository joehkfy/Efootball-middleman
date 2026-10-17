import Link from "next/link";
import { Listing } from "@/lib/types";
import { Gamepad2, Coins } from "lucide-react";

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link
      href={`/listings/${listing.id}`}
      className="block bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-emerald-500/50 transition group"
    >
      <div className="aspect-video bg-zinc-800 relative flex items-center justify-center">
        {listing.images?.[0] ? (
          <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
        ) : (
          <Gamepad2 className="w-12 h-12 text-zinc-600" />
        )}
        <span className="absolute top-2 left-2 bg-black/70 text-xs px-2 py-1 rounded">
          {listing.platform}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg group-hover:text-emerald-400 transition line-clamp-1">
          {listing.title}
        </h3>
        <div className="flex items-center gap-3 mt-2 text-sm text-zinc-400">
          <span className="flex items-center gap-1">
            <Coins className="w-4 h-4" /> {listing.coins?.toLocaleString() || 0} coins
          </span>
          <span>•</span>
          <span>{listing.rank || "Unranked"}</span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xl font-bold text-emerald-400">
            ${listing.price.toFixed(2)}
          </span>
          <span className="text-xs text-zinc-500">
            by {listing.seller?.username || "Seller"}
          </span>
        </div>
      </div>
    </Link>
  );
}
