import { Assessment, Respondent } from "@/lib/types";
import { bouwblokStatus, voortgang } from "@/lib/scoring";
import { getGroepen } from "@/lib/assessment-structuur";
import { CATEGORIE_COLORS } from "@/lib/colors";

export function Sidebar({
  assessment,
  respondent,
  actieveBouwblokId,
  onSelecteer,
}: {
  assessment: Assessment;
  respondent: Respondent;
  actieveBouwblokId: string;
  onSelecteer: (bouwblokId: string) => void;
}) {
  const { percentage, beantwoord, totaal } = voortgang(assessment, respondent.antwoorden);

  return (
    <aside className="flex w-full flex-col gap-6 border-r border-slate-200 bg-white p-6 sm:w-72 sm:flex-shrink-0">
      <div>
        <p className="text-lg font-bold text-slate-900">Coniche</p>
        <p className="text-sm text-slate-500">{respondent.naam || "Respondent"}</p>
      </div>

      <div>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Voortgang</span>
          <span>{percentage}%</span>
        </div>
        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-slate-900 transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-slate-400">
          {beantwoord} van {totaal} vragen
        </p>
      </div>

      <nav className="flex flex-col gap-4 overflow-y-auto">
        {getGroepen(assessment).map((groep) => {
            const kleur = groep.kleur ? CATEGORIE_COLORS[groep.kleur] : undefined;
            return (
              <div key={groep.id}>
                {groep.naam && (
                  <p
                    className={`mb-2 text-xs font-semibold uppercase tracking-wide ${kleur?.text ?? "text-slate-500"}`}
                  >
                    {groep.naam}
                  </p>
                )}
                <ul className="space-y-1">
                  {groep.bouwblokken.map((bouwblok) => {
                    const { status, beantwoord: bbBeantwoord, totaal: bbTotaal } =
                      bouwblokStatus(bouwblok, respondent.antwoorden);
                    const actief = bouwblok.id === actieveBouwblokId;
                    return (
                      <li key={bouwblok.id}>
                        <button
                          type="button"
                          onClick={() => onSelecteer(bouwblok.id)}
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${
                            actief
                              ? "bg-slate-900 text-white"
                              : "text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <span
                            className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                              actief
                                ? "bg-white/20 text-white"
                                : status === "afgerond"
                                  ? "bg-green-100 text-green-700"
                                  : status === "bezig"
                                    ? "bg-slate-200 text-slate-700"
                                    : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            {status === "afgerond" ? "✓" : bouwblok.volgnummer}
                          </span>
                          <span className="flex-1 truncate">{bouwblok.naam}</span>
                          {status === "bezig" && (
                            <span
                              className={`text-xs ${actief ? "text-white/70" : "text-slate-400"}`}
                            >
                              {bbBeantwoord}/{bbTotaal}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
      </nav>
    </aside>
  );
}
