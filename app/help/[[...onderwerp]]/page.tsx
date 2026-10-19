import Link from "next/link";
import { PageWithChrome } from "@/components/PageWithChrome";
import { MijnGegevensMenuVoorCode } from "@/components/MijnGegevensMenuVoorCode";
import { HelpVoorCode } from "@/components/help/HelpVoorCode";

/**
 * De Help voor een Respondent of Lead (`help.md`, Plek in de app): Via "Mijn gegevens", binnen de persoonlijke link. De code staat
 * in de adresbalk zoals bij de vier content-pagina's (`/visie?code=`). Wat de gebruiker ziet, volgt uit zijn rol en de vinkjes van
 * een Admin (`HelpVoorCode`). Zonder herkende gebruiker is er geen Help (`help.md`, Open punten).
 */
export default async function HelpPage({
  params,
  searchParams,
}: {
  params: Promise<{ onderwerp?: string[] }>;
  searchParams: Promise<{ code?: string }>;
}) {
  const { onderwerp } = await params;
  const { code } = await searchParams;
  return (
    <PageWithChrome
      logoHref={code ? `/s/${code}` : undefined}
      code={code}
      toonTerug
      identiteitMenu={code ? <MijnGegevensMenuVoorCode code={code} /> : undefined}
    >
      <div className="container help-container">
        {code ? (
          <HelpVoorCode code={code} slug={onderwerp?.[0]} />
        ) : (
          <div className="help-kaart" style={{ maxWidth: "36rem", margin: "var(--sp-8) auto" }}>
            <h1 className="page-title">Help</h1>
            <p>De help is er voor wie een persoonlijke link heeft. Open je link opnieuw, of vraag Coniche om een nieuwe.</p>
            <Link href="/toegang">Naar Toegang</Link>
          </div>
        )}
      </div>
    </PageWithChrome>
  );
}
