import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BarChart3,
  Fingerprint,
  FileText,
  Globe,
  LayoutDashboard,
  MonitorSmartphone,
  Settings,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { NotificationsBell, UserMenu } from "@/components/layout/app-nav";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentProfile, getPlan } from "@/services/identity";
import type { NotificationRow, ProfileRow } from "@/types/database";

const icons = {
  LayoutDashboard,
  Fingerprint,
  FileText,
  Sparkles,
  Globe,
  MonitorSmartphone,
  BarChart3,
  Settings,
} as const;

const NAV = [
  { href: "/app/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/app/identity", label: "Identity", icon: "Fingerprint" },
  { href: "/app/cv", label: "My CVs", icon: "FileText" },
  { href: "/app/ai", label: "AI Studio", icon: "Sparkles" },
  { href: "/app/showcase/profile", label: "Public Profile", icon: "Globe" },
  { href: "/app/showcase/website", label: "Website", icon: "MonitorSmartphone" },
  { href: "/app/analytics", label: "Analytics", icon: "BarChart3" },
  { href: "/app/settings", label: "Settings", icon: "Settings" },
] as const;

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = (await getCurrentProfile()) as ProfileRow | null;
  if (!profile) redirect("/login");
  if (!profile.onboarding_completed) redirect("/onboarding");

  const plan = await getPlan(user.id);
  const { data: notifications } = await supabase
    .from("notifications")
    .select("id")
    .is("read_at", null)
    .limit(1);
  void (notifications as NotificationRow[] | null);

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-line bg-obsidian-raised lg:flex">
        <div className="px-5 py-5">
          <Link href="/" aria-label="PortoTional home">
            <Logo />
          </Link>
        </div>
        <nav className="flex-1 space-y-1 px-3" aria-label="Application">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-3 rounded-md px-3 py-2 text-sm text-ivory-dim transition-colors hover:bg-white/5 hover:text-ivory"
            >
              {(() => {
                const Icon = icons[item.icon];
                return (
                  <Icon className="h-4 w-4 text-muted transition-colors group-hover:text-gold" />
                );
              })()}
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-line p-4">
          <p className="text-xs uppercase tracking-widest text-muted">Plan</p>
          <p className="mt-0.5 flex items-center gap-2 text-sm font-medium text-ivory">
            {plan === "pro" ? (
              <>
                <span className="inline-block h-2 w-2 rounded-full bg-success" />
                Pro
              </>
            ) : (
              <>
                <span className="inline-block h-2 w-2 rounded-full bg-muted" />
                Free
              </>
            )}
          </p>
          {plan !== "pro" ? (
            <Link
              href="/pricing"
              className="mt-2 inline-block text-xs text-gold hover:underline"
            >
              Upgrade to Pro →
            </Link>
          ) : null}
        </div>
      </aside>

      <div className="flex min-h-screen w-full flex-col lg:pl-60">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-obsidian/90 px-4 py-3 backdrop-blur lg:px-8">
          <Link href="/app/dashboard" className="lg:hidden">
            <Logo />
          </Link>
          <div className="hidden items-center gap-2 lg:flex">
            <span className="text-sm text-muted">
              Setup once, showcase everywhere.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <NotificationsBell />
            <UserMenu username={profile.username} email={user.email ?? ""} />
          </div>
        </header>

        <nav
          className="flex gap-1 overflow-x-auto border-b border-line px-3 py-2 lg:hidden"
          aria-label="Mobile navigation"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-md px-3 py-1.5 text-xs text-ivory-dim hover:bg-white/5 hover:text-ivory"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
