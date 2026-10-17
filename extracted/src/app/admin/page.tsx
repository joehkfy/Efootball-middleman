"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Listing, Order } from "@/lib/types";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"listings" | "orders">("listings");
  const router = useRouter();

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (data?.role !== "admin") {
        alert("Access denied");
        router.push("/");
        return;
      }

      setIsAdmin(true);
      await loadData();
      setLoading(false);
    }
    checkAdmin();
  }, [router]);

  async function loadData() {
    const { data: listingsData } = await supabase
      .from("listings")
      .select("*, seller:profiles(username)")
      .order("created_at", { ascending: false });

    const { data: ordersData } = await supabase
      .from("orders")
      .select(`
        *,
        listing:listings(title),
        buyer:profiles!orders_buyer_id_fkey(username),
        seller:profiles!orders_seller_id_fkey(username)
      `)
      .order("created_at", { ascending: false });

    setListings((listingsData as Listing[]) || []);
    setOrders((ordersData as Order[]) || []);
  }

  const updateListingStatus = async (id: string, status: string) => {
    await supabase.from("listings").update({ status }).eq("id", id);
    await loadData();
  };

  const updateOrderStatus = async (id: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    await loadData();
  };

  if (loading || !isAdmin) {
    return <div className="text-center py-20">Loading admin panel...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("listings")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            tab === "listings" ? "bg-emerald-600" : "bg-zinc-800"
          }`}
        >
          Listings ({listings.filter((l) => l.status === "pending").length} pending)
        </button>
        <button
          onClick={() => setTab("orders")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            tab === "orders" ? "bg-emerald-600" : "bg-zinc-800"
          }`}
        >
          Orders ({orders.filter((o) => o.status === "waiting_admin").length} waiting)
        </button>
      </div>

      {tab === "listings" && (
        <div className="space-y-3">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <h3 className="font-medium">{listing.title}</h3>
                <p className="text-sm text-zinc-400">
                  ${listing.price} • {listing.platform} • by {listing.seller?.username} •{" "}
                  <span className="uppercase text-xs">{listing.status}</span>
                </p>
              </div>
              <div className="flex gap-2">
                {listing.status === "pending" && (
                  <>
                    <button
                      onClick={() => updateListingStatus(listing.id, "active")}
                      className="text-xs bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-lg"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateListingStatus(listing.id, "rejected")}
                      className="text-xs bg-red-600 hover:bg-red-500 px-3 py-1.5 rounded-lg"
                    >
                      Reject
                    </button>
                  </>
                )}
                {listing.status === "active" && (
                  <button
                    onClick={() => updateListingStatus(listing.id, "sold")}
                    className="text-xs bg-zinc-700 hover:bg-zinc-600 px-3 py-1.5 rounded-lg"
                  >
                    Mark Sold
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "orders" && (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-medium">{order.listing?.title}</h3>
                  <p className="text-sm text-zinc-400">
                    Buyer: {order.buyer?.username} → Seller: {order.seller?.username}
                  </p>
                  <p className="text-sm text-zinc-400">
                    ${order.amount.toFixed(2)} + ${order.commission.toFixed(2)} fee •{" "}
                    <span className="uppercase text-xs">{order.status}</span>
                  </p>
                  {order.payment_proof && (
                    <p className="text-xs text-yellow-400 mt-1">
                      Proof: {order.payment_proof}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/chat/${order.id}`}
                    className="text-xs bg-zinc-700 hover:bg-zinc-600 px-3 py-1.5 rounded-lg"
                  >
                    Chat
                  </Link>
                  {order.status === "waiting_admin" && (
                    <button
                      onClick={() => updateOrderStatus(order.id, "in_progress")}
                      className="text-xs bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg"
                    >
                      Confirm Payment
                    </button>
                  )}
                  {order.status === "in_progress" && (
                    <button
                      onClick={() => updateOrderStatus(order.id, "completed")}
                      className="text-xs bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-lg"
                    >
                      Complete Deal
                    </button>
                  )}
                  {(order.status === "waiting_admin" || order.status === "in_progress") && (
                    <button
                      onClick={() => updateOrderStatus(order.id, "disputed")}
                      className="text-xs bg-red-600 hover:bg-red-500 px-3 py-1.5 rounded-lg"
                    >
                      Dispute
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
