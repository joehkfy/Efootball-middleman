"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase, COMMISSION_RATE } from "@/lib/supabase";
import { Listing } from "@/lib/types";
import { Gamepad2, Coins, Shield } from "lucide-react";

export default function ListingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      const { data } = await supabase
        .from("listings")
        .select("*, seller:profiles(username, email)")
        .eq("id", id)
        .single();

      setListing(data as Listing);
      setLoading(false);
    }
    load();
  }, [id]);

  const handleBuy = async () => {
    if (!user || !listing) return;
    if (user.id === listing.seller_id) {
      alert("You cannot buy your own listing");
      return;
    }

    setBuying(true);
    const commission = listing.price * COMMISSION_RATE;
    const total = listing.price + commission;

    const { data, error } = await supabase
      .from("orders")
      .insert({
        listing_id: listing.id,
        buyer_id: user.id,
        seller_id: listing.seller_id,
        amount: listing.price,
        commission,
        status: "pending_payment",
      })
      .select()
      .single();

    if (error) {
      alert(error.message);
      setBuying(false);
      return;
    }

    // Mark listing as sold temporarily? Better leave active until completed
    router.push(`/orders`);
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!listing) return <div className="text-center py-20">Listing not found</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="aspect-video bg-zinc-800 flex items-center justify-center">
          {listing.images?.[0] ? (
            <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
          ) : (
            <Gamepad2 className="w-20 h-20 text-zinc-600" />
          )}
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{listing.title}</h1>
              <p className="text-zinc-400 mt-1">
                Sold by <span className="text-white">{listing.seller?.username}</span>
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-emerald-400">${listing.price.toFixed(2)}</div>
              <div className="text-xs text-zinc-500 mt-1">
                + ${(listing.price * COMMISSION_RATE).toFixed(2)} fee
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-4 text-sm">
            <span className="bg-zinc-800 px-3 py-1 rounded-full">{listing.platform}</span>
            <span className="bg-zinc-800 px-3 py-1 rounded-full flex items-center gap-1">
              <Coins className="w-3 h-3" /> {listing.coins?.toLocaleString()} coins
            </span>
            <span className="bg-zinc-800 px-3 py-1 rounded-full">{listing.rank || "Unranked"}</span>
          </div>

          <div className="mt-6">
            <h2 className="font-semibold mb-2">Description</h2>
            <p className="text-zinc-300 whitespace-pre-wrap">{listing.description || "No description provided."}</p>
          </div>

          <div className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-start gap-3">
            <Shield className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-emerald-400">Protected by Middleman</p>
              <p className="text-zinc-400 mt-1">
                You pay us → We hold the money → Seller transfers account → You confirm → Seller gets paid.
              </p>
            </div>
          </div>

          {user && listing.status === "active" && user.id !== listing.seller_id && (
            <button
              onClick={handleBuy}
              disabled={buying}
              className="mt-6 w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 py-3 rounded-lg font-semibold text-lg transition"
            >
              {buying ? "Creating Order..." : `Buy Now — $${(listing.price * (1 + COMMISSION_RATE)).toFixed(2)}`}
            </button>
          )}

          {!user && (
            <p className="mt-6 text-center text-zinc-400">
              Please <a href="/login" className="text-emerald-400 underline">login</a> to buy this account.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
