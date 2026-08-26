"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { NotificationRow } from "@/types/database";

export function NotificationsBell() {
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [, startTransition] = useTransition();

  async function load() {
    const supabase = getSupabaseBrowserClient();
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(12);
    setItems((data as NotificationRow[]) ?? []);
  }

  useEffect(() => {
    load();
    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel("notifications-bell")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        () => startTransition(() => void load()),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function markAllRead() {
    const supabase = getSupabaseBrowserClient();
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .is("read_at", null);
    load();
  }

  const unread = items.filter((n) => !n.read_at).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        className="relative rounded-full border border-line bg-surface p-2 text-ivory-dim hover:text-ivory"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-obsidian">
            {unread}
          </span>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-xs font-medium uppercase tracking-wide text-muted">
            Notifications
          </span>
          {unread > 0 ? (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 text-xs text-gold hover:underline"
            >
              <Check className="h-3 w-3" /> Mark all read
            </button>
          ) : null}
        </div>
        <DropdownMenuSeparator />
        {items.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-muted">
            You&apos;re all caught up.
          </p>
        ) : (
          items.map((n) => (
            <div
              key={n.id}
              className={`rounded-md px-2 py-2 ${!n.read_at ? "bg-gold/5" : ""}`}
            >
              <p className="text-sm font-medium text-ivory">{n.title}</p>
              {n.body ? (
                <p className="mt-0.5 text-xs text-muted">{n.body}</p>
              ) : null}
              <p className="mt-1 text-[10px] text-muted/70">
                {new Date(n.created_at).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function UserMenu({
  username,
  email,
  isAdmin = false,
}: {
  username: string;
  email: string;
  isAdmin?: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-surface text-sm font-semibold text-gold"
        aria-label="Open profile menu"
      >
        {(username || email || "?").slice(0, 1).toUpperCase()}
      </DropdownMenuTrigger>
      {/* §18 — workspace & admin entry points live in the Profile Menu. */}
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <p className="truncate">{email}</p>
          <p className="text-xs font-normal text-muted">@{username}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href={`/u/${username}`}>
          <DropdownMenuItem>My Profile</DropdownMenuItem>
        </Link>
        <Link href="/app/dashboard">
          <DropdownMenuItem>Dashboard</DropdownMenuItem>
        </Link>
        <Link href="/app/billing">
          <DropdownMenuItem>Billing &amp; Plan</DropdownMenuItem>
        </Link>
        <Link href="/app/settings">
          <DropdownMenuItem>Settings</DropdownMenuItem>
        </Link>
        {isAdmin ? (
          <>
            <DropdownMenuSeparator />
            <Link href="/app/admin/users">
              <DropdownMenuItem className="text-gold">Admin Console</DropdownMenuItem>
            </Link>
          </>
        ) : null}
        <DropdownMenuSeparator />
        <SignOutItem />
        <SignOutItem allDevices />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SignOutItem({ allDevices = false }: { allDevices?: boolean }) {
  const router = useRouter();
  return (
    <DropdownMenuItem
      onSelect={async () => {
        const supabase = getSupabaseBrowserClient();
        // §20 session management — global scope revokes every refresh token.
        await supabase.auth.signOut(allDevices ? { scope: "global" } : undefined);
        router.push("/");
      }}
    >
      {allDevices ? "Sign out of all devices" : "Sign out"}
    </DropdownMenuItem>
  );
}
