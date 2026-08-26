import Link from "next/link";
import { requireAdmin } from "@/services/identity";
import { AdminOverview } from "@/features/admin/overview";

const TABS = [
  { href: "/app/admin/users", label: "Users" },
  { href: "/app/admin/transactions", label: "Transactions" },
  { href: "/app/admin/reports", label: "Reports" },
  { href: "/app/admin/audit", label: "Audit Logs" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-gold">
          Admin
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-ivory">
          Platform Administration
        </h1>
      </div>
      <nav
        className="flex gap-1 overflow-x-auto border-b border-line"
        aria-label="Admin sections"
      >
        {TABS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="whitespace-nowrap rounded-t-md px-3 py-2 text-sm text-muted transition-colors hover:bg-white/5 hover:text-ivory"
          >
            {t.label}
          </Link>
        ))}
      </nav>
      <AdminOverview />
      {children}
    </div>
  );
}
