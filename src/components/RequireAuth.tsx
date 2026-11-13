"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

/**
 * Client-side gate for the dashboard and admin areas.
 *
 * It waits for `loading` to settle before deciding anything — redirecting
 * while the identity check is still in flight would bounce a signed-in user
 * to the login page every time they refreshed.
 *
 * This is a UX guard, not a security boundary. Nothing here is trusted: the
 * API authorises every request on its own, so a user who edits their way
 * past this sees an empty shell and a string of 401s.
 */
export default function RequireAuth({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      // Come back here once they've signed in.
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    } else if (adminOnly && user.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [user, loading, adminOnly, router, pathname]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div
          className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-accent"
          role="status"
          aria-label="Loading"
        />
      </div>
    );
  }

  if (!user || (adminOnly && user.role !== "admin")) return null;

  return <>{children}</>;
}
