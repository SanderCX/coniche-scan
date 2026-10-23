"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Kruimelpad } from "@/components/beheer/Kruimelpad";
import { BevestigModal } from "@/components/beheer/BevestigModal";
import { Fasestrook } from "@/components/adviesverloop/Fasestrook";
import { KoppelModal, PeilmetingModal } from "@/components/adviesverloop/MetingenModals";
import { GedaanModal, PromptModal } from "@/components/adviesverloop/PromptModal";
import { ShortlistScherm } from "@/components/adviesverloop/ShortlistScherm";
import { UitwerkingScherm } from "@/components/adviesverloop/UitwerkingScherm";
import { useAdviesData } from "@/components/adviesverloop/useAdviesData";
import { useIngelogdeGebruiker } from "@/lib/admin-auth";
import { heropenAdviesverloop, rondAdviesverloopAf, verwijderAdviesverloop } from "@/lib/db";
import { onderdeelNaamVan } from "@/lib/advies";
import { maandJaar, meetdatumVan } from "@/lib/metingen";
import { magAdviesverloop } from "@/lib/rechten";
import type { UseCase } from "@/lib/types";

type Scherm = "shortlist" | "uitwerking";

/**
 * De pagina Adviesverloop (`adviesverloop.md`, Scherm Adviesverloop en Scherm Uitwerking per bouwsteen), voor een Admin (alle Organisaties) en een Consultant (eigen).
 * De fasestrook blijft bij scrollen onder de nav staan. Een afgerond adviesverloop is alleen te lezen.
 */
