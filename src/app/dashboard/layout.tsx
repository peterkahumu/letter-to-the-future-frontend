import RequireAuth from "@/components/RequireAuth";
import DashboardNav from "@/components/DashboardNav";

export const metadata = {
  title: "Dashboard",
};

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <RequireAuth>
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <DashboardNav />
        {children}
      </div>
    </RequireAuth>
  );
}
