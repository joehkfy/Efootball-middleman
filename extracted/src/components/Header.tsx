"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Shield, LogOut, Plus, ShoppingBag, LayoutDashboard } from "lucide-react";

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        setIsAdmin(data?.role === "admin");
      }
      setLoading(false);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single()
          .then(({ data }) => setIsAdmin(data?.role === "admin"));
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-6xl h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Shield className="w-6 h-6 text-emerald-400" />
          <span>eFootball <span className="text-emerald-400">Middleman</span></span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link href="/" className="text-sm text-zinc-300 hover:text-white transition">
            Browse
          </Link>

          {!loading && user ? (
            <>
              <Link
                href="/listings/new"
                className="flex items-center gap-1 text-sm bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-lg transition"
              >
                <Plus className="w-4 h-4" /> Sell
              </Link>
              <Link href="/orders" className="flex items-center gap-1 text-sm text-zinc-300 hover:text-white">
                <ShoppingBag className="w-4 h-4" /> Orders
              </Link>
              {isAdmin && (
                <Link href="/admin" className="flex items-center gap-1 text-sm text-amber-400 hover:text-amber-300">
                  <LayoutDashboard className="w-4 h-4" /> Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-sm text-zinc-400 hover:text-red-400"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            !loading && (
              <div className="flex gap-2">
                <Link href="/login" className="text-sm px-3 py-1.5 rounded-lg border border-zinc-700 hover:bg-zinc-800">
                  Login
                </Link>
                <Link href="/register" className="text-sm px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500">
                  Register
                </Link>
              </div>
            )
          )}
        </nav>
      </div>
    </header>
  );
}
