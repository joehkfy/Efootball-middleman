"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Listing } from "@/lib/types";
import { ListingCard } from "@/components/ListingCard";
import { Search } from "lucide-react";

export default function HomePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("all");

  useEffect(() => {
    fetchListings();
  }, []);

  async function fetchListings() {
    setLoading(true);
    let query = supabase
      .from("listings")
      .select("*, seller:profiles(username)")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    const { data, error } = await query;
    if (!error && data) {
      setListings(data as Listing[]);
    }
    setLoading(false);
  }

  const filtered = listings.filter((l) => {
    const matchesSearch =
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.description?.toLowerCase().includes(search.toLowerCase());
    const matchesPlatform = platform === "all" || l.platform === platform;
    return matchesSearch && matchesPlatform;
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Buy & Sell eFootball Accounts Safely</h1>
        <p className="text-zinc-400">
          All deals go through our trusted middleman service. Your money is safe until the deal is complete.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search accounts, coins, rank..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500"
        >
          <option value="all">All Platforms</option>
          <option value="Mobile">Mobile</option>
          <option value="PS5">PS5</option>
          <option value="Xbox">Xbox</option>
          <option value="PC">PC</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl h-72 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <p className="text-lg">No active listings found.</p>
          <p className="mt-2">Be the first to sell an account!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
