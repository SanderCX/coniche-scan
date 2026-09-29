import { PageWithChrome } from "@/components/PageWithChrome";
import {
  geenVastEindbeeld,
  vijfDingenOntwerpen,
  machineCustomerIntro,
  machineCustomerEffecten,
  machineCustomerPunten,
  machineCustomerSlot,
  aiConcreet,
  kostenBusinesscase,
  watDitVoorMensenBetekent,
  gemeenschappelijkeKenmerken,
  relatieMetScan,
  vijfDingenIntro,
  machineCustomerEffectenIntro,
  kenmerkenIntro,
} from "@/data/klantcontact-2030-content";

function GenummerdeLijst({ items }: { items: { titel: string; tekst: string | string[] }[] }) {
  return (
    <div className="grid grid-cols-1 gap-4" style={{ marginTop: "1.5rem" }}>
      {items.map((item, i) => (
        <div key={item.titel} className="card" style={{ display: "flex", gap: "1rem" }}>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "2.2rem",
              height: "2.2rem",
              borderRadius: "50%",
              background: "var(--or-faint)",
              color: "var(--or)",
              fontWeight: 800,
              fontSize: "0.9rem",
              flex: "none",
            }}
          >
            {i + 1}
          </span>
          <div>
            <p className="font-semibold text-ink">{item.titel}</p>
            {(Array.isArray(item.tekst) ? item.tekst : [item.tekst]).map((alinea, j) => (
              <p
                key={j}
                className="text-sm"
                style={{ color: "var(--ink-m)", marginTop: j === 0 ? "0.25rem" : "0.6rem" }}
              >
                {alinea}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function Klantcontact2030Page({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  return (
    <PageWithChrome logoHref={code ? `/s/${code}` : undefined} code={code} toonTerug>
      <div style={{ background: "linear-gradient(180deg, var(--or-faint) 0%, var(--bg) 65%)" }}>
        <div className="container" style={{ padding: "4.5rem 2rem 0.5rem", textAlign: "center" }}>
          <span className="eyebrow">Coniche Scan</span>
          <h1>Klantcontact richting 2030</h1>
        </div>
      </div>

      <div className="container" style={{ maxWidth: "42rem", padding: "1rem 2rem 2.5rem" }}>
        {geenVastEindbeeld.map((tekst, i) => (
          <p key={i}>{tekst}</p>
        ))}
      </div>

      <div className="container" style={{ maxWidth: "42rem", padding: "2.5rem 2rem" }}>
        <h2>Vijf dingen die iedere organisatie moet ontwerpen</h2>
        <p>{vijfDingenIntro}</p>
        <GenummerdeLijst items={vijfDingenOntwerpen} />
      </div>

      <div className="container" style={{ maxWidth: "42rem", padding: "2.5rem 2rem" }}>
        <h2>De machine customer: nieuwe combinaties</h2>
        {machineCustomerIntro.map((tekst, i) => (
          <p key={i}>{tekst}</p>
        ))}
        <p style={{ marginTop: "1.5rem" }}>{machineCustomerEffectenIntro}</p>
        <ul className="list-disc pl-5 space-y-1">
          {machineCustomerEffecten.map((effect, i) => (
            <li key={i}>{effect}</li>
          ))}
        </ul>
        <GenummerdeLijst items={machineCustomerPunten} />
        {machineCustomerSlot.map((tekst, i) => (
          <p key={i} style={{ marginTop: i === 0 ? "1.5rem" : undefined }}>
            {tekst}
          </p>
        ))}
      </div>

      <div className="container" style={{ maxWidth: "42rem", padding: "2.5rem 2rem" }}>
        <h2>Wat dit voor AI concreet betekent</h2>
        <GenummerdeLijst items={aiConcreet} />
      </div>

      <div className="container" style={{ maxWidth: "42rem", padding: "2.5rem 2rem" }}>
        <h2>Kosten en businesscase</h2>
        {kostenBusinesscase.map((tekst, i) => (
          <p key={i}>{tekst}</p>
        ))}
      </div>

      <div className="container" style={{ maxWidth: "42rem", padding: "2.5rem 2rem" }}>
        <h2>Wat dit voor mensen betekent</h2>
        {watDitVoorMensenBetekent.map((tekst, i) => (
          <p key={i}>{tekst}</p>
        ))}
      </div>

      <div className="container" style={{ paddingBottom: "1rem" }}>
        <div className="card card-warm" style={{ maxWidth: "48rem", margin: "0 auto" }}>
          <h3>Wat organisaties die zich hierop voorbereiden gemeen hebben</h3>
          <p className="text-sm" style={{ color: "var(--ink-m)" }}>
            {kenmerkenIntro}
          </p>
          <div
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            style={{ marginTop: "1.2rem" }}
          >
            {gemeenschappelijkeKenmerken.map((item) => (
              <div key={item.titel}>
                <p className="text-sm font-semibold text-ink">{item.titel}</p>
                <p className="text-sm" style={{ color: "var(--ink-m)" }}>
                  {item.tekst}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: "3rem", maxWidth: "42rem" }}>
        <h2>De relatie met deze scan</h2>
        <p>{relatieMetScan}</p>
      </div>
    </PageWithChrome>
  );
}
