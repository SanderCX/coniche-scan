"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/admin-auth";

const links = [
  { href: "/beheer", label: "Dashboard" },
  { href: "/beheer/scans", label: "Scans" },
  { href: "/beheer/content", label: "Content" },
];

export function BeheerNav() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 flex-shrink-0 flex-col gap-6 border-r border-slate-200 bg-white p-6">
      <div>
        <p className="text-lg font-bold text-slate-900">Coniche</p>
        <p className="text-sm text-slate-500">Beheer</p>
      </div>
      <nav className="flex flex-col gap-1">
        {links.map((link) => {
          const actief =
            link.href === "/beheer" ? pathname === link.href : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                actief ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        onClick={logout}
        className="mt-auto text-left text-sm text-slate-400 hover:text-slate-600"
      >
        Uitloggen
      </button>
    </aside>
  );
}
