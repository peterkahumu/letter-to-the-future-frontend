"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Flag, Send, Users } from "lucide-react";

const TABS = [
  { href: "/admin", label: "Overview", icon: BarChart3, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/moderation", label: "Moderation", icon: Flag },
  { href: "/admin/delivery", label: "Delivery", icon: Send },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Admin sections"
      className="-mx-5 mb-8 overflow-x-auto border-b border-line px-5 sm:mx-0 sm:px-0"
    >
      <ul className="flex min-w-max gap-1">
        {TABS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2 border-b-2 px-3.5 py-3 text-sm transition-colors duration-200 ${
                  active
                    ? "border-accent text-ink"
                    : "border-transparent text-ink-muted hover:text-ink-soft"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
