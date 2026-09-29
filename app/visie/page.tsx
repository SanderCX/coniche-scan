import { PageWithChrome } from "@/components/PageWithChrome";
import {
  visieSecties,
  watIsGoedKlantcontact,
  watIsGoedKlantcontactSlot,
  verbetercyclus,
  visieIntro,
  watIsGoedIntro,
} from "@/data/visie-content";

export default async function VisiePage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  return (
    <PageWithChrome logoHref={code ? `/s/${code}` : undefined} code={code} toonTerug>
      <div
        style={{
          background: "linear-gradient(180deg, var(--or-faint) 0%, var(--bg) 65%)",
        }}
      >
        <div className="container" style={{ padding: "4.5rem 2rem 1.5rem", textAlign: "center" }}>
          <span className="eyebrow">Coniche Scan</span>
          <h1>Onze visie op goed klantcontact</h1>
          <p
            style={{
              maxWidth: "44rem",
              margin: "1rem auto 0",
              fontSize: "1.1rem",
              fontWeight: 600,
              color: "var(--ink)",
            }}
          >
            {visieIntro}
          </p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: "42rem", padding: "2.5rem 2rem" }}>
        <h2>{visieSecties[0].titel}</h2>
        {visieSecties[0].alineas.map((tekst, i) => (
          <p key={i}>{tekst}</p>
        ))}
      </div>

      <div className="container" style={{ paddingBottom: "1rem" }}>
        <div className="card card-warm" style={{ maxWidth: "48rem", margin: "0 auto" }}>
          <h3>Wat is goed klantcontact?</h3>
          <p className="text-sm" style={{ color: "var(--ink-m)" }}>
            {watIsGoedIntro}
          </p>
          <ul
            className="grid grid-cols-1 gap-3 sm:grid-cols-2"
            style={{ listStyle: "none", padding: 0, marginTop: "1.2rem" }}
          >
            {watIsGoedKlantcontact.map((punt) => (
              <li key={punt} style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "1.4rem",
                    height: "1.4rem",
                    borderRadius: "50%",
                    background: "var(--or)",
                    color: "#fff",
                    fontSize: "0.75rem",
                    fontWeight: 800,
                    flex: "none",
                    marginTop: "0.1rem",
                  }}
                >
                  ✓
                </span>
                <span className="text-sm" style={{ color: "var(--ink)" }}>
                  {punt}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-sm" style={{ color: "var(--ink-m)", marginTop: "1.2rem" }}>
            {watIsGoedKlantcontactSlot}
          </p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: "42rem", padding: "2.5rem 2rem" }}>
        <h2>{visieSecties[1].titel}</h2>
        {visieSecties[1].alineas.map((tekst, i) => (
          <p key={i}>{tekst}</p>
        ))}
      </div>

      <div className="container" style={{ paddingBottom: "1rem", maxWidth: "42rem" }}>
        <h2>{visieSecties[2].titel}</h2>
        <p>{visieSecties[2].alineas[0]}</p>
      </div>

      <div className="container" style={{ paddingBottom: "2rem" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            margin: "2rem auto",
            maxWidth: "48rem",
          }}
        >
          {verbetercyclus.map((stap, i) => (
            <div key={stap} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "3rem",
                    height: "3rem",
                    borderRadius: "50%",
                    background: "var(--or-faint)",
                    color: "var(--or)",
                    fontWeight: 800,
                    fontSize: "1.1rem",
                  }}
                >
                  {i + 1}
                </span>
                <span className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                  {stap}
                </span>
              </div>
              {i < verbetercyclus.length - 1 && (
                <span style={{ color: "var(--or-mid)", fontSize: "1.5rem", marginBottom: "1.6rem" }}>
                  →
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="container" style={{ paddingBottom: "3rem", maxWidth: "42rem" }}>
        <p>{visieSecties[2].alineas[1]}</p>
      </div>
    </PageWithChrome>
  );
}
