"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { AdminRole } from "@/lib/auth";

const NAV_ITEMS: { label: string; href: string; roles: AdminRole[] }[] = [
  { label: "Dashboard", href: "/admin/dashboard", roles: ["SUPER_ADMIN", "CONTENT_MANAGER", "ORDER_MANAGER", "VIEWER"] },
  { label: "Books", href: "/admin/books", roles: ["SUPER_ADMIN", "CONTENT_MANAGER"] },
  { label: "Orders", href: "/admin/orders", roles: ["SUPER_ADMIN", "ORDER_MANAGER", "VIEWER"] },
  { label: "Users", href: "/admin/users", roles: ["SUPER_ADMIN"] },
];

export default function AdminNav({ role, name }: { role: AdminRole; name: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <nav className="w-56 shrink-0 bg-white border-r border-black/10 min-h-screen p-6 flex flex-col">
      <p className="text-[11px] tracking-[0.14em] uppercase text-black/40 mb-8">Admin Panel</p>
      <div className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.filter((item) => item.roles.includes(role)).map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`text-[14px] px-3 py-2 rounded ${active ? "bg-black text-white" : "text-black/70 hover:bg-black/5"}`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
      <div className="pt-6 border-t border-black/10">
        <p className="text-[13px] text-black/70">{name}</p>
        <p className="text-[11px] uppercase tracking-[0.08em] text-black/40 mt-0.5">{role.replace("_", " ")}</p>
        <button type="button" onClick={handleLogout} className="mt-3 text-[12px] text-black/50 hover:text-black underline">
          Log out
        </button>
      </div>
    </nav>
  );
}
