"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Order } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";

const statusColors: Record<string, string> = {
  pending_payment: "bg-yellow-500/20 text-yellow-400",
  waiting_admin: "bg-blue-500/20 text-blue-400",
  in_progress: "bg-purple-500/20 text-purple-400",
  completed: "bg-emerald-500/20 text-emerald-400",
  disputed: "bg-red-500/20 text-red-400",
  cancelled: "bg-zinc-500/20 text-zinc-400",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      const { data } = await supabase
        .from("orders")
        .select(`
          *,
          listing:listings(title, platform),
          buyer:profiles!orders_buyer_id_fkey(username),
          seller:profiles!orders_seller_id_fkey(username)
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      setOrders((data as Order[]) || []);
      setLoading(false);
    }
    load();
  }, [router]);

  const markPaymentSent = async (orderId: string) => {
    const proof = prompt("Paste payment proof (transaction ID / screenshot link):");
    if (!proof) return;

    await supabase
      .from("orders")
      .update({ status: "waiting_admin", payment_proof: proof })
      .eq("id", orderId);

    // Refresh
    window.location.reload();
  };

  if (loading) return <div className="text-center py-20">Loading orders...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          <p>No orders yet.</p>
          <Link href="/" className="text-emerald-400 underline mt-2 inline-block">
            Browse listings
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-lg">
                    {order.listing?.title || "Listing"}
                  </h3>
                  <p className="text-sm text-zinc-400 mt-1">
                    {order.buyer_id === user.id ? "You are buying" : "You are selling"} •{" "}
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full ${statusColors[order.status]}`}>
                  {order.status.replace("_", " ").toUpperCase()}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <span>Amount: <strong>${order.amount.toFixed(2)}</strong></span>
                <span>Fee: <strong>${order.commission.toFixed(2)}</strong></span>
                <span>
                  Total: <strong className="text-emerald-400">${(order.amount + order.commission).toFixed(2)}</strong>
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href={`/chat/${order.id}`}
                  className="flex items-center gap-1 text-sm bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg"
                >
                  <MessageSquare className="w-4 h-4" /> Chat
                </Link>

                {order.buyer_id === user.id && order.status === "pending_payment" && (
                  <button
                    onClick={() => markPaymentSent(order.id)}
                    className="text-sm bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-lg"
                  >
                    I have paid
                  </button>
                )}
              </div>

              {order.status === "pending_payment" && order.buyer_id === user.id && (
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm text-yellow-200">
                  <p className="font-medium">Payment Instructions</p>
                  <p className="mt-1 text-yellow-200/80">
                    Send <strong>${(order.amount + order.commission).toFixed(2)}</strong> to the admin (details will be provided in chat or by admin).
                    Then click "I have paid" and paste your proof.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
