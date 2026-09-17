import Image from "next/image";

/**
 * Gedeelde footer, zie stylesheet.md "Logo-gebruik": logo op zwarte
 * achtergrond, hoogte 30px, geen kleurfilter nodig.
 */
export function SiteFooter() {
  return (
    <footer className="bg-black py-8">
      <div className="mx-auto flex max-w-[1160px] flex-col items-center justify-between gap-4 px-8 sm:flex-row">
        <Image
          src="/LOGO/Coniche_MMW_Logo-Wit.png"
          alt="Coniche"
          width={110}
          height={30}
          style={{ height: "30px", width: "auto" }}
        />
        <p className="text-sm text-white/60">
          © {new Date().getFullYear()} Coniche — Maakt Meer Werkend
        </p>
      </div>
    </footer>
  );
}
