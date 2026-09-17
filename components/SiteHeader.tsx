"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

/**
 * Gedeelde navigatiebalk over alle respondent-facing schermen heen (zie
 * CLAUDE.md sectie 5 en stylesheet.md "Layout en spacing"/"Logo-gebruik").
 * Vaste hoogte 64px, transparant tot er gescrold wordt, dan wit met blur.
 */
export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 h-16 transition-colors ${
        scrolled ? "border-b border-border bg-white/95 backdrop-blur-lg" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-full max-w-[1160px] items-center justify-between px-8">
        <Link href="/">
          <Image
            src="/LOGO/Coniche_MMW_standard.svg"
            alt="Coniche"
            width={120}
            height={34}
            style={{ height: "34px", width: "auto" }}
            priority
          />
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-ink">
          <Link href="/" className="hover:text-or">
            Assessments
          </Link>
        </nav>
      </div>
    </header>
  );
}
