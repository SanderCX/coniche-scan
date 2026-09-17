"use client";

import Image from "next/image";
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
        <Image
          src="/LOGO/Coniche_MMW_standard.svg"
          alt="Coniche"
          width={120}
          height={34}
          className="h-[34px] w-auto"
          priority
        />
        <p className="mt-2 text-sm text-ink-m">Beheer</p>
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
                actief ? "bg-or text-white" : "text-ink hover:bg-gray-100"
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
        className="mt-auto text-left text-sm text-ink-m hover:text-ink"
      >
        Uitloggen
      </button>
    </aside>
  );
}
