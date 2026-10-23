"use client";

import { AdviescatalogusBeheer } from "@/components/beheer/AdviescatalogusBeheer";

export default function AdviescatalogusPage() {
  return (
    <div className="admin-main admin-main--breed">
      <h1>Adviescatalogus</h1>
      <p>De fasen, de use cases, de rollen en de prompts waaruit het adviesverloop bestaat.</p>
      <AdviescatalogusBeheer />
    </div>
  );
}
