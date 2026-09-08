import { getSession } from "@/lib/session";
import AdminNav from "@/components/admin/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  // Middleware already redirects unauthenticated requests away from every
  // /admin route except /admin/login — a null session here means this is
  // that login page, so render it bare, without the dashboard chrome.
  if (!session) return <>{children}</>;

  return (
    <div className="min-h-screen bg-[#F5F5F3] text-[#1A1A1A] flex">
      <AdminNav role={session.role} name={session.name} />
      <main className="flex-1 min-w-0 p-8">{children}</main>
    </div>
  );
}
