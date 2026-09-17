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
    <aside className="flex w-56 flex-shrink-0 flex-col gap-6 border-r border-gray-200 bg-white p-6">
      <div>
        <p className="text-lg font-bold text-ink">Coniche</p>
        <p className="text-sm text-muted">Beheer</p>
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
                actief ? "bg-brand text-white" : "text-ink hover:bg-gray-100"
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
        className="mt-auto text-left text-sm text-muted hover:text-muted"
      >
        Uitloggen
      </button>
    </aside>
  );
}
