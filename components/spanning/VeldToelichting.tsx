"use client";

import { Assessment, Bouwblok } from "@/lib/types";
import { veldKleur } from "@/lib/colors";
import { niveauNaam, Niveau } from "@/lib/spanning";
import { ToelichtingModal } from "@/components/ToelichtingModal";

/** De ijkpunten van een veld met de naam van het niveau erbij, voor de Toelichtingsmodal van een spanningsveld. */
export function ijkpuntenMetNaam(assessment: Assessment, veld: Bouwblok): { niveau: number; naam: string; tekst: string }[] {
  return (veld.ijkpunten ?? []).map((tekst, i) => ({
    niveau: i + 1,
    naam: niveauNaam(assessment, (i + 1) as Niveau),
    tekst,
  }));
}

/**
 * De Toelichtingsmodal van een spanningsveld (`stylesheet.md`, Toelichtingsmodal, opbouw; `content-spanningsmeter.md`, Hoe de app de
 * content gebruikt): De omschrijving, de ijkpunten en de basis. Er is geen centrale vraag. Het label onder de naam is "Spanningsveld".
 */
export function VeldToelichtingModal({
  assessment,
  veld,
  open,
  onClose,
}: {
  assessment: Assessment;
  veld: Bouwblok;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <ToelichtingModal
      open={open}
      onClose={onClose}
      nummer={veld.volgnummer}
      naam={veld.naam}
      categorie={assessment.bouwblokLabel}
      kleur={veldKleur(veld.volgnummer)}
      centraleVraag={null}
      beschrijving={[veld.omschrijving]}
      ijkpunten={ijkpuntenMetNaam(assessment, veld)}
      basis={veld.toelichting}
    />
  );
}
