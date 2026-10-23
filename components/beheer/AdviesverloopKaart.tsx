"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { InfoIcoon } from "@/components/InfoIcoon";
import { FasestrookKlein } from "@/components/adviesverloop/Fasestrook";
import { KoppelModal } from "@/components/adviesverloop/MetingenModals";
import { useAssessments } from "@/lib/assessment-store";
import { useAdviesCatalogus } from "@/lib/advies-catalogus-store";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { adviesverloopVoorMeting, heeftAfgerondeScans, heeftBouwstenenMetScore, labelVan, lopendAdviesverloop } from "@/lib/advies";
import { startAdviesverloop } from "@/lib/db";
import { magAdviesverloop } from "@/lib/rechten";
import type { Organisatie, ScanUitvoering } from "@/lib/types";

/**
 * De kaart Adviesverloop in het Meting-overzicht (`beheerpagina.md`, punt 5, Adviesverloop): Hoort de Meting bij een adviesverloop, dan de fasestrook in klein
 * formaat, het label van de Meting in het traject en de knop "Adviesverloop openen". Hoort ze er nog niet bij maar loopt er een, dan "Koppelen". Loopt er
 * geen, dan "Adviesverloop starten". Zonder afgeronde scans zijn de knoppen uitgeschakeld, met de reden in een Info-icoon.
 */
export function AdviesverloopKaart({ organisatie, meting }: { organisatie: Organisatie; meting: ScanUitvoering }) {
  const router = useRouter();
  const gebruiker = useIngelogdeGebruiker();
  const catalogus = useAdviesCatalogus();
  const assessment = useAssessments().find((a) => a.id === meting.assessmentId);
  const [koppelOpen, setKoppelOpen] = useState(false);
  const [fout, setFout] = useState<string | null>(null);
  if (!magAdviesverloop(gebruiker, organisatie)) return null;

  const av = adviesverloopVoorMeting(organisatie, meting.id);
  const lopend = lopendAdviesverloop(organisatie, meting.onderdeelId ?? null);
  const reden = !heeftAfgerondeScans(organisatie, meting)
    ? "Deze Meting heeft nog geen afgeronde scans."
    : !heeftBouwstenenMetScore(assessment)
      ? "Deze Meting heeft geen schaal van 1 tot 5."
      : null;

  function start() {
    const r = startAdviesverloop(organisatie.id, meting.id);
    if (!r.ok) return setFout(r.reden);
    router.push(`/beheer/organisaties/${organisatie.id}/adviesverloop/${r.adviesverloop.id}`);
  }

  return (
    <section className="beheer-kaart" aria-label="Adviesverloop" style={{ margin: "1rem 0" }}>
      <div className="beheer-kaart-kop">
        <h2>Adviesverloop</h2>
        {av ? (
          <Link className="btn btn-or btn-compact" href={`/beheer/organisaties/${organisatie.id}/adviesverloop/${av.id}`}>
            Adviesverloop openen
          </Link>
        ) : lopend ? (
          <span className="knop-met-icoon">
            <button type="button" className="btn btn-or btn-compact" disabled={reden !== null} onClick={() => setKoppelOpen(true)}>
              Koppelen
            </button>
            {reden && <InfoIcoon naastVeld sleutel="info.adviesverloopStarten" voorloop={reden} />}
          </span>
        ) : (
          <span className="knop-met-icoon">
            <button type="button" className="btn btn-or btn-compact" disabled={reden !== null} onClick={start}>
              Adviesverloop starten
            </button>
            {reden && <InfoIcoon naastVeld sleutel="info.adviesverloopStarten" voorloop={reden} />}
          </span>
        )}
      </div>
      {av ? (
        <>
          <FasestrookKlein catalogus={catalogus} adviesverloop={av} />
          <p className="text-sm text-ink-s">Deze Meting in het traject: {labelVan(av, meting.id) ?? "zonder label"}</p>
        </>
      ) : lopend ? (
        <p className="text-sm text-ink-s">Deze Meting hoort nog niet bij het lopende adviesverloop.</p>
      ) : (
        <p className="text-sm text-ink-s">Voor dit onderdeel loopt nog geen adviesverloop.</p>
      )}
      {fout && (
        <p className="admin-notice" role="alert">
          {fout}
        </p>
      )}
      {koppelOpen && lopend && <KoppelModal organisatie={organisatie} adviesverloop={lopend} onderdeelId={lopend.onderdeelId} aangevinkt={meting.id} onSluit={() => setKoppelOpen(false)} />}
    </section>
  );
}