export default function AdviesverloopPagina({ params }: { params: Promise<{ organisatieId: string; adviesverloopId: string }> }) {
  const { organisatieId, adviesverloopId } = use(params);
  const router = useRouter();
  const gebruiker = useIngelogdeGebruiker();
  const data = useAdviesData(organisatieId, adviesverloopId);
  const [scherm, setScherm] = useState<Scherm>("shortlist");
  const [peilOpen, setPeilOpen] = useState(false);
  const [koppelOpen, setKoppelOpen] = useState(false);
  const [prompt, setPrompt] = useState<{ useCase: UseCase; bouwsteenId: string | null } | null>(null);
  const [gedaan, setGedaan] = useState<{ useCase: UseCase; bouwsteenId: string | null } | null>(null);
  const [verwijderen, setVerwijderen] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  if (!data) {
    return (
      <div className="admin-main">
        <p className="admin-notice">Dit adviesverloop bestaat niet (meer).</p>
        <Link href="/beheer/organisaties">Naar Organisaties</Link>
      </div>
    );
  }
  const { organisatie, adviesverloop, catalogus, peil } = data;
  if (!magAdviesverloop(gebruiker, organisatie)) {
    return (
      <div className="admin-main">
        <p className="admin-notice">Geen toegang tot het adviesverloop van deze organisatie.</p>
      </div>
    );
  }
  const afgerond = adviesverloop.status === "afgerond";
  const kanWijzigen = !afgerond;
  const peilDatum = peil ? meetdatumVan(peil) : null;
  const onderdeel = onderdeelNaamVan(organisatie, adviesverloop.onderdeelId);

  return (
    <>
      <Fasestrook
        adviesverloop={adviesverloop}
        catalogus={catalogus}
        gekoppeld={data.gekoppeld}
        peil={peil}
        kanWijzigen={kanWijzigen}
        onPeilmeting={() => setPeilOpen(true)}
        onKoppelen={() => setKoppelOpen(true)}
        onKiesUseCase={(useCase) => setPrompt({ useCase, bouwsteenId: data.shortlist[0]?.bouwblok.id ?? null })}
      />
      <div className="adv-pagina">
        <Kruimelpad
          delen={[
            { label: "Organisaties", href: "/beheer/organisaties" },
            { label: organisatie.naam, href: `/beheer/organisaties/${organisatie.id}` },
            { label: "Adviesverloop" },
          ]}
        />
        <div className="adv-kop">
          <div>
            <p className="eyebrow">Adviesverloop</p>
            <h1>{organisatie.naam}</h1>
            <p className="adv-sub">
              {onderdeel} · {data.gekoppeld.length} {data.gekoppeld.length === 1 ? "Meting" : "Metingen"}
              {peil ? ` · peil ${data.peilLabel}${peilDatum ? ` ${maandJaar(peilDatum)}` : ""}` : ""}
              {afgerond ? " · afgerond" : ""}
            </p>
          </div>
          {peil && (
            <Link className="btn btn-outline" href={`/beheer/rapportage/${peil.id}`}>
              Alle resultaten bekijken
            </Link>
          )}
        </div>

        {afgerond && (
          <p className="admin-notice">
            Dit adviesverloop is afgerond. Je kunt het alleen lezen.{" "}
            <button
              type="button"
              className="btn btn-outline btn-compact"
              onClick={() => {
                const r = heropenAdviesverloop(organisatie.id, adviesverloop.id);
                setFout(r.ok ? null : r.reden);
              }}
            >
              Heropenen
            </button>
          </p>
        )}
        {fout && (
          <p className="admin-notice" role="alert">
            {fout}
          </p>
        )}

        {scherm === "shortlist" ? (
          <ShortlistScherm data={data} kanWijzigen={kanWijzigen} onUitwerken={() => setScherm("uitwerking")} />
        ) : (
          <UitwerkingScherm
            data={data}
            kanWijzigen={kanWijzigen}
            onWijzig={() => setScherm("shortlist")}
            onPrompt={(useCase, bouwsteenId) => setPrompt({ useCase, bouwsteenId })}
            onGedaan={(useCase, bouwsteenId) => setGedaan({ useCase, bouwsteenId })}
          />
        )}

        <section className="beheer-kaart" aria-label="Afronden en verwijderen">
          <div className="beheer-kaart-kop">
            <h2>Afronden en verwijderen</h2>
            <div className="adv-acties">
              {!afgerond && (
                <button
                  type="button"
                  className="btn btn-outline btn-compact"
                  onClick={() => {
                    const r = rondAdviesverloopAf(organisatie.id, adviesverloop.id);
                    setFout(r.ok ? null : r.reden);
                  }}
                >
                  Adviesverloop afronden
                </button>
              )}
              <button type="button" className="btn btn-outline btn-compact" onClick={() => setVerwijderen(true)}>
                Adviesverloop verwijderen
              </button>
            </div>
          </div>
          <p className="text-sm text-ink-s">
            Afronden houdt het adviesverloop leesbaar. Een nieuw traject begint dan met een nieuw adviesverloop.
          </p>
        </section>
      </div>

      {peilOpen && <PeilmetingModal organisatie={organisatie} adviesverloop={adviesverloop} onSluit={() => setPeilOpen(false)} />}
      {koppelOpen && <KoppelModal organisatie={organisatie} adviesverloop={adviesverloop} onderdeelId={adviesverloop.onderdeelId} onSluit={() => setKoppelOpen(false)} />}
      {prompt && <PromptModal data={data} useCase={prompt.useCase} bouwsteenId={prompt.bouwsteenId} onSluit={() => setPrompt(null)} />}
      {gedaan && <GedaanModal data={data} useCase={gedaan.useCase} bouwsteenId={gedaan.bouwsteenId} onSluit={() => setGedaan(null)} />}
      <BevestigModal
        open={verwijderen}
        titel="Adviesverloop verwijderen?"
        bericht={
          <>
            <p>
              Het adviesverloop van {organisatie.naam} ({onderdeel}) verdwijnt met {adviesverloop.stappen.length} gedane {adviesverloop.stappen.length === 1 ? "stap" : "stappen"}. De
              Metingen blijven bestaan.
            </p>
            <p>Dit kan niet ongedaan worden gemaakt.</p>
          </>
        }
        onAnnuleren={() => setVerwijderen(false)}
        onBevestigen={() => {
          verwijderAdviesverloop(organisatie.id, adviesverloop.id);
          setVerwijderen(false);
          router.push(`/beheer/organisaties/${organisatie.id}`);
        }}
      />
    </>
  );
}
