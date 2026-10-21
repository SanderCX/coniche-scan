import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * De losse contentpagina's zijn vervallen (`CLAUDE.md`, sectie 3, scherm 2, Routes, besloten door Joost op 21 oktober 2026): De content staat als
   * secties op de Assessment-pagina. Een oud adres stuurt door naar de plek waar de content nu staat. Een `?code=` blijft meegaan.
   */
  async redirects() {
    return [
      { source: "/visie", destination: "/klantcontact-volwassenheid#visie", permanent: true },
      { source: "/bouwstenen", destination: "/klantcontact-volwassenheid#bouwblokken", permanent: true },
      { source: "/ai-scan", destination: "/ai-volwassenheid#ai", permanent: true },
      { source: "/klantcontact-2030", destination: "/ai-volwassenheid#2030", permanent: true },
    ];
  },
};

export default nextConfig;
