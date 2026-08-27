import Link from "next/link";
import RequireAuth from "@/components/RequireAuth";
import AdminNav from "@/components/AdminNav";

export const metadata = {
  title: "Admin",
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <RequireAuth adminOnly>
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="rounded-[var(--radius-full)] bg-tint px-2.5 py-1 text-[10px] uppercase tracking-wider text-accent-text">
            Admin
          </span>
          <Link
            href="/dashboard"
            className="text-xs text-ink-muted transition-colors hover:text-ink-soft"
          >
            Back to your dashboard
          </Link>
        </div>

        <AdminNav />
        {children}
      </div>
    </RequireAuth>
  );
}
